"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, PlayCircle } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const appleEase = [0.16, 1, 0.3, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: appleEase },
  },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: appleEase },
  },
};

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const initialState = prefersReducedMotion ? "visible" : "hidden";

  return (
    <section
      aria-label="Find your perfect tutor match"
      className="relative flex min-h-[90vh] w-full items-center overflow-hidden lg:min-h-screen"
    >
      {/* Background artwork — static, never animated */}
      <Image
        src="/hero.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        className="z-0 object-cover object-right"
      />

      {/* Readability wash — fades out by the time it reaches the student */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(255,255,255,.92)_0%,rgba(255,255,255,.65)_35%,rgba(255,255,255,0)_70%)]"
      />

      {/* Content */}
      <div className="relative z-20 mx-auto w-full max-w-[1400px] px-[clamp(24px,4vw,80px)]">
        <motion.div
          initial={initialState}
          animate="visible"
          variants={containerVariants}
          className="flex w-full flex-col items-start text-left lg:max-w-[40%]"
        >
          <motion.span
            variants={fadeUpVariants}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-600"
          >
            Tutoring, reimagined.
          </motion.span>

          <motion.h1
            variants={fadeUpVariants}
            className="text-[42px] font-bold leading-[1.05] tracking-tight text-neutral-900 sm:text-[56px] lg:text-[72px]"
          >
            Find your
            <br />
            perfect match.
          </motion.h1>

          <motion.p
            variants={fadeUpVariants}
            className="mt-6 max-w-sm text-lg text-neutral-700 sm:text-xl"
          >
            Verified tutors. Every subject. Matched in minutes.
          </motion.p>

          <motion.p
            variants={fadeUpVariants}
            className="mt-3 text-sm text-neutral-600"
          >
            From $24/hr · First session free
          </motion.p>

          <motion.div
            variants={buttonVariants}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Link
              href="/get-matched"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-8 py-4 text-base font-medium text-white shadow-sm shadow-teal-600/20 transition-colors hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              Get matched
              <ChevronRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/how-it-works"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/30 px-8 py-4 text-base font-medium text-neutral-900 backdrop-blur-md transition-colors hover:bg-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              Watch overview
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}