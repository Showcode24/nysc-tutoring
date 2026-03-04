"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  User,
  Briefcase,
  ClipboardList,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Pencil,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import { StatusBadge } from "@/app/src/components/shared/status-badge";
import { ProgressRing } from "@/app/src/components/shared/progress-ring";
import { auth, db } from "@/app/firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { TutorStatus } from "@/app/src/types";

const tutorNavItems = [
  { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/tutor/profile", icon: User },
  { label: "Gigs", href: "/tutor/gigs", icon: Briefcase },
  { label: "My Gigs", href: "/tutor/my-gigs", icon: ClipboardList },
];

const documentStatusConfig = {
  pending: {
    icon: Clock,
    className: "text-status-pending-foreground bg-status-pending-bg",
    label: "Pending",
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

interface TutorData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  createdAt: any;
  tutorProfile: {
    status: string;
    bio: string;
    category: string;
    degreeClass: string;
    hourlyRate: number;
    specialization: string[];
  };
}

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: any;
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

function mapStatus(status: string): TutorStatus {
  if (status === "pending_verification") return "pending";
  return (status as TutorStatus) || "pending";
}

export default function TutorProfile() {
  const [tutor, setTutor] = useState<TutorData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
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
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const profileCompletion = tutor ? calculateProfileCompletion(tutor) : 0;
  const mappedStatus = mapStatus(tutor?.tutorProfile?.status || "pending");

  if (isLoading) {
    return (
      <DashboardLayout navItems={tutorNavItems} userType="tutor" userName="">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navItems={tutorNavItems}
      userType="tutor"
      userName={tutor ? `${tutor.firstName} ${tutor.lastName}` : ""}
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-description">
              Manage your personal information and documents.
            </p>
          </div>
          <StatusBadge status={mappedStatus} size="lg" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Completion Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-6"
            >
              <div className="flex items-center gap-4">
                <ProgressRing
                  progress={profileCompletion}
                  size={72}
                  strokeWidth={6}
                />
                <div>
                  <h3 className="font-semibold">Profile Completion</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profileCompletion < 100
                      ? "Complete your profile to increase your chances of approval."
                      : "Great job! Your profile is complete."}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-elevated"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">Personal Information</h2>
                <Button variant="ghost" size="sm">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={tutor?.firstName || ""}
                      readOnly
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={tutor?.lastName || ""}
                      readOnly
                      className="bg-muted/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={tutor?.email || ""}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={tutor?.phone || ""}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={tutor?.location || ""}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
              </div>
            </motion.div>

            {/* Qualifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-elevated"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">Qualifications</h2>
                <Button variant="ghost" size="sm">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label>Degree Class</Label>
                  <Input
                    value={tutor?.tutorProfile?.degreeClass || ""}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={
                      tutor?.tutorProfile?.category === "academic"
                        ? "Academic Subjects"
                        : tutor?.tutorProfile?.category === "digital_skills"
                          ? "Digital Skills"
                          : tutor?.tutorProfile?.category || ""
                    }
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hourly Rate</Label>
                  <Input
                    value={
                      tutor?.tutorProfile?.hourlyRate
                        ? `₦${tutor.tutorProfile.hourlyRate.toLocaleString()}`
                        : ""
                    }
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subjects</Label>
                  <div className="flex flex-wrap gap-2">
                    {tutor?.tutorProfile?.specialization?.length ? (
                      tutor.tutorProfile.specialization.map((subject) => (
                        <span
                          key={subject}
                          className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium"
                        >
                          {subject}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No subjects added yet.
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={tutor?.tutorProfile?.bio || ""}
                    readOnly
                    className="bg-muted/50 resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Documents & Status */}
          <div className="space-y-6">
            {/* Verification Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="card-elevated p-6"
            >
              <h2 className="font-semibold mb-4">Verification Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Status</span>
                  <StatusBadge status={mappedStatus} size="sm" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Member since
                  </span>
                  <span className="text-sm font-medium">
                    {tutor?.createdAt?.toDate
                      ? new Date(tutor.createdAt.toDate()).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
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
                      <div key={document.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              statusConfig.className,
                            )}
                          >
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {document.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                              {document.documentType.replace("_", " ")}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-1 rounded-full",
                              statusConfig.className,
                            )}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No documents uploaded yet.
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border">
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
