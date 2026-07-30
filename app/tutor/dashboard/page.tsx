"use client";
import { useState, useEffect } from "react";
import { TutorStatus } from "@/app/src/types";
import {
  User,
  Briefcase,
  Bell,
  Calendar,
  FileText,
  ArrowRight,
  ArrowUpRight,
  Clock,
  CheckCircle,
  ClipboardList,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import ProtectedPageWrapper from "@/app/src/components/layouts/protected-page-wrapper";
import { auth, db } from "@/app/firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

const tutorNavItems = [
  { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/tutor/profile", icon: User },
  { label: "Gigs", href: "/tutor/gigs", icon: Briefcase },
  { label: "My Gigs", href: "/tutor/my-gigs", icon: ClipboardList },
];

interface TutorData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  tutorProfile: {
    status: string;
    bio: string;
    category: string;
    degreeClass: string;
    hourlyRate: number;
    specialization: string[];
    appointmentDate?: string;
    verificationNotes?: string;
  };
}

interface DocumentRecord {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: any;
}

interface Appointment {
  id: string;
  type: string;
  date: string;
  time: string;
  status: string;
  assignedAdmin?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: any;
}

function calculateProfileCompletion(tutor: TutorData): number {
  const fields = [
    tutor.firstName,
    tutor.lastName,
    tutor.email,
    tutor.phone,
    tutor.location,
    tutor.tutorProfile?.bio,
    tutor.tutorProfile?.degreeClass,
    tutor.tutorProfile?.hourlyRate,
    tutor.tutorProfile?.specialization?.length > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

/* ---------- Local primitives, matched to the Kopa360 landing page ---------- */

function Pill({
  children,
  tone = "sand",
}: {
  children: React.ReactNode;
  tone?: "sand" | "sage" | "terracotta" | "ochre";
}) {
  const styles = {
    sand: "bg-sand text-ink border-line",
    sage: "bg-sage/10 text-sage border-sage/20",
    terracotta: "bg-terracotta/10 text-terracotta border-terracotta/25",
    ochre: "bg-ochre/10 text-ochre border-ochre/25",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-ink-soft">
      <span className="h-px w-8 bg-line" />
      <span>{children}</span>
    </div>
  );
}

function ProgressRing({
  progress,
  size = 56,
}: {
  progress: number;
  size?: number;
}) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--sand)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--terracotta)"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-28px_rgba(20,15,10,0.25)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl leading-none text-ink">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-ink-soft">{description}</p>
          )}
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-terracotta/10 text-terracotta">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-sand text-ink-soft">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-lg text-ink">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-ink-soft">{description}</p>
      </div>
    </div>
  );
}

const STATUS_COPY: Record<
  string,
  { tone: "sage" | "ochre" | "terracotta"; title: string; body: string }
> = {
  active: {
    tone: "sage",
    title: "Your profile is live",
    body: "Parents in Benin City can find and book you right now.",
  },
  pending: {
    tone: "ochre",
    title: "Verification in progress",
    body: "Our team is reviewing your documents and profile details.",
  },
  pending_verification: {
    tone: "ochre",
    title: "Verification in progress",
    body: "Our team is reviewing your documents and profile details.",
  },
  rejected: {
    tone: "terracotta",
    title: "Action needed on your profile",
    body: "Something needs your attention before we can verify you.",
  },
};

function StatusBanner({
  status,
  appointmentDate,
  verificationNotes,
}: {
  status: TutorStatus | string;
  appointmentDate?: string;
  verificationNotes?: string;
}) {
  const copy = STATUS_COPY[status] ?? STATUS_COPY.pending;
  const toneStyles = {
    sage: "bg-sage/10 border-sage/20 text-sage",
    ochre: "bg-ochre/10 border-ochre/20 text-ochre",
    terracotta: "bg-terracotta/10 border-terracotta/20 text-terracotta",
  } as const;
  const Icon = copy.tone === "sage" ? ShieldCheck : ShieldAlert;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${toneStyles[copy.tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-xl leading-tight text-ink">
            {copy.title}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {verificationNotes || copy.body}
          </p>
          {appointmentDate && (
            <p className="mt-1 text-xs text-ink-soft">
              Appointment scheduled for{" "}
              {new Date(appointmentDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
      <Pill tone={copy.tone === "terracotta" ? "terracotta" : copy.tone}>
        {status.replace("_", " ")}
      </Pill>
    </div>
  );
}

/* ---------- Page ---------- */

export default function TutorDashboard() {
  const [tutor, setTutor] = useState<TutorData | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const uid = currentUser.uid;

        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          setTutor(userDoc.data() as TutorData);
        }

        const docsQuery = query(
          collection(db, "documents"),
          where("tutorId", "==", doc(db, "users", uid)),
        );
        const docsSnap = await getDocs(docsQuery);
        setDocuments(
          docsSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as DocumentRecord,
          ),
        );

        const apptQuery = query(
          collection(db, "appointments"),
          where("tutorId", "==", uid),
        );
        const apptSnap = await getDocs(apptQuery);
        setAppointments(
          apptSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Appointment),
        );

        const notifQuery = query(
          collection(db, "notifications"),
          where("tutorId", "==", uid),
        );
        const notifSnap = await getDocs(notifQuery);
        setNotifications(
          notifSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as Notification,
          ),
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const upcomingAppointment = appointments.find(
    (apt) => apt.status === "scheduled",
  );
  const unreadNotifications = notifications.filter((n) => !n.read);
  const approvedDocs = documents.filter((d) => d.status === "approved").length;
  const profileCompletion = tutor ? calculateProfileCompletion(tutor) : 0;

  if (isLoading) {
    return (
      <ProtectedPageWrapper>
        <DashboardLayout navItems={tutorNavItems} userType="tutor" userName="">
          <div className="flex h-64 items-center justify-center bg-cream">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-terracotta" />
          </div>
        </DashboardLayout>
      </ProtectedPageWrapper>
    );
  }

  const quickActions = [
    { label: "Complete profile", href: "/tutor/profile", icon: User },
    { label: "View documents", href: "/tutor/profile", icon: FileText },
    { label: "Browse gigs", href: "/tutor/gigs", icon: Briefcase },
    { label: "Contact support", href: "#", icon: Bell },
  ];

  return (
    <ProtectedPageWrapper>
      <DashboardLayout
        navItems={tutorNavItems}
        userType="tutor"
        userName={tutor ? `${tutor.firstName} ${tutor.lastName}` : ""}
      >
        <div className="space-y-10 bg-cream">
          {/* Header */}
          <div>
            <Eyebrow>Tutor dashboard</Eyebrow>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.01em] text-ink md:text-5xl">
              Welcome back,{" "}
              <span className="italic text-terracotta">{tutor?.firstName}</span>
            </h1>
            <p className="mt-3 max-w-xl text-ink-soft">
              Here's what's happening with your tutoring account.
            </p>
          </div>

          {/* Status */}
          <StatusBanner
            status={
              tutor?.tutorProfile?.status === "pending_verification"
                ? "pending_verification"
                : (tutor?.tutorProfile?.status as TutorStatus) || "pending"
            }
            appointmentDate={tutor?.tutorProfile?.appointmentDate}
            verificationNotes={tutor?.tutorProfile?.verificationNotes}
          />

          {/* Quick stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-28px_rgba(20,15,10,0.25)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    Profile completion
                  </p>
                  <p className="mt-2 font-display text-3xl leading-none text-ink">
                    {profileCompletion}%
                  </p>
                </div>
                <ProgressRing progress={profileCompletion} size={52} />
              </div>
              {profileCompletion < 100 && (
                <Link
                  href="/tutor/profile"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-terracotta hover:gap-1.5 transition-all"
                >
                  Complete profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <StatCard
              label="Account status"
              value={
                tutor?.tutorProfile?.status
                  ? tutor.tutorProfile.status
                      .replace("_", " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  : "Pending"
              }
              icon={
                tutor?.tutorProfile?.status === "active" ? CheckCircle : Clock
              }
            />

            <StatCard
              label="Documents"
              value={`${approvedDocs}/${documents.length}`}
              description="approved"
              icon={FileText}
            />

            <StatCard
              label="Notifications"
              value={unreadNotifications.length}
              description="unread"
              icon={Bell}
            />
          </div>

          {/* Main grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Upcoming appointment */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-line bg-white">
                <div className="flex items-center gap-2 border-b border-line p-6">
                  <Calendar className="h-4 w-4 text-terracotta" />
                  <h2 className="font-display text-xl text-ink">
                    Upcoming appointment
                  </h2>
                </div>

                {upcomingAppointment ? (
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-terracotta/10 text-terracotta">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize text-ink">
                          {upcomingAppointment.type.replace("_", " ")}{" "}
                          appointment
                        </p>
                        <p className="mt-1 text-sm text-ink-soft">
                          {new Date(
                            upcomingAppointment.date,
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          at {upcomingAppointment.time}
                        </p>
                        {upcomingAppointment.assignedAdmin && (
                          <p className="mt-1 text-sm text-ink-soft">
                            With: {upcomingAppointment.assignedAdmin}
                          </p>
                        )}
                      </div>
                      <Pill tone="ochre">Scheduled</Pill>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="No upcoming appointments"
                    description="You don't have any scheduled appointments at the moment."
                  />
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl border border-line bg-white">
              <div className="flex items-center justify-between gap-2 border-b border-line p-6">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-terracotta" />
                  <h2 className="font-display text-xl text-ink">
                    Notifications
                  </h2>
                </div>
                {unreadNotifications.length > 0 && (
                  <Pill tone="terracotta">
                    {unreadNotifications.length} new
                  </Pill>
                )}
              </div>

              <div className="divide-y divide-line">
                {notifications.length > 0 ? (
                  notifications.slice(0, 4).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 ${!notification.read ? "bg-sand/40" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-2 h-1.5 w-1.5 rounded-full ${
                            notification.type === "success"
                              ? "bg-sage"
                              : notification.type === "warning"
                                ? "bg-ochre"
                                : notification.type === "error"
                                  ? "bg-terracotta"
                                  : "bg-ink-soft"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={Bell}
                    title="No notifications"
                    description="You're all caught up!"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-line bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-terracotta" />
              <h2 className="font-display text-xl text-ink">Quick actions</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-cream px-4 py-4 transition hover:-translate-y-0.5 hover:border-terracotta/40 hover:bg-terracotta/[0.04]"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-terracotta/10 text-terracotta transition group-hover:bg-terracotta group-hover:text-cream">
                      <action.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-ink">
                      {action.label}
                    </span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-ink-soft opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedPageWrapper>
  );
}
