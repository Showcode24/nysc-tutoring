"use client"
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User,
  Briefcase,
  ClipboardList,
  Lock,
  DollarSign,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  currentTutor,
  getApplicationsForTutor,
  getGigById,
} from "@/app/src/mock/data";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import { EmptyState } from "@/app/src/components/shared/empty-state";
import Link from "next/link";

const tutorNavItems = [
  { label: "Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/tutor/profile", icon: User },
  { label: "Gigs", href: "/tutor/gigs", icon: Briefcase },
  { label: "My Gigs", href: "/tutor/my-gigs", icon: ClipboardList },
];

type TabFilter = "all" | "applied" | "accepted" | "rejected";

export default function TutorMyGigs() {
  const isLocked = currentTutor.status !== "active";
  const [tab, setTab] = useState<TabFilter>("all");
  const applications = getApplicationsForTutor(currentTutor.id);

  const filtered = applications.filter(
    (a) => tab === "all" || a.status === tab,
  );

  if (isLocked) {
    return (
      <DashboardLayout
        navItems={tutorNavItems}
        userType="tutor"
        userName={`${currentTutor.firstName} ${currentTutor.lastName}`}
      >
        <div className="space-y-8">
          <div className="page-header">
            <div>
              <h1 className="page-title">My Gigs</h1>
              <p className="page-description">
                Complete verification to access your gig applications.
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated p-8 text-center"
          >
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Applications Are Locked
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Your account must be verified before you can apply to gigs and
              track your applications.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/tutor/profile">Complete Profile</Link>
              </Button>
              <Button asChild>
                <Link href="/tutor/dashboard">View Status</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

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
            <h1 className="page-title">My Gigs</h1>
            <p className="page-description">
              Track your gig applications and active assignments.
            </p>
          </div>
          <Button asChild>
            <Link href="/tutor/gigs">
              <Briefcase className="w-4 h-4 mr-2" />
              Browse Gigs
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "Applied",
              count: applications.filter((a) => a.status === "applied").length,
              icon: Loader2,
              color: "text-[hsl(var(--status-pending))]",
            },
            {
              label: "Accepted",
              count: applications.filter((a) => a.status === "accepted").length,
              icon: CheckCircle,
              color: "text-[hsl(var(--status-active))]",
            },
            {
              label: "Rejected",
              count: applications.filter((a) => a.status === "rejected").length,
              icon: XCircle,
              color: "text-[hsl(var(--status-rejected))]",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-elevated p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.count}</p>
                </div>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {(["all", "applied", "accepted", "rejected"] as TabFilter[]).map(
            (t) => (
              <Button
                key={t}
                variant={tab === t ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTab(t)}
                className="capitalize"
              >
                {t}
              </Button>
            ),
          )}
        </div>

        {/* Applications List */}
        {filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((app, index) => {
              const gig = getGigById(app.gigId);
              if (!gig) return null;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-elevated p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-semibold">{gig.title}</h3>
                        <span
                          className={cn(
                            "status-badge",
                            app.status === "applied" && "status-badge-pending",
                            app.status === "accepted" && "status-badge-active",
                            app.status === "rejected" &&
                              "status-badge-rejected",
                          )}
                        >
                          {app.status.charAt(0).toUpperCase() +
                            app.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {gig.subject}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />$
                          {gig.hourlyRate}/hr
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {gig.hoursPerWeek} hrs/wk
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {gig.location}
                        </span>
                      </div>

                      {app.message && (
                        <div className="mt-3 bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              Your message:{" "}
                            </span>
                            {app.message}
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-3">
                        Applied{" "}
                        {new Date(app.appliedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Link href={`/tutor/gigs/${gig.id}`} className="shrink-0">
                      <Button variant="ghost" size="sm">
                        View
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title={
              tab === "all" ? "No applications yet" : `No ${tab} applications`
            }
            description={
              tab === "all"
                ? "Browse available gigs and submit your first application."
                : `You don't have any ${tab} applications.`
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
}
