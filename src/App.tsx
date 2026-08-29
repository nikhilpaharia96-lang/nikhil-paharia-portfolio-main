import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { Route, Switch } from "wouter";
import { startSmoothScroll, updateSmoothScrollOptions } from "@/lib/smoothScroll";
import { MusicProvider } from "@/lib/MusicProvider";

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
import Support from "@/pages/Support";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// The original single-page portfolio, unchanged — Hero, About, Projects,
// Skills/Services, Testimonials, Contact, Footer all still live and render
// exactly as before. This is now just the "/" route's content.
function Portfolio() {
  return (
    <>
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
    </>
  );
}

function App() {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Warm up every CinematicSection's + Hero's + About's scroll-linked
    // measurements (Framer Motion's useScroll, and the plain
    // getBoundingClientRect() reads several components do) *before* the
    // user's actual first touch, instead of letting the browser do all of
    // it in response to that first real gesture.
    //
    // Framer Motion's useScroll doesn't eagerly measure each target's
    // position at mount -- it measures lazily, the first time a relevant
    // scroll/resize event actually fires. With 8-9 CinematicSection
    // wrappers on this page (each doing its own measurement) all deferred
    // to that same first event, the user's first real swipe of the
    // session is the one that pays for all of it at once: several
    // synchronous layout reads back-to-back, right as the browser is also
    // trying to run the touch-driven scroll fling. That read as "the first
    // swipe (or two) barely moves the page, then it's smooth" -- because
    // it genuinely was busy measuring, not failing to receive the touch.
    //
    // Firing one harmless 1px-and-back scroll shortly after mount (well
    // before the user has had time to touch the screen) makes the browser
    // dispatch a real `scroll` event, which triggers exactly those lazy
    // measurements to run now, on an idle frame with nothing else
    // competing for the main thread -- so by the time the user's actual
    // first swipe happens, everything is already warm.
    const warmupId = window.setTimeout(() => {
      const y = window.scrollY;
      window.scrollTo(0, y + 1);
      window.scrollTo(0, y);
    }, 50);
    return () => window.clearTimeout(warmupId);
  }, []);

  useEffect(() => {
    // Single shared Lenis instance + GSAP ticker + ScrollTrigger sync,
    // enabled on every device (see src/lib/smoothScroll.ts for the full
    // rationale). Ref-counted internally, so this is also StrictMode-safe:
    // dev's mount -> unmount -> mount cycle reuses the same instance rather
    // than creating two competing scroll loops.
    //
    // Intentionally mounted once (empty deps), NOT re-run when
    // shouldReduceMotion changes. useReducedMotion() can report a stale
    // value on first render and correct itself a tick later — if this
    // effect depended on it, that correction would tear down and rebuild
    // the entire Lenis + ScrollTrigger pipeline mid-session, which is what
    // produced the "scrolls 2-3 times" glitch (a brief destroy/recreate of
    // the scroll engine while the user is actively scrolling). Reading the
    // latest value at call time instead avoids that restart entirely.
    const stopSmoothScroll = startSmoothScroll({
      duration: 1.2,
      instant: !!shouldReduceMotion,
    });

    return () => {
      stopSmoothScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If prefers-reduced-motion resolves/changes after the mount effect
    // above already started Lenis, push the updated duration/smoothing
    // into the live instance instead of restarting the whole scroll
    // pipeline (see updateSmoothScrollOptions in smoothScroll.ts for why).
    updateSmoothScrollOptions({ duration: 1.2, instant: !!shouldReduceMotion });
  }, [shouldReduceMotion]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MotionConfig reducedMotion="user">
        <MusicProvider>
        <Cursor />
        <GlobalBackground />
        <ScrollProgress />

        <motion.div 
          className="relative overflow-x-hidden max-w-full"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Switch>
            <Route path="/" component={Portfolio} />
            <Route path="/payment" component={Support} />
            <Route component={NotFound} />
          </Switch>
        </motion.div>

        <Toaster theme="light" position="bottom-right" />
        </MusicProvider>
        </MotionConfig>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
