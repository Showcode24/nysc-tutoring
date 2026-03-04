"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-background/95 border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold">
            <Image
              alt="kopa360-logo"
              src="/kopa360-logo.png"
              width={150}
              height={30}
            />
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Become a Tutor
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-2 bg-background">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent"
                onClick={() => setMenuOpen(false)}
              >
                Become a Tutor
              </Link>
              <div className="flex gap-2 mt-2">
                <Link
                  href="/login"
                  className="flex-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/register"
                  className="flex-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
