import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Lenis from "@studio-freight/lenis";
import { motion, useReducedMotion } from "framer-motion";

import LoadingScreen from "@/components/LoadingScreen";
import Cursor from "@/components/Cursor";
import ScrollProgress from "@/components/ScrollProgress";
import GlobalBackground from "@/components/GlobalBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import VideoShowcase from "@/components/VideoShowcase";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CinematicSection from "@/components/CinematicSection";

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Cinematic smooth scroll — slower duration for that filmic feel
    const lenis = new Lenis({
      duration: shouldReduceMotion ? 0.1 : 1.4, // Instant scroll if user prefers reduced motion
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !shouldReduceMotion,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.8,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const timer = setTimeout(() => setLoading(false), 4200);

    return () => {
      lenis.destroy();
      clearTimeout(timer);
    };
  }, [shouldReduceMotion]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
              <Skills />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
