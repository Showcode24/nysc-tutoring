@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

/* Nigerian Green Design System
   A clean, enterprise-grade design language
   Inspired by: Linear, Stripe, Rippling
*/

:root {
  /* Base neutrals - Cool slate palette */
  --background: 153 10% 98%;
  --foreground: 153 30% 8%;

  /* Card surfaces */
  --card: 0 0% 100%;
  --card-foreground: 153 30% 8%;

  /* Popover/dropdown surfaces */
  --popover: 0 0% 100%;
  --popover-foreground: 153 30% 8%;

  /* Primary - Nigerian Green */
  --primary: 153 100% 27%;
  --primary-foreground: 0 0% 100%;

  /* Secondary - Cool slate for professional actions */
  --secondary: 153 20% 94%;
  --secondary-foreground: 153 30% 15%;

  /* Muted surfaces */
  --muted: 153 15% 93%;
  --muted-foreground: 153 10% 42%;

  /* Accent - Subtle green highlight */
  --accent: 153 60% 92%;
  --accent-foreground: 153 100% 22%;

  /* Destructive - Refined red */
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;

  /* Borders and inputs */
  --border: 153 20% 86%;
  --input: 153 20% 86%;
  --ring: 153 100% 27%;

  --radius: 0.5rem;

  /* Status colors */
  --status-pending: 38 92% 50%;
  --status-pending-bg: 38 92% 95%;
  --status-pending-foreground: 38 92% 30%;

  --status-active: 153 100% 27%;
  --status-active-bg: 153 60% 93%;
  --status-active-foreground: 153 100% 20%;

  --status-restricted: 38 80% 50%;
  --status-restricted-bg: 38 80% 95%;
  --status-restricted-foreground: 38 80% 30%;

  --status-rejected: 0 72% 51%;
  --status-rejected-bg: 0 72% 96%;
  --status-rejected-foreground: 0 72% 35%;

  /* Sidebar */
  --sidebar-background: 153 15% 96%;
  --sidebar-foreground: 153 20% 25%;
  --sidebar-primary: 153 100% 27%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 153 60% 90%;
  --sidebar-accent-foreground: 153 100% 22%;
  --sidebar-border: 153 20% 88%;
  --sidebar-ring: 153 100% 27%;

  /* Chart colors */
  --chart-1: 153 100% 27%;
  --chart-2: 120 60% 40%;
  --chart-3: 153 50% 50%;
  --chart-4: 38 92% 50%;
  --chart-5: 0 72% 51%;
}

.dark {
  --background: 153 20% 6%;
  --foreground: 153 10% 95%;

  --card: 153 18% 9%;
  --card-foreground: 153 10% 95%;

  --popover: 153 18% 9%;
  --popover-foreground: 153 10% 95%;

  --primary: 153 80% 42%;
  --primary-foreground: 153 100% 6%;

  --secondary: 153 15% 14%;
  --secondary-foreground: 153 10% 90%;

  --muted: 153 15% 14%;
  --muted-foreground: 153 10% 58%;

  --accent: 153 40% 18%;
  --accent-foreground: 153 80% 72%;

  --destructive: 0 62% 50%;
  --destructive-foreground: 0 0% 100%;

  --border: 153 15% 17%;
  --input: 153 15% 17%;
  --ring: 153 80% 42%;

  --status-pending-bg: 38 80% 15%;
  --status-pending-foreground: 38 92% 70%;

  --status-active-bg: 153 50% 13%;
  --status-active-foreground: 153 80% 65%;

  --status-restricted-bg: 38 70% 15%;
  --status-restricted-foreground: 38 80% 70%;

  --status-rejected-bg: 0 60% 15%;
  --status-rejected-foreground: 0 72% 70%;

  --sidebar-background: 153 20% 5%;
  --sidebar-foreground: 153 10% 88%;
  --sidebar-primary: 153 80% 42%;
  --sidebar-primary-foreground: 153 100% 6%;
  --sidebar-accent: 153 40% 16%;
  --sidebar-accent-foreground: 153 80% 72%;
  --sidebar-border: 153 15% 14%;
  --sidebar-ring: 153 80% 42%;

  --chart-1: 153 80% 42%;
  --chart-2: 120 55% 50%;
  --chart-3: 153 50% 58%;
  --chart-4: 38 80% 60%;
  --chart-5: 0 62% 60%;
}

@theme inline {
  /* Colors */
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-chart-1: hsl(var(--chart-1));
  --color-chart-2: hsl(var(--chart-2));
  --color-chart-3: hsl(var(--chart-3));
  --color-chart-4: hsl(var(--chart-4));
  --color-chart-5: hsl(var(--chart-5));

  /* Sidebar colors */
  --color-sidebar: hsl(var(--sidebar-background));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-ring: hsl(var(--sidebar-ring));

  /* Border radius */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    @apply bg-background text-foreground;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "cv11", "ss01";
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 600;
    letter-spacing: -0.025em;
    color: hsl(var(--foreground));
  }

  h1 {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }

  h2 {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }

  h3 {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  h4 {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  @media (min-width: 768px) {
    h1 {
      font-size: 3rem;
      line-height: 1;
    }

    h2 {
      font-size: 2.25rem;
      line-height: 2.5rem;
    }

    h3 {
      font-size: 1.875rem;
      line-height: 2.25rem;
    }

    h4 {
      font-size: 1.5rem;
      line-height: 2rem;
    }
  }

  @media (min-width: 1024px) {
    h1 {
      font-size: 3.75rem;
      line-height: 1;
    }
  }
}

@layer components {
  /* Status badge variants */
  .status-badge {
    @apply inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium;
  }

  .status-badge-pending {
    background-color: hsl(var(--status-pending-bg));
    color: hsl(var(--status-pending-foreground));
  }

  .status-badge-active {
    background-color: hsl(var(--status-active-bg));
    color: hsl(var(--status-active-foreground));
  }

  .status-badge-restricted {
    background-color: hsl(var(--status-restricted-bg));
    color: hsl(var(--status-restricted-foreground));
  }

  .status-badge-rejected {
    background-color: hsl(var(--status-rejected-bg));
    color: hsl(var(--status-rejected-foreground));
  }

  /* Card variants */
  .card-elevated {
    @apply bg-card rounded-xl border border-border transition-shadow duration-200;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.04),
      0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .card-elevated:hover {
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  }

  .card-interactive {
    @apply bg-card rounded-xl border border-border transition-shadow duration-200 cursor-pointer hover:border-primary/20;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.04),
      0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .card-interactive:hover {
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  }

  /* Metric card */
  .metric-card {
    @apply bg-card rounded-xl border border-border transition-shadow duration-200 p-6;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.04),
      0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .metric-card:hover {
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
  }

  /* Page section */
  .page-section {
    @apply space-y-6;
  }

  .page-header {
    @apply flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between;
  }

  .page-title {
    @apply text-2xl font-semibold tracking-tight;
  }

  .page-description {
    @apply text-muted-foreground;
  }

  /* Status banner */
  .status-banner {
    @apply p-4 rounded-lg border flex items-center gap-3;
  }

  .status-banner-warning {
    background-color: hsl(var(--status-pending-bg));
    border-color: hsl(var(--status-pending) / 0.2);
    color: hsl(var(--status-pending-foreground));
  }

  .status-banner-success {
    background-color: hsl(var(--status-active-bg));
    border-color: hsl(var(--status-active) / 0.2);
    color: hsl(var(--status-active-foreground));
  }

  .status-banner-error {
    background-color: hsl(var(--status-rejected-bg));
    border-color: hsl(var(--status-rejected) / 0.2);
    color: hsl(var(--status-rejected-foreground));
  }

  /* Empty state */
  .empty-state {
    @apply flex flex-col items-center justify-center py-16 px-4 text-center;
  }

  .empty-state-icon {
    @apply w-16 h-16 mb-4;
    color: hsl(var(--muted-foreground) / 0.3);
  }

  .empty-state-title {
    @apply text-lg font-medium mb-1;
    color: hsl(var(--foreground));
  }

  .empty-state-description {
    @apply text-sm max-w-sm;
    color: hsl(var(--muted-foreground));
  }

  /* Skeleton loader */
  .skeleton {
    @apply animate-pulse bg-muted rounded;
  }

  /* Timeline */
  .timeline-item {
    @apply relative pl-8 pb-8 last:pb-0;
  }

  .timeline-item::before {
    content: "";
    position: absolute;
    left: 11px;
    top: 1.5rem;
    bottom: 0;
    width: 1px;
    background-color: hsl(var(--border));
  }

  .timeline-item:last-child::before {
    @apply hidden;
  }

  .timeline-dot {
    @apply absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center;
    border-color: hsl(var(--border));
    background-color: hsl(var(--background));
  }

  /* Navigation link */
  .nav-link {
    @apply flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors;
    color: hsl(var(--muted-foreground));
  }

  .nav-link:hover {
    color: hsl(var(--foreground));
    background-color: hsl(var(--accent));
  }

  .nav-link-active {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }

  /* Glass effect */
  .glass {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background-color: hsl(var(--background) / 0.8);
  }

  /* Gradient text */
  .text-gradient-green {
    background: linear-gradient(
      to right,
      hsl(var(--primary)),
      hsl(120 80% 35%)
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}

@layer utilities {
  /* Animation utilities */
  .animate-in {
    animation: animate-in 0.3s ease-out;
  }

  .animate-fade-up {
    animation: fade-up 0.4s ease-out;
  }

  .animate-scale-in {
    animation: scale-in 0.2s ease-out;
  }

  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Focus ring */
  .focus-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
    --tw-ring-color: hsl(var(--ring));
  }
}
