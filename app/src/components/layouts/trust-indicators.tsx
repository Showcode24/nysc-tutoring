import { CheckCircle, Shield, Award, Users } from 'lucide-react';
import { motion } from 'framer-motion';
const indicators = [
  { icon: CheckCircle, label: 'Background Verified' },
  { icon: Shield, label: 'Credential Checked' },
  { icon: Award, label: 'Quality Assured' },
  { icon: Users, label: '2,500+ Tutors' },
];
export function TrustIndicators() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="container px-4 md:px-8 py-8">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-muted-foreground">
          {indicators.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}