"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  History,
  Clock,
  CheckCircle,
  XCircle,
  List,
  Grid3X3,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import AdminProtectedWrapper from "@/app/src/components/layouts/admin-protected-wrapper";
import Link from "next/link";
import { auth, db } from "@/app/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  fetchAllAppointments,
  checkInAppointment,
  cancelAppointment,
  AppointmentRecord,
} from "@/app/firebase/adminTutorReviewService";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tutors", href: "/admin/tutors", icon: Users },
  { label: "Gigs", href: "/admin/gigs", icon: Briefcase },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Audit Log", href: "/admin/audit", icon: History },
];

const appointmentStatusConfig: Record<
  string,
  { icon: typeof Clock; className: string; label: string }
> = {
  scheduled: {
    icon: Clock,
    className: "bg-status-pending-bg text-status-pending-foreground",
    label: "Scheduled",
  },
  checked_in: {
    icon: CheckCircle,
    className: "bg-status-active-bg text-status-active-foreground",
    label: "Checked In",
  },
  completed: {
    icon: CheckCircle,
    className: "bg-status-active-bg text-status-active-foreground",
    label: "Completed",
  },
  no_show: {
    icon: XCircle,
    className: "bg-status-rejected-bg text-status-rejected-foreground",
    label: "No Show",
  },
  cancelled: {
    icon: XCircle,
    className: "bg-muted text-muted-foreground",
    label: "Cancelled",
  },
};

function toDateKey(date: any): string {
  const d = date?.toDate ? date.toDate() : new Date(date);
  if (isNaN(d.getTime())) return "unknown";
  return d.toISOString().slice(0, 10);
}

export default function AdminAppointments() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [adminRole, setAdminRole] = useState("admin");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const adminDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (adminDoc.exists()) {
        const d = adminDoc.data();
        setAdminName(`${d.firstName || ""} ${d.lastName || ""}`.trim());
        setAdminRole((d.role || d.userType || "admin").replace(/_/g, " "));
      }
    }
    const result = await fetchAllAppointments();
    setAppointments(result);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCheckIn = async (id: string) => {
    setProcessingId(id);
    try {
      await checkInAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "checked_in" } : a)),
      );
      toast({ title: "Checked in" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to check in.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setProcessingId(id);
    try {
      await cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)),
      );
      toast({ title: "Appointment cancelled" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to cancel appointment.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Group appointments by date
  const appointmentsByDate = appointments.reduce(
    (acc, apt) => {
      const key = toDateKey(apt.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(apt);
      return acc;
    },
    {} as Record<string, AppointmentRecord[]>,
  );

  const sortedDates = Object.keys(appointmentsByDate)
    .filter((d) => d !== "unknown")
    .sort()
    .reverse();

  if (isLoading) {
    return (
      <AdminProtectedWrapper>
        <DashboardLayout navItems={adminNavItems} userType="admin" userName="">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DashboardLayout>
      </AdminProtectedWrapper>
    );
  }

  return (
    <AdminProtectedWrapper>
      <DashboardLayout
        navItems={adminNavItems}
        userType="admin"
        userName={adminName}
        userRole={adminRole}
      >
        <div className="space-y-8">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Appointments</h1>
              <p className="page-description">
                Manage tutor verification appointments and schedules.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("calendar")}
                title="Calendar view isn't wired up yet — showing the list instead"
                disabled
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* List View */}
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                <div className="card-elevated divide-y divide-border">
                  {appointmentsByDate[date].map((apt) => {
                    const statusConfig =
                      appointmentStatusConfig[apt.status] ||
                      appointmentStatusConfig.scheduled;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div key={apt.id} className="p-4 flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <p className="text-lg font-semibold">{apt.time}</p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/tutor-review/${apt.tutorId}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {apt.tutorName || "Unknown tutor"}
                            </Link>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {apt.type.replace("_", " ")}
                            {apt.assignedAdmin && ` • ${apt.assignedAdmin}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                              statusConfig.className,
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>

                          {apt.status === "scheduled" && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={processingId === apt.id}
                                onClick={() => handleCheckIn(apt.id)}
                              >
                                Check In
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                disabled={processingId === apt.id}
                                onClick={() => handleCancel(apt.id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {sortedDates.length === 0 && (
              <div className="card-elevated p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">
                  No Appointments Scheduled
                </h3>
                <p className="text-muted-foreground">
                  There are no upcoming appointments to display.
                </p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AdminProtectedWrapper>
  );
}
