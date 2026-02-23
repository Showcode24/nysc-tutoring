"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Users,
  Calendar,
  History,
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  CalendarPlus,
  UserCheck,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import {
  getTutorById,
  getAuditEventsForTutor,
  getAppointmentsForTutor,
  mockAdmin,
} from "@/app/src/mock/data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import Link from "next/link";
import { StatusBadge } from "@/app/src/components/shared/status-badge";
import { useParams } from "next/navigation";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tutors", href: "/admin/tutors", icon: Users },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Audit Log", href: "/admin/audit", icon: History },
];

const documentStatusConfig = {
  pending: {
    icon: Clock,
    className: "text-status-pending-foreground bg-status-pending-bg",
    label: "Pending Review",
  },
  approved: {
    icon: CheckCircle,
    className: "text-status-active-foreground bg-status-active-bg",
    label: "Approved",
  },
  rejected: {
    icon: XCircle,
    className: "text-status-rejected-foreground bg-status-rejected-bg",
    label: "Rejected",
  },
};

export default function AdminTutorReview() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const tutor = getTutorById(id || "");
  const auditEvents = getAuditEventsForTutor(id || "");
  const appointments = getAppointmentsForTutor(id || "");

  if (!tutor) {
    return (
      <DashboardLayout
        navItems={adminNavItems}
        userType="admin"
        userName={`${mockAdmin.firstName} ${mockAdmin.lastName}`}
        userRole={mockAdmin.role.replace("_", " ")}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Tutor Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The tutor you're looking for doesn't exist.
          </p>
          <Link href="/admin/tutors">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tutors
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleApprove = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Tutor Approved",
      description: `${tutor.firstName} ${tutor.lastName} has been approved and activated.`,
    });
    setIsProcessing(false);
  };

  const handleCheckIn = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast({
      title: "Check-in Complete",
      description: `${tutor.firstName} ${tutor.lastName} has been checked in.`,
    });
    setIsProcessing(false);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Application Rejected",
      description: `${tutor.firstName} ${tutor.lastName}'s application has been rejected.`,
      variant: "destructive",
    });
    setIsProcessing(false);
    setRejectDialogOpen(false);
  };

  return (
    <DashboardLayout
      navItems={adminNavItems}
      userType="admin"
      userName={`${mockAdmin.firstName} ${mockAdmin.lastName}`}
      userRole={mockAdmin.role.replace("_", " ")}
    >
      <div className="space-y-8">
        {/* Back button and header */}
        <div>
          <Link
            href="/admin/tutors"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tutors
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                {tutor.firstName[0]}
                {tutor.lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {tutor.firstName} {tutor.lastName}
                </h1>
                <p className="text-muted-foreground">{tutor.email}</p>
              </div>
            </div>
            <StatusBadge status={tutor.status} size="lg" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-elevated p-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCheckIn} disabled={isProcessing}>
              <UserCheck className="w-4 h-4 mr-2" />
              Check In
            </Button>
            <Button variant="outline">
              <CalendarPlus className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-status-active hover:bg-status-active/90"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Application</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to reject {tutor.firstName}{" "}
                    {tutor.lastName}'s application?
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Provide a reason for rejection (optional)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setRejectDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Confirm Rejection"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated"
            >
              <div className="p-6 border-b border-border">
                <h2 className="font-semibold">Contact Information</h2>
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent">
                    <Mail className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{tutor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent">
                    <Phone className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {tutor.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Qualifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-elevated"
            >
              <div className="p-6 border-b border-border">
                <h2 className="font-semibold">Qualifications</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent">
                    <GraduationCap className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Education</p>
                    <p className="font-medium">
                      {tutor.education || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent">
                    <Briefcase className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">
                      {tutor.experience || "Not provided"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {tutor.bio && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Bio</p>
                      <p className="text-sm">{tutor.bio}</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-elevated"
            >
              <div className="p-6 border-b border-border">
                <h2 className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Documents
                </h2>
              </div>
              <div className="divide-y divide-border">
                {tutor.documents.map((doc) => {
                  const statusConfig = documentStatusConfig[doc.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={doc.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            statusConfig.className,
                          )}
                        >
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {doc.type.replace("_", " ")} • Uploaded{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            statusConfig.className,
                          )}
                        >
                          {statusConfig.label}
                        </span>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        {doc.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-status-active-foreground"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-status-rejected-foreground"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Timeline & Appointments */}
          <div className="space-y-6">
            {/* Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card-elevated"
            >
              <div className="p-6 border-b border-border">
                <h2 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Appointments
                </h2>
              </div>
              <div className="divide-y divide-border">
                {appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <div key={apt.id} className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm capitalize">
                          {apt.type.replace("_", " ")}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            apt.status === "scheduled"
                              ? "bg-status-pending-bg text-status-pending-foreground"
                              : apt.status === "completed"
                                ? "bg-status-active-bg text-status-active-foreground"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(apt.date).toLocaleDateString()} at {apt.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No appointments scheduled</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Activity Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="card-elevated"
            >
              <div className="p-6 border-b border-border">
                <h2 className="font-semibold flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Activity Timeline
                </h2>
              </div>
              <div className="p-6">
                {auditEvents.length > 0 ? (
                  <div className="space-y-0">
                    {auditEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="timeline-item">
                        <div className="timeline-dot">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{event.action}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {event.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.timestamp).toLocaleString()}
                            {event.adminName && ` • ${event.adminName}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activity recorded</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
