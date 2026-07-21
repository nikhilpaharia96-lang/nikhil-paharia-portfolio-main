import { useEffect, useState, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Lenis from "lenis";
import gsap from "gsap";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import LoadingScreen from "@/components/LoadingScreen";
import Cursor from "@/components/Cursor";
import ScrollProgress from "@/components/ScrollProgress";
import GlobalBackground from "@/components/GlobalBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import CinematicSection from "@/components/CinematicSection";

// Below-the-fold sections are code-split so the initial bundle only has to
// download/parse/execute what's needed to render the first screen. Each
// chunk is fetched as the user approaches it while scrolling (React lazy +
// Suspense), which keeps time-to-interactive low on slower mobile networks
// and low-end CPUs without changing what eventually renders.
const Skills = lazy(() => import("@/components/Skills"));
const Projects = lazy(() => import("@/components/Projects"));
const VideoShowcase = lazy(() => import("@/components/VideoShowcase"));
const Services = lazy(() => import("@/components/Services"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const Contact = lazy(() => import("@/components/Contact"));
const Footer = lazy(() => import("@/components/Footer"));

/** Minimal, layout-neutral placeholder shown while a section chunk loads. */
function SectionFallback() {
  return <div className="w-full min-h-[40vh]" aria-hidden="true" />;
}

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Cinematic smooth scroll — slower duration for that filmic feel
    const lenis = new Lenis({
      duration: shouldReduceMotion ? 0.1 : 1.2, // Instant scroll if user prefers reduced motion
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !shouldReduceMotion,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
      autoRaf: false, // gsap.ticker below is the single RAF loop driving Lenis — never let Lenis start its own
    });

    // Make Lenis reachable from anywhere (Navbar anchor links, in-page "scroll to" CTAs)
    // so every programmatic scroll goes through the same smooth-scroll engine instead of
    // fighting the native scrollIntoView, which is what caused jumpy nav clicks.
    (window as typeof window & { lenis?: Lenis }).lenis = lenis;

    // Drive Lenis off GSAP's ticker instead of a separate requestAnimationFrame loop.
    // Both Lenis (scroll) and GSAP (cursor, any future ScrollTrigger work) now share a
    // single timing source, so they can never drift out of sync with each other.
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0); // don't let GSAP "catch up" with a jump after a stalled frame (tab switch, etc.)

    const timer = setTimeout(() => setLoading(false), 4200);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      delete (window as typeof window & { lenis?: Lenis }).lenis;
      clearTimeout(timer);
    };
  }, [shouldReduceMotion]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MotionConfig reducedMotion="user">
        {loading && <LoadingScreen />}
        <Cursor />
        <GlobalBackground />
        <ScrollProgress />

        <motion.div 
          className="relative overflow-x-hidden max-w-full"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: "blur(6px)" }}
          animate={!loading ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Navbar />
          <main className="max-w-full overflow-x-hidden">

            {/* Hero — no wrapper, it's the opening scene */}
            <Hero />

            {/* Marquee — fast cut between scenes */}
            <CinematicSection parallax={15} delay={0}>
              <Marquee />
            </CinematicSection>

            {/* About — slow crane-up reveal */}
            <CinematicSection parallax={40} delay={0.05}>
              <About />
            </CinematicSection>

            {/* Skills — scene with depth */}
            <CinematicSection parallax={35} delay={0.05}>
              <Suspense fallback={<SectionFallback />}>
                <Skills />
              </Suspense>
            </CinematicSection>

            {/* Projects — dramatic entrance */}
            <CinematicSection parallax={30} delay={0.05}>
              <Suspense fallback={<SectionFallback />}>
                <Projects />
              </Suspense>
            </CinematicSection>

            {/* Video — immersive pull-in */}
            <CinematicSection parallax={25} delay={0}>
              <Suspense fallback={<SectionFallback />}>
                <VideoShowcase />
              </Suspense>
            </CinematicSection>

            {/* Services — lateral wipe feel */}
            <CinematicSection parallax={35} delay={0.05}>
              <Suspense fallback={<SectionFallback />}>
                <Services />
              </Suspense>
            </CinematicSection>

            {/* Testimonials — soft fade */}
            <CinematicSection parallax={30} delay={0.05}>
              <Suspense fallback={<SectionFallback />}>
                <Testimonials />
              </Suspense>
            </CinematicSection>

            {/* Contact — final scene */}
            <CinematicSection parallax={40} delay={0.05}>
              <Suspense fallback={<SectionFallback />}>
                <Contact />
              </Suspense>
            </CinematicSection>

          </main>

          <CinematicSection parallax={20} delay={0}>
            <Suspense fallback={<SectionFallback />}>
              <Footer />
            </Suspense>
          </CinematicSection>
        </motion.div>

        <Toaster theme="light" position="bottom-right" />
        </MotionConfig>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
