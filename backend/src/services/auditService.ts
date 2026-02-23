import { PrismaClient, AuditAction } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Audit Service
 * Handles all audit logging for compliance and accountability
 */

export class AuditService {
  /**
   * Log an admin action
   */
  static async logAction(
    adminId: string,
    action: AuditAction,
    targetType: string,
    targetId: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return await prisma.adminActionLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
        performedAt: new Date(),
      },
    });
  }

  /**
   * Get audit logs for an admin
   */
  static async getAdminLogs(
    adminId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    const [logs, total] = await Promise.all([
      prisma.adminActionLog.findMany({
        where: { adminId },
        include: {
          admin: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { performedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.adminActionLog.count({
        where: { adminId },
      }),
    ]);

    return {
      logs,
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }

  /**
   * Get audit logs for a specific target (tutor, appointment, etc.)
   */
  static async getTargetLogs(
    targetType: string,
    targetId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    const [logs, total] = await Promise.all([
      prisma.adminActionLog.findMany({
        where: {
          targetType,
          targetId,
        },
        include: {
          admin: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { performedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.adminActionLog.count({
        where: {
          targetType,
          targetId,
        },
      }),
    ]);

    return {
      logs,
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }

  /**
   * Get all audit logs (for super admin)
   */
  static async getAllLogs(
    action?: AuditAction,
    limit: number = 100,
    offset: number = 0
  ) {
    const [logs, total] = await Promise.all([
      prisma.adminActionLog.findMany({
        where: action ? { action } : {},
        include: {
          admin: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { performedAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.adminActionLog.count({
        where: action ? { action } : {},
      }),
    ]);

    return {
      logs,
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }

  /**
   * Answer accountability questions
   * "Who approved this tutor?"
   */
  static async getApprovalAudit(tutorId: string) {
    const logs = await prisma.adminActionLog.findMany({
      where: {
        targetId: tutorId,
        action: AuditAction.TUTOR_APPROVED,
      },
      include: {
        admin: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (logs.length === 0) {
      return null;
    }

    const log = logs[0]; // Get first (most recent) approval

    return {
      approvedBy: {
        id: log.admin.user.id,
        name: `${log.admin.user.firstName} ${log.admin.user.lastName}`,
        email: log.admin.user.email,
      },
      approvedAt: log.performedAt,
      role: log.admin.role,
      details: log.details ? JSON.parse(log.details) : null,
    };
  }

  /**
   * Get full status change history for a tutor
   */
  static async getTutorTimeline(tutorId: string) {
    const statusHistory = await prisma.tutorStatusHistory.findMany({
      where: { tutorId },
      orderBy: { changedAt: "asc" },
    });

    const actionLogs = await prisma.adminActionLog.findMany({
      where: {
        targetId: tutorId,
      },
      orderBy: { performedAt: "asc" },
      include: {
        admin: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return {
      statusChanges: statusHistory,
      actions: actionLogs,
    };
  }
}

export default AuditService;
