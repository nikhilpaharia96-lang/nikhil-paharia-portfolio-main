import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MoveDownLeft } from "lucide-react";
import { ease } from "@/animations/videoShowcase.motion";
import ReviewsBackdrop from "./ReviewsBackdrop";
import FeaturedTestimonial from "./FeaturedTestimonial";
import TestimonialStats from "./TestimonialStats";
import TrustedByBrands from "./TrustedByBrands";
import WorkedWithMeCTA from "./WorkedWithMeCTA";
import SubmitTestimonialModal from "./SubmitTestimonialModal";

export default function Testimonials() {
  const [modalOpen, setModalOpen] = useState(false);
  const reduce = !!useReducedMotion();
  const dur = reduce ? 0.01 : 0.8;
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: reduce ? 0 : 24 }, show: { opacity: 1, y: 0, transition: { duration: dur, ease } } };
  const view = { once: false, amount: 0.15 } as const;

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden section-wrap max-w-full pt-14 pb-14 sm:pt-32 sm:pb-20 lg:py-32"
      aria-label="Testimonials — Client Stories"
    >
      <ReviewsBackdrop />

      <div className="container-tight relative z-10 max-w-full">
        {/* Mobile order: intro → feedback card → carousel → stats. Desktop: two columns. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-6 lg:gap-y-10 items-start">
          {/* Intro. Phones/tablets: heading column on the left, compact feedback card on the right (as in the design). */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={view}
            className="lg:col-span-5 lg:row-start-1 grid grid-cols-1 min-[360px]:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] gap-x-[clamp(0.6rem,3vw,1.5rem)] lg:block"
          >
            <motion.div variants={item} className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full bg-white/85 backdrop-blur-xl border border-white shadow-[0_8px_24px_-12px_rgba(15,45,90,0.3)] mb-[clamp(0.75rem,3.5vw,1.5rem)]">
              <span aria-hidden="true" className="text-primary font-black leading-none text-sm">“</span>
              <span className="text-[clamp(0.6rem,2.8vw,0.75rem)] font-bold tracking-[0.12em] uppercase text-primary">
                Client Stories
              </span>
            </motion.div>

            <motion.h2
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13 } } }}
              className="font-sans font-extrabold tracking-tight text-[clamp(1.6rem,8.2vw,3.6rem)] lg:text-[4rem] leading-[1.02] text-[#0b1530] min-[360px]:row-start-2"
            >
              <motion.span variants={item} className="block">Loved by</motion.span>
              <motion.span variants={item} className="block">Clients.</motion.span>
              <motion.span variants={item} className="block">
                Built on{" "}
                <span className="relative inline-block text-primary">
                  Trust.
                  <svg
                    aria-hidden="true"
                    className="absolute left-0 -bottom-1.5 w-full h-3"
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <motion.path
                      d="M3 8 C 40 2, 110 2, 197 6"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      variants={{
                        hidden: { pathLength: reduce ? 1 : 0 },
                        show: { pathLength: 1, transition: { duration: reduce ? 0.01 : 0.9, delay: reduce ? 0 : 0.5, ease } },
                      }}
                    />
                  </svg>
                </span>
              </motion.span>
            </motion.h2>

            <motion.p variants={item} className="mt-[clamp(0.8rem,4vw,1.5rem)] max-w-md text-[clamp(0.72rem,3.1vw,1rem)] lg:text-[1.05rem] leading-[1.55] text-slate-700 min-[360px]:row-start-3">
              Real stories from founders, creators and businesses I've worked with. Every project is
              crafted with attention to detail, performance and long-term impact.
            </motion.p>

            <motion.div variants={item} className="mt-5 min-[360px]:mt-0 min-[360px]:col-start-2 min-[360px]:row-start-2 min-[360px]:row-span-2 min-[360px]:self-start lg:hidden">
              <WorkedWithMeCTA variant="inline" onOpen={() => setModalOpen(true)} />
            </motion.div>
          </motion.div>

          <motion.div
            className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-center relative"
            initial={{ opacity: 0, x: reduce ? 0 : 48, scale: reduce ? 1 : 0.98 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={view}
            transition={{ duration: reduce ? 0.01 : 1, ease, delay: reduce ? 0 : 0.15 }}
          >
            <motion.div
              className="hidden lg:block absolute -top-24 right-0 z-20 w-64"
              animate={reduce ? undefined : { y: [0, -7, 0] }}
              transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <WorkedWithMeCTA variant="floating" onOpen={() => setModalOpen(true)} />
            </motion.div>
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0, rotate: reduce ? -6 : -14 }}
              whileInView={{ opacity: 1, rotate: -6 }}
              viewport={{ once: false }}
              transition={{ duration: reduce ? 0.01 : 0.9, ease, delay: reduce ? 0 : 0.7 }}
              className="hidden xl:flex absolute -top-16 -right-24 flex-col items-start font-script font-bold text-xl leading-tight text-[#14284f]"
            >
              <span>
                Ideas
                <br />
                People
                <br />
                Places
                <br />
                Stories
              </span>
              <MoveDownLeft className="w-6 h-6 text-primary -ml-5" strokeWidth={1.6} />
            </motion.div>

            <FeaturedTestimonial />
          </motion.div>

          <div className="lg:col-span-5 lg:row-start-2">
            <TestimonialStats />
          </div>
        </div>

        <TrustedByBrands />
      </div>

      <SubmitTestimonialModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
