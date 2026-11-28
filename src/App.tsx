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
import AboutBooks from "@/components/AboutBooks";
import Projects from "@/components/Projects";
import VideoShowcase from "@/components/video-showcase/VideoShowcase";
import Services from "@/components/Services";
import Testimonials from "@/components/testimonials/Testimonials";
import ProcessFAQ from "@/components/ProcessFAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import LeadFunnelPopup from "@/components/LeadFunnelPopup";
import StickyContact from "@/components/StickyContact";
import NotFound from "@/pages/not-found";
import Analytics from "@/components/Analytics";
import { captureAttribution } from "@/lib/attribution";

// Private admin dashboard — lazy so it adds nothing to the public bundle.
const Admin = lazy(() => import("@/pages/Admin"));
const BookingReturn = lazy(() => import("@/pages/BookingReturn"));
// Secondary pages load only when visited.
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const Support = lazy(() => import("@/pages/Support"));
const Guwahati = lazy(() => import("@/pages/Guwahati"));

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

  return (
    <>
      <Navbar />
      <main className="max-w-full overflow-x-hidden">
        <Hero />
        <Marquee />
        <AboutBooks />
        <Projects />
        <VideoShowcase />
        <Services />
        <Testimonials />
        <ProcessFAQ />
        <Contact />
      </main>
      {/* phones: room so the fixed contact bar never hides the end of the footer */}
      <div className="pb-16 md:pb-0">
        <Footer />
      </div>
      <LeadFunnelPopup />
      <StickyContact />
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
              <Route path="/services/:slug">{(params) => <Suspense fallback={<div className="min-h-screen" />}><ServiceDetail {...({ params } as any)} /></Suspense>}</Route>
              <Route path="/guwahati">{(params) => <Suspense fallback={<div className="min-h-screen" />}><Guwahati {...({ params } as any)} /></Suspense>}</Route>
              <Route path="/payment">{(params) => <Suspense fallback={<div className="min-h-screen" />}><Support {...({ params } as any)} /></Suspense>}</Route>
              <Route path="/booking/return">{() => <Suspense fallback={null}><BookingReturn /></Suspense>}</Route>
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
