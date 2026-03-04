import { signOut } from "firebase/auth";
import { collection, doc, setDoc, Timestamp, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./firebase";

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  hourlyRate: number;
  degreeClass: string;
  category: string;
  specialization: string;
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

    // Save profile to Firestore
    const userRef = doc(db, "users", uid);

    await setDoc(userRef, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      location: data.location,
      role: "tutor",

      tutorProfile: {
        bio: data.bio,
        hourlyRate: data.hourlyRate,
        category: data.category,
        degreeClass: data.degreeClass,
        specialization: data.specialization.split(", ").filter((s) => s.trim()),
        status: "pending_verification",
      },

      userType: "tutor",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

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

        const storagePath = `documents/${tutorId}/${Date.now()}_${docFile.name}`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, docFile.file);
        const fileUrl = await getDownloadURL(storageRef);

        onProgress?.(docKey, 75);

        const docRef = await addDoc(collection(db, "documents"), {
          tutorId: doc(db, "users", tutorId),
          documentType: documentTypeMap[docKey],
          fileName: docFile.name,
          fileType: docFile.file.type,
          fileUrl: fileUrl,
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
