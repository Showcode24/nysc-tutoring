"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  easeInOut,
} from "framer-motion";

/**
 * EDITORIAL SCROLL STORY
 * ----------------------
 * Centered, one move per stage (fade + slow upward drift, eased). Plus the
 * quiet editorial devices: a fixed kicker naming the current chapter, a
 * large ghosted numeral behind each headline, a thin progress bar, and a
 * short muted support line under each headline.
 *
 * The section background is a soft white-to-cream gradient throughout — no
 * fade from the hero. Headline and support text use a green-gray ink rather
 * than flat charcoal/gray. The final stage does not fade out: it fades in
 * and then holds at full opacity through the end of the scroll range, so
 * the section stays visibly "full" right up until the next section takes
 * over.
 */

const SECTION_GRADIENT = "linear-gradient(180deg, #FFFFFF 0%, #F7F4EF 100%)";
const INK = "#3A423C"; // green-gray, replaces flat charcoal ink
const MUTED = "#6E766F"; // lighter green-gray, replaces flat gray

type StageRange = readonly [number, number, number, number];

// [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] on the 0->1 scroll axis.
// For the final stage, fadeOutStart/fadeOutEnd are unused (see `holdAtEnd`).
const STAGE_1_RANGE: StageRange = [0, 0.16, 0.24, 0.4];
const STAGE_2_RANGE: StageRange = [0.32, 0.48, 0.54, 0.7];
const STAGE_3_RANGE: StageRange = [0.62, 0.85, 1, 1];

const STAGES = [
  {
    range: STAGE_1_RANGE,
    number: "01",
    kicker: "The learner",
    lines: ["Every student", "learns differently."] as const,
    support:
      "Pace, format, feedback style — no two students learn the same way.",
    holdAtEnd: false,
  },
  {
    range: STAGE_2_RANGE,
    number: "02",
    kicker: "The tutor",
    lines: ["Every tutor", "teaches differently."] as const,
    support:
      "Method, tone, subject depth — every tutor brings their own strengths.",
    holdAtEnd: false,
  },
  {
    range: STAGE_3_RANGE,
    number: "03",
    kicker: "The match",
    lines: ["The perfect match", "changes everything."] as const,
    support: "Kopa360 pairs the two, deliberately, every time.",
    holdAtEnd: true,
  },
] as const;

type MV = import("framer-motion").MotionValue<number>;

interface StoryStageProps {
  range: StageRange;
  scrollYProgress: MV;
  number: string;
  lines: readonly [string, string];
  support: string;
  reduceMotion: boolean;
  holdAtEnd: boolean;
}

function StoryStage({
  range,
  scrollYProgress,
  number,
  lines,
  support,
  reduceMotion,
  holdAtEnd,
}: StoryStageProps) {
  const [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] = range;

  // Stages that fade out: 0 -> 1 -> 1 -> 0.
  // The final stage holds: 0 -> 1 -> 1 (stays there, never returns to 0).
  const opacity = useTransform(
    scrollYProgress,
    holdAtEnd
      ? [fadeInStart, fadeInEnd]
      : [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    holdAtEnd ? [0, 1] : [0, 1, 1, 0],
    { ease: easeInOut },
  );

  // Drift continues gently upward on arrival; for the holding stage it just
  // settles rather than continuing to drift toward an exit.
  const y = useTransform(
    scrollYProgress,
    holdAtEnd ? [fadeInStart, fadeInEnd] : [fadeInStart, fadeOutEnd],
    holdAtEnd ? [30, 0] : [30, -20],
    { ease: easeInOut },
  );

  const supportFadeInEnd = fadeInEnd + (fadeOutStart - fadeInEnd) * 0.15;
  const supportOpacity = useTransform(
    scrollYProgress,
    holdAtEnd
      ? [fadeInStart, supportFadeInEnd]
      : [fadeInStart, supportFadeInEnd, fadeOutStart, fadeOutEnd],
    holdAtEnd ? [0, 1] : [0, 1, 1, 0],
    { ease: easeInOut },
  );

  return (
    <motion.div
      style={{ opacity, y: reduceMotion ? 0 : y }}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 sm:px-12"
    >
      <div className="relative mx-auto w-full max-w-[1000px] text-center">
        {/* Ghosted numeral, centered behind the headline. */}
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[62%] select-none font-serif text-[220px] leading-none sm:text-[300px] lg:text-[360px]"
          style={{ color: INK, opacity: 0.05 }}
        >
          {number}
        </span>

        <p
          className="relative font-semibold tracking-[-0.02em] leading-[1.05] antialiased [text-rendering:optimizeLegibility] text-[56px] sm:text-[76px] md:text-[96px] lg:text-[120px]"
          style={{ color: INK }}
        >
          {lines[0]}
          <br />
          {lines[1]}
        </p>

        <motion.p
          style={{ opacity: supportOpacity, color: MUTED }}
          className="relative mx-auto mt-6 max-w-[440px] text-[15px] leading-snug sm:text-base"
        >
          {support}
        </motion.p>
      </div>
    </motion.div>
  );
}

/** Fixed top-center kicker that cross-fades between chapter names. */
function Kicker({ scrollYProgress }: { scrollYProgress: MV }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 sm:top-12">
      <div className="relative h-5 w-max">
        {STAGES.map((stage, i) => {
          const [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] =
            stage.range;
          const opacity = useTransform(
            scrollYProgress,
            stage.holdAtEnd
              ? [fadeInStart, fadeInEnd]
              : [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
            stage.holdAtEnd ? [0, 1] : [0, 1, 1, 0],
            { ease: easeInOut },
          );
          return (
            <motion.span
              key={i}
              style={{ opacity, color: MUTED }}
              className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.18em]"
            >
              {String(i + 1).padStart(2, "0")} / 03 — {stage.kicker}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

/** Thin horizontal progress bar, bottom-center, fills left to right. */
function ProgressBar({ scrollYProgress }: { scrollYProgress: MV }) {
  return (
    <div className="pointer-events-none absolute bottom-10 left-1/2 h-px w-40 -translate-x-1/2 sm:bottom-14 sm:w-56">
      <div
        className="h-full w-full"
        style={{ backgroundColor: INK, opacity: 0.1 }}
      />
      <motion.div
        className="absolute left-0 top-0 h-full origin-left"
        style={{
          scaleX: scrollYProgress,
          backgroundColor: INK,
          width: "100%",
          opacity: 0.55,
        }}
      />
    </div>
  );
}

export function TrustIndicators() {
  const containerRef = useRef<HTMLElement>(null);
  const reduceMotion = !!useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      ref={containerRef}
      aria-label="Why the right match matters"
      className="relative h-[300vh] w-full"
      style={{ backgroundImage: SECTION_GRADIENT }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Kicker scrollYProgress={scrollYProgress} />
        <ProgressBar scrollYProgress={scrollYProgress} />

        {STAGES.map((stage, i) => (
          <StoryStage
            key={i}
            range={stage.range}
            scrollYProgress={scrollYProgress}
            number={stage.number}
            lines={stage.lines}
            support={stage.support}
            reduceMotion={reduceMotion}
            holdAtEnd={stage.holdAtEnd}
          />
        ))}

        {/* Accessible copy — the animated stages above are decorative. */}
        <p className="sr-only">
          Every student learns differently. Every tutor teaches differently. The
          perfect match changes everything.
        </p>
      </div>
    </section>
  );
}
