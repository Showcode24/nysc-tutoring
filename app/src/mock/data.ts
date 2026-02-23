import type {
  Tutor,
  Admin,
  Gig,
  Appointment,
  AuditEvent,
  Notification,
  DashboardMetrics,
  GigApplication,
} from "../types";

// Mock Tutors
export const mockTutors: Tutor[] = [
  {
    id: "1",
    email: "sarah.johnson@email.com",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1 (555) 123-4567",
    status: "pending",
    bio: "Experienced mathematics tutor with a passion for helping students succeed.",
    skills: ["Calculus", "Algebra", "Statistics", "SAT Prep"],
    subjects: ["Mathematics", "Physics"],
    education: "M.S. Mathematics, Stanford University",
    experience: "5 years tutoring experience",
    documents: [
      {
        id: "d1",
        name: "Government ID",
        type: "id",
        status: "approved",
        uploadedAt: "2024-01-15",
      },
      {
        id: "d2",
        name: "Teaching Certificate",
        type: "certification",
        status: "pending",
        uploadedAt: "2024-01-16",
      },
      {
        id: "d3",
        name: "Background Check",
        type: "background_check",
        status: "pending",
        uploadedAt: "2024-01-16",
      },
    ],
    profileCompletion: 85,
    createdAt: "2024-01-14",
    appointmentDate: "2024-01-20",
  },
  {
    id: "2",
    email: "michael.chen@email.com",
    firstName: "Michael",
    lastName: "Chen",
    phone: "+1 (555) 234-5678",
    status: "active",
    bio: "Computer Science graduate with expertise in programming and web development.",
    skills: ["Python", "JavaScript", "React", "Data Structures"],
    subjects: ["Computer Science", "Web Development"],
    education: "B.S. Computer Science, MIT",
    experience: "3 years tutoring experience",
    documents: [
      {
        id: "d4",
        name: "Government ID",
        type: "id",
        status: "approved",
        uploadedAt: "2024-01-10",
      },
      {
        id: "d5",
        name: "Degree Certificate",
        type: "degree",
        status: "approved",
        uploadedAt: "2024-01-10",
      },
      {
        id: "d6",
        name: "Background Check",
        type: "background_check",
        status: "approved",
        uploadedAt: "2024-01-12",
      },
    ],
    profileCompletion: 100,
    createdAt: "2024-01-09",
  },
  {
    id: "3",
    email: "emily.rodriguez@email.com",
    firstName: "Emily",
    lastName: "Rodriguez",
    phone: "+1 (555) 345-6789",
    status: "restricted",
    bio: "Bilingual English and Spanish tutor specializing in language arts and ESL.",
    skills: ["ESL", "Creative Writing", "Grammar", "Literature"],
    subjects: ["English", "Spanish"],
    education: "B.A. English Literature, UCLA",
    experience: "4 years tutoring experience",
    documents: [
      {
        id: "d7",
        name: "Government ID",
        type: "id",
        status: "approved",
        uploadedAt: "2024-01-12",
      },
      {
        id: "d8",
        name: "TESOL Certificate",
        type: "certification",
        status: "approved",
        uploadedAt: "2024-01-12",
      },
      {
        id: "d9",
        name: "Background Check",
        type: "background_check",
        status: "pending",
        uploadedAt: "2024-01-13",
      },
    ],
    profileCompletion: 90,
    verificationNotes: "Awaiting background check clearance",
    createdAt: "2024-01-11",
    appointmentDate: "2024-01-22",
  },
  {
    id: "4",
    email: "david.kim@email.com",
    firstName: "David",
    lastName: "Kim",
    phone: "+1 (555) 456-7890",
    status: "rejected",
    bio: "Science enthusiast with background in chemistry and biology.",
    skills: ["Organic Chemistry", "Biology", "Lab Techniques"],
    subjects: ["Chemistry", "Biology"],
    education: "B.S. Chemistry, UC Berkeley",
    experience: "1 year tutoring experience",
    documents: [
      {
        id: "d10",
        name: "Government ID",
        type: "id",
        status: "approved",
        uploadedAt: "2024-01-08",
      },
      {
        id: "d11",
        name: "Background Check",
        type: "background_check",
        status: "rejected",
        uploadedAt: "2024-01-09",
      },
    ],
    profileCompletion: 75,
    verificationNotes: "Background check did not meet requirements",
    createdAt: "2024-01-07",
  },
  {
    id: "5",
    email: "jessica.taylor@email.com",
    firstName: "Jessica",
    lastName: "Taylor",
    phone: "+1 (555) 567-8901",
    status: "pending",
    bio: "Professional musician and music theory expert.",
    skills: ["Piano", "Music Theory", "Composition", "Ear Training"],
    subjects: ["Music"],
    education: "M.A. Music Theory, Juilliard",
    experience: "7 years teaching experience",
    documents: [
      {
        id: "d12",
        name: "Government ID",
        type: "id",
        status: "pending",
        uploadedAt: "2024-01-17",
      },
    ],
    profileCompletion: 60,
    createdAt: "2024-01-16",
  },
];

// Mock Admin
export const mockAdmin: Admin = {
  id: "admin-1",
  email: "admin@Kopa360.com",
  firstName: "Alexandra",
  lastName: "Mitchell",
  role: "manager",
  createdAt: "2023-01-01",
};

// Mock Gigs
export const mockGigs: Gig[] = [
  {
    id: "g1",
    title: "SAT Math Prep Tutor Needed",
    subject: "Mathematics",
    description:
      "Looking for an experienced tutor to help prepare a high school junior for the SAT Math section. Student is aiming for a 750+ score.",
    hourlyRate: 65,
    hoursPerWeek: 4,
    location: "San Francisco, CA",
    startDate: "2024-02-01",
    status: "open",
    createdAt: "2024-01-18",
  },
  {
    id: "g2",
    title: "Python Programming Fundamentals",
    subject: "Computer Science",
    description:
      "Beginner student needs help learning Python basics including variables, loops, functions, and object-oriented programming.",
    hourlyRate: 55,
    hoursPerWeek: 3,
    location: "Remote",
    startDate: "2024-01-25",
    status: "assigned",
    studentName: "Alex Thompson",
    createdAt: "2024-01-15",
  },
  {
    id: "g3",
    title: "Spanish Conversation Practice",
    subject: "Spanish",
    description:
      "Adult learner seeking conversational Spanish practice. Intermediate level, wants to improve fluency for upcoming travel.",
    hourlyRate: 45,
    hoursPerWeek: 2,
    location: "Oakland, CA",
    startDate: "2024-02-05",
    status: "open",
    createdAt: "2024-01-19",
  },
  {
    id: "g4",
    title: "AP Chemistry Support",
    subject: "Chemistry",
    description:
      "High school senior needs weekly support for AP Chemistry. Focus on lab reports and exam preparation.",
    hourlyRate: 60,
    hoursPerWeek: 3,
    location: "Berkeley, CA",
    startDate: "2024-01-22",
    status: "open",
    createdAt: "2024-01-17",
  },
];

// Mock Gig Applications
export const mockGigApplications: GigApplication[] = [
  {
    id: "ga1",
    gigId: "g1",
    tutorId: "2",
    status: "applied",
    appliedAt: "2024-01-19T10:00:00Z",
    message:
      "I have 5 years of SAT Math tutoring experience and have helped students achieve 750+ scores consistently.",
  },
  {
    id: "ga2",
    gigId: "g2",
    tutorId: "2",
    status: "accepted",
    appliedAt: "2024-01-16T14:30:00Z",
    message:
      "As a CS graduate from MIT, I am well-equipped to teach Python fundamentals.",
  },
  {
    id: "ga3",
    gigId: "g3",
    tutorId: "3",
    status: "applied",
    appliedAt: "2024-01-20T09:15:00Z",
    message:
      "Native Spanish speaker with 4 years of ESL and language tutoring experience.",
  },
  {
    id: "ga4",
    gigId: "g4",
    tutorId: "2",
    status: "rejected",
    appliedAt: "2024-01-18T11:00:00Z",
    message: "I have strong chemistry knowledge from my coursework.",
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: "apt1",
    tutorId: "1",
    tutorName: "Sarah Johnson",
    type: "verification",
    date: "2024-01-20",
    time: "10:00 AM",
    status: "scheduled",
    assignedAdmin: "Alexandra Mitchell",
  },
  {
    id: "apt2",
    tutorId: "3",
    tutorName: "Emily Rodriguez",
    type: "interview",
    date: "2024-01-22",
    time: "2:00 PM",
    status: "scheduled",
    assignedAdmin: "Alexandra Mitchell",
  },
  {
    id: "apt3",
    tutorId: "2",
    tutorName: "Michael Chen",
    type: "orientation",
    date: "2024-01-18",
    time: "11:00 AM",
    status: "completed",
    assignedAdmin: "Alexandra Mitchell",
    notes: "Completed orientation successfully. Ready for assignments.",
  },
  {
    id: "apt4",
    tutorId: "5",
    tutorName: "Jessica Taylor",
    type: "verification",
    date: "2024-01-23",
    time: "3:30 PM",
    status: "scheduled",
  },
];

// Mock Audit Events
export const mockAuditEvents: AuditEvent[] = [
  {
    id: "evt1",
    tutorId: "1",
    action: "Application Submitted",
    description: "Sarah Johnson submitted their tutor application",
    timestamp: "2024-01-14T09:30:00Z",
  },
  {
    id: "evt2",
    tutorId: "1",
    action: "Documents Uploaded",
    description: "Government ID and Teaching Certificate uploaded",
    timestamp: "2024-01-15T14:20:00Z",
  },
  {
    id: "evt3",
    tutorId: "1",
    action: "Document Approved",
    description: "Government ID was approved",
    adminName: "Alexandra Mitchell",
    timestamp: "2024-01-16T10:15:00Z",
  },
  {
    id: "evt4",
    tutorId: "1",
    action: "Appointment Scheduled",
    description: "Verification appointment scheduled for January 20, 2024",
    adminName: "Alexandra Mitchell",
    timestamp: "2024-01-17T11:00:00Z",
  },
  {
    id: "evt5",
    tutorId: "2",
    action: "Status Changed",
    description: "Status changed from Pending to Active",
    adminName: "Alexandra Mitchell",
    timestamp: "2024-01-18T16:30:00Z",
  },
  {
    id: "evt6",
    tutorId: "3",
    action: "Status Changed",
    description: "Status changed to Restricted - awaiting background check",
    adminName: "Alexandra Mitchell",
    timestamp: "2024-01-19T09:45:00Z",
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "Appointment Reminder",
    message:
      "Your verification appointment is scheduled for tomorrow at 10:00 AM.",
    type: "info",
    read: false,
    createdAt: "2024-01-19T08:00:00Z",
  },
  {
    id: "n2",
    title: "Document Approved",
    message: "Your Government ID has been approved.",
    type: "success",
    read: true,
    createdAt: "2024-01-16T10:15:00Z",
  },
  {
    id: "n3",
    title: "Profile Incomplete",
    message: "Please complete your profile to proceed with verification.",
    type: "warning",
    read: false,
    createdAt: "2024-01-15T12:00:00Z",
  },
];

// Mock Dashboard Metrics
export const mockDashboardMetrics: DashboardMetrics = {
  totalTutors: 156,
  pendingTutors: 23,
  activeTutors: 112,
  totalGigs: 89,
  openGigs: 34,
  appointmentsToday: 8,
};

// Current logged in tutor (for demo purposes)
export const currentTutor: Tutor = mockTutors[0];

// Helper to get tutor by ID
export const getTutorById = (id: string): Tutor | undefined => {
  return mockTutors.find((t) => t.id === id);
};

// Helper to get gig by ID
export const getGigById = (id: string): Gig | undefined => {
  return mockGigs.find((g) => g.id === id);
};

// Helper to get appointments for a tutor
export const getAppointmentsForTutor = (tutorId: string): Appointment[] => {
  return mockAppointments.filter((apt) => apt.tutorId === tutorId);
};

// Helper to get audit events for a tutor
export const getAuditEventsForTutor = (tutorId: string): AuditEvent[] => {
  return mockAuditEvents.filter((evt) => evt.tutorId === tutorId);
};

// Helper to get applications for a tutor
export const getApplicationsForTutor = (tutorId: string): GigApplication[] => {
  return mockGigApplications.filter((app) => app.tutorId === tutorId);
};

// Helper to get applications for a gig
export const getApplicationsForGig = (gigId: string): GigApplication[] => {
  return mockGigApplications.filter((app) => app.gigId === gigId);
};
