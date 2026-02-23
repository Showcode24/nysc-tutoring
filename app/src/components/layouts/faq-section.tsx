import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, MessageCircleQuestion, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
const faqCategories = ["General", "Tutors", "Payments"] as const;

const faqs = [
  {
    q: "How do I apply to become a tutor?",
    a: 'Simply click "Become a Tutor" and complete your profile with your qualifications, experience, and teaching preferences. Our team will review your application within 48 hours.',
    category: "General",
  },
  {
    q: "What qualifications do I need?",
    a: "You need a minimum of a matric certificate with relevant subject passes. A teaching qualification or degree in your subject area is preferred. All tutors must pass our background and credential verification.",
    category: "Tutors",
  },
  {
    q: "How does the verification process work?",
    a: "We conduct a thorough background check, verify your academic credentials, and review your teaching experience. This ensures only qualified professionals join our platform.",
    category: "Tutors",
  },
  {
    q: "How and when do I get paid?",
    a: "Payments are processed weekly via EFT directly to your bank account. You can track all your earnings and payment history through your tutor dashboard.",
    category: "Payments",
  },
  {
    q: "Can I choose which gigs to accept?",
    a: "Absolutely. You have full control over which tutoring opportunities you apply for. Choose based on subject, location, schedule, and compensation.",
    category: "General",
  },
  {
    q: "Is there a minimum commitment required?",
    a: "No minimum hours are required. You have the flexibility to tutor as much or as little as you want, making it perfect for both full-time and part-time educators.",
    category: "General",
  },
];
export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<string>("General");
  const [openItem, setOpenItem] = useState<number | null>(0);
  const filteredFaqs = faqs.filter((f) => f.category === activeCategory);
  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-8">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left column - heading & categories */}
          <div className="lg:col-span-2 lg:sticky lg:top-28">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-medium text-primary mb-3 uppercase tracking-wider"
            >
              FAQ
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Got Questions?{" "}
              <span className="text-gradient-copper">We've Got Answers</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mb-8 leading-relaxed"
            >
              Everything you need to know before getting started. Can't find
              what you're looking for?
            </motion.p>
            {/* Category filters */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {faqCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenItem(0);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button variant="outline" className="group">
                <MessageCircleQuestion className="mr-2 w-4 h-4" />
                Contact Support
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
          {/* Right column - FAQ items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 space-y-3"
          >
            {filteredFaqs.map((faq, i) => {
              const isOpen = openItem === i;
              return (
                <motion.div
                  key={`${activeCategory}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-primary/20 bg-card shadow-[var(--shadow-card-hover)]"
                      : "border-border bg-card/50 hover:bg-card hover:border-border"
                  }`}
                >
                  <button
                    onClick={() => setOpenItem(isOpen ? null : i)}
                    className="flex items-center justify-between w-full text-left px-6 py-5 gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                          isOpen
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-semibold text-[15px]">{faq.q}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: isOpen ? "auto" : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 pl-16 text-muted-foreground leading-relaxed text-[15px]">
                      {faq.a}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
