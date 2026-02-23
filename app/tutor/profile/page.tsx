"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
  Upload
} from 'lucide-react';
import { currentTutor } from '@/app/src/mock/data';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/app/src/components/layouts/dashboard-layouts';
import { StatusBadge } from '@/app/src/components/shared/status-badge';
import { ProgressRing } from '@/app/src/components/shared/progress-ring';

const tutorNavItems = [
  { label: 'Dashboard', href: '/tutor/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/tutor/profile', icon: User },
  { label: 'Gigs', href: '/tutor/gigs', icon: Briefcase },
  { label: 'My Gigs', href: '/tutor/my-gigs', icon: ClipboardList },
];

const documentStatusConfig = {
  pending: { icon: Clock, className: 'text-status-pending-foreground bg-status-pending-bg', label: 'Pending' },
  approved: { icon: CheckCircle, className: 'text-status-active-foreground bg-status-active-bg', label: 'Approved' },
  rejected: { icon: XCircle, className: 'text-status-rejected-foreground bg-status-rejected-bg', label: 'Rejected' },
};

export default function TutorProfile() {
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
            <h1 className="page-title">My Profile</h1>
            <p className="page-description">Manage your personal information and documents.</p>
          </div>
          <StatusBadge status={currentTutor.status} size="lg" />
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
                <ProgressRing progress={currentTutor.profileCompletion} size={72} strokeWidth={6} />
                <div>
                  <h3 className="font-semibold">Profile Completion</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentTutor.profileCompletion < 100 
                      ? 'Complete your profile to increase your chances of approval.'
                      : 'Great job! Your profile is complete.'}
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
                    <Input value={currentTutor.firstName} readOnly className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={currentTutor.lastName} readOnly className="bg-muted/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={currentTutor.email} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={currentTutor.phone || ''} readOnly className="bg-muted/50" />
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
                  <Label>Education</Label>
                  <Input value={currentTutor.education || ''} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <Input value={currentTutor.experience || ''} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>Subjects</Label>
                  <div className="flex flex-wrap gap-2">
                    {currentTutor.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {currentTutor.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea value={currentTutor.bio || ''} readOnly className="bg-muted/50 resize-none" rows={4} />
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
                  <StatusBadge status={currentTutor.status} size="sm" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="text-sm font-medium">
                    {new Date(currentTutor.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
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
                {currentTutor.documents.map((doc) => {
                  const statusConfig = documentStatusConfig[doc.status];
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div key={doc.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg', statusConfig.className)}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {doc.type.replace('_', ' ')}
                          </p>
                        </div>
                        <span className={cn(
                          'text-xs font-medium px-2 py-1 rounded-full',
                          statusConfig.className
                        )}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
