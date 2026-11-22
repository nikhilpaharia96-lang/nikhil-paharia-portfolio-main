import { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowUpRight } from "lucide-react";
import brandMark from "../assets/logos/np-mark.webp";
import { lockBodyScroll } from "@/lib/scrollLock";
import ThemeToggle from "@/components/ThemeToggle";

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
  // Smart navbar: slides away while reading down, slides back the moment the visitor scrolls up.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const menuOpenRef = useRef(false);
  const progressRef = useRef<HTMLSpanElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
    if (menuOpen) setHidden(false);
  }, [menuOpen]);

  // Scroll behaviour — passive listener: glass gets more opaque after 40px, the bar hides on
  // scroll-down / returns on scroll-up (ignores tiny jitters and iOS rubber-band overscroll),
  // and a thin progress line under the bar shows how far down the page the visitor is.
  useEffect(() => {
    const onScroll = () => {
      const y = Math.max(window.scrollY, 0);
      setIsScrolled(y > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Editor-style timecode (mm:ss:ff @30fps) mapped to page progress over a 3-minute "reel".
      const t = (max > 0 ? Math.min(y / max, 1) : 0) * 180;
      const tc = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}:${String(Math.floor((t % 1) * 30)).padStart(2, "0")}`;
      headerRef.current?.querySelectorAll<HTMLElement>("[data-timecode]").forEach((el) => {
        el.textContent = tc;
      });
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      }
      const dy = y - lastY.current;
      if (Math.abs(dy) < 8) return;
      lastY.current = y;
      if (y < 80 || menuOpenRef.current) setHidden(false);
      else setHidden(dy > 0);
    };
    lastY.current = Math.max(window.scrollY, 0);
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

  const total = menuLinks.length;
  const activeIdx = menuLinks.findIndex((l) => l.href.substring(1) === activeSection);
  const playheadLeft =
    activeIdx >= 0 ? ((activeIdx + 0.5) / total) * 100 : activeSection === "contact" ? 100 : 0;
  // Pseudo start-time of each clip on the 3-minute reel, shown in the mobile menu.
  const clipTime = (i: number) => {
    const sec = Math.round((i / total) * 180);
    return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  };

  return (
    <header
      ref={headerRef}
      onFocusCapture={() => setHidden(false)}
      className={`fixed inset-x-0 top-0 z-[200] pointer-events-none transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <nav
        aria-label="Primary"
        className={`nav-enter relative pointer-events-auto w-full flex items-center justify-between gap-3 xl:gap-5 border-b px-4 sm:px-6 lg:px-8 h-[62px] sm:h-[68px] transition-[background-color,box-shadow,border-color] duration-300 motion-reduce:transition-none ${
          isScrolled
            ? "bg-white/[0.82] border-white/80 backdrop-blur-[20px] backdrop-saturate-150 shadow-[0_12px_36px_-14px_rgba(30,100,200,0.35)]"
            : "bg-white/[0.55] border-white/60 backdrop-blur-[14px] backdrop-saturate-150 shadow-[0_6px_24px_-12px_rgba(30,100,200,0.18)]"
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
          className={`group flex items-center min-w-0 rounded-lg pr-2 ${focusRing}`}
        >
          <img
            src={brandMark}
            alt=""
            width={345}
            height={261}
            decoding="async"
            className="h-[34px] sm:h-[42px] xl:h-[46px] w-auto shrink-0 transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <span className="ml-1.5 inline-flex flex-col items-stretch">
            <span
              className="whitespace-nowrap font-bold tracking-tight leading-none text-[18px] min-[400px]:text-[20px] sm:text-[23px] xl:text-[25px]"
              style={{ fontFamily: 'Futura, "Futura PT", "Jost", "Century Gothic", sans-serif', fontWeight: 700 }}
            >
              <span className="np-name-first text-[#0b1530]">Nikhil</span> <span className="name-shimmer">Paharia</span>
            </span>
            <svg viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true" className="mt-[5px] h-[6px] sm:h-[8px] w-full">
              <defs>
                <linearGradient id="np-swoosh" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#1266F1" />
                  <stop offset="1" stopColor="#1266F1" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <path d="M1 7.5 C 50 1.5, 130 1.5, 199 6.5 C 130 4.2, 50 4.8, 1 7.5 Z" fill="url(#np-swoosh)" />
            </svg>
          </span>
        </a>

        {/* Desktop: the timeline — every section is a clip, the playhead follows where you are */}
        <ul
          className="relative hidden xl:flex flex-1 max-w-[800px] items-stretch h-11 rounded-lg border border-slate-300/70 bg-slate-100/60"
        >
          {menuLinks.map((link, i) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <li key={link.name} className="relative flex-1 min-w-0 border-l border-slate-300/60 first:border-l-0">
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.href);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex h-full w-full items-center justify-center gap-1.5 px-2 text-[13px] font-semibold transition-[color,background-color] duration-150 motion-reduce:transition-none ${focusRing} ${
                    i === 0 ? "rounded-l-[7px]" : ""
                  } ${i === total - 1 ? "rounded-r-[7px]" : ""} ${
                    isActive
                      ? "nav-clip-active"
                      : "text-[#172033] hover:text-[#1266F1] hover:bg-black/[0.04]"
                  }`}
                >
                  <span aria-hidden="true" className="hidden 2xl:inline font-mono text-[10px] opacity-55">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate">{link.name}</span>
                </a>
              </li>
            );
          })}
          {/* Playhead */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-[7px] -bottom-[7px] w-0 transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{ left: `${playheadLeft}%` }}
          >
            <span className="absolute left-[-5px] top-0 h-0 w-0 border-x-[5px] border-t-[7px] border-x-transparent" style={{ borderTopColor: "#ff6a1a" }} />
            <span className="absolute left-[-1px] top-[6px] bottom-0 w-[2px] rounded-full" style={{ backgroundColor: "#ff6a1a" }} />
          </span>
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span
            aria-hidden="true"
            data-timecode
            className="hidden min-[1500px]:inline-block rounded-md border border-slate-300/70 bg-slate-100/60 px-2.5 py-1.5 font-mono text-xs font-semibold tabular-nums text-slate-600"
          >
            00:00:00
          </span>
          <ThemeToggle className="nav-icon-btn bg-white/60 border-blue-100 text-[#172033] hover:bg-blue-50" />
          <a
            href="#contact"
            onClick={connect}
            className={`hidden sm:inline-flex group items-center gap-2 rounded-lg bg-[#1266F1] px-5 min-h-[48px] text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(18,102,241,0.6)] transition duration-150 hover:bg-[#0F58D6] hover:-translate-y-0.5 active:scale-95 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focusRing}`}
          >
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#ff6a1a]" />
            Hire Me
            <ArrowUpRight
              className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </a>
          <button
            ref={toggleRef}
            type="button"
            className={`nav-icon-btn xl:hidden w-11 h-11 rounded-lg bg-white/60 border border-blue-100 text-[#172033] flex items-center justify-center hover:bg-blue-50 transition-colors motion-reduce:transition-none ${focusRing}`}
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

        {/* Reading-progress line = the reel's timeline bar */}
        <span
          ref={progressRef}
          aria-hidden="true"
          className="absolute left-0 bottom-[-1px] h-[3px] w-full origin-left pointer-events-none"
          style={{ transform: "scaleX(0)", background: "linear-gradient(90deg,#1266F1,#ff6a1a)" }}
        />
      </nav>

      {/* Mobile / tablet menu — each section listed as a clip with its start time */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        {...(!menuOpen ? { inert: "" } : {})}
        className={`xl:hidden pointer-events-auto w-full border-b border-white/85 bg-white/[0.9] backdrop-blur-[20px] backdrop-saturate-150 shadow-[0_24px_56px_-16px_rgba(30,100,200,0.4)] overflow-hidden origin-top ${
          menuOpen
            ? "opacity-100 translate-y-0 visible transition duration-[250ms] ease-out"
            : "opacity-0 -translate-y-2 invisible pointer-events-none transition duration-[120ms] ease-in"
        } motion-reduce:transition-none`}
      >
        <div className="flex items-center justify-between px-5 pt-3 font-mono text-[11px] uppercase tracking-widest text-slate-500">
          <span>Reel</span>
          <span data-timecode className="tabular-nums">00:00:00</span>
        </div>
        <ul className="p-3 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[calc(100dvh-9.5rem)] overflow-y-auto">
          {menuLinks.map((link, i) => {
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
                  className={`flex min-h-[48px] items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-semibold transition-colors motion-reduce:transition-none ${focusRing} ${
                    isActive ? "bg-blue-50 text-[#1266F1]" : "text-[#172033] hover:bg-black/[0.04] hover:text-[#1266F1]"
                  }`}
                >
                  <span aria-hidden="true" className="font-mono text-[11px] opacity-50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">{link.name}</span>
                  <span aria-hidden="true" className="font-mono text-[11px] tabular-nums opacity-50">
                    {clipTime(i)}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <div className="px-3 pb-3 sm:hidden">
          <a
            href="#contact"
            onClick={connect}
            className={`group inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg bg-[#1266F1] px-5 py-3.5 text-[15px] font-bold text-white ${focusRing}`}
          >
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#ff6a1a]" />
            Hire Me
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
