import { PrismaClient, AppointmentStatus } from "@prisma/client";
import { eventService, SystemEvent } from "./eventService";

const prisma = new PrismaClient();

export class AppointmentService {
  /**
   * Schedule appointment
   * Only managers can schedule
   */
  static async scheduleAppointment(
    tutorId: string,
    adminId: string,
    scheduledAt: Date,
    location?: string,
    notes?: string
  ) {
    const [tutor, admin] = await Promise.all([
      prisma.tutor.findUnique({ where: { id: tutorId }, include: { user: true } }),
      prisma.admin.findUnique({
        where: { id: adminId },
        include: { user: true },
      }),
    ]);

    if (!tutor) {
      throw new Error("Tutor not found");
    }

    if (!admin) {
      throw new Error("Admin not found");
    }

    // Validate scheduled time is in the future
    if (scheduledAt <= new Date()) {
      throw new Error("Appointment must be scheduled for future date/time");
    }

    const appointment = await prisma.appointment.create({
      data: {
        tutorId,
        adminId,
        scheduledAt,
        location,
        notes,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        tutor: {
          include: { user: true },
        },
        admin: {
          include: { user: true },
        },
      },
    });

    // Emit event
    await eventService.emit(SystemEvent.APPOINTMENT_SCHEDULED, {
      appointmentId: appointment.id,
      tutorId,
      tutorEmail: tutor.user.email,
      scheduledAt,
      adminName: `${admin.user.firstName} ${admin.user.lastName}`,
    });

    return appointment;
  }

  /**
   * Check in tutor for appointment
   * Called when tutor arrives for appointment
   */
  static async checkInTutor(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        tutor: {
          include: { user: true },
        },
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new Error(
        `Cannot check in. Appointment status is ${appointment.status}`
      );
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        checkedInAt: new Date(),
      },
    });

    // Emit event
    await eventService.emit(SystemEvent.TUTOR_CHECKED_IN, {
      tutorId: appointment.tutorId,
      tutorEmail: appointment.tutor.user.email,
      tutorName: `${appointment.tutor.user.firstName} ${appointment.tutor.user.lastName}`,
      appointmentId,
      checkedInAt: updated.checkedInAt!,
    });

    return updated;
  }

  /**
   * Complete appointment
   */
  static async completeAppointment(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        tutor: {
          include: { user: true },
        },
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Emit event
    await eventService.emit(SystemEvent.APPOINTMENT_COMPLETED, {
      appointmentId,
      tutorId: appointment.tutorId,
      tutorEmail: appointment.tutor.user.email,
      completedAt: updated.completedAt!,
    });

    return updated;
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(appointmentId: string, reason?: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new Error("Cannot cancel completed appointment");
    }

    return await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        notes: reason ? `Cancelled: ${reason}` : "Cancelled",
      },
    });
  }

  /**
   * Get appointments for tutor
   */
  static async getTutorAppointments(tutorId: string) {
    return await prisma.appointment.findMany({
      where: { tutorId },
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
      orderBy: { scheduledAt: "desc" },
    });
  }

  /**
   * Get appointments for admin
   */
  static async getAdminAppointments(adminId: string) {
    return await prisma.appointment.findMany({
      where: { adminId },
      include: {
        tutor: {
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
      orderBy: { scheduledAt: "desc" },
    });
  }

  /**
   * Get all scheduled appointments (for admin)
   */
  static async getScheduledAppointments(limit: number = 50, offset: number = 0) {
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: { status: AppointmentStatus.SCHEDULED },
        include: {
          tutor: {
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
        orderBy: { scheduledAt: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.appointment.count({
        where: { status: AppointmentStatus.SCHEDULED },
      }),
    ]);

    return {
      appointments,
      pagination: {
        total,
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get appointment details
   */
  static async getAppointmentDetails(appointmentId: string) {
    return await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        tutor: {
          include: {
            user: true,
          },
        },
        admin: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}

export default AppointmentService;
