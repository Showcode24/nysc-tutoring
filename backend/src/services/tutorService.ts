import { PrismaClient, TutorStatus } from "@prisma/client";
import { eventService, SystemEvent } from "./eventService";
import { TutorResponse, TutorUploadDocumentRequest } from "@/types/index";

const prisma = new PrismaClient();

export class TutorService {
  /**
   * Get tutor profile
   */
  static async getTutorProfile(userId: string): Promise<TutorResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tutor: {
          include: {
            documents: {
              select: {
                id: true,
                documentType: true,
                fileName: true,
                verified: true,
                uploadedAt: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.tutor) {
      return null;
    }

    const tutor = user.tutor;
    return {
      id: tutor.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: tutor.status,
      specialization: tutor.specialization,
      yearsOfExperience: tutor.yearsOfExperience,
      hourlyRate: tutor.hourlyRate,
      bio: tutor.bio || undefined,
      documents: tutor.documents,
      createdAt: tutor.createdAt.toISOString(),
      updatedAt: tutor.updatedAt.toISOString(),
    };
  }

  /**
   * Upload document
   * Tutors can upload government ID, certificates, degrees, etc.
   */
  static async uploadDocument(
    tutorId: string,
    input: TutorUploadDocumentRequest
  ) {
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      throw new Error("Tutor not found");
    }

    const document = await prisma.tutorDocument.create({
      data: {
        tutorId,
        documentType: input.documentType,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        uploadedAt: new Date(),
      },
    });

    // Emit event for document uploaded
    const user = await prisma.user.findUnique({
      where: { id: tutor.userId },
    });

    if (user) {
      await eventService.emit(SystemEvent.DOCUMENT_UPLOADED, {
        tutorId,
        documentType: input.documentType,
        fileName: input.fileName,
        uploadedAt: new Date(),
      });
    }

    return document;
  }

  /**
   * Get tutor's documents
   */
  static async getTutorDocuments(tutorId: string) {
    return await prisma.tutorDocument.findMany({
      where: { tutorId },
      orderBy: { uploadedAt: "desc" },
    });
  }

  /**
   * Verify document (admin only)
   */
  static async verifyDocument(documentId: string, verifiedBy: string) {
    const document = await prisma.tutorDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    return await prisma.tutorDocument.update({
      where: { id: documentId },
      data: {
        verified: true,
        verifiedAt: new Date(),
        verifiedBy,
      },
    });
  }

  /**
   * View gigs (only if tutor is ACTIVE)
   * Tutors in REGISTERED_RESTRICTED or CHECKED_IN cannot view gigs
   */
  static async viewGigs(tutorId: string) {
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      throw new Error("Tutor not found");
    }

    // CRITICAL: Access control based on status
    if (tutor.status !== TutorStatus.ACTIVE) {
      throw new Error(
        `Cannot view gigs. Current status: ${tutor.status}. Must be ACTIVE.`
      );
    }

    // Return available gigs
    return await prisma.gig.findMany({
      where: {
        status: "OPEN",
      },
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        level: true,
        hourlyRate: true,
        startDate: true,
        endDate: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });
  }

  /**
   * View appointments
   */
  static async viewAppointments(tutorId: string) {
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
   * Get tutor status
   */
  static async getTutorStatus(tutorId: string) {
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      throw new Error("Tutor not found");
    }

    return {
      status: tutor.status,
      canAccessGigs: tutor.status === TutorStatus.ACTIVE,
    };
  }

  /**
   * Get pending tutors (for admin dashboard)
   */
  static async getPendingTutors(status?: TutorStatus) {
    return await prisma.tutor.findMany({
      where: {
        status: status || TutorStatus.REGISTERED_RESTRICTED,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        documents: true,
        appointments: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Search tutors (admin)
   */
  static async searchTutors(query: string, limit: number = 20) {
    return await prisma.tutor.findMany({
      where: {
        OR: [
          {
            specialization: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            user: {
              OR: [
                {
                  firstName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        ],
      },
      include: {
        user: true,
      },
      take: limit,
    });
  }

  /**
   * Get tutor details (admin view)
   */
  static async getTutorDetails(tutorId: string) {
    return await prisma.tutor.findUnique({
      where: { id: tutorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            createdAt: true,
          },
        },
        documents: true,
        appointments: {
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
        },
      },
    });
  }
}

export default TutorService;
