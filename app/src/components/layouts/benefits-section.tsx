import { Star, Clock, Shield, Award } from "lucide-react";
import { motion } from "framer-motion";
const benefits = [
  {
    icon: Star,
    title: "Competitive Compensation",
    description: "Earn top rates for your expertise and experience.",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Choose when and how much you work.",
  },
  {
    icon: Shield,
    title: "Professional Platform",
    description: "Focus on teaching while we handle the rest.",
  },
  {
    icon: Award,
    title: "Growth Opportunities",
    description: "Build your reputation and expand your client base.",
  },
];
export function BenefitsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-sm font-medium text-primary mb-3 uppercase tracking-wider">
              For Tutors
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Tutors Choose Copper360
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We provide the infrastructure, support, and opportunities you need
              to build a successful tutoring career.
            </p>

            <div className="space-y-5">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0 p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center border border-primary/10">
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {[
                  { value: "98%", label: "Satisfaction" },
                  { value: "2.5k+", label: "Tutors" },
                  { value: "50k+", label: "Sessions" },
                  { value: "4.9", label: "Avg Rating" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="card-elevated p-6 text-center"
                  >
                    <div className="text-3xl font-bold text-primary">
                      {item.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
