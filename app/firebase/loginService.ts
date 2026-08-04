import { signInWithEmailAndPassword, AuthError, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * Full authentication state returned by loginUser(). The service only
 * reports state — it never decides where the UI should navigate next.
 *
 * Stopping points for a login attempt, in order:
 *   0. no account exists for this email          -> accountNotFound === true
 *   1. authenticated but not verified             -> verified === false
 *   2. verified but no Firestore profile          -> profileExists === false
 *   3. profile exists but registration incomplete -> registrationCompleted === false
 *   4. fully authenticated                        -> registrationCompleted === true
 */
export interface LoginResponse {
  success: boolean;
  user?: User;
  role?: "tutor" | "admin" | "super_admin";
  /** True when no user document exists for this email — checked before
   *  Firebase Auth is ever called. Check this before `!success`. */
  accountNotFound?: boolean;
  verified?: boolean;
  profileExists?: boolean;
  registrationCompleted?: boolean;
  /** Convenience summary of the booleans above — same information, easier
   *  to switch on in the UI. The booleans remain the source of truth. */
  state?: AuthState;
  error?: string;
}

export type AuthState =
  | "UNVERIFIED"
  | "PROFILE_MISSING"
  | "PROFILE_INCOMPLETE"
  | "READY";

/** Derives `state` from the individual booleans so the two never disagree. */
function deriveAuthState(
  verified?: boolean,
  profileExists?: boolean,
  registrationCompleted?: boolean,
): AuthState {
  if (!verified) return "UNVERIFIED";
  if (!profileExists) return "PROFILE_MISSING";
  if (!registrationCompleted) return "PROFILE_INCOMPLETE";
  return "READY";
}

/**
 * Checks whether an account exists for this email, via the server-side
 * /api/check-account route (Admin SDK, checks Firebase Auth directly).
 * Deliberately NOT a client-side Firestore query: the client has no
 * Firebase Auth session yet at this point, and Firestore rules that
 * correctly restrict reads to `request.auth.uid == userId` can't be
 * satisfied by an unauthenticated collection query — it would just throw
 * "Missing or insufficient permissions". Checking Auth server-side avoids
 * that entirely and is the more authoritative source of truth anyway.
 */
async function checkAccountExists(email: string): Promise<boolean> {
  try {
    const res = await fetch("/api/check-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      // Fail open: let the real Firebase Auth attempt below decide.
      // Firebase Auth's own error handling still correctly rejects a
      // truly nonexistent account — we just lose the nicer "no account,
      // sign up" messaging for this one request if the check itself
      // errored.
      console.error(
        "[auth] Account existence check failed, proceeding to auth attempt",
      );
      return true;
    }

    const data = await res.json();
    return Boolean(data.exists);
  } catch (error) {
    console.error(
      "[auth] Account existence check errored, proceeding to auth attempt:",
      error,
    );
    return true;
  }
}

/**
 * Authenticates a user and returns their complete authentication state.
 * Does not make any navigation decisions — see LoginResponse for how the
 * UI should branch on the result.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  try {
    // 0. Account existence check, before Firebase Auth is ever called
    const accountExists = await checkAccountExists(email);
    if (!accountExists) {
      return {
        success: false,
        accountNotFound: true,
        error:
          "No account found with this email. Create an account to continue.",
      };
    }

    // 1. Authenticate
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // 2. Reload to get the latest emailVerified status
    await user.reload();

    // 3. Single Firestore read, done here rather than after the verified
    // check. Role (`userType`) only exists in Firestore — there's no
    // custom-claims setup — so there's no way to know whether the
    // admin/super_admin bypass applies without reading it first. This is a
    // deliberate departure from "no Firestore read for unverified users":
    // with this schema that rule can't be satisfied literally. If you add
    // custom claims mirroring `userType` later, this can go back to two
    // separate steps.
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.exists() ? userSnap.data() : undefined;

    const role = userData?.userType as
      | "tutor"
      | "admin"
      | "super_admin"
      | undefined;
    const isBypassRole = role === "admin" || role === "super_admin";

    // Email verification always comes from Firebase Auth's emailVerified —
    // the Firestore `verified` field is a separate, unrelated field and is
    // never read here.
    const verified = isBypassRole ? true : user.emailVerified;

    // 4. Not verified: return without profile/registration details
    if (!verified) {
      return {
        success: true,
        verified: false,
        user,
        role,
        state: deriveAuthState(false),
      };
    }

    // 5. No Firestore profile at all
    if (!userSnap.exists()) {
      return {
        success: true,
        verified: true,
        profileExists: false,
        user,
        role,
        state: deriveAuthState(true, false),
      };
    }

    // 6. Registration completion is tracked by its own dedicated boolean —
    // set to false when the user doc is created, and flipped to true by the
    // registration/profile-setup flow once it finishes. Deliberately NOT
    // inferred from any profile fields, and independent of
    // tutorProfile.status (tutor approval — untouched here) and the
    // Firestore `verified` field (also untouched here).
    const registrationCompleted = Boolean(userData?.registrationCompleted);
    if (userData?.registrationCompleted === undefined) {
      console.warn(
        "[auth] `registrationCompleted` missing on user doc",
        user.uid,
        "— defaulting to false until the field is added.",
      );
    }

    return {
      success: true,
      verified: true,
      profileExists: true,
      registrationCompleted,
      user,
      role: role ?? "tutor",
      state: deriveAuthState(true, true, registrationCompleted),
    };
  } catch (error) {
    return handleLoginError(error as AuthError);
  }
}

/**
 * Handle Firebase Auth errors with user-friendly messages.
 * Account-existence-revealing errors are collapsed into one generic message
 * — account existence itself is now surfaced separately, before this ever
 * runs, via `accountNotFound`.
 */
function handleLoginError(error: AuthError): LoginResponse {
  console.error("[auth] Login error:", error.code, error.message);

  let message = "An error occurred during login. Please try again.";

  switch (error.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      message = "Incorrect email or password. Please try again.";
      break;
    case "auth/invalid-email":
      message = "Please enter a valid email address.";
      break;
    case "auth/user-disabled":
      message = "This account has been disabled. Please contact support.";
      break;
    case "auth/too-many-requests":
      message =
        "Too many failed login attempts. Please try again later or reset your password.";
      break;
    case "auth/network-request-failed":
      message = "Network error. Please check your connection and try again.";
      break;
    default:
      message = error.message || message;
  }

  return {
    success: false,
    error: message,
  };
}
