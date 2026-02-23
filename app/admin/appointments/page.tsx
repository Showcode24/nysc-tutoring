"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  History,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  List,
  Grid3X3,
  Briefcase,
} from "lucide-react";
import { mockAppointments, mockAdmin, getTutorById } from "@/app/src/mock/data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import { StatusBadge } from "@/app/src/components/shared/status-badge";
import Link from "next/link";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tutors", href: "/admin/tutors", icon: Users },
   { label: "Gigs", href: "/admin/gigs", icon: Briefcase },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Audit Log", href: "/admin/audit", icon: History },
];

const appointmentStatusConfig = {
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

export default function AdminAppointments() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentDate] = useState(new Date());

  // Group appointments by date
  const appointmentsByDate = mockAppointments.reduce(
    (acc, apt) => {
      if (!acc[apt.date]) {
        acc[apt.date] = [];
      }
      acc[apt.date].push(apt);
      return acc;
    },
    {} as Record<string, typeof mockAppointments>,
  );

  const sortedDates = Object.keys(appointmentsByDate).sort();

  return (
    <DashboardLayout
      navItems={adminNavItems}
      userType="admin"
      userName={`${mockAdmin.firstName} ${mockAdmin.lastName}`}
      userRole={mockAdmin.role.replace("_", " ")}
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
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="card-elevated p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-semibold">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <Button variant="ghost" size="icon">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* List View */}
        {viewMode === "list" && (
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
                    const statusConfig = appointmentStatusConfig[apt.status];
                    const StatusIcon = statusConfig.icon;
                    const tutor = getTutorById(apt.tutorId);

                    return (
                      <div key={apt.id} className="p-4 flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <p className="text-lg font-semibold">{apt.time}</p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/tutors/${apt.tutorId}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {apt.tutorName}
                            </Link>
                            {tutor && (
                              <StatusBadge status={tutor.status} size="sm" />
                            )}
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
                              <Button size="sm" variant="outline">
                                Check In
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
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
        )}

        {/* Calendar View (Simplified) */}
        {viewMode === "calendar" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-elevated p-6"
          >
            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const dayNumber = i - 3; // Offset for starting day
                const isCurrentMonth = dayNumber >= 0 && dayNumber < 31;
                const dayDate = isCurrentMonth ? dayNumber + 1 : "";
                const dateStr = isCurrentMonth
                  ? `2024-01-${String(dayNumber + 1).padStart(2, "0")}`
                  : "";
                const dayAppointments = appointmentsByDate[dateStr] || [];

                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[100px] p-2 border border-border rounded-lg transition-colors",
                      isCurrentMonth
                        ? "bg-card hover:bg-accent/50"
                        : "bg-muted/30",
                    )}
                  >
                    {isCurrentMonth && (
                      <>
                        <span className="text-sm font-medium">{dayDate}</span>
                        <div className="mt-1 space-y-1">
                          {dayAppointments.slice(0, 2).map((apt) => (
                            <div
                              key={apt.id}
                              className={cn(
                                "text-xs px-1.5 py-0.5 rounded truncate",
                                appointmentStatusConfig[apt.status].className,
                              )}
                            >
                              {apt.time} - {apt.tutorName.split(" ")[0]}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
