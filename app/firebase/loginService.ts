import { signInWithEmailAndPassword, AuthError, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface LoginResponse {
  success: boolean;
  user?: User;
  role?: "tutor" | "admin" | "super_admin";
  verified?: boolean;
  notRegistered?: boolean;
  error?: string;
}

/**
 * Login user with email and password
 * @param email User email
 * @param password User password
 * @returns LoginResponse with user data and role
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    console.log("User signed in successfully:", user.email);

    // Reload to get latest verification status
    await user.reload();

    // Get user role and verification status from Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    // User has a Firebase Auth account but hasn't completed registration
    if (!userSnap.exists()) {
      console.error("User document not found in Firestore");
      return {
        success: false,
        notRegistered: true,
        error: "User profile not found.",
      };
    }

    const userData = userSnap.data();
    const role = userData?.role || "tutor";
    const verified =
      role === "admin" || role === "super_admin" ? true : user.emailVerified;

    console.log("User login data:", {
      email: user.email,
      verified,
      role,
    });

    return {
      success: true,
      user,
      role: role as "tutor" | "admin" | "super_admin",
      verified,
    };
  } catch (error) {
    return handleLoginError(error as AuthError);
  }
}

/**
 * Handle Firebase Auth errors with user-friendly messages
 */
function handleLoginError(error: AuthError): LoginResponse {
  console.error("[v0] Login error:", error.code, error.message);

  let userFriendlyMessage = "An error occurred during login. Please try again.";

  switch (error.code) {
    case "auth/user-not-found":
      userFriendlyMessage =
        "No account found with this email. Please check your email or sign up.";
      break;
    case "auth/wrong-password":
      userFriendlyMessage =
        "Incorrect password. Please try again or reset your password.";
      break;
    case "auth/invalid-email":
      userFriendlyMessage = "Please enter a valid email address.";
      break;
    case "auth/user-disabled":
      userFriendlyMessage =
        "This account has been disabled. Please contact support.";
      break;
    case "auth/too-many-requests":
      userFriendlyMessage =
        "Too many failed login attempts. Please try again later or reset your password.";
      break;
    case "auth/invalid-credential":
      userFriendlyMessage = "Invalid email or password. Please try again.";
      break;
    default:
      userFriendlyMessage = error.message || userFriendlyMessage;
  }

  return {
    success: false,
    error: userFriendlyMessage,
  };
}
