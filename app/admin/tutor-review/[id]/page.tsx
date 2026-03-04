"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import Link from "next/link";
import { StatusBadge } from "@/app/src/components/shared/status-badge";
import { useParams } from "next/navigation";
import { auth } from "@/app/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebase";
import { TutorStatus } from "@/app/src/types";
import {
  fetchTutorReviewData,
  approveTutor,
  rejectTutor,
  approveDocument,
  rejectDocument,
  scheduleAppointment,
  TutorReviewData,
} from "@/app/firebase/adminTutorReviewService";

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

function mapStatus(status: string): TutorStatus {
  if (status === "pending_verification") return "pending";
  return (status as TutorStatus) || "pending";
}

export default function AdminTutorReview() {
  const params = useParams();
  const tutorId = Array.isArray(params.id) ? params.id[0] : params.id || "";
  const { toast } = useToast();

  const [data, setData] = useState<TutorReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ id: "", name: "", role: "" });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminDoc = await getDoc(doc(db, "users", user.uid));
        if (adminDoc.exists()) {
          const d = adminDoc.data();
          setAdminInfo({
            id: user.uid,
            name: `${d.firstName} ${d.lastName}`,
            role: d.role?.replace(/_/g, " ") || "admin",
          });
        }
      }
      const result = await fetchTutorReviewData(tutorId);
      setData(result);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [tutorId]);

  const handleApprove = async () => {
    if (!data?.tutor) return;
    setIsProcessing(true);
    try {
      await approveTutor(tutorId, adminInfo.id, adminInfo.name);
      setData((prev) =>
        prev
          ? {
              ...prev,
              tutor: prev.tutor
                ? {
                    ...prev.tutor,
                    tutorProfile: {
                      ...prev.tutor.tutorProfile,
                      status: "active",
                    },
                  }
                : null,
            }
          : null,
      );
      toast({
        title: "Tutor Approved",
        description: `${data.tutor.firstName} ${data.tutor.lastName} has been approved and activated.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to approve tutor.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!data?.tutor) return;
    setIsProcessing(true);
    try {
      await rejectTutor(tutorId, adminInfo.id, adminInfo.name, rejectReason);
      setData((prev) =>
        prev
          ? {
              ...prev,
              tutor: prev.tutor
                ? {
                    ...prev.tutor,
                    tutorProfile: {
                      ...prev.tutor.tutorProfile,
                      status: "rejected",
                    },
                  }
                : null,
            }
          : null,
      );
      toast({
        title: "Application Rejected",
        description: `${data.tutor.firstName} ${data.tutor.lastName}'s application has been rejected.`,
        variant: "destructive",
      });
      setRejectDialogOpen(false);
      setRejectReason("");
    } catch {
      toast({
        title: "Error",
        description: "Failed to reject tutor.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveDocument = async (docId: string) => {
    try {
      await approveDocument(docId);
      setData((prev) =>
        prev
          ? {
              ...prev,
              documents: prev.documents.map((d) =>
                d.id === docId ? { ...d, status: "approved" as const } : d,
              ),
            }
          : null,
      );
      toast({ title: "Document Approved" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to approve document.",
        variant: "destructive",
      });
    }
  };

  const handleRejectDocument = async (docId: string) => {
    try {
      await rejectDocument(docId, "");
      setData((prev) =>
        prev
          ? {
              ...prev,
              documents: prev.documents.map((d) =>
                d.id === docId ? { ...d, status: "rejected" as const } : d,
              ),
            }
          : null,
      );
      toast({ title: "Document Rejected" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to reject document.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleAppointment = async () => {
    if (!appointmentDate || !appointmentTime) {
      toast({
        title: "Missing Fields",
        description: "Please provide both date and time.",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    try {
      await scheduleAppointment(
        tutorId,
        adminInfo.id,
        adminInfo.name,
        appointmentDate,
        appointmentTime,
      );
      toast({
        title: "Appointment Scheduled",
        description: `Appointment set for ${appointmentDate} at ${appointmentTime}`,
      });
      setScheduleDialogOpen(false);
      setAppointmentDate("");
      setAppointmentTime("");
    } catch {
      toast({
        title: "Error",
        description: "Failed to schedule appointment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout navItems={adminNavItems} userType="admin" userName="">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data?.tutor) {
    return (
      <DashboardLayout
        navItems={adminNavItems}
        userType="admin"
        userName={adminInfo.name}
        userRole={adminInfo.role}
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

  const { tutor, documents, appointments, auditEvents } = data;

  return (
    <DashboardLayout
      navItems={adminNavItems}
      userType="admin"
      userName={adminInfo.name}
      userRole={adminInfo.role}
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
            <StatusBadge
              status={mapStatus(tutor.tutorProfile?.status)}
              size="lg"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-elevated p-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleApprove}
              disabled={isProcessing || tutor.tutorProfile?.status === "active"}
              className="bg-status-active hover:bg-status-active/90"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>

            {/* Schedule Appointment Dialog */}
            <Dialog
              open={scheduleDialogOpen}
              onOpenChange={setScheduleDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Appointment</DialogTitle>
                  <DialogDescription>
                    Schedule a verification appointment for {tutor.firstName}{" "}
                    {tutor.lastName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setScheduleDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleScheduleAppointment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Scheduling..." : "Schedule"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={tutor.tutorProfile?.status === "rejected"}
                >
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
          {/* Left Column */}
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
                    <p className="text-sm text-muted-foreground">
                      Degree Class
                    </p>
                    <p className="font-medium">
                      {tutor.tutorProfile?.degreeClass || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent">
                    <Briefcase className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">
                      {tutor.tutorProfile?.category?.replace("_", " ") ||
                        "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent">
                    <Briefcase className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hourly Rate</p>
                    <p className="font-medium">
                      {tutor.tutorProfile?.hourlyRate
                        ? `₦${tutor.tutorProfile.hourlyRate.toLocaleString()}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.tutorProfile?.specialization?.length ? (
                      tutor.tutorProfile.specialization.map((subject) => (
                        <span
                          key={subject}
                          className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm"
                        >
                          {subject}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No subjects added.
                      </p>
                    )}
                  </div>
                </div>
                {tutor.tutorProfile?.bio && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Bio</p>
                      <p className="text-sm">{tutor.tutorProfile.bio}</p>
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
                {documents.length > 0 ? (
                  documents.map((document) => {
                    const statusConfig =
                      documentStatusConfig[document.status] ||
                      documentStatusConfig.pending;
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div
                        key={document.id}
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
                            <p className="font-medium">{document.fileName}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {document.documentType.replace(/_/g, " ")} •{" "}
                              {document.uploadedAt?.toDate
                                ? new Date(
                                    document.uploadedAt.toDate(),
                                  ).toLocaleDateString()
                                : "—"}
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
                          <a
                            href={document.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </a>
                          {document.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-status-active-foreground"
                                onClick={() =>
                                  handleApproveDocument(document.id)
                                }
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-status-rejected-foreground"
                                onClick={() =>
                                  handleRejectDocument(document.id)
                                }
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No documents uploaded.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
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
                        {apt.date?.toDate
                          ? new Date(apt.date.toDate()).toLocaleDateString()
                          : apt.date}{" "}
                        at {apt.time}
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
                            {event.timestamp?.toDate
                              ? new Date(
                                  event.timestamp.toDate(),
                                ).toLocaleString()
                              : "—"}
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
