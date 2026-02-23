import {
  PrismaClient,
  UserType,
  AdminRole,
  TutorStatus,
  AppointmentStatus,
  DocumentType,
  AuditAction,
} from "@prisma/client";
import { hashPassword } from "../src/utils/index";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ==================== ADMINS ====================

  console.log("📝 Creating admin users...");

  const adminPassword = await hashPassword(
    process.env.ADMIN_DEFAULT_PASSWORD || "admin123456",
  );

  // Super Admin
  const superAdminUser = await prisma.user.upsert({
    where: { email: "superadmin@Kopa360.com" },
    update: {},
    create: {
      email: "superadmin@Kopa360.com",
      password: adminPassword,
      firstName: "Super",
      lastName: "Admin",
      userType: UserType.ADMIN,
    },
  });

  const superAdmin = await prisma.admin.upsert({
    where: { userId: superAdminUser.id },
    update: {},
    create: {
      userId: superAdminUser.id,
      role: AdminRole.SUPER_ADMIN,
      department: "Executive",
    },
  });

  console.log("✓ Super Admin created");
  console.log("  Email: superadmin@Kopa360.com");
  console.log(
    `  Password: ${process.env.ADMIN_DEFAULT_PASSWORD || "admin123456"}\n`,
  );

  // Manager
  const managerUser = await prisma.user.upsert({
    where: { email: "manager@Kopa360.com" },
    update: {},
    create: {
      email: "manager@Kopa360.com",
      password: adminPassword,
      firstName: "Chioma",
      lastName: "Okafor",
      userType: UserType.ADMIN,
    },
  });

  const manager = await prisma.admin.upsert({
    where: { userId: managerUser.id },
    update: {},
    create: {
      userId: managerUser.id,
      role: AdminRole.MANAGER,
      department: "Verification",
    },
  });

  console.log("✓ Manager created");
  console.log("  Email: manager@Kopa360.com");
  console.log(
    `  Password: ${process.env.ADMIN_DEFAULT_PASSWORD || "admin123456"}\n`,
  );

  // Front Desk
  const frontDeskUser = await prisma.user.upsert({
    where: { email: "frontdesk@Kopa360.com" },
    update: {},
    create: {
      email: "frontdesk@Kopa360.com",
      password: adminPassword,
      firstName: "Front",
      lastName: "Desk",
      userType: UserType.ADMIN,
    },
  });

  await prisma.admin.upsert({
    where: { userId: frontDeskUser.id },
    update: {},
    create: {
      userId: frontDeskUser.id,
      role: AdminRole.FRONT_DESK,
      department: "Reception",
    },
  });

  console.log("✓ Front Desk created");
  console.log("  Email: frontdesk@Kopa360.com");
  console.log(
    `  Password: ${process.env.ADMIN_DEFAULT_PASSWORD || "admin123456"}\n`,
  );

  // ==================== TUTORS ====================

  console.log("📝 Creating tutors with documents...");

  const tutorPassword = await hashPassword("tutor123456");

  const tutorsData = [
    {
      email: "aisha.adebayo@email.com",
      firstName: "Aisha",
      lastName: "Adebayo",
      phone: "+234 (803) 123-4567",
      bio: "Experienced mathematics tutor with expertise in WASSCE and JAMB preparation. Passionate about helping students excel in quantitative subjects.",
      specialization: "Mathematics",
      yearsOfExperience: 5,
      hourlyRate: 15000,
      status: TutorStatus.REGISTERED_RESTRICTED,
      documents: [
        {
          type: DocumentType.GOVERNMENT_ID,
          name: "National ID",
          verified: true,
        },
        {
          type: DocumentType.CERTIFICATE,
          name: "Teaching Certificate",
          verified: false,
        },
      ],
    },
    {
      email: "chukwu.eze@email.com",
      firstName: "Chukwu",
      lastName: "Eze",
      phone: "+234 (803) 234-5678",
      bio: "Computer Science graduate from University of Lagos with expertise in programming and software development. Certified instructor.",
      specialization: "Computer Science",
      yearsOfExperience: 3,
      hourlyRate: 18000,
      status: TutorStatus.ACTIVE,
      documents: [
        {
          type: DocumentType.GOVERNMENT_ID,
          name: "National ID",
          verified: true,
        },
        {
          type: DocumentType.DEGREE,
          name: "University Degree",
          verified: true,
        },
      ],
    },
    {
      email: "ngozi.obi@email.com",
      firstName: "Ngozi",
      lastName: "Obi",
      phone: "+234 (805) 345-6789",
      bio: "English Language specialist with focus on WAEC examination preparation and literature. Native Yoruba speaker with fluent English.",
      specialization: "English Language",
      yearsOfExperience: 4,
      hourlyRate: 12000,
      status: TutorStatus.REGISTERED_RESTRICTED,
      documents: [
        {
          type: DocumentType.GOVERNMENT_ID,
          name: "National ID",
          verified: true,
        },
        {
          type: DocumentType.CERTIFICATE,
          name: "TEFL Certificate",
          verified: true,
        },
      ],
    },
    {
      email: "tunde.adeniran@email.com",
      firstName: "Tunde",
      lastName: "Adeniran",
      phone: "+234 (808) 456-7890",
      bio: "Chemistry and Biology tutor with strong background in STEM subjects. Experienced in laboratory practicals and exam preparation.",
      specialization: "Chemistry",
      yearsOfExperience: 1,
      hourlyRate: 14000,
      status: TutorStatus.REGISTERED_RESTRICTED,
      documents: [
        {
          type: DocumentType.GOVERNMENT_ID,
          name: "National ID",
          verified: true,
        },
      ],
    },
    {
      email: "zainab.malik@email.com",
      firstName: "Zainab",
      lastName: "Malik",
      phone: "+234 (810) 567-8901",
      bio: "Professional music teacher and composer. Specializes in music theory, notation, and instrument instruction for all levels.",
      specialization: "Music",
      yearsOfExperience: 7,
      hourlyRate: 16000,
      status: TutorStatus.REGISTERED_RESTRICTED,
      documents: [
        {
          type: DocumentType.GOVERNMENT_ID,
          name: "National ID",
          verified: false,
        },
      ],
    },
  ];

  const createdTutors: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[] = [];

  for (const data of tutorsData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        password: tutorPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        userType: UserType.TUTOR,
      },
    });

    const tutor = await prisma.tutor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        status: data.status,
        specialization: data.specialization,
        yearsOfExperience: data.yearsOfExperience,
        hourlyRate: data.hourlyRate,
        bio: data.bio,
      },
    });

    createdTutors.push({
      id: tutor.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    });

    // Create tutor documents
    for (const doc of data.documents) {
      await prisma.tutorDocument.create({
        data: {
          tutorId: tutor.id,
          documentType: doc.type,
          fileName: doc.name,
          fileUrl: `https://example.com/${doc.name.replace(/\s/g, "-").toLowerCase()}.pdf`,
          verified: doc.verified,
          verifiedAt: doc.verified ? new Date("2024-01-16") : null,
        },
      });
    }

    console.log(
      `✓ ${data.firstName} ${data.lastName} (${data.specialization})`,
    );
  }

  console.log(`\n  All tutors created with documents. Password: tutor123456\n`);

  // ==================== GIGS ====================

  console.log("📝 Creating gigs...");

  const gigsData = [
    {
      title: "JAMB Mathematics Prep Tutor Needed",
      subject: "Mathematics",
      description:
        "Seeking an experienced tutor to prepare a secondary 6 student for JAMB examination. Student aims for 280+ score in Mathematics.",
      level: "HIGH_SCHOOL",
      hourlyRate: 16000,
      startDate: new Date("2024-02-01"),
      status: "OPEN",
    },
    {
      title: "Python Programming and Web Development",
      subject: "Computer Science",
      description:
        "University student needs help learning Python basics, web frameworks, and practical project development. Location: Lagos mainland.",
      level: "BEGINNER",
      hourlyRate: 15000,
      startDate: new Date("2024-01-25"),
      status: "OPEN",
    },
    {
      title: "English Language WAEC Exam Coaching",
      subject: "English Language",
      description:
        "Secondary school student requires intensive coaching for WAEC English Language examination. Focus on comprehension, essay writing, and oral skills.",
      level: "BEGINNER",
      hourlyRate: 13000,
      startDate: new Date("2024-02-05"),
      status: "OPEN",
    },
    {
      title: "UTME Chemistry and Biology Support",
      subject: "Chemistry",
      description:
        "Final year student needs weekly support for Chemistry and Biology practicals. Preparation for UTME and university entrance examinations.",
      level: "HIGH_SCHOOL",
      hourlyRate: 17000,
      startDate: new Date("2024-01-22"),
      status: "OPEN",
    },
  ];

  const createdGigs = [];

  for (const gig of gigsData) {
    const createdGig = await prisma.gig.create({
      data: gig,
    });
    createdGigs.push(createdGig);
    console.log(`✓ ${gig.title}`);
  }

  console.log();

  // ==================== APPOINTMENTS ====================

  console.log("📝 Creating appointments...");

  const appointmentDates = [
    {
      tutorIndex: 0,
      date: "2024-01-20T10:00:00Z",
      status: AppointmentStatus.SCHEDULED,
    },
    {
      tutorIndex: 2,
      date: "2024-01-22T14:00:00Z",
      status: AppointmentStatus.SCHEDULED,
    },
    {
      tutorIndex: 1,
      date: "2024-01-18T11:00:00Z",
      status: AppointmentStatus.COMPLETED,
    },
    {
      tutorIndex: 4,
      date: "2024-01-23T15:30:00Z",
      status: AppointmentStatus.SCHEDULED,
    },
  ];

  for (const apt of appointmentDates) {
    if (createdTutors[apt.tutorIndex]) {
      await prisma.appointment.create({
        data: {
          tutorId: createdTutors[apt.tutorIndex].id,
          adminId: manager.id,
          scheduledAt: new Date(apt.date),
          status: apt.status,
          location: "Office",
          notes:
            apt.status === AppointmentStatus.COMPLETED
              ? "Completed orientation successfully. Ready for assignments."
              : null,
        },
      });
      console.log(
        `✓ Appointment for ${createdTutors[apt.tutorIndex].firstName} ${createdTutors[apt.tutorIndex].lastName}`,
      );
    }
  }

  console.log();

  // ==================== TUTOR STATUS HISTORY ====================

  console.log("📝 Creating tutor status history...");

  // Create status history for Michael Chen (changed from restricted to active)
  if (createdTutors[1]) {
    await prisma.tutorStatusHistory.create({
      data: {
        tutorId: createdTutors[1].id,
        oldStatus: TutorStatus.REGISTERED_RESTRICTED,
        newStatus: TutorStatus.ACTIVE,
        changedBy: manager.id,
        reason: "All documents verified. Ready to take gigs.",
        changedAt: new Date("2024-01-18"),
      },
    });
    console.log(
      `✓ Status history for ${createdTutors[1].firstName} ${createdTutors[1].lastName}`,
    );
  }

  console.log();

  // ==================== AUDIT LOGS ====================

  console.log("📝 Creating audit logs...");

  const auditEntries = [
    {
      adminId: manager.id,
      action: AuditAction.TUTOR_REGISTERED,
      targetType: "Tutor",
      targetId: createdTutors[0]?.id || "",
      details: `${createdTutors[0]?.firstName} ${createdTutors[0]?.lastName} registered as tutor`,
    },
    {
      adminId: manager.id,
      action: AuditAction.DOCUMENT_UPLOADED,
      targetType: "Tutor",
      targetId: createdTutors[0]?.id || "",
      details: "Government ID and Teaching Certificate uploaded",
    },
    {
      adminId: manager.id,
      action: AuditAction.STATUS_CHANGED,
      targetType: "Tutor",
      targetId: createdTutors[1]?.id || "",
      details: "Status changed from Registered to Active",
    },
    {
      adminId: manager.id,
      action: AuditAction.APPOINTMENT_SCHEDULED,
      targetType: "Appointment",
      targetId: createdTutors[0]?.id || "",
      details: "Verification appointment scheduled",
    },
  ];

  for (const audit of auditEntries) {
    if (audit.targetId) {
      await prisma.adminActionLog.create({
        data: {
          adminId: audit.adminId,
          action: audit.action,
          targetType: audit.targetType,
          targetId: audit.targetId,
          details: audit.details,
        },
      });
    }
  }

  console.log(`✓ ${auditEntries.length} audit logs created`);
  console.log();

  console.log("✅ Database seed completed successfully!\n");

  console.log("📌 DEFAULT CREDENTIALS FOR TESTING:");
  console.log("────────────────────────────────────");
  console.log("\nAdmins:");
  console.log("  Super Admin: superadmin@Kopa360.com");
  console.log("  Manager: manager@Kopa360.com");
  console.log("  Front Desk: frontdesk@Kopa360.com");
  console.log("  Password: admin123456");
  console.log("\nTutors:");
  console.log("  aisha.adebayo@email.com - Aisha Adebayo (Mathematics)");
  console.log("  chukwu.eze@email.com - Chukwu Eze (Computer Science)");
  console.log("  ngozi.obi@email.com - Ngozi Obi (English Language)");
  console.log("  tunde.adeniran@email.com - Tunde Adeniran (Chemistry)");
  console.log("  zainab.malik@email.com - Zainab Malik (Music)");
  console.log("  Password: tutor123456\n");
  console.log("Gigs created: 4 open positions");
  console.log("Appointments: 4 scheduled/completed\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
