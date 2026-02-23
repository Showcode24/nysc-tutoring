import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { TutorStatus } from '../../types';

interface StatusBannerProps {
  status: TutorStatus;
  appointmentDate?: string;
  verificationNotes?: string;
  className?: string;
}

const bannerConfig: Record<TutorStatus, {
  icon: typeof Clock;
  title: string;
  description: string;
  bannerClass: string;
}> = {
  pending: {
    icon: Clock,
    title: 'Application Under Review',
    description: 'Your application is being reviewed. Complete your profile and documents to expedite the process.',
    bannerClass: 'status-banner-warning',
  },
  restricted: {
    icon: AlertCircle,
    title: 'Account Restricted',
    description: 'Your account has temporary restrictions. Please complete the required verification steps.',
    bannerClass: 'status-banner-warning',
  },
  active: {
    icon: CheckCircle,
    title: 'Account Verified',
    description: 'Your account is fully verified. You can now browse and accept available gigs.',
    bannerClass: 'status-banner-success',
  },
  rejected: {
    icon: XCircle,
    title: 'Application Not Approved',
    description: 'Unfortunately, your application was not approved at this time.',
    bannerClass: 'status-banner-error',
  },
};

export function StatusBanner({ 
  status, 
  appointmentDate,
  verificationNotes,
  className 
}: StatusBannerProps) {
  const config = bannerConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('status-banner', config.bannerClass, className)}
    >
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{config.title}</p>
        <p className="text-sm opacity-90 mt-0.5">
          {verificationNotes || config.description}
        </p>
        {appointmentDate && status !== 'active' && status !== 'rejected' && (
          <p className="text-sm font-medium mt-2">
            Scheduled appointment: {new Date(appointmentDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
