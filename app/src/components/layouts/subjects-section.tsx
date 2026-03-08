import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Calculator,
  BookOpen,
  FlaskConical,
  Globe,
  Music,
  Languages,
  Code,
  Palette,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
const subjects = [
  {
    name: "Mathematics",
    icon: Calculator,
    count: "450+",
    description: "Algebra, Calculus, Statistics & more",
    levels: ["Primary", "High School", "University"],
    color: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    name: "English",
    icon: BookOpen,
    count: "380+",
    description: "Literature, Grammar, Creative Writing",
    levels: ["Primary", "High School", "University"],
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    name: "Sciences",
    icon: FlaskConical,
    count: "320+",
    description: "Physics, Chemistry, Biology",
    levels: ["High School", "University"],
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    name: "Geography",
    icon: Globe,
    count: "180+",
    description: "Physical, Human & Environmental",
    levels: ["Primary", "High School"],
    color: "from-teal-500/20 to-cyan-500/20",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  {
    name: "Music",
    icon: Music,
    count: "95+",
    description: "Theory, Instruments, Composition",
    levels: ["All Levels"],
    color: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    name: "Programming",
    icon: Code,
    count: "210+",
    description: "Python, Java, Web Development",
    levels: ["High School", "University"],
    color: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    name: "Art & Design",
    icon: Palette,
    count: "120+",
    description: "Visual Arts, Digital Design, Drawing",
    levels: ["All Levels"],
    color: "from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    name: "Languages",
    icon: Languages,
    count: "260+",
    description: "Afrikaans, isiZulu, French & more",
    levels: ["Primary", "High School", "University"],
    color: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
];
export function SubjectsSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <section className="py-20 md:py-28 overflow-hidden">
      <div className="container px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-medium text-primary mb-3 uppercase tracking-wider"
            >
              Wide Coverage
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-3"
            >
              Every Subject,{" "}
              <span className="text-gradient-copper">Every Level</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-xl"
            >
              From primary school to university level, we have expert tutors
              across every discipline.
            </motion.p>
          </div>
          {/* <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" className="group">
              View All Subjects
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div> */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((subject, i) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300 cursor-default overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-2.5 rounded-xl bg-muted group-hover:bg-background/60 transition-colors`}
                  >
                    <subject.icon className={`w-5 h-5 ${subject.iconColor}`} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground tabular-nums">
                    {subject.count}
                    <span className="font-normal ml-0.5">tutors</span>
                  </span>
                </div>

                <h4 className="font-semibold text-[15px] mb-1">
                  {subject.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {subject.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {subject.levels.map((level) => (
                    <span
                      key={level}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground group-hover:bg-background/50 transition-colors"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
              {/* Hover arrow indicator */}
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={
                  hoveredIndex === i
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -5 }
                }
                className="absolute bottom-5 right-5"
              >
                <ArrowRight className="w-4 h-4 text-primary" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
