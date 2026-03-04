"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TutorStatus } from "@/app/src/types";
import {
  LayoutDashboard,
  User,
  Briefcase,
  Bell,
  Calendar,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import { StatusBanner } from "@/app/src/components/shared/status-banner";
import { MetricCard } from "@/app/src/components/shared/metric-card";
import { ProgressRing } from "@/app/src/components/shared/progress-ring";
import { EmptyState } from "@/app/src/components/shared/empty-state";
import Link from "next/link";
import ProtectedPageWrapper from "@/app/src/components/layouts/ptotected-page-wrapper";
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

interface Document {
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

export default function TutorDashboard() {
  const [tutor, setTutor] = useState<TutorData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const uid = currentUser.uid;

        // Fetch tutor profile
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          setTutor(userDoc.data() as TutorData);
        }

        // Fetch documents
        const docsQuery = query(
          collection(db, "documents"),
          where("tutorId", "==", doc(db, "users", uid)),
        );
        const docsSnap = await getDocs(docsQuery);
        setDocuments(
          docsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Document),
        );

        // Fetch appointments
        const apptQuery = query(
          collection(db, "appointments"),
          where("tutorId", "==", uid),
        );
        const apptSnap = await getDocs(apptQuery);
        setAppointments(
          apptSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Appointment),
        );

        // Fetch notifications
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
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DashboardLayout>
      </ProtectedPageWrapper>
    );
  }

  return (
    <ProtectedPageWrapper>
      <DashboardLayout
        navItems={tutorNavItems}
        userType="tutor"
        userName={tutor ? `${tutor.firstName} ${tutor.lastName}` : ""}
      >
        <div className="space-y-8">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Welcome back, {tutor?.firstName}</h1>
              <p className="page-description">
                Here's what's happening with your tutoring account.
              </p>
            </div>
          </div>

          {/* Status Banner */}
          <StatusBanner
            status={
              tutor?.tutorProfile?.status === "pending_verification"
                ? "pending"
                : (tutor?.tutorProfile?.status as TutorStatus) || "pending"
            }
            appointmentDate={tutor?.tutorProfile?.appointmentDate}
            verificationNotes={tutor?.tutorProfile?.verificationNotes}
          />

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-elevated p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Profile Completion
                  </p>
                  <p className="text-2xl font-semibold mt-1">
                    {profileCompletion}%
                  </p>
                </div>
                <ProgressRing progress={profileCompletion} size={56} />
              </div>
              {profileCompletion < 100 && (
                <Link href="/tutor/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 -ml-2 text-primary"
                  >
                    Complete profile
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </motion.div>

            <MetricCard
              title="Account Status"
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
              className="delay-150"
            />

            <MetricCard
              title="Documents"
              value={`${approvedDocs}/${documents.length}`}
              description="approved"
              icon={FileText}
              className="delay-200"
            />

            <MetricCard
              title="Notifications"
              value={unreadNotifications.length}
              description="unread"
              icon={Bell}
              className="delay-250"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Upcoming Appointment */}
            <div className="lg:col-span-2">
              <div className="card-elevated">
                <div className="p-6 border-b border-border">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming Appointment
                  </h2>
                </div>

                {upcomingAppointment ? (
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">
                          {upcomingAppointment.type.replace("_", " ")}{" "}
                          Appointment
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
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
                          <p className="text-sm text-muted-foreground mt-1">
                            With: {upcomingAppointment.assignedAdmin}
                          </p>
                        )}
                      </div>
                      <span className="status-badge status-badge-pending">
                        Scheduled
                      </span>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="No upcoming appointments"
                    description="You don't have any scheduled appointments at the moment."
                    className="py-12"
                  />
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="card-elevated">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                </h2>
                {unreadNotifications.length > 0 && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {unreadNotifications.length} new
                  </span>
                )}
              </div>

              <div className="divide-y divide-border">
                {notifications.length > 0 ? (
                  notifications.slice(0, 4).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 ${!notification.read ? "bg-accent/30" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === "success"
                              ? "bg-status-active"
                              : notification.type === "warning"
                                ? "bg-status-pending"
                                : notification.type === "error"
                                  ? "bg-status-rejected"
                                  : "bg-muted-foreground"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
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
                    className="py-8"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-elevated p-6">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Complete Profile",
                  href: "/tutor/profile",
                  icon: User,
                },
                {
                  label: "View Documents",
                  href: "/tutor/profile",
                  icon: FileText,
                },
                { label: "Browse Gigs", href: "/tutor/gigs", icon: Briefcase },
                { label: "Contact Support", href: "#", icon: Bell },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-4"
                  >
                    <action.icon className="w-5 h-5 mr-3 text-primary" />
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedPageWrapper>
  );
}
