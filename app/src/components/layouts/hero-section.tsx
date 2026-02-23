import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};
const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      
      <div className="container relative px-4 md:px-8 py-24 md:py-36">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
              <Shield className="w-4 h-4" />
              Verified Professional Tutors
            </span>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            Where Quality Tutors
            <span className="text-gradient-copper block mt-2">Meet Opportunity</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Copper360 is a professional tutoring platform that connects verified, 
            qualified tutors with students who need them. Join a trusted community 
            of educators making a difference.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="min-w-[200px] h-12 text-base">
                Become a Tutor
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="min-w-[200px] h-12 text-base">
                Sign In
              </Button>
            </Link>
          </motion.div>
          {/* Floating trust note */}
          <motion.p 
            variants={fadeInUp}
            className="mt-8 text-sm text-muted-foreground"
          >
            Trusted by <span className="font-semibold text-foreground">2,500+</span> tutors across South Africa
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}