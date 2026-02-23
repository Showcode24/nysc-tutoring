import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
const testimonials = [
  {
    name: 'Thabo Mokoena',
    role: 'Mathematics Tutor',
    quote: 'Copper360 has transformed my tutoring career. The platform connects me with students who genuinely need help, and the verification process means parents trust me from day one.',
    rating: 5,
    sessions: '320+ sessions',
  },
  {
    name: 'Naledi Dlamini',
    role: 'English & Literature Tutor',
    quote: 'The flexibility is incredible. I can choose gigs that fit my schedule and expertise. The compensation is fair and payments are always on time.',
    rating: 5,
    sessions: '480+ sessions',
  },
  {
    name: 'James van der Merwe',
    role: 'Science Tutor',
    quote: 'As a retired teacher, Copper360 lets me continue making an impact. The platform is professional, easy to use, and the support team is always responsive.',
    rating: 5,
    sessions: '195+ sessions',
  },
];
export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container px-4 md:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-primary mb-3 uppercase tracking-wider"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            What Our Tutors Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Hear from verified tutors who have built successful careers on our platform.
          </motion.p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-8 rounded-2xl border border-border bg-card hover:shadow-[var(--shadow-card-hover)] transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {t.sessions}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}