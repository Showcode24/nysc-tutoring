"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User,
  Briefcase,
  ClipboardList,
  Lock,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import ProtectedPageWrapper from "@/app/src/components/layouts/protected-page-wrapper";
import { StatusBadge } from "@/app/src/components/shared/status-badge";
import { EmptyState } from "@/app/src/components/shared/empty-state";
import { TutorStatus } from "@/app/src/types";
import Link from "next/link";
import { auth, db } from "@/app/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { fetchOpenGigs, GigRecord } from "@/app/firebase/gigsService";

const tutorNavItems = [
  { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/tutor/profile", icon: User },
  { label: "Gigs", href: "/tutor/gigs", icon: Briefcase },
  { label: "My Gigs", href: "/tutor/my-gigs", icon: ClipboardList },
];

function mapStatus(status: string): TutorStatus {
  if (status === "pending_verification") return "pending";
  return (status as TutorStatus) || "pending";
}

export default function TutorGigs() {
  const [tutorName, setTutorName] = useState("");
  const [status, setStatus] = useState<TutorStatus>("pending");
  const [gigs, setGigs] = useState<GigRecord[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setTutorName(`${data.firstName || ""} ${data.lastName || ""}`.trim());
          setStatus(mapStatus(data.tutorProfile?.status));
        }
      }
      const result = await fetchOpenGigs();
      setGigs(result);
      setIsLoading(false);
    };
    load();
  }, []);

  const isLocked = status !== "active";
  const subjects = [...new Set(gigs.map((g) => g.subject))];
  const filteredGigs = subjectFilter
    ? gigs.filter((g) => g.subject === subjectFilter)
    : gigs;

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

  return (
    <ProtectedPageWrapper>
      <DashboardLayout
        navItems={tutorNavItems}
        userType="tutor"
        userName={tutorName}
      >
        <div className="space-y-8">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Available Gigs</h1>
              <p className="page-description">
                {isLocked
                  ? "Complete verification to access tutoring opportunities."
                  : "Browse and apply to tutoring opportunities."}
              </p>
            </div>
            <StatusBadge status={status} size="lg" />
          </div>

          {/* Locked State */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-8 text-center"
            >
              <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Gigs Are Locked</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Your account must be verified before you can view and apply to
                tutoring opportunities. Please complete your profile and wait
                for approval.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" asChild>
                  <a href="/tutor/profile">Complete Profile</a>
                </Button>
                <Button asChild>
                  <a href="/tutor/dashboard">View Status</a>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Active State - Gig Listings */}
          {!isLocked && (
            <>
              {/* Subject filter */}
              {subjects.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant={subjectFilter === null ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSubjectFilter(null)}
                  >
                    All Subjects
                  </Button>
                  {subjects.map((subject) => (
                    <Button
                      key={subject}
                      variant={subjectFilter === subject ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSubjectFilter(subject)}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              )}

              {/* Gigs Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {filteredGigs.map((gig, index) => (
                  <motion.div
                    key={gig.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-interactive p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{gig.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {gig.subject}
                        </p>
                      </div>
                      <span className="status-badge status-badge-active">
                        Open
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {gig.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />${gig.hourlyRate}/hr
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {gig.hoursPerWeek} hrs/week
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {gig.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        Starts{" "}
                        {gig.startDate
                          ? new Date(gig.startDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )
                          : "—"}
                      </span>
                      <Button size="sm" asChild>
                        <Link href={`/tutor/gigs/${gig.id}`}>
                          View Details
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredGigs.length === 0 && (
                <EmptyState
                  icon={Briefcase}
                  title="No gigs available"
                  description="There are no tutoring opportunities available at the moment. Check back soon!"
                />
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedPageWrapper>
  );
}
