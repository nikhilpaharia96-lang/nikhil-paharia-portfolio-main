import { Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { MusicProvider } from "@/lib/MusicProvider";

import GlobalBackground from "@/components/GlobalBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import NotFound from "@/pages/not-found";
import ServiceDetail from "@/pages/ServiceDetail";
import Support from "@/pages/Support";
import Analytics from "@/components/Analytics";
import { captureAttribution } from "@/lib/attribution";

// Private admin dashboard — lazy so it adds nothing to the public bundle.
// Below-the-fold sections load as separate chunks, then are prefetched when the browser is idle
const loadAbout = () => import("@/components/About");
const About = lazy(loadAbout);
const loadProjects = () => import("@/components/Projects");
const Projects = lazy(loadProjects);
const loadVideoShowcase = () => import("@/components/video-showcase/VideoShowcase");
const VideoShowcase = lazy(loadVideoShowcase);
const loadServices = () => import("@/components/Services");
const Services = lazy(loadServices);
const loadTestimonials = () => import("@/components/testimonials/Testimonials");
const Testimonials = lazy(loadTestimonials);
const loadContact = () => import("@/components/Contact");
const Contact = lazy(loadContact);
const loadFooter = () => import("@/components/Footer");
const Footer = lazy(loadFooter);
const prefetchSections = [loadAbout, loadProjects, loadVideoShowcase, loadServices, loadTestimonials, loadContact, loadFooter];
function SectionFallback() { return <div aria-hidden="true" className="min-h-[60vh]" />; }
const Admin = lazy(() => import("@/pages/Admin"));

const queryClient = new QueryClient();

// Section order matches the design reference. Everything renders statically:
// no loading screen, no reveal wrappers, no smooth scrolling, no custom cursor.
function Portfolio() {
  // Arriving from a service page via "/#services" etc. — scroll to that section once it has rendered.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const t = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>(hash) ?? (hash === "#skills" ? document.querySelector<HTMLElement>("#about") : null);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: "auto" });
    }, 120);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const run = () => prefetchSections.forEach((l) => { l().catch(() => {}); });
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(run, { timeout: 4000 });
    else setTimeout(run, 2500);
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-full overflow-x-hidden">
        <Hero />
        <Marquee />
        <Suspense fallback={<SectionFallback />}>
          <About />
          <Projects />
          <VideoShowcase />
          <Services />
          <Testimonials />
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}

function App() {
  // Remember utm_* / referrer so a later enquiry or booking can be attributed to the campaign.
  useEffect(() => { captureAttribution(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MusicProvider>
          <GlobalBackground />
          <div className="relative overflow-x-hidden max-w-full">
            <Switch>
              <Route path="/" component={Portfolio} />
              <Route path="/services/:slug" component={ServiceDetail} />
              <Route path="/payment" component={Support} />
              <Route path="/admin">{() => <Suspense fallback={null}><Admin /></Suspense>}</Route>
              <Route component={NotFound} />
            </Switch>
          </div>
          <Toaster theme="light" position="bottom-right" />
          <Analytics />
        </MusicProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
