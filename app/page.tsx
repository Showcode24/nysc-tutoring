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
    <PublicLayout hero={<HeroSection />}>
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
