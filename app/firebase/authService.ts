import { signOut } from "firebase/auth";
import { collection, doc, setDoc, Timestamp, addDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { uploadDocumentFile } from "./uploadService";

// A tutor's availability is a set of open time windows, each attached to
// either weekdays or weekends (e.g. "Weekdays 3–5pm", "Weekends 10am–1pm")
// rather than a single fixed schedule, since most tutors' free hours
// differ between the two. Admins use this plus `tutoringMode` to match
// tutors to students who need them at a specific time and format.
export type TutoringMode = "online" | "in_person" | "both";

export interface AvailabilitySlot {
  days: "weekdays" | "weekends";
  startTime: string; // 24h "HH:MM", from an <input type="time">
  endTime: string;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  education: string;
  hourlyRate: number;
  degreeClass: string;
  category: string;
  specialization: string;
  tutoringMode: TutoringMode;
  availability: AvailabilitySlot[];
}

interface DocumentUpload {
  [key: string]: { file: File; name: string };
}

interface DocumentTypeMap {
  [key: string]: string;
}

export async function registerTutor(data: RegistrationData) {
  try {
    // User already has a Firebase Auth account from signup — just get the current user
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No authenticated user found. Please sign in first.");
    }

    const uid = currentUser.uid;

    // Merge into the profile document that signUpWithEmail() already created —
    // a plain setDoc() here would wipe fields like uid, accountType, status,
    // verified, profileComplete, and createdAt that were set at signup.
    const userRef = doc(db, "users", uid);

    await setDoc(
      userRef,
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        role: "tutor",

        tutorProfile: {
          bio: data.bio,
          education: data.education,
          hourlyRate: data.hourlyRate,
          category: data.category,
          degreeClass: data.degreeClass,
          specialization: data.specialization
            .split(", ")
            .filter((s) => s.trim()),
          tutoringMode: data.tutoringMode,
          availability: data.availability,
          status: "pending_verification",
        },

        userType: "tutor",
        // Marks the profile-setup step of the funnel as done, distinct from
        // tutorProfile.status (admin approval). loginService.ts reads this
        // to decide whether to send a returning user back to /register —
        // without it, every login would bounce a fully-registered tutor
        // back into the registration form.
        registrationCompleted: true,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );

    return {
      success: true,
      uid,
      message: "Registration successful!",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    throw new Error(error.message || "An error occurred during registration.");
  }
}

export async function uploadTutorDocuments(
  tutorId: string,
  uploadedFiles: DocumentUpload,
  documentTypeMap: DocumentTypeMap,
  onProgress?: (docType: string, progress: number) => void,
) {
  try {
    const documentIds: { [key: string]: string } = {};

    for (const [docKey, docFile] of Object.entries(uploadedFiles)) {
      try {
        onProgress?.(docKey, 25);

        const uploaded = await uploadDocumentFile(
          docFile.file,
          `documents/${tutorId}`,
        );

        onProgress?.(docKey, 75);

        const docRef = await addDoc(collection(db, "documents"), {
          tutorId: doc(db, "users", tutorId),
          documentType: documentTypeMap[docKey],
          fileName: docFile.name,
          fileType: docFile.file.type,
          fileUrl: uploaded.url,
          cloudinaryPublicId: uploaded.publicId,
          status: "pending",
          verified: false,
          uploadedAt: Timestamp.now(),
          rejectedReason: "",
          verifiedAt: null,
          verifiedBy: "",
        });

        documentIds[docKey] = docRef.id;
        onProgress?.(docKey, 100);
      } catch (uploadError: any) {
        console.error(`Upload error for ${docKey}:`, uploadError);
        throw new Error(
          `Failed to upload ${documentTypeMap[docKey]}: ${uploadError.message}`,
        );
      }
    }

    return {
      success: true,
      documentIds,
      message: "All documents uploaded successfully",
    };
  } catch (error: any) {
    console.error("Document upload error:", error);
    return {
      success: false,
      message: error.message || "Failed to upload documents",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  Resend verification email via your own API route.
//  Call this from a "Resend verification email" button in your UI.
// ─────────────────────────────────────────────────────────────
export async function resendVerificationEmail(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const res = await fetch("/api/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to resend verification email");
    }

    return { success: true, message: "Verification email sent! Please check your inbox." };
  } catch (error: any) {
    console.error("[auth] Resend verification error:", error);
    return {
      success: false,
      message: error.message || "Failed to resend verification email.",
    };
  }
}