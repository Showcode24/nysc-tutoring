import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { TutoringMode, AvailabilitySlot } from "./authService";

export interface TutorDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  createdAt: any;
  tutorProfile: {
    status: string;
    bio: string;
    category: string;
    degreeClass: string;
    hourlyRate: number;
    specialization: string[];
    tutoringMode?: TutoringMode;
    availability?: AvailabilitySlot[];
  };
}

export interface TutorDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: any;
  rejectedReason: string;
}

export interface TutorAppointment {
  id: string;
  type: string;
  date: any;
  time: string;
  status: string;
  assignedAdmin?: string;
}

export interface AuditEvent {
  id: string;
  tutorId?: string;
  action: string;
  description: string;
  timestamp: any;
  adminName?: string;
}

export interface TutorReviewData {
  tutor: TutorDetail | null;
  documents: TutorDocument[];
  appointments: TutorAppointment[];
  auditEvents: AuditEvent[];
}

export async function fetchTutorReviewData(
  tutorId: string,
): Promise<TutorReviewData> {
  try {
    // Fetch tutor profile
    const tutorRef = doc(db, "users", tutorId);
    const tutorDoc = await getDoc(tutorRef);
    const tutor = tutorDoc.exists()
      ? ({ id: tutorDoc.id, ...tutorDoc.data() } as TutorDetail)
      : null;

    // Fetch documents — tutorId stored as a Firestore reference
    let documents: TutorDocument[] = [];
    try {
      const docsSnap = await getDocs(
        query(
          collection(db, "documents"),
          where("tutorId", "==", tutorRef), // ✅ pass ref, not string
        ),
      );
      documents = docsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TutorDocument[];
    } catch (e) {
      console.error("Documents fetch error:", e);
      documents = [];
    }

    // Fetch appointments — tutorId stored as a string
    let appointments: TutorAppointment[] = [];
    try {
      const apptSnap = await getDocs(
        query(
          collection(db, "appointments"),
          where("tutorId", "==", tutorId), // ✅ plain string
        ),
      );
      appointments = apptSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TutorAppointment[];
    } catch (e) {
      console.error("Appointments fetch error:", e);
      appointments = [];
    }

    // Fetch audit events
    let auditEvents: AuditEvent[] = [];
    try {
      const auditSnap = await getDocs(
        query(collection(db, "auditLog"), where("tutorId", "==", tutorId)),
      );
      auditEvents = auditSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AuditEvent[];
    } catch (e) {
      console.error("Audit fetch error:", e);
      auditEvents = [];
    }

    return { tutor, documents, appointments, auditEvents };
  } catch (error) {
    console.error("Error fetching tutor review data:", error);
    return { tutor: null, documents: [], appointments: [], auditEvents: [] };
  }
}

export async function approveTutor(
  tutorId: string,
  adminId: string,
  adminName: string,
): Promise<void> {
  await updateDoc(doc(db, "users", tutorId), {
    "tutorProfile.status": "active",
    updatedAt: Timestamp.now(),
  });

  await addDoc(collection(db, "auditLog"), {
    tutorId,
    action: "Tutor Approved",
    description: "Application approved and account activated.",
    adminId,
    adminName,
    timestamp: Timestamp.now(),
  });
}

export async function rejectTutor(
  tutorId: string,
  adminId: string,
  adminName: string,
  reason: string,
): Promise<void> {
  await updateDoc(doc(db, "users", tutorId), {
    "tutorProfile.status": "rejected",
    "tutorProfile.verificationNotes": reason,
    updatedAt: Timestamp.now(),
  });

  await addDoc(collection(db, "auditLog"), {
    tutorId,
    action: "Tutor Rejected",
    description: reason || "Application rejected.",
    adminId,
    adminName,
    timestamp: Timestamp.now(),
  });
}

export async function approveDocument(docId: string): Promise<void> {
  await updateDoc(doc(db, "documents", docId), {
    status: "approved",
    verified: true,
    verifiedAt: Timestamp.now(),
  });
}

export async function rejectDocument(
  docId: string,
  reason: string,
): Promise<void> {
  await updateDoc(doc(db, "documents", docId), {
    status: "rejected",
    verified: false,
    rejectedReason: reason,
  });
}

export async function scheduleAppointment(
  tutorId: string,
  tutorName: string,
  adminId: string,
  adminName: string,
  date: string,
  time: string,
): Promise<void> {
  await addDoc(collection(db, "appointments"), {
    tutorId,
    tutorName,
    assignedAdmin: adminName,
    adminId,
    type: "verification",
    date: Timestamp.fromDate(new Date(date)),
    time,
    status: "scheduled",
    createdAt: Timestamp.now(),
  });

  await updateDoc(doc(db, "users", tutorId), {
    "tutorProfile.appointmentDate": date,
    updatedAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────────────────────
//  Admin-wide appointments list (not scoped to one tutor) — used by
//  /admin/appointments, which previously showed hardcoded mock data
//  instead of the appointments this file already writes to Firestore.
// ─────────────────────────────────────────────────────────────
export interface AppointmentRecord {
  id: string;
  tutorId: string;
  tutorName: string;
  type: string;
  date: any;
  time: string;
  status: "scheduled" | "checked_in" | "completed" | "no_show" | "cancelled";
  assignedAdmin?: string;
}

export async function fetchAllAppointments(): Promise<AppointmentRecord[]> {
  try {
    const snap = await getDocs(
      query(collection(db, "appointments"), orderBy("date", "desc"), limit(100)),
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AppointmentRecord[];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

export async function checkInAppointment(appointmentId: string): Promise<void> {
  await updateDoc(doc(db, "appointments", appointmentId), {
    status: "checked_in",
  });
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  await updateDoc(doc(db, "appointments", appointmentId), {
    status: "cancelled",
  });
}

// ─────────────────────────────────────────────────────────────
//  Admin-wide audit log — same situation as appointments above:
//  approveTutor/rejectTutor already write real entries to `auditLog`,
//  but /admin/audit was never reading them back.
// ─────────────────────────────────────────────────────────────
export async function fetchAllAuditEvents(): Promise<AuditEvent[]> {
  try {
    const snap = await getDocs(
      query(collection(db, "auditLog"), orderBy("timestamp", "desc"), limit(200)),
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AuditEvent[];
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return [];
  }
}
