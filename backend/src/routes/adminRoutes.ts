import { Router, Request, Response } from "express";
import { PrismaClient, AuditAction } from "@prisma/client";
import {
  requireAdmin,
  requireAdminRole,
  authenticateToken,
} from "@/middleware/auth";
import AuthService from "@/services/authService";
import StatusTransitionService from "@/services/statusTransitionService";
import AppointmentService from "@/services/appointmentService";
import TutorService from "@/services/tutorService";
import AuditService from "@/services/auditService";
import { formatResponse, formatError } from "@/utils/index";
import { AdminLoginRequest, AdminScheduleAppointmentRequest } from "@/types/index";

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /admin/login
 * Admin login
 * Public endpoint
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const input: AdminLoginRequest = req.body;

    if (!input.email || !input.password) {
      return res
        .status(400)
        .json(formatError("Email and password required", "VALIDATION_ERROR"));
    }

    const result = await AuthService.adminLogin(input);

    return res.json(
      formatResponse(true, {
        message: "Login successful",
        user: result.user,
        token: result.token,
      })
    );
  } catch (error: any) {
    console.error("[AdminLogin]", error);
    return res.status(401).json(formatError(error.message, "LOGIN_FAILED"));
  }
});

/**
 * GET /admin/tutors/pending
 * Get pending tutors (REGISTERED_RESTRICTED status)
 * Protected endpoint - requires front desk or manager
 */
router.get(
  "/tutors/pending",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(formatError("Authentication required", "UNAUTHORIZED"));
      }

      const tutors = await TutorService.getPendingTutors();

      return res.json(formatResponse(true, { tutors }));
    } catch (error: any) {
      console.error("[GetPendingTutors]", error);
      return res
        .status(500)
        .json(formatError(error.message, "INTERNAL_ERROR"));
    }
  }
);

/**
 * GET /admin/tutors/:tutorId
 * Get detailed tutor information
 * Protected endpoint - requires admin
 */
router.get(
  "/tutors/:tutorId",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(formatError("Authentication required", "UNAUTHORIZED"));
      }

      const { tutorId } = req.params;

      const tutorDetails = await TutorService.getTutorDetails(tutorId);

      if (!tutorDetails) {
        return res.status(404).json(formatError("Tutor not found", "NOT_FOUND"));
      }

      return res.json(formatResponse(true, { tutor: tutorDetails }));
    } catch (error: any) {
      console.error("[GetTutorDetails]", error);
      return res
        .status(500)
        .json(formatError(error.message, "INTERNAL_ERROR"));
    }
  }
);

/**
 * POST /admin/appointments/schedule
 * Schedule appointment with tutor
 * Protected endpoint - requires manager role
 */
router.post(
  "/appointments/schedule",
  authenticateToken,
  requireAdminRole("MANAGER", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(formatError("Authentication required", "UNAUTHORIZED"));
      }

      const input: AdminScheduleAppointmentRequest = req.body;

      if (!input.tutorId || !input.scheduledAt) {
        return res
          .status(400)
          .json(formatError("Missing required fields", "VALIDATION_ERROR"));
      }

      // Get admin details
      const admin = await AuthService.getUserById(req.user.userId);
      if (!admin) {
        return res
          .status(401)
          .json(formatError("Admin not found", "UNAUTHORIZED"));
      }

      // Get admin record
      const adminRecord = await prisma.admin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!adminRecord) {
        return res
          .status(401)
          .json(formatError("Admin record not found", "UNAUTHORIZED"));
      }

      const appointment = await AppointmentService.scheduleAppointment(
        input.tutorId,
        adminRecord.id,
        new Date(input.scheduledAt),
        input.location,
        input.notes
      );

      // Log action
      await AuditService.logAction(
        adminRecord.id,
        AuditAction.APPOINTMENT_SCHEDULED,
        "Appointment",
        appointment.id,
        {
          tutorId: input.tutorId,
          scheduledAt: input.scheduledAt,
          location: input.location,
        },
        req.ip,
        req.get("user-agent")
      );

      return res.status(201).json(
        formatResponse(true, {
          message: "Appointment scheduled",
          appointment,
        })
      );
    } catch (error: any) {
      console.error("[ScheduleAppointment]", error);
      return res
        .status(500)
        .json(formatError(error.message, "INTERNAL_ERROR"));
    }
  }
);

/**
 * POST /admin/appointments/:appointmentId/check-in
 * Check in tutor for appointment
 * Protected endpoint - requires front desk role
 */
router.post(
  "/appointments/:appointmentId/check-in",
  authenticateToken,
  requireAdminRole("FRONT_DESK", "MANAGER", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(formatError("Authentication required", "UNAUTHORIZED"));
      }

      const { appointmentId } = req.params;

      // Check in via service
      const updated = await AppointmentService.checkInTutor(appointmentId);

      // Get admin record for audit
      const adminRecord = await prisma.admin.findUnique({
        where: { userId: req.user.userId },
      });

      if (adminRecord) {
        // Trigger status transition to CHECKED_IN
        await StatusTransitionService.checkInTutor(
          updated.tutorId,
          adminRecord.id
        );

        // Log action
        await AuditService.logAction(
          adminRecord.id,
          AuditAction.TUTOR_CHECKED_IN,
          "Appointment",
          appointmentId,
          { tutorId: updated.tutorId },
          req.ip,
          req.get("user-agent")
        );
      }

      return res.json(
        formatResponse(true, {
          message: "Tutor checked in",
          appointment: updated,
        })
      );
    } catch (error: any) {
      console.error("[CheckInTutor]", error);
      return res
        .status(500)
        .json(formatError(error.message, "INTERNAL_ERROR"));
    }
  }
);

/**
 * POST /admin/tutors/:tutorId/approve
 * Approve tutor (transition to ACTIVE)
 * Protected endpoint - requires manager role
 */
router.post(
  "/tutors/:tutorId/approve",
  authenticateToken,
  requireAdminRole("MANAGER", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(formatError("Authentication required", "UNAUTHORIZED"));
      }

      const { tutorId } = req.params;
      const { reason } = req.body;

      // Get admin record
      const adminRecord = await prisma.admin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!adminRecord) {
        return res
          .status(401)
          .json(formatError("Admin not found", "UNAUTHORIZED"));
      }

      const result = await StatusTransitionService.approveTutor(
        tutorId,
        adminRecord.id,
        reason
      );

      // Log action
      await AuditService.logAction(
        adminRecord.id,
        AuditAction.TUTOR_APPROVED,
        "Tutor",
        tutorId,
        { reason },
        req.ip,
        req.get("user-agent")
      );

      return res.json(
        formatResponse(true, {
          message: "Tutor approved successfully",
          status: result,
        })
      );
    } catch (error: any) {
      console.error("[ApproveTutor]", error);
      return res
        .status(500)
        .json(formatError(error.message, "INTERNAL_ERROR"));
    }
  }
);

/**
 * POST /admin/tutors/:tutorId/reject
 * Reject tutor
 * Protected endpoint - requires manager role
 */
router.post(
  "/tutors/:tutorId/reject",
  authenticateToken,
  requireAdminRole("MANAGER", "SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(formatError("Authentication required", "UNAUTHORIZED"));
      }

      const { tutorId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res
          .status(400)
          .json(formatError("Rejection reason required", "VALIDATION_ERROR"));
      }

      // Get admin record
      const adminRecord = await prisma.admin.findUnique({
        where: { userId: req.user.userId },
      });

      if (!adminRecord) {
        return res
          .status(401)
          .json(formatError("Admin not found", "UNAUTHORIZED"));
      }

      const result = await StatusTransitionService.rejectTutor(
        tutorId,
        adminRecord.id,
        reason
      );

      // Log action
      await AuditService.logAction(
        adminRecord.id,
        AuditAction.TUTOR_REJECTED,
        "Tutor",
        tutorId,
        { reason },
        req.ip,
        req.get("user-agent")
      );

      return res.json(
        formatResponse(true, {
          message: "Tutor rejected",
          status: result,
        })
      );
    } catch (error: any) {
      console.error("[RejectTutor]", error);
      return res
        .status(500)
        .json(formatError(error.message, "INTERNAL_ERROR"));
    }
  }
);

/**
 * GET /admin/audit-logs
 * Get audit logs
 * Protected endpoint - requires super admin
 */
router.get(
  "/audit-logs",
  authenticateToken,
  requireAdminRole("SUPER_ADMIN"),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(formatError("Authentication required", "UNAUTHORIZED"));
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await AuditService.getAllLogs(undefined, limit, offset);

      return res.json(
        formatResponse(true, {
          logs: result.logs,
          pagination: result.pagination,
        })
      );
    } catch (error: any) {
      console.error("[GetAuditLogs]", error);
      return res
        .status(500)
        .json(formatError(error.message, "INTERNAL_ERROR"));
    }
  }
);

/**
 * GET /admin/tutors/:tutorId/timeline
 * Get tutor status and action timeline
 * Protected endpoint - requires admin
 */
router.get(
  "/tutors/:tutorId/timeline",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(formatError("Authentication required", "UNAUTHORIZED"));
      }

      const { tutorId } = req.params;

      const timeline = await AuditService.getTutorTimeline(tutorId);

      return res.json(formatResponse(true, { timeline }));
    } catch (error: any) {
      console.error("[GetTutorTimeline]", error);
      return res
        .status(500)
        .json(formatError(error.message, "INTERNAL_ERROR"));
    }
  }
);

export default router;
