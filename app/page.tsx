"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Heart,
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronDown,
  Calculator,
  Microscope,
  BookOpen,
  Globe2,
  Code2,
  Palette,
  Languages,
  Music2,
  Clock,
  Users,
  BadgeCheck,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";

// In Next.js, files placed in the /public folder are referenced directly
// by their URL path — no import statement is needed (unlike Vite's
// `import img from "/file.jpg"` pattern used in the original).
// Place these files at: public/hero-tutor.jpg, public/become-kopa.jpg,
// public/kopa-1.jpg, public/kopa-2.jpg, public/kopa-3.jpg, public/kopa-4.jpg
const heroImg = "/hero-tutor.jpg";
const becomeImg = "/become-kopa.jpg";
const kopa1 = "/kopa-1.jpg";
const kopa2 = "/kopa-2.jpg";
const kopa3 = "/kopa-3.jpg";
const kopa4 = "/kopa-4.jpg";

/* ---------- Primitives ---------- */

function Pill({
  children,
  tone = "sand",
}: {
  children: React.ReactNode;
  tone?: "sand" | "sage" | "terracotta";
}) {
  const styles = {
    sand: "bg-sand text-ink border-line",
    sage: "bg-sage/10 text-sage border-sage/20",
    terracotta: "bg-terracotta/10 text-terracotta border-terracotta/25",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-ink-soft">
      <span className="font-mono text-terracotta">{index}</span>
      <span className="h-px w-8 bg-line" />
      <span>{children}</span>
    </div>
  );
}

/* ---------- Nav ---------- */

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#tutors", label: "Find a tutor" },
    { href: "#subjects", label: "Subjects" },
    { href: "#how", label: "How it works" },
    { href: "#become", label: "Become a tutor" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-cream/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-5 md:px-8">
        <a href="#" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-cream">
            <span className="font-display text-lg leading-none">K</span>
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Kopa<span className="text-terracotta">360</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="hidden text-sm text-ink-soft hover:text-ink md:inline"
            aria-label="Sign in"
          >
            Sign in
          </a>
          <a
            href="#tutors"
            className="hidden items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream transition hover:bg-ink/90 md:inline-flex"
          >
            Book a tutor <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div
        className={`overflow-hidden border-t border-line/60 bg-cream/95 backdrop-blur-xl transition-[max-height] duration-300 md:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-5 py-4 text-sm">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-line/50 py-3 text-ink last:border-b-0 hover:text-terracotta"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#"
            onClick={() => setOpen(false)}
            className="border-b border-line/50 py-3 text-ink-soft hover:text-ink"
          >
            Sign in
          </a>
          <a
            href="#tutors"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-cream"
          >
            Book a tutor <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  const [subject, setSubject] = useState("Mathematics");
  const [area, setArea] = useState("GRA, Benin City");
  const [level, setLevel] = useState("Secondary");

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="mx-auto grid max-w-[1360px] gap-10 px-5 pb-16 pt-10 md:grid-cols-12 md:gap-8 md:px-8 md:pb-24 md:pt-16">
        {/* Left */}
        <div className="animate-rise md:col-span-7">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-3 py-1 text-xs text-ink-soft">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sage" />
            </span>
            412 tutors teaching across Benin City today
          </div>

          <h1 className="font-display text-[52px] leading-[0.95] tracking-[-0.02em] text-ink sm:text-[68px] md:text-[88px]">
            Better tutors.
            <br />
            <span className="italic text-terracotta">Brighter</span> students.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Kopa360 connects parents in Benin City with rigorously vetted tutors
            — from primary maths to WAEC prep — so your child gets the attention
            that actually moves grades.
          </p>

          {/* Search card */}
          <div className="mt-8 rounded-2xl border border-line bg-white p-2 shadow-[0_1px_0_rgba(20,15,10,0.04),0_20px_60px_-30px_rgba(20,15,10,0.25)]">
            <div className="grid grid-cols-1 gap-1 md:grid-cols-[1.1fr_1fr_0.9fr_auto]">
              <label className="group rounded-xl px-4 py-3 transition hover:bg-sand/60">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  Subject
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-terracotta" />
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-transparent text-[15px] font-medium text-ink placeholder:text-ink-soft focus:outline-none"
                    aria-label="Subject"
                  />
                </div>
              </label>
              <label className="group rounded-xl px-4 py-3 transition hover:bg-sand/60 md:border-l md:border-line/70">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  Area in Benin
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-terracotta" />
                  <input
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-transparent text-[15px] font-medium text-ink placeholder:text-ink-soft focus:outline-none"
                    aria-label="Area"
                  />
                </div>
              </label>
              <label className="group rounded-xl px-4 py-3 transition hover:bg-sand/60 md:border-l md:border-line/70">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  Level
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-terracotta" />
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-transparent text-[15px] font-medium text-ink focus:outline-none"
                    aria-label="Level"
                  >
                    <option>Primary</option>
                    <option>Secondary</option>
                    <option>WAEC / JAMB</option>
                    <option>University</option>
                  </select>
                </div>
              </label>
              <button className="group m-1 inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-cream transition hover:bg-terracotta">
                <Search className="h-4 w-4" />
                Find my tutor
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-sage" /> ID + background
              checked
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-ochre" /> Free first-session
              match
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-terracotta" /> Avg reply in 12 min
            </span>
          </div>
        </div>

        {/* Right — hero image collage */}
        <div className="relative md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-sand">
            <img
              src={heroImg}
              alt="A Kopa360 tutor helping a young student with schoolwork in Benin City"
              width={1200}
              height={1400}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/40 to-transparent" />
            <div className="absolute left-4 top-4">
              <Pill tone="terracotta">
                <span className="h-1.5 w-1.5 rounded-full bg-terracotta" /> Live
                in Benin City
              </Pill>
            </div>
          </div>

          {/* Floating rating card */}
          <div className="absolute -left-3 bottom-8 hidden w-[240px] rotate-[-3deg] rounded-2xl border border-line bg-white p-4 shadow-xl md:block">
            <div className="flex items-center gap-3">
              <img
                src={kopa3}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold">Adaeze O.</div>
                <div className="text-xs text-ink-soft">Maths · WAEC prep</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-ochre">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
              <span className="ml-1 text-xs text-ink-soft">
                4.98 · 214 sessions
              </span>
            </div>
          </div>

          {/* Floating stat card */}
          <div className="absolute -right-2 -top-4 hidden w-[200px] rotate-[4deg] rounded-2xl border border-line bg-ink p-4 text-cream shadow-xl md:block">
            <div className="text-[11px] uppercase tracking-[0.18em] text-cream/60">
              Grade lift · Term 1
            </div>
            <div className="mt-1 font-display text-4xl">+27%</div>
            <div className="mt-1 text-xs text-cream/70">
              Average across secondary students, 2024–25
            </div>
          </div>
        </div>
      </div>

      {/* Trust marquee */}
      <div className="border-t border-line bg-sand/50">
        <div className="mx-auto flex max-w-[1360px] items-center gap-6 overflow-hidden px-5 py-5 md:px-8">
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft">
            Trusted by families at
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-2xl text-ink/60">
              {[
                "Federal Government College",
                "Word of Faith Group",
                "Nosakhare Model",
                "Idia College",
                "University Prep. School",
                "Presentation National High",
                "Adolo College",
                "Igbinedion Education Centre",
              ]
                .concat([
                  "Federal Government College",
                  "Word of Faith Group",
                  "Nosakhare Model",
                  "Idia College",
                ])
                .map((s, i) => (
                  <span key={i} className="flex items-center gap-10">
                    {s}
                    <span className="h-1 w-1 rounded-full bg-line" />
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Trust Bar ---------- */

function Stats() {
  const stats = [
    { k: "412", l: "Verified tutors" },
    { k: "18,400+", l: "Sessions completed" },
    { k: "4.92", l: "Avg. parent rating" },
    { k: "12 min", l: "Avg. response time" },
  ];
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-[1360px] grid-cols-2 divide-line px-5 py-10 md:grid-cols-4 md:divide-x md:px-8 md:py-14">
        {stats.map((s) => (
          <div key={s.l} className="px-2 py-3 md:px-8">
            <div className="font-display text-5xl text-ink md:text-6xl">
              {s.k}
            </div>
            <div className="mt-1 text-sm text-ink-soft">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Tell us what your child needs",
      d: "Subject, level, learning goals, preferred days — takes under 60 seconds.",
    },
    {
      n: "02",
      t: "Meet 3 hand-matched tutors",
      d: "We surface only tutors who fit your child's syllabus, location and pace.",
    },
    {
      n: "03",
      t: "Free 20-min discovery session",
      d: "See the chemistry before you commit. No card required upfront.",
    },
    {
      n: "04",
      t: "Learn, track, grow",
      d: "Sessions at home or online. Real progress reports after every 4 lessons.",
    },
  ];
  return (
    <section id="how" className="border-b border-line">
      <div className="mx-auto max-w-[1360px] px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionLabel index="01">How Kopa360 works</SectionLabel>
            <h2 className="mt-5 font-display text-4xl leading-[1.05] md:text-5xl">
              From <span className="italic">"we need help"</span> to your first
              lesson — in a day.
            </h2>
            <p className="mt-5 text-ink-soft">
              We built the shortest possible path between a worried parent and a
              truly great tutor. No agency fees. No guesswork.
            </p>
          </div>
          <ol className="md:col-span-8">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="group relative bg-cream p-7 transition hover:bg-white"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs text-terracotta">
                      {s.n}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-ink-soft opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-8 font-display text-2xl leading-tight">
                    {s.t}
                  </h3>
                  <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
                </li>
              ))}
            </div>
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------- Featured tutors ---------- */

type Tutor = {
  name: string;
  photo: string;
  subjects: string[];
  rate: string;
  rating: number;
  sessions: number;
  years: number;
  area: string;
  reply: string;
  bio: string;
};

const KOPAS: Tutor[] = [
  {
    name: "Ese Igbinovia",
    photo: kopa1,
    subjects: ["Mathematics", "Further Maths"],
    rate: "₦4,500/hr",
    rating: 4.98,
    sessions: 214,
    years: 6,
    area: "GRA",
    reply: "8 min",
    bio: "Ex-Sasakawa scholar. Specialises in WAEC breakthroughs for anxious learners.",
  },
  {
    name: "David Aigbogun",
    photo: kopa2,
    subjects: ["Physics", "Chemistry"],
    rate: "₦5,000/hr",
    rating: 4.95,
    sessions: 178,
    years: 5,
    area: "Ugbowo",
    reply: "11 min",
    bio: "UNIBEN Physics 1st class. Turns 'I hate science' into curiosity.",
  },
  {
    name: "Adaeze Okonkwo",
    photo: kopa3,
    subjects: ["English", "Literature"],
    rate: "₦4,000/hr",
    rating: 5.0,
    sessions: 302,
    years: 7,
    area: "Ikpoba Hill",
    reply: "6 min",
    bio: "Cambridge-trained. Coaches confident writers, not just correct ones.",
  },
  {
    name: "Ifeanyi Osaigbovo",
    photo: kopa4,
    subjects: ["Coding", "Robotics"],
    rate: "₦6,000/hr",
    rating: 4.9,
    sessions: 96,
    years: 4,
    area: "Airport Rd",
    reply: "15 min",
    bio: "Builds first apps with primary kids. Python, Scratch, and confidence.",
  },
];

function KopaCard({ k }: { k: Tutor }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(20,15,10,0.25)]">
      <div className="relative aspect-[5/6] overflow-hidden bg-sand">
        <img
          src={k.photo}
          alt={`${k.name}, Kopa360 tutor`}
          loading="lazy"
          width={600}
          height={700}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        <button
          aria-label={`Save ${k.name}`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink backdrop-blur transition hover:bg-white hover:text-terracotta"
        >
          <Heart className="h-4 w-4" />
        </button>
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur">
          <BadgeCheck className="h-3.5 w-3.5 text-sage" /> Verified
        </div>
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-medium text-cream backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Available this
          week
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl leading-tight">
              {k.name}
            </h3>
            <p className="mt-0.5 text-xs text-ink-soft">
              {k.years} yrs · {k.area}, Benin City
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-sm font-semibold">
              <Star className="h-3.5 w-3.5 fill-ochre text-ochre" />
              {k.rating}
            </div>
            <div className="text-[11px] text-ink-soft">
              {k.sessions} sessions
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-soft">{k.bio}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {k.subjects.map((s) => (
            <span
              key={s}
              className="rounded-full border border-line bg-sand/60 px-2.5 py-1 text-[11px] font-medium text-ink"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <div>
            <div className="font-display text-xl">{k.rate}</div>
            <div className="text-[11px] text-ink-soft">
              Replies in ~{k.reply}
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream transition hover:bg-terracotta">
            Book <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

function FeaturedKopas() {
  return (
    <section id="tutors" className="border-b border-line bg-sand/40">
      <div className="mx-auto max-w-[1360px] px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionLabel index="02">This week's featured tutors</SectionLabel>
            <h2 className="mt-5 max-w-2xl font-display text-4xl leading-[1.05] md:text-5xl">
              Meet a few tutors parents in Benin{" "}
              <span className="italic">quietly rave about.</span>
            </h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-line bg-white px-4 py-2 text-sm font-medium hover:bg-ink hover:text-cream"
          >
            Browse all 412 tutors <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {KOPAS.map((k) => (
            <KopaCard key={k.name} k={k} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Subjects ---------- */

function Subjects() {
  const categories = [
    { key: "all", label: "All", count: 321 },
    { key: "waec", label: "WAEC / NECO", count: 184 },
    { key: "jamb", label: "JAMB prep", count: 96 },
    { key: "primary", label: "Primary", count: 72 },
    { key: "future", label: "Future skills", count: 41 },
  ];
  const featured = {
    i: Calculator,
    n: "Mathematics",
    tagline: "Our most-booked subject",
    c: 82,
    lift: "+31% avg. grade lift",
    level: "Primary → SS3",
  };
  const subjects = [
    { i: Microscope, n: "Sciences", sub: "Phy · Chem · Bio", c: 61 },
    {
      i: BookOpen,
      n: "English & Lit",
      sub: "Grammar · Essay · Lit-in-Eng",
      c: 74,
    },
    { i: Globe2, n: "Social Studies", sub: "Govt · Econs · CRK", c: 38 },
    {
      i: Code2,
      n: "Coding & Robotics",
      sub: "Scratch · Python · Arduino",
      c: 22,
      trend: true,
    },
    {
      i: Languages,
      n: "French & Igbo",
      sub: "Conversational · Exam prep",
      c: 19,
    },
    {
      i: Palette,
      n: "Art & Design",
      sub: "Fine art · Digital · Portfolio",
      c: 14,
    },
    { i: Music2, n: "Music", sub: "Piano · Voice · Theory", c: 11 },
  ];
  return (
    <section id="subjects" className="border-b border-line bg-cream/40">
      <div className="mx-auto max-w-[1360px] px-5 py-20 md:px-8 md:py-28">
        {/* Header */}
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionLabel index="03">Popular subjects</SectionLabel>
            <h2 className="mt-5 font-display text-4xl leading-[1.05] md:text-5xl">
              Whatever the syllabus,{" "}
              <span className="italic">there's a tutor for it.</span>
            </h2>
            <p className="mt-5 max-w-xl text-ink-soft">
              From WAEC core subjects to future-facing skills like coding — we
              cover the breadth of the Nigerian curriculum and beyond.
            </p>
          </div>
          <div className="md:col-span-5 md:text-right">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-terracotta hover:gap-2.5 transition-all"
            >
              Browse all 24 subjects
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="mt-10 -mx-5 md:mx-0 overflow-x-auto scrollbar-none">
          <div className="flex min-w-max gap-2 px-5 md:px-0">
            {categories.map((c, idx) => (
              <button
                key={c.key}
                className={
                  "group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition " +
                  (idx === 0
                    ? "border-ink bg-ink text-cream"
                    : "border-line bg-white text-ink hover:border-terracotta/40 hover:bg-terracotta/[0.04]")
                }
              >
                {c.label}
                <span
                  className={
                    "rounded-full px-1.5 py-px text-[10px] font-medium " +
                    (idx === 0
                      ? "bg-cream/20 text-cream"
                      : "bg-ink/5 text-ink-soft")
                  }
                >
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured + grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {/* Featured subject */}
          <a
            href="#"
            className="group relative col-span-2 flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-ink p-7 text-cream md:col-span-2 md:row-span-2 lg:col-span-2 lg:min-h-[420px]"
          >
            {/* decorative gradient */}
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-40 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, var(--terracotta) 0%, transparent 70%)",
              }}
              aria-hidden
            />
            <div className="relative flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-cream/5 px-2.5 py-1 text-[11px] font-medium text-cream/90">
                <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
                Most booked
              </span>
              <featured.i className="h-8 w-8 text-terracotta" />
            </div>
            <div className="relative mt-16">
              <div className="font-display text-4xl leading-[1.05] md:text-5xl">
                {featured.n}
              </div>
              <p className="mt-2 text-sm text-cream/70">{featured.tagline}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-cream/10 pt-5 text-xs">
                <div>
                  <div className="text-cream/50">Tutors</div>
                  <div className="mt-0.5 font-medium text-cream">
                    {featured.c}
                  </div>
                </div>
                <div>
                  <div className="text-cream/50">Levels</div>
                  <div className="mt-0.5 font-medium text-cream">
                    {featured.level}
                  </div>
                </div>
                <div>
                  <div className="text-cream/50">Outcome</div>
                  <div className="mt-0.5 font-medium text-terracotta">
                    {featured.lift}
                  </div>
                </div>
              </div>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-cream group-hover:gap-2.5 transition-all">
                Find a Maths tutor
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </a>

          {/* Smaller cards — miniatures of the featured card */}
          {subjects.map((s) => (
            <a
              key={s.n}
              href="#"
              className="group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-terracotta/40 hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] md:col-span-2 md:min-h-[200px] lg:col-span-2"
            >
              {/* subtle hover glow */}
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
                style={{
                  background:
                    "radial-gradient(circle, var(--terracotta) 0%, transparent 70%)",
                }}
                aria-hidden
              />
              <div className="relative flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta transition group-hover:bg-terracotta group-hover:text-cream">
                  <s.i className="h-5 w-5" />
                </div>
                {s.trend ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-terracotta/20 bg-terracotta/[0.06] px-2 py-0.5 text-[10px] font-medium text-terracotta">
                    <span className="h-1 w-1 rounded-full bg-terracotta" />
                    Trending
                  </span>
                ) : (
                  <span className="text-[11px] text-ink-soft/70">
                    {s.c} tutors
                  </span>
                )}
              </div>
              <div className="relative mt-8">
                <div className="font-display text-2xl leading-tight">{s.n}</div>
                <div className="mt-1 text-xs text-ink-soft">{s.sub}</div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-ink-soft">
                  <span>
                    {s.trend ? `${s.c} tutors · new` : "Available this week"}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-terracotta" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-line bg-white/60 px-5 py-4 text-sm text-ink-soft">
          <span>
            Can't find your subject? We'll source a vetted tutor within 72
            hours.
          </span>
          <a
            href="#"
            className="inline-flex items-center gap-1 font-medium text-ink hover:text-terracotta"
          >
            Request a subject <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Trust / Safety ---------- */

function Safety() {
  const points = [
    {
      t: "Government-ID verified",
      d: "Every tutor is matched to a valid NIN or passport.",
    },
    {
      t: "Background & reference checks",
      d: "We call two past employers or schools before approval.",
    },
    {
      t: "Teaching audition",
      d: "A live 30-min mock class scored by our academic panel.",
    },
    {
      t: "Ongoing parent reviews",
      d: "Fall below 4.5★ and you're paused from the platform.",
    },
  ];
  return (
    <section className="border-b border-line bg-ink text-cream">
      <div className="mx-auto grid max-w-[1360px] gap-12 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
        <div className="md:col-span-5">
          <SectionLabel index="04">
            <span className="text-cream/70">Why parents trust us</span>
          </SectionLabel>
          <h2 className="mt-5 font-display text-4xl leading-[1.05] md:text-5xl">
            We are pickier than{" "}
            <span className="italic text-ochre">most schools</span> about who
            teaches your child.
          </h2>
          <p className="mt-5 text-cream/70">
            Only 1 in 9 applicants makes it onto Kopa360. Our four-step vetting
            removes the biggest fear parents have about home lessons.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-cream/10">
              <ShieldCheck className="h-6 w-6 text-ochre" />
            </div>
            <div>
              <div className="font-display text-2xl">11% acceptance</div>
              <div className="text-sm text-cream/60">
                Of tutors who apply monthly
              </div>
            </div>
          </div>
        </div>
        <ol className="md:col-span-7 md:pl-10">
          {points.map((p, i) => (
            <li
              key={p.t}
              className="grid grid-cols-[auto_1fr] gap-6 border-t border-cream/10 py-6 first:border-t-0 first:pt-0"
            >
              <span className="font-mono text-xs text-ochre">0{i + 1}</span>
              <div>
                <div className="font-display text-2xl leading-tight">{p.t}</div>
                <p className="mt-1.5 max-w-lg text-cream/70">{p.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */

function Testimonials() {
  const items = [
    {
      q: "My daughter went from 42% in Maths to 78% in one term. The tutor didn't just teach — she rebuilt her confidence.",
      n: "Mrs. Osaghae",
      r: "Parent · SS2 · GRA",
      img: kopa3,
    },
    {
      q: "I'm the one who dreaded Physics. Now I actually enjoy problem sets. My tutor explains things like a big brother.",
      n: "Daniel, 15",
      r: "Student · Idia College",
      img: kopa2,
    },
    {
      q: "Vetting is real. The tutor we got had a police report on file, a demo lesson, and referees I could call. Rare.",
      n: "Engr. Uwagboe",
      r: "Parent · Primary 5",
      img: kopa1,
    },
  ];
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-[1360px] px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionLabel index="05">Real parents. Real students.</SectionLabel>
            <h2 className="mt-5 max-w-2xl font-display text-4xl leading-[1.05] md:text-5xl">
              The moment a child <span className="italic">stops dreading</span>{" "}
              the subject — that's the review.
            </h2>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((t, i) => (
            <figure
              key={i}
              className={`flex flex-col justify-between rounded-2xl border border-line p-7 ${
                i === 1 ? "bg-terracotta text-cream" : "bg-white"
              }`}
            >
              <blockquote
                className={`font-display text-2xl leading-snug ${
                  i === 1 ? "text-cream" : "text-ink"
                }`}
              >
                "{t.q}"
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <img
                  src={t.img}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div
                    className={`text-sm font-semibold ${i === 1 ? "text-cream" : "text-ink"}`}
                  >
                    {t.n}
                  </div>
                  <div
                    className={`text-xs ${i === 1 ? "text-cream/70" : "text-ink-soft"}`}
                  >
                    {t.r}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 fill-current ${
                        i === 1 ? "text-ochre" : "text-ochre"
                      }`}
                    />
                  ))}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Become a tutor ---------- */

function BecomeAKopa() {
  const perks = [
    {
      t: "Earn ₦120k–₦450k / month",
      d: "Set your own rate. Keep 85% of every session.",
    },
    {
      t: "Students come to you",
      d: "We match, pre-qualify, and schedule. You just teach.",
    },
    {
      t: "Get paid, weekly",
      d: "Direct transfer every Friday. No chasing parents.",
    },
    {
      t: "Grow your practice",
      d: "Reviews, badges, and a public profile that compounds.",
    },
  ];
  return (
    <section id="become" className="border-b border-line bg-terracotta-soft">
      <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
        <div className="relative md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-sand">
            <img
              src={becomeImg}
              alt="A Kopa360 tutor holding notebooks"
              loading="lazy"
              width={1000}
              height={1200}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -right-3 bottom-8 hidden w-[220px] rotate-[3deg] rounded-2xl border border-line bg-white p-4 shadow-xl md:block">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">
              This month
            </div>
            <div className="mt-1 font-display text-3xl">₦318,500</div>
            <div className="text-xs text-ink-soft">
              Paid out to tutor Adaeze
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-sand">
              <div className="h-full w-[74%] rounded-full bg-sage" />
            </div>
          </div>
        </div>
        <div className="md:col-span-7 md:pl-6">
          <SectionLabel index="06">Become a tutor</SectionLabel>
          <h2 className="mt-5 font-display text-4xl leading-[1.02] md:text-6xl">
            Teach on your terms. <span className="italic">Get paid</span> for
            the impact you already make.
          </h2>
          <p className="mt-6 max-w-xl text-ink-soft">
            Join Benin City's most respected tutoring network. We handle
            bookings, payments, and parent comms — you focus on the lesson.
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {perks.map((p) => (
              <li
                key={p.t}
                className="rounded-2xl border border-ink/10 bg-cream p-5"
              >
                <Check className="h-5 w-5 rounded-full bg-sage/15 p-1 text-sage" />
                <div className="mt-3 font-display text-xl leading-tight">
                  {p.t}
                </div>
                <p className="mt-1 text-sm text-ink-soft">{p.d}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-ink/90"
            >
              Apply to teach <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-transparent px-6 py-3 text-sm font-medium text-ink hover:bg-cream"
            >
              See earnings calculator
            </a>
            <span className="text-sm text-ink-soft">Takes 6 minutes.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

function FAQ() {
  const faqs = [
    {
      q: "How much does a tutor cost?",
      a: "Rates range from ₦3,500 to ₦8,000 per hour depending on subject, level and experience. You'll see each tutor's rate on their profile — no surprise fees.",
    },
    {
      q: "Do lessons happen at home or online?",
      a: "Both. Most Benin City families prefer in-home lessons. You can also book online for schedule flexibility, especially for WAEC and JAMB prep.",
    },
    {
      q: "What if my child doesn't click with the tutor?",
      a: "The first 20-minute discovery session is free. If it isn't the right match, we rematch you — no charge, no questions.",
    },
    {
      q: "How do you vet tutors?",
      a: "Government ID, two reference calls, a live 30-minute audition scored by our academic panel, and ongoing parent reviews. Only 11% of applicants are approved.",
    },
    {
      q: "How do payments work?",
      a: "Pay per session or buy a bundle. All payments are held safely and only released to the tutor after each lesson is confirmed by you.",
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
        <div className="md:col-span-4">
          <SectionLabel index="07">Questions parents ask</SectionLabel>
          <h2 className="mt-5 font-display text-4xl leading-[1.05] md:text-5xl">
            Everything you'd ask before{" "}
            <span className="italic">letting anyone teach your child.</span>
          </h2>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium hover:bg-ink hover:text-cream"
          >
            <MessageCircle className="h-4 w-4" /> Chat with us on WhatsApp
          </a>
        </div>
        <div className="md:col-span-8">
          <ul className="divide-y divide-line border-y border-line">
            {faqs.map((f, i) => (
              <li key={i}>
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  aria-expanded={open === i}
                >
                  <span className="font-display text-xl md:text-2xl">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ink-soft transition ${
                      open === i ? "rotate-180 text-terracotta" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ${
                    open === i ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 max-w-2xl text-ink-soft">{f.a}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCTA() {
  return (
    <section className="border-b border-line bg-cream">
      <div className="mx-auto max-w-[1360px] px-5 py-20 md:px-8 md:py-28">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-ink px-8 py-16 text-center text-cream md:px-16 md:py-24">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-terracotta/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-ochre/25 blur-3xl" />
          <Pill tone="terracotta">
            <Sparkles className="h-3 w-3" /> Free first match
          </Pill>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-[1.02] md:text-7xl">
            Your child's next{" "}
            <span className="italic text-ochre">breakthrough</span> is one
            lesson away.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-cream/70">
            Tell us the subject. We'll bring the tutor. Book your first session
            in under two minutes.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-ink hover:bg-terracotta hover:text-cream"
            >
              Find my tutor <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#become"
              className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-6 py-3 text-sm font-medium text-cream hover:bg-cream/10"
            >
              I want to teach instead
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="bg-cream">
      <div className="mx-auto max-w-[1360px] px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-cream">
                <span className="font-display text-lg leading-none">K</span>
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                Kopa<span className="text-terracotta">360</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-ink-soft">
              Benin City's marketplace for trusted private tutors. Built by
              educators, for parents who refuse to gamble on their child's
              future.
            </p>
            <form className="mt-6 flex max-w-md items-center gap-2 rounded-full border border-line bg-white p-1.5">
              <input
                type="email"
                placeholder="you@parent.com"
                aria-label="Email"
                className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none"
              />
              <button className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-terracotta">
                Get the guide
              </button>
            </form>
            <p className="mt-2 text-xs text-ink-soft">
              Get our free "Picking the right tutor" guide for Nigerian parents.
            </p>
          </div>
          <div className="md:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              {
                h: "Platform",
                l: ["Find a tutor", "Subjects", "Pricing", "Gift a session"],
              },
              {
                h: "Tutors",
                l: ["Become a tutor", "Payouts", "Community", "Resources"],
              },
              {
                h: "Support",
                l: ["Help center", "Safety", "Contact", "WhatsApp us"],
              },
              { h: "Company", l: ["About", "Blog", "Careers", "Press"] },
            ].map((c) => (
              <div key={c.h}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                  {c.h}
                </div>
                <ul className="mt-4 space-y-3 text-sm">
                  {c.l.map((i) => (
                    <li key={i}>
                      <a href="#" className="text-ink hover:text-terracotta">
                        {i}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 text-xs text-ink-soft md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Kopa360. Made in Benin City.</div>
          <div className="flex flex-wrap gap-5">
            <a href="#" className="hover:text-ink">
              Terms
            </a>
            <a href="#" className="hover:text-ink">
              Privacy
            </a>
            <a href="#" className="hover:text-ink">
              Safeguarding
            </a>
            <a href="#" className="hover:text-ink">
              Accessibility
            </a>
          </div>
        </div>

        <div className="mt-10 select-none">
          <div className="font-display text-[16vw] leading-[0.85] tracking-[-0.04em] text-ink/[0.06]">
            Kopa360.
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
// In the TanStack Router version this component was registered via
// `createFileRoute("/")({ component: Landing })`. In Next.js App Router,
// a default export from `app/page.tsx` is the route itself — no
// route-registration call is needed.

export default function Landing() {
  return (
    <main className="min-h-dvh bg-cream text-ink">
      <Nav />
      <Hero />
      <Stats />
      <HowItWorks />
      <FeaturedKopas />
      <Subjects />
      <Safety />
      <Testimonials />
      <BecomeAKopa />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

// The block below (from the original file) was already commented out and
// sketched an alternative composition using separate layout components
// under ./src/components/layouts/*. Left untouched in case you want to
// migrate to that structure later — it is not active code.

// "use client";
// import { BenefitsSection } from "./src/components/layouts/benefits-section";
// import { CTASection } from "./src/components/layouts/cta-section";
// import { FAQSection } from "./src/components/layouts/faq-section";
// import { HeroSection } from "./src/components/layouts/hero-section";
// import { HowItWorks } from "./src/components/layouts/how-it-works";
// import { PublicLayout } from "./src/components/layouts/public-layout";
// import { StatsSection } from "./src/components/layouts/stats-section";
// import { SubjectsSection } from "./src/components/layouts/subjects-section";
// import { TestimonialsSection } from "./src/components/layouts/testimonials-section";
// import { TrustIndicators } from "./src/components/layouts/trust-indicators";

// export default function LandingPage() {
//   return (
//     <PublicLayout hero={<HeroSection />}>
//       <TrustIndicators />
//       {/* <StatsSection /> */}
//       <HowItWorks />
//       <SubjectsSection />
//       <BenefitsSection />
//       <TestimonialsSection />
//       <FAQSection />
//       <CTASection />
//     </PublicLayout>
//   );
// }
