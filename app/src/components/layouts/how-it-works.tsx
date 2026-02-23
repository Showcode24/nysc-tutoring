import { BookOpen, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
const steps = [
  {
    step: '01',
    title: 'Apply',
    description: 'Complete your profile with qualifications, experience, and teaching preferences.',
    icon: BookOpen,
  },
  {
    step: '02',
    title: 'Verify',
    description: 'Submit documents and complete our verification process including background checks.',
    icon: Shield,
  },
  {
    step: '03',
    title: 'Connect',
    description: 'Once approved, access tutoring opportunities matched to your expertise.',
    icon: Users,
  },
];
export function HowItWorks() {
  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-primary mb-3 uppercase tracking-wider"
          >
            Simple Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Our streamlined process ensures only qualified tutors join our platform.
          </motion.p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-border" />
          
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative p-8 rounded-2xl border border-border bg-card hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 group"
            >
              <div className="text-6xl font-bold text-muted/50 mb-4 group-hover:text-primary/20 transition-colors">{item.step}</div>
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}