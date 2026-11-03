import { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowUpRight } from "lucide-react";
import brandLogo from "../assets/logos/nikhil-paharia-logo.webp";
import { lockBodyScroll } from "@/lib/scrollLock";

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

// Links shown in the bar / menu. "Contact" lives in the CTA button, but stays in
// `navLinks` above so active-section tracking still works when the contact section is in view.
const menuLinks = navLinks.filter((l) => l.href !== "#contact");

const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Scrolled state (glass gets a little more opaque) — passive listener, one cheap state flip.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active-section tracking: a section is "current" while it crosses a thin band ~30% down the
  // viewport. IntersectionObserver stays correct when lazy content shifts layout, and needs no
  // cached offsets or per-scroll layout reads.
  useEffect(() => {
    const ids = navLinks.map((link) => link.href.substring(1));
    const crossing = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        let current = "";
        for (const id of ids) if (crossing.has(id)) current = id; // last one in page order wins
        if (current) setActiveSection(current);
      },
      { rootMargin: "-30% 0px -69% 0px", threshold: 0 },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  const scrollTo = useCallback((href: string) => {
    setMenuOpen(false);
    // There is no standalone Skills section — the "Tech I work with" spread lives in About.
    const element =
      document.querySelector<HTMLElement>(href) ??
      (href === "#skills" ? document.querySelector<HTMLElement>("#about") : null);
    if (!element) return;
    // Instant jump; sections carry generous top padding so headings clear the floating bar.
    const top = element.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top, behavior: "auto" });
  }, []);

  // Mobile menu: lock scroll, Escape to close, outside click to close, close on desktop resize.
  useEffect(() => {
    if (!menuOpen) return;
    const unlock = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const mq = window.matchMedia("(min-width: 1280px)");
    const onMq = () => mq.matches && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    mq.addEventListener("change", onMq);
    return () => {
      unlock();
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      mq.removeEventListener("change", onMq);
    };
  }, [menuOpen]);

  const connect = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo("#contact");
  };

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-[200] pointer-events-none"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <nav
        aria-label="Primary"
        className={`nav-enter pointer-events-auto w-full flex items-center justify-between gap-3 xl:gap-6 rounded-none border-0 border-b px-4 sm:px-6 lg:px-10 h-[64px] sm:h-[70px] xl:h-[74px] transition-[background-color,box-shadow,border-color] duration-300 motion-reduce:transition-none ${
          isScrolled
            ? "bg-white/[0.92] border-white/85 backdrop-blur-[18px] backdrop-saturate-150 shadow-[0_10px_36px_rgba(30,100,200,0.18)]"
            : "bg-white/80 border-white/60 backdrop-blur-[12px] backdrop-saturate-150 shadow-[0_6px_24px_rgba(30,100,200,0.08)]"
        }`}
      >
        {/* Brand */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("#home");
          }}
          aria-label="Nikhil Paharia — back to top"
          className={`group flex items-center min-w-0 rounded-none pr-2 ${focusRing}`}
        >
          {/* Full logo lockup: NP mark + divider + "Nikhil Paharia" (transparent PNG → webp) */}
          <img
            src={brandLogo}
            alt=""
            width={1993}
            height={331}
            decoding="async"
            className="h-[min(34px,calc((100vw-168px)/6.02))] sm:h-11 xl:h-[46px] 2xl:h-[54px] w-auto max-w-full shrink-0 transition duration-300 group-hover:scale-[1.03] group-hover:drop-shadow-[0_4px_10px_rgba(18,102,241,0.3)] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </a>

        {/* Desktop links */}
        <ul className="hidden xl:flex flex-1 items-center justify-center gap-0.5 2xl:gap-2">
          {menuLinks.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.href);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative block rounded-none px-4 2xl:px-5 py-2.5 text-[13px] 2xl:text-sm font-semibold uppercase tracking-[0.08em] transition-[color,background-color,box-shadow] duration-200 motion-reduce:transition-none hover:text-[#1266F1] ${focusRing} ${
                    isActive
                      ? "text-[#1266F1] bg-blue-50/80 shadow-[0_6px_16px_-8px_rgba(18,102,241,0.45)]"
                      : "text-[#172033]"
                  }`}
                >
                  {link.name}
                  <span
                    aria-hidden="true"
                    className={`absolute left-5 right-5 bottom-1.5 h-[2px] rounded-none bg-[#1266F1] origin-center transition-transform duration-300 motion-reduce:transition-none ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="#contact"
            onClick={connect}
            className={`hidden sm:inline-flex group items-center gap-2 rounded-none bg-[#1266F1] px-5 xl:px-6 py-3 text-[13px] 2xl:text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[0_10px_24px_-8px_rgba(18,102,241,0.6)] transition duration-200 hover:bg-[#0F58D6] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-8px_rgba(18,102,241,0.7)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focusRing}`}
          >
            Contact
            <ArrowUpRight
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </a>
          <button
            ref={toggleRef}
            type="button"
            className={`xl:hidden w-11 h-11 rounded-full bg-white/60 border border-blue-100 text-[#172033] flex items-center justify-center hover:bg-blue-50 transition-colors motion-reduce:transition-none ${focusRing}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                <path d="M8 7h8.5" />
                <path d="M4 12h16" />
                <path d="M6.5 17H15" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile / tablet menu — always mounted so open/close can transition */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        {...(!menuOpen ? { inert: true } : {})}
        className={`xl:hidden pointer-events-auto w-full mt-0 rounded-none border-0 border-b border-white/85 bg-white/[0.86] backdrop-blur-[18px] backdrop-saturate-150 shadow-[0_18px_48px_rgba(30,100,200,0.20)] overflow-hidden origin-top transition duration-300 motion-reduce:transition-none ${
          menuOpen ? "opacity-100 translate-y-0 scale-100 visible" : "opacity-0 -translate-y-2 scale-[0.98] invisible pointer-events-none"
        }`}
      >
        <ul className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[calc(100dvh-8.5rem)] overflow-y-auto">
          {menuLinks.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.href);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center justify-between rounded-none px-4 py-3.5 text-[15px] font-semibold uppercase tracking-[0.08em] transition-colors motion-reduce:transition-none ${focusRing} ${
                    isActive ? "bg-blue-50 text-[#1266F1]" : "text-[#172033] hover:bg-blue-50/70 hover:text-[#1266F1]"
                  }`}
                >
                  {link.name}
                  {isActive && <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#1266F1]" />}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="px-3 pb-3 sm:hidden">
          <a
            href="#contact"
            onClick={connect}
            className={`group inline-flex w-full items-center justify-center gap-2 rounded-none bg-[#1266F1] px-5 py-3.5 text-[15px] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_10px_24px_-8px_rgba(18,102,241,0.6)] ${focusRing}`}
          >
            Contact
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
