// Kopa360 Type Definitions

export type TutorStatus = "pending" | "restricted" | "active" | "rejected";

export type AdminRole = "front_desk" | "manager" | "super_admin";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Tutor extends User {
  status: TutorStatus;
  bio?: string;
  skills: string[];
  subjects: string[];
  education?: string;
  experience?: string;
  documents: TutorDocument[];
  profileCompletion: number;
  verificationNotes?: string;
  appointmentDate?: string;
}

export interface TutorDocument {
  id: string;
  name: string;
  type: "id" | "certification" | "degree" | "background_check" | "other";
  status: "pending" | "approved" | "rejected";
  uploadedAt: string;
  url?: string;
}

export interface Admin extends User {
  role: AdminRole;
}

export interface Gig {
  id: string;
  title: string;
  subject: string;
  description: string;
  hourlyRate: number;
  hoursPerWeek: number;
  location: string;
  startDate: string;
  status: "open" | "assigned" | "completed" | "cancelled";
  studentName?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  tutorId: string;
  tutorName: string;
  type: "verification" | "interview" | "orientation";
  date: string;
  time: string;
  status: "scheduled" | "checked_in" | "completed" | "no_show" | "cancelled";
  assignedAdmin?: string;
  notes?: string;
}

export interface AuditEvent {
  id: string;
  tutorId: string;
  action: string;
  description: string;
  adminName?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface GigApplication {
  id: string;
  gigId: string;
  tutorId: string;
  status: "applied" | "accepted" | "rejected" | "withdrawn";
  appliedAt: string;
  message?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  totalTutors: number;
  pendingTutors: number;
  activeTutors: number;
  totalGigs: number;
  openGigs: number;
  appointmentsToday: number;
}
