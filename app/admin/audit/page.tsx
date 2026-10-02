"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import AdminProtectedWrapper from "@/app/src/components/layouts/admin-protected-wrapper";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Users,
  Calendar,
  History,
  Search,
  Filter,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  CalendarPlus,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { auth, db } from "@/app/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  fetchAllAuditEvents,
  AuditEvent,
} from "@/app/firebase/adminTutorReviewService";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tutors", href: "/admin/tutors", icon: Users },
  { label: "Gigs", href: "/admin/gigs", icon: Briefcase },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Audit Log", href: "/admin/audit", icon: History },
];

const actionIcons: Record<string, typeof User> = {
  "Application Submitted": User,
  "Documents Uploaded": FileText,
  "Document Approved": CheckCircle,
  "Tutor Approved": CheckCircle,
  "Tutor Rejected": XCircle,
  "Appointment Scheduled": CalendarPlus,
  "Status Changed": Clock,
};

function eventDate(timestamp: any): Date {
  return timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
}

export default function AdminAuditLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [adminRole, setAdminRole] = useState("admin");

  useEffect(() => {
    const load = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const adminDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (adminDoc.exists()) {
          const d = adminDoc.data();
          setAdminName(`${d.firstName || ""} ${d.lastName || ""}`.trim());
          setAdminRole((d.role || d.userType || "admin").replace(/_/g, " "));
        }
      }
      const result = await fetchAllAuditEvents();
      setEvents(result);
      setIsLoading(false);
    };
    load();
  }, []);

  // Get unique actions for filter
  const uniqueActions = [...new Set(events.map((e) => e.action))];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);

    const matchesAction =
      actionFilter === "all" || event.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  // Group events by date
  const eventsByDate = filteredEvents.reduce(
    (acc, event) => {
      const date = eventDate(event.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(event);
      return acc;
    },
    {} as Record<string, AuditEvent[]>,
  );

  if (isLoading) {
    return (
      <AdminProtectedWrapper>
        <DashboardLayout navItems={adminNavItems} userType="admin" userName="">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DashboardLayout>
      </AdminProtectedWrapper>
    );
  }

  return (
    <AdminProtectedWrapper>
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
              <h1 className="page-title">Audit Log</h1>
              <p className="page-description">
                Track all administrative actions and tutor activities.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="card-elevated p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {Object.entries(eventsByDate).map(([date, dateEvents]) => (
              <div key={date}>
                <h3 className="font-medium text-sm text-muted-foreground mb-4 sticky top-0 bg-background py-2">
                  {date}
                </h3>
                <div className="card-elevated">
                  {dateEvents.map((event, index) => {
                    const Icon = actionIcons[event.action] || Clock;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "p-4 flex gap-4",
                          index < dateEvents.length - 1 &&
                            "border-b border-border",
                        )}
                      >
                        <div className="flex-shrink-0">
                          <div className="p-2 rounded-lg bg-accent">
                            <Icon className="w-4 h-4 text-accent-foreground" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium">{event.action}</p>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {event.description}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {eventDate(event.timestamp).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {event.tutorId && (
                              <Link
                                href={`/admin/tutor-review/${event.tutorId}`}
                                className="hover:text-foreground transition-colors"
                              >
                                View tutor
                              </Link>
                            )}
                            {event.adminName && (
                              <span>By: {event.adminName}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}

            {Object.keys(eventsByDate).length === 0 && (
              <div className="card-elevated p-12 text-center">
                <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground">
                  {events.length === 0
                    ? "No admin actions have been recorded yet."
                    : "Try adjusting your search or filters."}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    </AdminProtectedWrapper>
  );
}
