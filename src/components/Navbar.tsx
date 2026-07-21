import npLogo from "../assets/logos/np-logo.webp";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";
import Magnetic from "@/components/ui/Magnetic";
import type Lenis from "lenis";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Videos", href: "#videos" },
  { name: "Services", href: "#services" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Section offsets are read from the DOM once (and on resize), never inside the
  // scroll handler itself — reading offsetTop on every scroll tick forces a
  // layout/reflow on whatever frame the browser is trying to paint a scroll on,
  // which is exactly the kind of jank a smooth-scroll setup can't hide.
  const sectionOffsets = useRef<{ id: string; top: number }[]>([]);

  useEffect(() => {
    const measure = () => {
      sectionOffsets.current = navLinks.map((link) => {
        const id = link.href.substring(1);
        const el = document.getElementById(id);
        return { id, top: el ? el.offsetTop : Infinity };
      });
    };

    measure();

    // Re-measure on resize (debounced) and once more after everything (fonts,
    // below-the-fold lazy chunks, images) has settled and may have shifted layout.
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 150);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    const settleTimer = setTimeout(measure, 1500);

    const handleScroll = (scrollY: number) => {
      setIsScrolled(scrollY > 40);

      let current = "";
      for (const { id, top } of sectionOffsets.current) {
        if (scrollY >= top - 220) current = id;
      }
      if (current) setActiveSection(current);
    };

    // Ride the app's single Lenis instance (already RAF-synced) instead of adding
    // a second, independent native scroll listener competing for the same frame.
    const lenis = (window as typeof window & { lenis?: Lenis }).lenis;
    if (lenis) {
      const onLenisScroll = ({ scroll }: { scroll: number }) => handleScroll(scroll);
      lenis.on("scroll", onLenisScroll);
      handleScroll(lenis.scroll);
      return () => {
        lenis.off("scroll", onLenisScroll);
        window.removeEventListener("resize", handleResize);
        clearTimeout(resizeTimer);
        clearTimeout(settleTimer);
      };
    }

    // Fallback (Lenis not mounted yet, e.g. reduced-motion instant scroll edge case)
    const onNativeScroll = () => handleScroll(window.scrollY);
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    onNativeScroll();
    return () => {
      window.removeEventListener("scroll", onNativeScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      clearTimeout(settleTimer);
    };
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector<HTMLElement>(href);
    if (!element) return;

    const lenis = (window as typeof window & { lenis?: Lenis }).lenis;
    if (lenis) {
      lenis.scrollTo(element, { offset: -24, duration: 1.2 });
    } else {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 ${
        isScrolled 
          ? "py-2.5 lg:py-3 bg-white/75 backdrop-blur-md border-b border-blue-100/40 shadow-[0_2px_30px_rgba(29,111,235,0.06)]" 
          : "py-4 lg:py-6 bg-transparent"
      }`}
      style={{ paddingTop: `max(env(safe-area-inset-top, 0px), ${isScrolled ? '10px' : '16px'})` }}
    >
      <div className="container-tight flex items-center justify-between h-11">
        <Magnetic range={50} strength={0.3}>
         <a 
  href="#home" 
  onClick={(e) => { e.preventDefault(); scrollTo("#home"); }}
  className="font-mono text-lg sm:text-xl lg:text-2xl font-bold tracking-wider flex items-center gap-2 text-foreground transition-all duration-300 hover:text-primary hover:drop-shadow-[0_0_12px_rgba(29,111,235,0.4)]"
>
  <img src={npLogo} alt="NP logo" className="h-7 sm:h-8 lg:h-9 w-auto" />
  𝐍𝐢𝐤𝐡𝐢𝐥 <span className="text-primary">𝐏𝐚𝐡𝐚𝐫𝐢𝐚 </span>
</a>
        </Magnetic>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                  className={`relative text-xs font-bold transition-all duration-300 uppercase tracking-widest py-1.5 px-0.5 hover:text-primary ${
                    isActive ? "text-primary text-glow" : "text-slate-600"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full shadow-[0_1px_8px_rgba(29,111,235,0.6)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </div>
          
          <div className="w-px h-6 bg-blue-200/60" />
          
          <Magnetic range={45} strength={0.25}>
            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); scrollTo("#contact"); }}
              className="border border-primary text-primary hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(29,111,235,0.3)] transition-all duration-300 rounded-full px-5 py-2 text-xs font-bold shadow-sm"
            >
              Hire Me
            </a>
          </Magnetic>
        </div>

        {/* Mobile Toggle — vertically centered, properly sized */}
        <button 
          className="lg:hidden text-slate-800 hover:text-slate-900 transition-colors w-11 h-11 flex items-center justify-center bg-blue-50/50 rounded-full border border-blue-100/60 z-[210] relative self-center flex-shrink-0"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[200] flex flex-col items-center justify-center lg:hidden overflow-y-auto h-[100dvh] py-20 pb-safe"
          >
            <div className="absolute top-0 left-0 right-0 px-4 sm:px-6 pt-safe flex justify-between items-center z-[210] max-w-7xl mx-auto w-full" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 2rem)' }}>
              <a 
  href="#home" 
  onClick={(e) => { e.preventDefault(); scrollTo("#home"); }}
  className="font-mono text-2xl font-bold tracking-wider flex items-center gap-2 text-foreground"
>
  <img src={npLogo} alt="NP logo" className="h-8 w-auto" />
  Nikhil <span className="text-primary">Paharia</span>
</a>
            </div>
            <div className="flex flex-col items-center gap-6 mt-10">
              {navLinks.map((link, i) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <motion.a
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, ease: "easeOut" }}
                    key={link.name}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                    className={`relative text-3xl font-serif font-bold uppercase tracking-widest ${
                      isActive ? "text-primary text-glow" : "text-slate-600"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-1 bg-primary rounded-full" />
                    )}
                  </motion.a>
                );
              })}
            </div>
            
            <motion.a
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.04, ease: "easeOut" }}
              href="#contact"
              onClick={(e) => { e.preventDefault(); scrollTo("#contact"); }}
              className="mt-8 bg-primary text-white px-8 py-4 rounded-full text-lg font-bold shadow-[0_8px_30px_rgba(29,111,235,0.3)] w-[80%] text-center max-w-sm"
            >
              Hire Me
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
