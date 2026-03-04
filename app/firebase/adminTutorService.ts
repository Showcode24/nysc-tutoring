import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface TutorRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  specialization: string[];
  profileCompletion: number;
  createdAt: any;
}

function calculateProfileCompletion(data: any): number {
  const fields = [
    data.firstName,
    data.lastName,
    data.email,
    data.phone,
    data.location,
    data.tutorProfile?.bio,
    data.tutorProfile?.degreeClass,
    data.tutorProfile?.hourlyRate,
    data.tutorProfile?.specialization?.length > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export async function fetchAllTutors(): Promise<TutorRecord[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  try {
    const tutorsQuery = query(
      collection(db, "users"),
      where("role", "==", "tutor"),
    );
    const snap = await getDocs(tutorsQuery);

    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        status: data.tutorProfile?.status || "pending_verification",
        specialization: data.tutorProfile?.specialization || [],
        profileCompletion: calculateProfileCompletion(data),
        createdAt: data.createdAt,
      };
    });
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return [];
  }
}
