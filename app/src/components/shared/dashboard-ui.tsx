"use client";

export function Pill({
  children,
  tone = "sand",
}: {
  children: React.ReactNode;
  tone?: "sand" | "sage" | "terracotta" | "ochre";
}) {
  const styles = {
    sand: "bg-sand text-ink border-line",
    sage: "bg-sage/10 text-sage border-sage/20",
    terracotta: "bg-terracotta/10 text-terracotta border-terracotta/25",
    ochre: "bg-ochre/10 text-ochre border-ochre/25",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-ink-soft">
      <span className="h-px w-8 bg-line" />
      <span>{children}</span>
    </div>
  );
}

export function ProgressRing({
  progress,
  size = 56,
}: {
  progress: number;
  size?: number;
}) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--sand)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--terracotta)"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-sand text-ink-soft">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-lg text-ink">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-ink-soft">{description}</p>
      </div>
    </div>
  );
}