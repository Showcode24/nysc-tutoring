"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LayoutDashboard,
  Users,
  Calendar,
  History,
  Briefcase,
  Plus,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  UserCheck,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/app/src/components/shared/empty-state";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import AdminProtectedWrapper from "@/app/src/components/layouts/admin-protected-wrapper";
import Link from "next/link";
import { auth, db } from "@/app/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  fetchAllGigs,
  fetchApplicationsForGig,
  createGig,
  GigRecord,
} from "@/app/firebase/gigsService";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tutors", href: "/admin/tutors", icon: Users },
  { label: "Gigs", href: "/admin/gigs", icon: Briefcase },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Audit Log", href: "/admin/audit", icon: History },
];

type GigFilter = "all" | "open" | "assigned" | "completed" | "cancelled";

const emptyForm = {
  title: "",
  subject: "",
  location: "",
  description: "",
  hourlyRate: "",
  hoursPerWeek: "",
  startDate: "",
};

export default function AdminGigs() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<GigFilter>("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isCreating, setIsCreating] = useState(false);

  const [gigs, setGigs] = useState<GigRecord[]>([]);
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [adminRole, setAdminRole] = useState("admin");
  const [adminId, setAdminId] = useState("");

  const load = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setAdminId(currentUser.uid);
      const adminDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (adminDoc.exists()) {
        const d = adminDoc.data();
        setAdminName(`${d.firstName || ""} ${d.lastName || ""}`.trim());
        setAdminRole((d.role || d.userType || "admin").replace(/_/g, " "));
      }
    }
    const result = await fetchAllGigs();
    setGigs(result);

    const counts: Record<string, number> = {};
    await Promise.all(
      result.map(async (gig) => {
        const apps = await fetchApplicationsForGig(gig.id);
        counts[gig.id] = apps.length;
      }),
    );
    setApplicantCounts(counts);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateGig = async () => {
    if (!form.title || !form.subject || !form.location || !form.hourlyRate || !form.hoursPerWeek || !form.startDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields before creating a gig.",
        variant: "destructive",
      });
      return;
    }
    setIsCreating(true);
    try {
      await createGig(
        {
          title: form.title,
          subject: form.subject,
          description: form.description,
          hourlyRate: parseFloat(form.hourlyRate) || 0,
          hoursPerWeek: parseFloat(form.hoursPerWeek) || 0,
          location: form.location,
          startDate: form.startDate,
        },
        adminId,
      );
      toast({ title: "Gig created" });
      setCreateOpen(false);
      setForm(emptyForm);
      await load();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create gig.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredGigs = gigs
    .filter((g) => filter === "all" || g.status === filter)
    .filter(
      (g) =>
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.subject.toLowerCase().includes(search.toLowerCase()),
    );

  const filterCounts = {
    all: gigs.length,
    open: gigs.filter((g) => g.status === "open").length,
    assigned: gigs.filter((g) => g.status === "assigned").length,
    completed: gigs.filter((g) => g.status === "completed").length,
    cancelled: gigs.filter((g) => g.status === "cancelled").length,
  };

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
              <h1 className="page-title">Gig Management</h1>
              <p className="page-description">
                Create, manage, and assign tutoring gigs.
              </p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Gig
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Gig</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new tutoring opportunity.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., SAT Math Prep Tutor Needed"
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Mathematics"
                        value={form.subject}
                        onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Remote"
                        value={form.location}
                        onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the tutoring requirements..."
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rate">Hourly Rate ($)</Label>
                      <Input
                        id="rate"
                        type="number"
                        placeholder="50"
                        value={form.hourlyRate}
                        onChange={(e) => setForm((p) => ({ ...p, hourlyRate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours">Hours/Week</Label>
                      <Input
                        id="hours"
                        type="number"
                        placeholder="4"
                        value={form.hoursPerWeek}
                        onChange={(e) => setForm((p) => ({ ...p, hoursPerWeek: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start">Start Date</Label>
                      <Input
                        id="start"
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGig} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Gig"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search gigs by title or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(
                ["all", "open", "assigned", "completed", "cancelled"] as GigFilter[]
              ).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="capitalize"
                >
                  {f} ({filterCounts[f]})
                </Button>
              ))}
            </div>
          </div>

          {/* Gigs Table */}
          {filteredGigs.length > 0 ? (
            <div className="card-elevated overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                        Gig
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                        Details
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                        Applicants
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                        Status
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredGigs.map((gig, index) => (
                      <motion.tr
                        key={gig.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-accent/30 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{gig.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {gig.subject}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
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
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {applicantCounts[gig.id] ?? 0}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              applicants
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
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
                        </td>
                        <td className="p-4 text-right">
                          <Link href={`/admin/gigs/details/${gig.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No gigs found"
              description={
                search
                  ? "Try adjusting your search or filters."
                  : "Create your first gig to get started."
              }
            />
          )}
        </div>
      </DashboardLayout>
    </AdminProtectedWrapper>
  );
}
