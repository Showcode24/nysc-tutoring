"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Eye,
  Filter,
  Briefcase,
} from "lucide-react";
import { mockTutors, mockAdmin } from "@/app/src/mock/data";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/app/src/components/layouts/dashboard-layouts";
import { StatusBadge } from "@/app/src/components/shared/status-badge";
import { TutorStatus } from "@/app/src/types";
import Link from "next/link";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tutors", href: "/admin/tutors", icon: Users },
  { label: "Gigs", href: "/admin/gigs", icon: Briefcase },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Audit Log", href: "/admin/audit", icon: History },
];

export default function AdminTutors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TutorStatus | "all">("all");

  const filteredTutors = mockTutors.filter((tutor) => {
    const matchesSearch =
      tutor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || tutor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      navItems={adminNavItems}
      userType="admin"
      userName={`${mockAdmin.firstName} ${mockAdmin.lastName}`}
      userRole={mockAdmin.role.replace("_", " ")}
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Tutor Management</h1>
            <p className="page-description">
              Review and manage tutor applications and statuses.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card-elevated p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as TutorStatus | "all")
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tutors Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tutor</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTutors.map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                        {tutor.firstName[0]}
                        {tutor.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tutor.firstName} {tutor.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {tutor.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tutor.subjects.slice(0, 2).map((subject) => (
                        <span
                          key={subject}
                          className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs"
                        >
                          {subject}
                        </span>
                      ))}
                      {tutor.subjects.length > 2 && (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                          +{tutor.subjects.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tutor.status} size="sm" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${tutor.profileCompletion}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {tutor.profileCompletion}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(tutor.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/tutor-review/${tutor.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTutors.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-medium">No tutors found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
