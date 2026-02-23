"use client";
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
import { currentTutor, mockGigs } from "@/app/src/mock/data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import { StatusBadge } from "@/app/src/components/shared/status-badge";
import { EmptyState } from "@/app/src/components/shared/empty-state";
import Link from "next/link";

const tutorNavItems = [
  { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/tutor/profile", icon: User },
  { label: "Gigs", href: "/tutor/gigs", icon: Briefcase },
  { label: "My Gigs", href: "/tutor/my-gigs", icon: ClipboardList },
];

export default function TutorGigs() {
  const isLocked = currentTutor.status !== "active";

  return (
    <DashboardLayout
      navItems={tutorNavItems}
      userType="tutor"
      userName={`${currentTutor.firstName} ${currentTutor.lastName}`}
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
          <StatusBadge status={currentTutor.status} size="lg" />
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
              tutoring opportunities. Please complete your profile and wait for
              approval.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <a href="/tutor/profile">Complete Profile</a>
              </Button>
              <Button asChild>
                <a href="/tutor/dashboard">View Status</a>
              </Button>
            </div>

            {/* Blurred Preview */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-background" />
              <div className="blur-sm opacity-50 pointer-events-none">
                <div className="grid md:grid-cols-2 gap-4">
                  {mockGigs.slice(0, 2).map((gig) => (
                    <div key={gig.id} className="card-elevated p-6 text-left">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold">{gig.title}</h3>
                        <span className="status-badge status-badge-active">
                          Open
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {gig.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />${gig.hourlyRate}/hr
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {gig.location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active State - Gig Listings */}
        {!isLocked && (
          <>
            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <Button variant="secondary" size="sm">
                All Subjects
              </Button>
              <Button variant="ghost" size="sm">
                Mathematics
              </Button>
              <Button variant="ghost" size="sm">
                Science
              </Button>
              <Button variant="ghost" size="sm">
                Languages
              </Button>
              <Button variant="ghost" size="sm">
                Computer Science
              </Button>
            </div>

            {/* Gigs Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {mockGigs
                .filter((g) => g.status === "open")
                .map((gig, index) => (
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
                        {new Date(gig.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
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

            {/* If no gigs */}
            {mockGigs.filter((g) => g.status === "open").length === 0 && (
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
  );
}
