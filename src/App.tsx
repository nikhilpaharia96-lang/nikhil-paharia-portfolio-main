import { useEffect, useState } from "react";
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

import Projects from "@/components/Projects";
import VideoShowcase from "@/components/video-showcase/VideoShowcase";
import Services from "@/components/Services";
import Testimonials from "@/components/testimonials/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CinematicSection from "@/components/CinematicSection";

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // ── Root cause of the mobile "can't scroll to the bottom" bug ──
    // Lenis re-implements scrolling on top of the browser's native scroll
    // (RAF-driven `window.scrollTo()` calls against a scroll limit it computes
    // itself). That's reliable on desktop, but on the long tail of mobile
    // browsers — older Android WebViews, in-app browsers (Instagram/FB/
    // LinkedIn webviews), some Samsung Internet/Chrome builds — the dynamic
    // toolbar resizing the visual viewport *during* momentum/rubber-band
    // touch scroll can desync Lenis's computed max-scroll from the real
    // document height. The page then stops short of the true bottom, and
    // whether it happens depends entirely on the visiting device/browser —
    // which matches "works on my phone, not on my friend's phone" exactly.
    //
    // Native touch scrolling on `html`/`body` never has this failure mode:
    // the browser itself owns the scroll, so it can always physically reach
    // the bottom. Lenis's own docs recommend exactly this mitigation, so we
    // only construct Lenis for fine-pointer (desktop/trackpad/mouse)
    // visitors and let every touch-primary device use native scroll.
    // Nothing else in the app depends on Lenis being present: CinematicSection
    // (Framer Motion useScroll), GSAP ScrollTrigger, and the marquees all key
    // off window/document scroll directly, and Navbar's scrollTo() already
    // falls back to native `scrollIntoView` when `window.lenis` is undefined.
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;

    const timer = setTimeout(() => setLoading(false), 4200);

    if (isCoarsePointer) {
      return () => clearTimeout(timer);
    }

    // Cinematic smooth scroll — slower duration for that filmic feel
    const lenis = new Lenis({
      duration: shouldReduceMotion ? 0.1 : 1.2, // Instant scroll if user prefers reduced motion
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !shouldReduceMotion,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
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

    // ── Safety net (belt-and-braces, desktop included) ──
    // If Lenis's computed scroll limit ever ends up shorter than the
    // document's actual scrollable height (e.g. a late-loading image/video
    // pushes the page taller faster than Lenis's ResizeObserver settles, or
    // a mobile toolbar resize event is missed), periodically reconcile by
    // asking Lenis to recompute its dimensions. `resize()` is cheap (it's
    // just two `ResizeObserver`-style reads) and idempotent when nothing
    // changed, so this can't introduce jank — it only ever *unblocks* scroll
    // that would otherwise silently cap short of the real bottom.
    const reconcile = () => {
      const docHeight = document.documentElement.scrollHeight;
      const lenisLimit = lenis.limit ?? 0;
      const viewport = window.innerHeight;
      if (lenisLimit + viewport < docHeight - 2) {
        lenis.resize();
      }
    };
    const reconcileInterval = window.setInterval(reconcile, 1000);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      delete (window as typeof window & { lenis?: Lenis }).lenis;
      clearTimeout(timer);
      window.clearInterval(reconcileInterval);
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

            

            {/* Projects — dramatic entrance */}
            <CinematicSection parallax={30} delay={0.05}>
              <Projects />
            </CinematicSection>

            {/* Video — immersive pull-in */}
            <CinematicSection parallax={25} delay={0}>
              <VideoShowcase />
            </CinematicSection>

            {/* Services — lateral wipe feel */}
            <CinematicSection parallax={35} delay={0.05}>
              <Services />
            </CinematicSection>

            {/* Testimonials — soft fade */}
            <CinematicSection parallax={30} delay={0.05}>
              <Testimonials />
            </CinematicSection>

            {/* Contact — final scene */}
            <CinematicSection parallax={40} delay={0.05}>
              <Contact />
            </CinematicSection>

          </main>

          <CinematicSection parallax={20} delay={0}>
            <Footer />
          </CinematicSection>
        </motion.div>

        <Toaster theme="light" position="bottom-right" />
        </MotionConfig>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
