import { motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import { featuredTestimonial, testimonials, trustStats } from "@/constants/testimonials";
import { ease } from "@/animations/testimonials.motion";
import { useTestimonialsCarousel } from "@/hooks/useTestimonialsCarousel";
import BackgroundGlow from "./BackgroundGlow";
import TestimonialCard from "./TestimonialCard";
import CarouselControls from "./CarouselControls";
import Pagination from "./Pagination";
import StatsCard from "./StatsCard";

function TestimonialCarousel() {
  const {
    emblaRef,
    selectedIndex,
    scrollPrev,
    scrollNext,
    scrollTo,
    getDistance,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
  } = useTestimonialsCarousel(testimonials.length);

  return (
    <div
      className="relative mt-10 sm:mt-12"
      role="region"
      aria-roledescription="carousel"
      aria-label="More client testimonials"
      tabIndex={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 sm:gap-6 -ml-5 sm:-ml-6 py-2">
          {testimonials.map((t, index) => {
            const distance = getDistance(index);
            const isActive = distance === 0;
            return (
              <div
                key={t.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${testimonials.length}`}
                aria-hidden={!isActive}
                className="pl-5 sm:pl-6 shrink-0 grow-0 basis-[85%] xs:basis-[75%] sm:basis-[55%] lg:basis-[38%]"
              >
                <TestimonialCard t={t} variant={isActive ? "active" : "side"} distance={distance} index={index} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen-reader-only live announcement of the current slide */}
      <p className="sr-only" role="status" aria-live="polite">
        Showing testimonial {selectedIndex + 1} of {testimonials.length}: {testimonials[selectedIndex]?.name}
      </p>

      <div className="flex items-center justify-between mt-8">
        <Pagination count={testimonials.length} selectedIndex={selectedIndex} onSelect={scrollTo} />
        <CarouselControls onPrev={scrollPrev} onNext={scrollNext} />
      </div>
    </div>
  );
}

function TrustBar() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 28 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="mt-16 sm:mt-20 rounded-3xl p-6 sm:p-8
                 bg-white/45 backdrop-blur-2xl border border-white/70
                 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_55px_-22px_rgba(15,45,90,0.28)]
                 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8 sm:gap-x-8"
    >
      {trustStats.map((stat, i) => (
        <StatsCard key={stat.label} stat={stat} index={i} isLast={i === trustStats.length - 1} />
      ))}
    </motion.div>
  );
}

export default function Testimonials() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden section-wrap max-w-full py-20 sm:py-28 md:py-36 lg:py-40"
      aria-label="Testimonials — Client Stories"
    >
      <BackgroundGlow />

      <div className="container-tight relative z-10 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-10 items-start mb-4">
          {/* ═══════════════ LEFT COLUMN ═══════════════ */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 relative">
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -16, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -left-2 hidden lg:block opacity-10 pointer-events-none"
              aria-hidden="true"
            >
              <Quote className="w-28 h-28 text-primary" fill="currentColor" />
            </motion.div>

            <div className="absolute top-24 right-2 w-14 h-14 rounded-2xl border border-primary/20 hidden lg:block pointer-events-none" aria-hidden="true" />
            <motion.div
              animate={prefersReducedMotion ? undefined : { rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-16 right-10 w-8 h-8 rounded-full border border-dashed border-primary/30 hidden lg:block pointer-events-none"
              aria-hidden="true"
            />

            <svg
              aria-hidden="true"
              className="absolute left-full top-52 hidden lg:block opacity-40 pointer-events-none -ml-4"
              width="140"
              height="90"
              viewBox="0 0 140 90"
              fill="none"
            >
              <motion.path
                d="M4 10 C 60 10, 60 70, 130 70"
                stroke="url(#arrowGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <motion.path
                d="M116 62 L130 70 L118 78"
                stroke="url(#arrowGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.6 }}
              />
              <defs>
                <linearGradient id="arrowGradient" x1="0" y1="0" x2="140" y2="90">
                  <stop offset="0%" stopColor="#1d6feb" stopOpacity="0" />
                  <stop offset="50%" stopColor="#1d6feb" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#1d6feb" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-white/60 backdrop-blur-xl border border-white/70
                         shadow-[0_8px_24px_-10px_rgba(15,45,90,0.25)] mb-7"
            >
              <span aria-hidden="true">💬</span>
              <span className="text-xs font-mono font-semibold tracking-[0.18em] uppercase text-primary">
                Client Stories
              </span>
            </motion.div>

            <motion.h2
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 28 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease }}
              className="font-serif font-bold text-[2.4rem] sm:text-5xl lg:text-[3.1rem] leading-[1.08] text-foreground mb-6"
            >
              <SplitText type="words">Loved by Clients.</SplitText>
              <br />
              <SplitText type="words" delay={0.15}>
                Built on Trust.
              </SplitText>
            </motion.h2>

            <motion.p
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-md"
            >
              Real stories from founders, creators and businesses I've worked with. Every
              project is crafted with attention to detail, performance and long-term impact.
            </motion.p>
          </div>

          {/* ═══════════════ RIGHT COLUMN ═══════════════ */}
          <div className="lg:col-span-8">
            <TestimonialCard t={featuredTestimonial} variant="featured" />
            <TestimonialCarousel />
          </div>
        </div>

        <TrustBar />
      </div>
    </section>
  );
}
