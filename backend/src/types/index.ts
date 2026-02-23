import { TutorStatus, AdminRole, AuditAction } from "@prisma/client";

// ==================== AUTH & JWT ====================

export interface JWTPayload {
  userId: string;
  email: string;
  userType: "TUTOR" | "ADMIN";
  adminRole?: AdminRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest {
  user?: JWTPayload;
  token?: string;
}

// ==================== TUTOR ====================

export interface TutorRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  specialization: string;
  yearsOfExperience: number;
  hourlyRate: number;
  bio?: string;
}

export interface TutorLoginRequest {
  email: string;
  password: string;
}

export interface TutorUploadDocumentRequest {
  documentType: string;
  fileUrl: string;
  fileName: string;
}

export interface TutorResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: TutorStatus;
  specialization: string;
  yearsOfExperience: number;
  hourlyRate: number;
  bio?: string;
  documents: {
    id: string;
    documentType: string;
    fileName: string;
    verified: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ==================== ADMIN ====================

export interface AdminCreateRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  department?: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminScheduleAppointmentRequest {
  tutorId: string;
  scheduledAt: string;
  location?: string;
  notes?: string;
}

export interface AdminCheckInTutorRequest {
  appointmentId: string;
}

export interface AdminApproveTutorRequest {
  tutorId: string;
  reason?: string;
}

export interface AdminRejectTutorRequest {
  tutorId: string;
  reason: string;
}

// ==================== APPOINTMENT ====================

export interface AppointmentResponse {
  id: string;
  tutorId: string;
  adminId: string;
  status: string;
  scheduledAt: string;
  completedAt?: string;
  checkedInAt?: string;
  location?: string;
  notes?: string;
  tutor: {
    id: string;
    firstName: string;
    lastName: string;
  };
  admin: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ==================== AUDIT ====================

export interface AuditLog {
  id: string;
  adminId: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  details?: any;
  performedAt: string;
  admin: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// ==================== STATUS TRANSITION ====================

export interface StatusTransitionContext {
  tutorId: string;
  fromStatus: TutorStatus;
  toStatus: TutorStatus;
  changedBy?: string;
  reason?: string;
  appointmentId?: string;
}

export interface StatusTransitionResult {
  success: boolean;
  message: string;
  oldStatus: TutorStatus;
  newStatus: TutorStatus;
}
