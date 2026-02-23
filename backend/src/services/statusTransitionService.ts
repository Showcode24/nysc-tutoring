import { PrismaClient, TutorStatus, AuditAction } from "@prisma/client";
import {
  StatusTransitionContext,
  StatusTransitionResult,
} from "@/types/index";

const prisma = new PrismaClient();

/**
 * STATUS TRANSITION STATE MACHINE
 *
 * Valid transitions:
 * REGISTERED_RESTRICTED → CHECKED_IN (by front desk)
 * CHECKED_IN → ACTIVE (by manager after verification)
 * CHECKED_IN → REJECTED (by manager if verification fails)
 * REGISTERED_RESTRICTED → REJECTED (by manager - can reject without check-in)
 *
 * ACTIVE and REJECTED are terminal states (no further transitions)
 */

const VALID_TRANSITIONS: Record<TutorStatus, TutorStatus[]> = {
  REGISTERED_RESTRICTED: [TutorStatus.CHECKED_IN, TutorStatus.REJECTED],
  CHECKED_IN: [TutorStatus.ACTIVE, TutorStatus.REJECTED],
  ACTIVE: [],
  REJECTED: [],
};

export class StatusTransitionService {
  /**
   * Validate if transition is allowed
   */
  static validateTransition(
    fromStatus: TutorStatus,
    toStatus: TutorStatus
  ): { valid: boolean; reason?: string } {
    const allowedTransitions = VALID_TRANSITIONS[fromStatus];

    if (!allowedTransitions.includes(toStatus)) {
      return {
        valid: false,
        reason: `Cannot transition from ${fromStatus} to ${toStatus}. Allowed transitions: ${allowedTransitions.join(", ") || "none"}`,
      };
    }

    return { valid: true };
  }

  /**
   * Execute status transition with full audit trail
   * This is the ONLY place where status changes happen
   */
  static async transitionStatus(
    context: StatusTransitionContext
  ): Promise<StatusTransitionResult> {
    // Get current tutor state
    const tutor = await prisma.tutor.findUnique({
      where: { id: context.tutorId },
    });

    if (!tutor) {
      throw new Error("Tutor not found");
    }

    // Validate transition is allowed
    const validation = this.validateTransition(tutor.status, context.toStatus);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // Execute transition in transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update tutor status
      const updatedTutor = await tx.tutor.update({
        where: { id: context.tutorId },
        data: {
          status: context.toStatus,
          updatedAt: new Date(),
        },
      });

      // Record status change in history
      await tx.tutorStatusHistory.create({
        data: {
          tutorId: context.tutorId,
          oldStatus: tutor.status,
          newStatus: context.toStatus,
          changedBy: context.changedBy,
          reason: context.reason,
          changedAt: new Date(),
        },
      });

      // Log admin action (if admin made the change)
      if (context.changedBy) {
        const admin = await tx.admin.findUnique({
          where: { userId: context.changedBy },
        });

        if (admin) {
          let auditAction: AuditAction = AuditAction.STATUS_CHANGED;

          if (context.toStatus === TutorStatus.ACTIVE) {
            auditAction = AuditAction.TUTOR_APPROVED;
          } else if (context.toStatus === TutorStatus.REJECTED) {
            auditAction = AuditAction.TUTOR_REJECTED;
          } else if (context.toStatus === TutorStatus.CHECKED_IN) {
            auditAction = AuditAction.TUTOR_CHECKED_IN;
          }

          await tx.adminActionLog.create({
            data: {
              adminId: admin.id,
              action: auditAction,
              targetType: "Tutor",
              targetId: context.tutorId,
              details: JSON.stringify({
                oldStatus: tutor.status,
                newStatus: context.toStatus,
                reason: context.reason,
              }),
              performedAt: new Date(),
            },
          });
        }
      }

      return updatedTutor;
    });

    return {
      success: true,
      message: `Tutor status changed from ${tutor.status} to ${context.toStatus}`,
      oldStatus: tutor.status,
      newStatus: result.status,
    };
  }

  /**
   * Check in tutor
   * Transition: REGISTERED_RESTRICTED → CHECKED_IN
   * Can only be done by FRONT_DESK
   */
  static async checkInTutor(
    tutorId: string,
    adminId: string
  ): Promise<StatusTransitionResult> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    // Check appointment exists and is scheduled
    const appointment = await prisma.appointment.findFirst({
      where: {
        tutorId,
        adminId,
      },
    });

    if (!appointment) {
      throw new Error("No appointment found for this tutor and admin");
    }

    return this.transitionStatus({
      tutorId,
      fromStatus: TutorStatus.REGISTERED_RESTRICTED,
      toStatus: TutorStatus.CHECKED_IN,
      changedBy: admin.userId,
      reason: `Check-in via appointment ${appointment.id}`,
      appointmentId: appointment.id,
    });
  }

  /**
   * Approve tutor
   * Transition: CHECKED_IN → ACTIVE
   * Can only be done by MANAGER or SUPER_ADMIN
   */
  static async approveTutor(
    tutorId: string,
    adminId: string,
    reason?: string
  ): Promise<StatusTransitionResult> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    return this.transitionStatus({
      tutorId,
      fromStatus: TutorStatus.CHECKED_IN,
      toStatus: TutorStatus.ACTIVE,
      changedBy: admin.userId,
      reason: reason || "Tutor approved after verification",
    });
  }

  /**
   * Reject tutor
   * Can transition from REGISTERED_RESTRICTED or CHECKED_IN
   * Can only be done by MANAGER or SUPER_ADMIN
   */
  static async rejectTutor(
    tutorId: string,
    adminId: string,
    reason: string
  ): Promise<StatusTransitionResult> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    // Get current status to determine valid transition
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      throw new Error("Tutor not found");
    }

    return this.transitionStatus({
      tutorId,
      fromStatus: tutor.status,
      toStatus: TutorStatus.REJECTED,
      changedBy: admin.userId,
      reason: reason || "Tutor rejected",
    });
  }

  /**
   * Get tutor status history
   */
  static async getStatusHistory(tutorId: string) {
    return await prisma.tutorStatusHistory.findMany({
      where: { tutorId },
      orderBy: { changedAt: "desc" },
    });
  }

  /**
   * Get all tutors by status
   */
  static async getTutorsByStatus(status: TutorStatus) {
    return await prisma.tutor.findMany({
      where: { status },
      include: {
        user: true,
      },
    });
  }
}

export default StatusTransitionService;
