import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import { startSmoothScroll } from "@/lib/smoothScroll";
import { MusicProvider } from "@/lib/MusicProvider";

import Cursor from "@/components/Cursor";
import ScrollProgress from "@/components/ScrollProgress";
import GlobalBackground from "@/components/GlobalBackground";
import MusicControl from "@/components/MusicControl";
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
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Single shared Lenis instance + GSAP ticker + ScrollTrigger sync,
    // enabled on every device (see src/lib/smoothScroll.ts for the full
    // rationale). Ref-counted internally, so this is also StrictMode-safe:
    // dev's mount -> unmount -> mount cycle reuses the same instance rather
    // than creating two competing scroll loops.
    const stopSmoothScroll = startSmoothScroll({
      duration: 1.2,
      instant: !!shouldReduceMotion,
    });

    return () => {
      stopSmoothScroll();
    };
  }, [shouldReduceMotion]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MotionConfig reducedMotion="user">
        <MusicProvider>
        <Cursor />
        <GlobalBackground />
        <ScrollProgress />
        <MusicControl />

        <motion.div 
          className="relative overflow-x-hidden max-w-full"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
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
        </MusicProvider>
        </MotionConfig>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
