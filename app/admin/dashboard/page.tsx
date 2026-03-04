"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  History,
  UserPlus,
  Briefcase,
  Clock,
  ArrowRight,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import { MetricCard } from "@/app/src/components/shared/metric-card";
import { StatusBadge } from "@/app/src/components/shared/status-badge";
import Link from "next/link";
import {
  fetchAdminDashboardData,
  AdminDashboardData,
} from "@/app/firebase/adminDashboardService";
import { TutorStatus } from "@/app/src/types";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tutors", href: "/admin/tutors", icon: Users },
  { label: "Gigs", href: "/admin/gigs", icon: Briefcase },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Audit Log", href: "/admin/audit", icon: History },
];

function mapStatus(status: string): TutorStatus {
  if (status === "pending_verification") return "pending";
  return (status as TutorStatus) || "pending";
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await fetchAdminDashboardData();
      setData(result);
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout navItems={adminNavItems} userType="admin" userName="">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const adminName = data?.admin
    ? `${data.admin.firstName} ${data.admin.lastName}`
    : "";
  const adminRole = data?.admin?.role?.replace(/_/g, " ") || "admin";

  return (
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
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-description">
              Overview of tutor management and operations.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
            {adminRole}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Tutors"
            value={data?.metrics.totalTutors || 0}
            icon={Users}
            description="registered"
          />
          <MetricCard
            title="Pending Reviews"
            value={data?.metrics.pendingTutors || 0}
            icon={ClipboardList}
            description="awaiting action"
          />
          <MetricCard
            title="Active Tutors"
            value={data?.metrics.activeTutors || 0}
            icon={UserPlus}
            description="verified"
          />
          <MetricCard
            title="Today's Appointments"
            value={data?.metrics.appointmentsToday || 0}
            icon={Calendar}
            description="scheduled"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Tutors */}
          <div className="lg:col-span-2">
            <div className="card-elevated">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Pending Tutors
                </h2>
                <Link href="/admin/tutors">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-border">
                {data?.pendingTutors && data.pendingTutors.length > 0 ? (
                  data.pendingTutors.map((tutor, index) => (
                    <motion.div
                      key={tutor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                          {tutor.firstName[0]}
                          {tutor.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            {tutor.firstName} {tutor.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {tutor.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge
                            status={mapStatus(tutor.status)}
                            size="sm"
                          />
                          <Link href={`/admin/tutors/${tutor.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No pending tutors</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today's Schedule
              </h2>
              <Link href="/admin/appointments">
                <Button variant="ghost" size="icon">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-border">
              {data?.todayAppointments && data.todayAppointments.length > 0 ? (
                data.todayAppointments.map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-accent">
                        <Clock className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{apt.tutorName}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {apt.type.replace("_", " ")}
                        </p>
                      </div>
                      <span className="text-sm font-medium">{apt.time}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No appointments today</p>
                </div>
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
                label: "Review Pending Tutors",
                href: "/admin/tutors",
                icon: Users,
              },
              {
                label: "Manage Appointments",
                href: "/admin/appointments",
                icon: Calendar,
              },
              { label: "View Audit Log", href: "/admin/audit", icon: History },
              { label: "Open Gigs", href: "/admin/gigs", icon: Briefcase },
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
  );
}
