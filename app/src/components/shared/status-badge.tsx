import { cn } from "@/lib/utils";
import { Circle, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { TutorStatus } from "../../types";

interface StatusBadgeProps {
  status: TutorStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  TutorStatus,
  {
    label: string;
    className: string;
    icon: typeof Circle;
  }
> = {
  pending: {
    label: "Pending",
    className: "status-badge-pending",
    icon: Circle,
  },
  restricted: {
    label: "Restricted",
    className: "status-badge-restricted",
    icon: AlertCircle,
  },
  active: {
    label: "Active",
    className: "status-badge-active",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    className: "status-badge-rejected",
    icon: XCircle,
  },
};

const sizeClasses = {
  sm: "text-2xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

const iconSizes = {
  sm: 10,
  md: 12,
  lg: 14,
};

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "status-badge",
        config.className,
        sizeClasses[size],
        className,
      )}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
