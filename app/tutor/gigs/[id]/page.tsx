"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  User,
  Briefcase,
  ClipboardList,
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Send,
  CheckCircle,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/app/src/components/shared/empty-state";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import ProtectedPageWrapper from "@/app/src/components/layouts/protected-page-wrapper";
import Link from "next/link";
import { auth, db } from "@/app/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  fetchGigById,
  fetchApplicationForTutorAndGig,
  applyToGig,
  GigRecord,
} from "@/app/firebase/gigsService";

const tutorNavItems = [
  { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/tutor/profile", icon: User },
  { label: "Gigs", href: "/tutor/gigs", icon: Briefcase },
  { label: "My Gigs", href: "/tutor/my-gigs", icon: ClipboardList },
];

export default function TutorGigDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [gig, setGig] = useState<GigRecord | null>(null);
  const [tutorName, setTutorName] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const currentUser = auth.currentUser;
      let name = "";
      let uid = "";
      if (currentUser) {
        uid = currentUser.uid;
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
          setIsLocked(data.tutorProfile?.status !== "active");
        }
        setTutorName(name);
      }

      const gigResult = await fetchGigById(id || "");
      setGig(gigResult);

      if (gigResult && uid) {
        const existing = await fetchApplicationForTutorAndGig(gigResult.id, uid);
        setApplied(!!existing && existing.status !== "withdrawn");
      }

      setIsLoading(false);
    };
    load();
  }, [id]);

  const handleApply = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !gig) return;
    setIsSubmitting(true);
    try {
      const result = await applyToGig(gig.id, currentUser.uid, tutorName, message);
      if (result.success) {
        setApplied(true);
        setApplyOpen(false);
        toast({
          title: "Application submitted",
          description: "We'll notify you when there's an update.",
        });
      } else {
        toast({
          title: "Couldn't apply",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedPageWrapper>
        <DashboardLayout navItems={tutorNavItems} userType="tutor" userName="">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-terracotta" />
          </div>
        </DashboardLayout>
      </ProtectedPageWrapper>
    );
  }

  if (!gig) {
    return (
      <ProtectedPageWrapper>
        <DashboardLayout
          navItems={tutorNavItems}
          userType="tutor"
          userName={tutorName}
        >
          <EmptyState
            icon={Briefcase}
            title="Gig not found"
            description="The gig you're looking for doesn't exist."
          />
        </DashboardLayout>
      </ProtectedPageWrapper>
    );
  }

  if (isLocked) {
    return (
      <ProtectedPageWrapper>
        <DashboardLayout
          navItems={tutorNavItems}
          userType="tutor"
          userName={tutorName}
        >
          <div className="space-y-6">
            <Link href="/tutor/gigs">
              <Button variant="ghost" size="sm" className="-ml-2">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Gigs
              </Button>
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-8 text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Account Not Verified
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You need to complete verification before you can view gig
                details or apply.
              </p>
              <Button asChild>
                <Link href="/tutor/dashboard">View Status</Link>
              </Button>
            </motion.div>
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
        userName={tutorName}
      >
        <div className="space-y-8">
          <Link href="/tutor/gigs">
            <Button variant="ghost" size="sm" className="-ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Gigs
            </Button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="card-elevated p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="page-title">{gig.title}</h1>
                    <p className="text-muted-foreground mt-1">{gig.subject}</p>
                  </div>
                  <span className="status-badge status-badge-active">
                    Open
                  </span>
                </div>

                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {gig.description}
                  </p>
                </div>

                {gig.studentName && (
                  <div className="border-t border-border pt-4 mt-4">
                    <h3 className="font-medium mb-2">Student</h3>
                    <p className="text-sm text-muted-foreground">
                      {gig.studentName}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="card-elevated p-6 space-y-4">
                <h3 className="font-semibold">Gig Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-muted-foreground">Hourly Rate</p>
                      <p className="font-medium">${gig.hourlyRate}/hr</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-muted-foreground">Hours per Week</p>
                      <p className="font-medium">{gig.hoursPerWeek} hrs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{gig.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {gig.startDate
                          ? new Date(gig.startDate).toLocaleDateString(
                              "en-US",
                              { month: "long", day: "numeric", year: "numeric" },
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Estimated Weekly Earnings
                  </p>
                  <p className="text-2xl font-semibold text-primary">
                    ${gig.hourlyRate * gig.hoursPerWeek}
                    <span className="text-sm text-muted-foreground font-normal">
                      /week
                    </span>
                  </p>
                </div>
              </div>

              <div className="card-elevated p-6">
                {applied ? (
                  <div className="text-center">
                    <CheckCircle className="w-10 h-10 text-[hsl(var(--status-active))] mx-auto mb-3" />
                    <p className="font-medium mb-1">Application Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      You've already applied to this gig. We'll notify you
                      when there's an update.
                    </p>
                    <Link href="/tutor/my-gigs">
                      <Button variant="outline" className="mt-4 w-full">
                        View My Applications
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold mb-2">Interested?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Submit your application and a message explaining why
                      you're a great fit.
                    </p>
                    <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Send className="w-4 h-4 mr-2" />
                          Apply Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Apply to: {gig.title}</DialogTitle>
                          <DialogDescription>
                            Tell the admin why you're a great fit for this
                            gig.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="message">Cover Message</Label>
                            <Textarea
                              id="message"
                              placeholder="Describe your experience and why you'd be a great match..."
                              rows={5}
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setApplyOpen(false)}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleApply} disabled={isSubmitting}>
                            {isSubmitting
                              ? "Submitting..."
                              : "Submit Application"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedPageWrapper>
  );
}
