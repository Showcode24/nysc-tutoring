"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  userType: "tutor" | "admin";
  userName: string;
  userRole?: string;
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-cream">
        <span className="font-display text-lg leading-none">K</span>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-ink">
        Kopa<span className="text-terracotta">360</span>
      </span>
    </Link>
  );
}

function UserBadge({
  userName,
  userType,
  userRole,
}: {
  userName: string;
  userType: string;
  userRole?: string;
}) {
  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("") || "?";
  return (
    <div className="flex items-center gap-3 rounded-xl p-2">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-terracotta/10 font-display text-sm text-terracotta">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{userName}</p>
        <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">
          {userRole || userType}
        </p>
      </div>
    </div>
  );
}

function NavLinks({
  navItems,
  pathname,
  onNavigate,
}: {
  navItems: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-ink text-cream"
                  : "text-ink-soft hover:bg-sand/60 hover:text-ink",
              )}
            >
              <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function DashboardLayout({
  children,
  navItems,
  userType,
  userName,
  userRole,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-line bg-cream lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-line px-6">
            <Logo />
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <NavLinks navItems={navItems} pathname={pathname} />
          </nav>

          <div className="border-t border-line p-4">
            <UserBadge
              userName={userName}
              userType={userType}
              userRole={userRole}
            />
            <Link
              href="/login"
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-terracotta/40 hover:text-terracotta"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line/60 bg-cream/80 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo />
      </header>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-cream lg:hidden"
            >
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center justify-between border-b border-line px-6">
                  <Logo />
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close menu"
                    className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4">
                  <NavLinks
                    navItems={navItems}
                    pathname={pathname}
                    onNavigate={() => setSidebarOpen(false)}
                  />
                </nav>
                <div className="border-t border-line p-4">
                  <UserBadge
                    userName={userName}
                    userType={userType}
                    userRole={userRole}
                  />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1360px] px-5 py-8 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
