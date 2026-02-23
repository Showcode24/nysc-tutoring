"use client";
import { BenefitsSection } from "./src/components/layouts/benefits-section";
import { CTASection } from "./src/components/layouts/cta-section";
import { FAQSection } from "./src/components/layouts/faq-section";
import { HeroSection } from "./src/components/layouts/hero-section";
import { HowItWorks } from "./src/components/layouts/how-it-works";
import { PublicLayout } from "./src/components/layouts/public-layout";
import { StatsSection } from "./src/components/layouts/stats-section";
import { SubjectsSection } from "./src/components/layouts/subjects-section";
import { TestimonialsSection } from "./src/components/layouts/testimonials-section";
import { TrustIndicators } from "./src/components/layouts/trust-indicators";
export default function LandingPage() {
  return (
    <PublicLayout>
      <HeroSection />
      <TrustIndicators />
      <StatsSection />
      <HowItWorks />
      <SubjectsSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </PublicLayout>
  );
}

// "use client";
// import { Button } from "@/components/ui/button";
// import {
//   Shield,
//   Users,
//   BookOpen,
//   CheckCircle,
//   ArrowRight,
//   Star,
//   Clock,
//   Award,
// } from "lucide-react";
// import { motion } from "framer-motion";
// import { PublicLayout } from "./src/components/layouts/public-layout";
// import Link from "next/link";

// const fadeInUp = {
//   initial: { opacity: 0, y: 20 },
//   animate: { opacity: 1, y: 0 },
//   transition: { duration: 0.5 },
// };

// const stagger = {
//   animate: {
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// };

// export default function LandingPage() {
//   return (
//     <PublicLayout>
//       {/* Hero Section */}
//       <section className="relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-hero" />
//         <div className="container relative px-4 md:px-8 py-20 md:py-32">
//           <motion.div
//             className="max-w-3xl mx-auto text-center"
//             initial="initial"
//             animate="animate"
//             variants={stagger}
//           >
//             <motion.div variants={fadeInUp}>
//               <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
//                 <Shield className="w-4 h-4" />
//                 Verified Professional Tutors
//               </span>
//             </motion.div>

//             <motion.h1
//               variants={fadeInUp}
//               className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
//             >
//               Where Quality Tutors
//               <span className="text-gradient-copper block mt-2">
//                 Meet Opportunity
//               </span>
//             </motion.h1>

//             <motion.p
//               variants={fadeInUp}
//               className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
//             >
//               Kopa360 is a professional tutoring platform that connects
//               verified, qualified tutors with students who need them. Join a
//               trusted community of educators.
//             </motion.p>

//             <motion.div
//               variants={fadeInUp}
//               className="flex flex-col sm:flex-row items-center justify-center gap-4"
//             >
//               <Link href="/register">
//                 <Button size="lg" className="min-w-[200px]">
//                   Become a Tutor
//                   <ArrowRight className="ml-2 w-4 h-4" />
//                 </Button>
//               </Link>
//               <Link href="/login">
//                 <Button variant="outline" size="lg" className="min-w-[200px]">
//                   Sign In
//                 </Button>
//               </Link>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Trust Indicators */}
//       <section className="border-y border-border bg-muted/30">
//         <div className="container px-4 md:px-8 py-8">
//           <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-muted-foreground">
//             <div className="flex items-center gap-2">
//               <CheckCircle className="w-5 h-5 text-primary" />
//               <span className="text-sm font-medium">Background Verified</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Shield className="w-5 h-5 text-primary" />
//               <span className="text-sm font-medium">Credential Checked</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Award className="w-5 h-5 text-primary" />
//               <span className="text-sm font-medium">Quality Assured</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Users className="w-5 h-5 text-primary" />
//               <span className="text-sm font-medium">2,500+ Tutors</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="py-20 md:py-28">
//         <div className="container px-4 md:px-8">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">
//               How It Works
//             </h2>
//             <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//               Our streamlined process ensures only qualified tutors join our
//               platform.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               {
//                 step: "01",
//                 title: "Apply",
//                 description:
//                   "Complete your profile with qualifications, experience, and teaching preferences.",
//                 icon: BookOpen,
//               },
//               {
//                 step: "02",
//                 title: "Verify",
//                 description:
//                   "Submit documents and complete our verification process including background checks.",
//                 icon: Shield,
//               },
//               {
//                 step: "03",
//                 title: "Connect",
//                 description:
//                   "Once approved, access tutoring opportunities matched to your expertise.",
//                 icon: Users,
//               },
//             ].map((item, index) => (
//               <motion.div
//                 key={item.step}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.1 }}
//                 className="relative p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow"
//               >
//                 <div className="text-6xl font-bold text-muted/50 mb-4">
//                   {item.step}
//                 </div>
//                 <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
//                   <item.icon className="w-6 h-6 text-primary" />
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
//                 <p className="text-muted-foreground">{item.description}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Benefits */}
//       <section className="py-20 md:py-28 bg-muted/30">
//         <div className="container px-4 md:px-8">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <div>
//               <h2 className="text-3xl md:text-4xl font-bold mb-6">
//                 Why Tutors Choose Kopa360
//               </h2>
//               <p className="text-lg text-muted-foreground mb-8">
//                 We provide the infrastructure, support, and opportunities you
//                 need to build a successful tutoring career.
//               </p>

//               <div className="space-y-4">
//                 {[
//                   {
//                     icon: Star,
//                     title: "Competitive Compensation",
//                     description:
//                       "Earn top rates for your expertise and experience.",
//                   },
//                   {
//                     icon: Clock,
//                     title: "Flexible Schedule",
//                     description: "Choose when and how much you work.",
//                   },
//                   {
//                     icon: Shield,
//                     title: "Professional Platform",
//                     description: "Focus on teaching while we handle the rest.",
//                   },
//                   {
//                     icon: Award,
//                     title: "Growth Opportunities",
//                     description:
//                       "Build your reputation and expand your client base.",
//                   },
//                 ].map((benefit) => (
//                   <div key={benefit.title} className="flex items-start gap-4">
//                     <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
//                       <benefit.icon className="w-5 h-5 text-primary" />
//                     </div>
//                     <div>
//                       <h4 className="font-semibold mb-1">{benefit.title}</h4>
//                       <p className="text-sm text-muted-foreground">
//                         {benefit.description}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="relative">
//               <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
//                 <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
//                   <div className="card-elevated p-6 text-center">
//                     <div className="text-3xl font-bold text-primary">98%</div>
//                     <div className="text-sm text-muted-foreground mt-1">
//                       Satisfaction
//                     </div>
//                   </div>
//                   <div className="card-elevated p-6 text-center">
//                     <div className="text-3xl font-bold text-primary">2.5k+</div>
//                     <div className="text-sm text-muted-foreground mt-1">
//                       Tutors
//                     </div>
//                   </div>
//                   <div className="card-elevated p-6 text-center">
//                     <div className="text-3xl font-bold text-primary">50k+</div>
//                     <div className="text-sm text-muted-foreground mt-1">
//                       Sessions
//                     </div>
//                   </div>
//                   <div className="card-elevated p-6 text-center">
//                     <div className="text-3xl font-bold text-primary">4.9</div>
//                     <div className="text-sm text-muted-foreground mt-1">
//                       Avg Rating
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="py-20 md:py-28">
//         <div className="container px-4 md:px-8">
//           <div className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-16 text-center">
//             <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
//             <div className="relative">
//               <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
//                 Ready to Start Teaching?
//               </h2>
//               <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
//                 Join thousands of verified tutors on Kopa360 and start making an
//                 impact today.
//               </p>
//               <Link href="/register">
//                 <Button size="lg" variant="secondary" className="min-w-[200px]">
//                   Apply Now
//                   <ArrowRight className="ml-2 w-4 h-4" />
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>
//     </PublicLayout>
//   );
// }
