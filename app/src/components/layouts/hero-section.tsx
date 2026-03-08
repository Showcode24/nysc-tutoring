"use client";

import { Button } from "@/components/ui/button";
import { Shield, Star, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const textVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.3 } },
};

const imageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const slides = [
  {
    title: "Find Your Perfect",
    highlight: "Tutor Match",
    description:
      "Connect with verified educators tailored to your learning style. Our smart matching system ensures academic success from the first session.",
    src: "/hero-1.png",
  },
  {
    title: "Expert Tutors for",
    highlight: "Every Subject",
    description:
      "From Mathematics to Music, access a diverse network of qualified professionals ready to help you master any challenge.",
    src: "/hero-2.png",
  },
  {
    title: "Flexible Learning",
    highlight: "On Your Terms",
    description:
      "Schedule sessions that fit your busy life. Quality education that adapts to you, not the other way around.",
    src: "/hero-3.png",
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-12 lg:py-20 min-h-[80vh] flex items-center">
      {/* CRITICAL ALIGNMENT: 
         Matches your PublicHeader: max-w-7xl mx-auto px-4 md:px-8 
      */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content Side */}
          <div className="flex flex-col justify-center min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={textVariants}
              >
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 text-gray-900 text-xs font-semibold border border-gray-200 uppercase tracking-wider">
                    <Shield className="w-3 h-3 text-primary" />
                    Verified Tutor Matching
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-black leading-[1.1]">
                  {slides[current].title} <br />
                  <span className="relative inline-block">
                    {slides[current].highlight}
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      height="8"
                      viewBox="0 0 100 8"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M1 5.5C20 2.5 40 2.5 99 5.5"
                        stroke="#94F294"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
                  {slides[current].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Static CTA Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              {/* <div className="w-full sm:w-auto flex bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm focus-within:ring-2 ring-[#94F294]/50 transition-all">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="px-4 py-2 outline-none bg-transparent w-full sm:w-64 text-sm"
                />
                <Button className="bg-[#94F294] hover:bg-[#82e082] text-black font-bold rounded-lg px-6 h-10">
                  Book a demo
                </Button>
              </div> */}
            </div>

            {/* Stats Block */}
            <div className="flex gap-10 pt-8 border-t border-gray-100">
              <div>
                <div className="text-3xl font-bold text-black">75.2%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Daily Matching Rate
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">~20k</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Active Students
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <div className="flex text-black">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-bold text-sm">4.5</span>
              <span className="text-gray-400 text-xs">Average user rating</span>
            </div>
          </div>

          {/* Right Side Image (No card/shadow) */}
          <div className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                variants={imageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative w-full h-full"
              >
                <Image
                  src={slides[current].src}
                  alt="Tutor Matching Illustration"
                  fill
                  className="object-contain" // Keeps it clean and uncropped like the reference
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Subtle Grid Background */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-30" />
          </div>
        </div>
      </div>
    </section>
  );
}
