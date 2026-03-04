import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";

export interface AdminData {
  firstName: string;
  lastName: string;
  role: string;
}

export interface TutorSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export interface AppointmentSummary {
  id: string;
  tutorName: string;
  type: string;
  time: string;
  status: string;
  date: string;
}

export interface DashboardMetrics {
  totalTutors: number;
  pendingTutors: number;
  activeTutors: number;
  appointmentsToday: number;
}

export interface AdminDashboardData {
  admin: AdminData | null;
  metrics: DashboardMetrics;
  pendingTutors: TutorSummary[];
  todayAppointments: AppointmentSummary[];
}

const defaultData: AdminDashboardData = {
  admin: null,
  metrics: {
    totalTutors: 0,
    pendingTutors: 0,
    activeTutors: 0,
    appointmentsToday: 0,
  },
  pendingTutors: [],
  todayAppointments: [],
};

function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  try {
    const currentUser: any = await getCurrentUser();

    if (!currentUser) return defaultData;

    // Fetch admin profile
    const adminDoc = await getDoc(doc(db, "users", currentUser.uid));
    const admin = adminDoc.exists() ? (adminDoc.data() as AdminData) : null;

    // Fetch all tutors by role
    const tutorsSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "tutor")),
    );

    const allTutors = tutorsSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        tutorProfile: data.tutorProfile || {},
      };
    });

    const pendingTutors = allTutors.filter(
      (t) => t.tutorProfile?.status === "pending_verification",
    );

    const activeTutors = allTutors.filter(
      (t) => t.tutorProfile?.status === "active",
    );

    // Fetch today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let todayAppointments: AppointmentSummary[] = [];
    try {
      const appointmentsSnap = await getDocs(
        query(
          collection(db, "appointments"),
          where("status", "==", "scheduled"),
          where("date", ">=", Timestamp.fromDate(today)),
          where("date", "<", Timestamp.fromDate(tomorrow)),
        ),
      );
      todayAppointments = appointmentsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AppointmentSummary[];
    } catch {
      // appointments collection may not exist yet
      todayAppointments = [];
    }

    return {
      admin,
      metrics: {
        totalTutors: allTutors.length,
        pendingTutors: pendingTutors.length,
        activeTutors: activeTutors.length,
        appointmentsToday: todayAppointments.length,
      },
      pendingTutors: pendingTutors.slice(0, 4).map((t) => ({
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        status: t.tutorProfile?.status || "pending_verification",
      })),
      todayAppointments: todayAppointments.slice(0, 4),
    };
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return defaultData;
  }
}
