"use client";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  History,
  Briefcase,
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  UserCheck,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import {
  mockAdmin,
  getGigById,
  getApplicationsForGig,
  getTutorById,
} from "@/app/src/mock/data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import { EmptyState } from "@/app/src/components/shared/empty-state";
import Link from "next/link";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tutors", href: "/admin/tutors", icon: Users },
  { label: "Gigs", href: "/admin/gigs", icon: Briefcase },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Audit Log", href: "/admin/audit", icon: History },
];

export default function AdminGigDetail() {
  const { id } = useParams<{ id: string }>();
  const gig = getGigById(id || "");
  const applications = getApplicationsForGig(id || "");

  if (!gig) {
    return (
      <DashboardLayout
        navItems={adminNavItems}
        userType="admin"
        userName={`${mockAdmin.firstName} ${mockAdmin.lastName}`}
        userRole={mockAdmin.role.replace("_", " ")}
      >
        <EmptyState
          icon={Briefcase}
          title="Gig not found"
          description="The gig you're looking for doesn't exist."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navItems={adminNavItems}
      userType="admin"
      userName={`${mockAdmin.firstName} ${mockAdmin.lastName}`}
      userRole={mockAdmin.role.replace("_", " ")}
    >
      <div className="space-y-8">
        {/* Back link */}
        <Link href="/admin/gigs">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Gigs
          </Button>
        </Link>

        {/* Gig Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="page-title">{gig.title}</h1>
              <p className="text-muted-foreground mt-1">{gig.subject}</p>
            </div>
            <span
              className={cn(
                "status-badge",
                gig.status === "open" && "status-badge-active",
                gig.status === "assigned" && "status-badge-pending",
                gig.status === "completed" && "status-badge-active",
                gig.status === "cancelled" && "status-badge-rejected",
              )}
            >
              {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            {gig.description}
          </p>

          <div className="grid sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-primary" />
              <div>
                <p className="text-muted-foreground">Rate</p>
                <p className="font-medium">${gig.hourlyRate}/hr</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <div>
                <p className="text-muted-foreground">Hours</p>
                <p className="font-medium">{gig.hoursPerWeek} hrs/week</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{gig.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                <p className="text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {new Date(gig.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {gig.status === "open" && (
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
              <Button variant="outline">Edit Gig</Button>
              <Button variant="destructive" className="ml-auto">
                Cancel Gig
              </Button>
            </div>
          )}
        </motion.div>

        {/* Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated"
        >
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Applications ({applications.length})
            </h2>
          </div>

          {applications.length > 0 ? (
            <div className="divide-y divide-border">
              {applications.map((app, index) => {
                const tutor = getTutorById(app.tutorId);
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium shrink-0">
                        {tutor
                          ? `${tutor.firstName[0]}${tutor.lastName[0]}`
                          : "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium">
                            {tutor
                              ? `${tutor.firstName} ${tutor.lastName}`
                              : "Unknown Tutor"}
                          </p>
                          <span
                            className={cn(
                              "status-badge",
                              app.status === "applied" &&
                                "status-badge-pending",
                              app.status === "accepted" &&
                                "status-badge-active",
                              app.status === "rejected" &&
                                "status-badge-rejected",
                            )}
                          >
                            {app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)}
                          </span>
                        </div>
                        {tutor && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {tutor.subjects.join(", ")} · {tutor.experience}
                          </p>
                        )}
                        {app.message && (
                          <div className="bg-muted/50 rounded-lg p-3 mt-2">
                            <p className="text-sm flex items-start gap-2">
                              <FileText className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                              {app.message}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Applied{" "}
                          {new Date(app.appliedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {app.status === "applied" && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="outline">
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={UserCheck}
              title="No applications yet"
              description="No tutors have applied to this gig yet."
              className="py-12"
            />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
