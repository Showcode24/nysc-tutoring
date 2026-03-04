import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

interface SignUpData {
  email: string;
  password: string;
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

    // 2️⃣ Send email verification
    try {
      await sendEmailVerification(user, {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
      });
      console.log("[v0] Email verification sent successfully to:", user.email);
    } catch (emailError: any) {
      console.error("[v0] Email verification failed:", emailError);
      throw new Error(`Email verification failed: ${emailError.message}`);
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
      verified: false, // Remains false until user clicks verification link
      profileComplete: false,
    });

    // 4️⃣ Optional: sign out user until email verified
    await auth.signOut();

    return {
      success: true,
      uid: user.uid,
      email: user.email,
      message:
        "Account created successfully! A verification email has been sent. Please verify your email before logging in.",
    };
  } catch (error: any) {
    console.error("[v0] Signup error:", error);

    // Firebase Auth error handling
    if (error.code === "auth/email-already-in-use") {
      return {
        success: false,
        message:
          "This email is already registered. Please use another email or sign in.",
      };
    } else if (error.code === "auth/weak-password") {
      return {
        success: false,
        message: "Password is too weak. Please use at least 6 characters.",
      };
    } else if (error.code === "auth/invalid-email") {
      return {
        success: false,
        message: "Invalid email address.",
      };
    }

    return {
      success: false,
      message: error.message || "Failed to create account",
    };
  }
}

// Google signup remains the same (no email verification needed)
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
        verified: true, // Google accounts are already verified
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
    console.error("[v0] Google signup error:", error);

    if (error.code === "auth/popup-closed-by-user") {
      return { success: false, message: "Sign up was cancelled" };
    }

    return {
      success: false,
      message: error.message || "Failed to sign up with Google",
    };
  }
}

// Sync Firebase email verification status to Firestore
export async function syncVerificationToFirestore(
  uid: string,
): Promise<boolean> {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.log("[v0] No user logged in");
      return false;
    }

    // Reload to get latest verification status from Firebase Auth
    await user.reload();

    if (user.emailVerified) {
      // Update Firestore verified flag to true
      const userDocRef = doc(db, "users", uid);
      await setDoc(
        userDocRef,
        { verified: true, updatedAt: Timestamp.now() },
        { merge: true },
      );
      console.log(
        "[v0] Firestore verified flag updated to true for user:",
        uid,
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error("[v0] Error syncing verification to Firestore:", error);
    return false;
  }
}

// Check if user's email is verified (IMPORTANT: Use this before allowing access to protected features)
export async function isEmailVerified(): Promise<boolean> {
  const user = auth.currentUser;

  if (!user) {
    console.log("[v0] No user logged in");
    return false;
  }

  // Reload to get latest verification status
  await user.reload();

  console.log("[v0] Email verification status:", {
    email: user.email,
    emailVerified: user.emailVerified,
  });

  // If Firebase says verified, sync it to Firestore
  if (user.emailVerified) {
    await syncVerificationToFirestore(user.uid);
  }

  return user.emailVerified;
}

// Check verification status and Firestore flag
export async function checkUserVerificationStatus(uid: string): Promise<{
  firebaseVerified: boolean;
  firestoreVerified: boolean;
}> {
  const user = auth.currentUser;

  if (!user) {
    return { firebaseVerified: false, firestoreVerified: false };
  }

  await user.reload();

  // Get Firestore verified flag
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

// Password validation remains unchanged
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
