import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─────────────────────────────────────────────────────────────
//  Gigs + gig applications. Replaces the mock-data-only UI that
//  previously backed /admin/gigs, /tutor/gigs and /tutor/my-gigs.
//
//  Query design note: every query here uses either a single `where`
//  equality filter with no `orderBy`, or several `where` equality filters
//  combined, or `orderBy` with no `where` at all — Firestore serves all of
//  those from its automatic single-field indexes. Mixing an equality
//  filter with `orderBy` on a *different* field needs a composite index
//  that doesn't exist in this project and can't be created from here, so
//  results that need sorting are sorted client-side instead.
// ─────────────────────────────────────────────────────────────

export type GigStatus = "open" | "assigned" | "completed" | "cancelled";
export type ApplicationStatus = "applied" | "accepted" | "rejected" | "withdrawn";

export interface GigRecord {
  id: string;
  title: string;
  subject: string;
  description: string;
  hourlyRate: number;
  hoursPerWeek: number;
  location: string;
  startDate: string;
  status: GigStatus;
  studentName?: string;
  assignedTutorId?: string;
  createdBy?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface GigApplicationRecord {
  id: string;
  gigId: string;
  tutorId: string;
  tutorName: string;
  status: ApplicationStatus;
  message?: string;
  appliedAt: any;
  updatedAt?: any;
}

export interface CreateGigInput {
  title: string;
  subject: string;
  description: string;
  hourlyRate: number;
  hoursPerWeek: number;
  location: string;
  startDate: string;
}

function byCreatedAtDesc(a: { createdAt: any }, b: { createdAt: any }) {
  const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
  const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
  return bTime - aTime;
}

// ---------- Gigs ----------

export async function fetchOpenGigs(): Promise<GigRecord[]> {
  try {
    const snap = await getDocs(
      query(collection(db, "gigs"), where("status", "==", "open")),
    );
    const gigs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as GigRecord[];
    return gigs.sort(byCreatedAtDesc);
  } catch (error) {
    console.error("Error fetching open gigs:", error);
    return [];
  }
}

export async function fetchAllGigs(): Promise<GigRecord[]> {
  try {
    const snap = await getDocs(collection(db, "gigs"));
    const gigs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as GigRecord[];
    return gigs.sort(byCreatedAtDesc);
  } catch (error) {
    console.error("Error fetching gigs:", error);
    return [];
  }
}

export async function fetchGigById(gigId: string): Promise<GigRecord | null> {
  try {
    const snap = await getDoc(doc(db, "gigs", gigId));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as GigRecord) : null;
  } catch (error) {
    console.error("Error fetching gig:", error);
    return null;
  }
}

export async function createGig(
  data: CreateGigInput,
  adminId: string,
): Promise<string> {
  const ref = await addDoc(collection(db, "gigs"), {
    ...data,
    status: "open" as GigStatus,
    createdBy: adminId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

export async function cancelGig(gigId: string): Promise<void> {
  await updateDoc(doc(db, "gigs", gigId), {
    status: "cancelled",
    updatedAt: Timestamp.now(),
  });
}

// ---------- Applications ----------

export async function fetchApplicationsForGig(
  gigId: string,
): Promise<GigApplicationRecord[]> {
  try {
    const snap = await getDocs(
      query(collection(db, "gigApplications"), where("gigId", "==", gigId)),
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as GigApplicationRecord[];
  } catch (error) {
    console.error("Error fetching applications for gig:", error);
    return [];
  }
}

export async function fetchApplicationsForTutor(
  tutorId: string,
): Promise<GigApplicationRecord[]> {
  try {
    const snap = await getDocs(
      query(collection(db, "gigApplications"), where("tutorId", "==", tutorId)),
    );
    const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as GigApplicationRecord[];
    return apps.sort((a, b) => {
      const aTime = a.appliedAt?.toMillis ? a.appliedAt.toMillis() : 0;
      const bTime = b.appliedAt?.toMillis ? b.appliedAt.toMillis() : 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error("Error fetching applications for tutor:", error);
    return [];
  }
}

export async function fetchApplicationForTutorAndGig(
  gigId: string,
  tutorId: string,
): Promise<GigApplicationRecord | null> {
  try {
    const snap = await getDocs(
      query(
        collection(db, "gigApplications"),
        where("gigId", "==", gigId),
        where("tutorId", "==", tutorId),
      ),
    );
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as GigApplicationRecord;
  } catch (error) {
    console.error("Error checking existing application:", error);
    return null;
  }
}

export async function applyToGig(
  gigId: string,
  tutorId: string,
  tutorName: string,
  message: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const existing = await fetchApplicationForTutorAndGig(gigId, tutorId);
    if (existing) {
      return { success: false, message: "You've already applied to this gig." };
    }

    await addDoc(collection(db, "gigApplications"), {
      gigId,
      tutorId,
      tutorName,
      message,
      status: "applied" as ApplicationStatus,
      appliedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error applying to gig:", error);
    return { success: false, message: "Failed to submit application." };
  }
}

// Accepting one application assigns the gig and auto-rejects every other
// still-pending applicant — a gig can only go to one tutor, so leaving
// their applications stuck on "applied" after the slot is filled would be
// misleading.
export async function acceptApplication(
  applicationId: string,
  gigId: string,
  tutorId: string,
): Promise<void> {
  const batch = writeBatch(db);

  batch.update(doc(db, "gigApplications", applicationId), {
    status: "accepted",
    updatedAt: Timestamp.now(),
  });

  batch.update(doc(db, "gigs", gigId), {
    status: "assigned",
    assignedTutorId: tutorId,
    updatedAt: Timestamp.now(),
  });

  const others = await getDocs(
    query(
      collection(db, "gigApplications"),
      where("gigId", "==", gigId),
      where("status", "==", "applied"),
    ),
  );
  others.docs.forEach((d) => {
    if (d.id !== applicationId) {
      batch.update(d.ref, { status: "rejected", updatedAt: Timestamp.now() });
    }
  });

  await batch.commit();
}

export async function rejectApplication(applicationId: string): Promise<void> {
  await updateDoc(doc(db, "gigApplications", applicationId), {
    status: "rejected",
    updatedAt: Timestamp.now(),
  });
}

export async function withdrawApplication(applicationId: string): Promise<void> {
  await updateDoc(doc(db, "gigApplications", applicationId), {
    status: "withdrawn",
    updatedAt: Timestamp.now(),
  });
}
