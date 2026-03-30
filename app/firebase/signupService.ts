import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";

interface SignUpData {
  email: string;
  password: string;
}

// ─────────────────────────────────────────────
//  Maps Firebase Auth error codes to plain messages
// ─────────────────────────────────────────────
function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/invalid-email":
      return "The email address is not valid. Please check and try again.";
    case "auth/operation-not-allowed":
      return "Email/password sign up is not enabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/popup-closed-by-user":
      return "Sign up was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "Pop-up was blocked by your browser. Please allow pop-ups and try again.";
    case "auth/cancelled-popup-request":
      return "Sign up was cancelled. Please try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method. Try signing in with Google instead.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export async function signUpWithEmail(data: SignUpData) {
  try {
    // 1️⃣ Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );

    const user = userCredential.user;

    // 2️⃣ Send verification email via Resend (non-blocking)
    try {
      const res = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("[signupService] Verification email failed:", err);
      } else {
        console.log("[signupService] Verification email sent to:", user.email);
      }
    } catch (emailError: any) {
      // Non-blocking — account is created, user can request a resend later
      console.error(
        "[signupService] Verification email error (non-blocking):",
        emailError,
      );
    }

    // 3️⃣ Create user document in Firestore
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: data.email,
      firstName: "",
      lastName: "",
      phone: "",
      location: "",
      bio: "",
      education: "",
      degreeClass: "",
      department: "",
      specialization: "",
      hourlyRate: 0,
      category: "",
      subjects: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      accountType: "tutor",
      status: "pending",
      verified: false,
      profileComplete: false,
    });

    // 4️⃣ Sign out until email verified
    await auth.signOut();

    return {
      success: true,
      uid: user.uid,
      email: user.email,
      message:
        "Account created successfully! A verification email has been sent. Please verify your email before logging in.",
    };
  } catch (error: any) {
    console.error("[signupService] Signup error:", error.code, error.message);

    return {
      success: false,
      message: error.code
        ? getFirebaseErrorMessage(error.code)
        : error.message || "Failed to create account. Please try again.",
    };
  }
}

// ─────────────────────────────────────────────
//  GOOGLE SIGN-UP
// ─────────────────────────────────────────────
export async function signUpWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);

    const user = userCredential.user;
    const userDocRef = doc(db, "users", user.uid);

    await setDoc(
      userDocRef,
      {
        uid: user.uid,
        email: user.email || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        phone: "",
        location: "",
        bio: "",
        education: "",
        degreeClass: "",
        department: "",
        specialization: "",
        hourlyRate: 0,
        category: "",
        subjects: [],
        profilePicture: user.photoURL || "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        accountType: "tutor",
        status: "pending",
        verified: true,
        profileComplete: false,
      },
      { merge: true },
    );

    return {
      success: true,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      message: "Signed up with Google successfully",
    };
  } catch (error: any) {
    console.error(
      "[signupService] Google signup error:",
      error.code,
      error.message,
    );

    return {
      success: false,
      message: error.code
        ? getFirebaseErrorMessage(error.code)
        : error.message || "Failed to sign up with Google. Please try again.",
    };
  }
}

// ─────────────────────────────────────────────
//  SYNC FIREBASE VERIFICATION → FIRESTORE
// ─────────────────────────────────────────────
export async function syncVerificationToFirestore(
  uid: string,
): Promise<boolean> {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.log("[signupService] No user logged in");
      return false;
    }

    await user.reload();

    if (user.emailVerified) {
      const userDocRef = doc(db, "users", uid);
      await setDoc(
        userDocRef,
        { verified: true, updatedAt: Timestamp.now() },
        { merge: true },
      );
      console.log("[signupService] Firestore verified flag updated for:", uid);
      return true;
    }

    return false;
  } catch (error) {
    console.error("[signupService] Error syncing verification:", error);
    return false;
  }
}

// ─────────────────────────────────────────────
//  CHECK EMAIL VERIFIED (Firebase Auth)
// ─────────────────────────────────────────────
export async function isEmailVerified(): Promise<boolean> {
  const user = auth.currentUser;

  if (!user) {
    console.log("[signupService] No user logged in");
    return false;
  }

  await user.reload();

  if (user.emailVerified) {
    await syncVerificationToFirestore(user.uid);
  }

  return user.emailVerified;
}

// ─────────────────────────────────────────────
//  CHECK BOTH FIREBASE + FIRESTORE STATUS
// ─────────────────────────────────────────────
export async function checkUserVerificationStatus(uid: string): Promise<{
  firebaseVerified: boolean;
  firestoreVerified: boolean;
}> {
  const user = auth.currentUser;

  if (!user) {
    return { firebaseVerified: false, firestoreVerified: false };
  }

  await user.reload();

  const userDocRef = doc(db, "users", uid);
  const userSnap = await getDoc(userDocRef);
  const firestoreVerified = userSnap.exists()
    ? userSnap.data()?.verified || false
    : false;

  return {
    firebaseVerified: user.emailVerified,
    firestoreVerified,
  };
}

// ─────────────────────────────────────────────
//  PASSWORD VALIDATION
// ─────────────────────────────────────────────
export async function validatePassword(password: string): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  if (password.length < 8)
    errors.push("Password must be at least 8 characters long");
  if (!/[A-Z]/.test(password))
    errors.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password))
    errors.push("Password must contain at least one lowercase letter");
  if (!/[0-9]/.test(password))
    errors.push("Password must contain at least one number");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push("Password must contain at least one special character");

  return { isValid: errors.length === 0, errors };
}
