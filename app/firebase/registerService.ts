import {
  registerTutor,
  uploadTutorDocuments,
} from "@/app/firebase/authService";

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  specialization: string;
  bio: string;
  hourlyRate: number;
  degreeClass: string;
  category: string;
}

export interface RegistrationResult {
  success: boolean;
  uid?: string;
  message?: string;
}

export interface DocumentUploadResult {
  success: boolean;
  message?: string;
}

export function determineCategory(degreeClass: string): string {
  return degreeClass === "First Class" || degreeClass === "Second Class Upper"
    ? "academic"
    : "digital_skills";
}

export async function submitTutorRegistration(
  data: RegistrationData,
): Promise<RegistrationResult> {
  try {
    const result = await registerTutor(data);
    if (!result.success) {
      return {
        success: false,
        message: result.message || "Registration failed",
      };
    }
    return { success: true, uid: result.uid };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

export async function submitTutorDocuments(
  tutorId: string,
  uploadedFiles: { [key: string]: { file: File; name: string } },
  onProgress: (docType: string, progress: number) => void,
): Promise<DocumentUploadResult> {
  const documentTypeMap: { [key: string]: string } = {
    id: "GOVERNMENT_ID",
    degree: "DEGREE",
    cert: "CERTIFICATE",
  };

  try {
    const result = await uploadTutorDocuments(
      tutorId,
      uploadedFiles,
      documentTypeMap,
      onProgress,
    );

    if (!result.success) {
      return {
        success: false,
        message: result.message || "Failed to upload documents",
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Document upload failed",
    };
  }
}
