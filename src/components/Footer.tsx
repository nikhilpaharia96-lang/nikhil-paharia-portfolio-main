import { useReducedMotion } from "framer-motion";
import { ArrowUp, Mail, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { RiGithubFill } from "react-icons/ri";
import { getLenis } from "@/lib/smoothScroll";
import { PHONE_DISPLAY, PHONE_TEL, waLink } from "@/lib/contact";
import "./footer-reel.css";

const chapters = [
  { tc: "00:00", label: "Home", href: "#home" },
  { tc: "00:12", label: "About", href: "#about" },
  { tc: "00:25", label: "Skills", href: "#skills" },
  { tc: "00:40", label: "Projects", href: "#projects" },
  { tc: "00:58", label: "Videos", href: "#videos" },
  { tc: "01:10", label: "Services", href: "#services" },
  { tc: "01:24", label: "Contact", href: "#contact" },
];

const credits = [
  ["Directed by", "Nikhil Paharia"],
  ["Websites & Web Apps", "React · TypeScript"],
  ["Video Editing", "Reels · YouTube · Ads"],
  ["Design", "Graphics · UI/UX"],
  ["Growth", "Marketing · Automation"],
  ["Shot on location", "Assam, India"],
];

export default function Footer() {
  const reduce = !!useReducedMotion();

  const scrollToTop = () => {
    const lenis = getLenis();
    if (reduce) window.scrollTo({ top: 0, behavior: "auto" });
    else if (lenis) lenis.scrollTo(0, { duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="rl-footer" aria-label="Footer">
      <div className="rl-perf" aria-hidden="true" />

      <div className="container-tight relative z-10 py-12 md:py-16">
        <div className="rl-mono mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#9aa6c8]">
          <span className="rl-rec" aria-hidden="true" />
          End of reel · Roll credits
        </div>

        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          {/* Left: headline + CTA + credits */}
          <div>
            <h2 className="font-serif text-4xl font-bold leading-[1.05] text-white md:text-6xl">
              Let&apos;s build<br />
              <span className="text-[#ff8a4a]">the future.</span>
            </h2>
            <p className="mt-4 max-w-md text-base text-[#aab4d2]">
              Available for freelance work worldwide. Tell me your idea and get a clear quote within 24–48 hours.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={waLink("Hi Nikhil, I found your portfolio and would like to discuss a project.")}
                target="_blank"
                rel="noopener noreferrer"
                className="rl-btn bg-[#25D366] text-[#05210f]"
              >
                <SiWhatsapp className="h-5 w-5" aria-hidden="true" /> Start a project
              </a>
              <a href={`tel:${PHONE_TEL}`} className="rl-btn border border-white/20 text-white">
                <Phone className="h-4 w-4" aria-hidden="true" /> {PHONE_DISPLAY}
              </a>
            </div>

            <dl className="mt-10 max-w-lg">
              {credits.map(([role, name]) => (
                <div key={role} className="rl-credit">
                  <dt className="rl-mono text-xs uppercase tracking-widest text-[#8793b8]">{role}</dt>
                  <span className="rl-dots h-px w-10 bg-white/10" aria-hidden="true" />
                  <dd className="text-sm font-semibold text-white sm:text-right">{name}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: chapters (nav) + links */}
          <div>
            <h3 className="rl-mono mb-3 text-xs uppercase tracking-[0.25em] text-[#9aa6c8]">Chapters</h3>
            <nav aria-label="Footer">
              <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-1">
                {chapters.map((c) => (
                  <li key={c.label}>
                    <a href={c.href} className="rl-link">
                      <span className="rl-mono rl-tc">{c.tc}</span>
                      <span className="text-sm font-semibold uppercase tracking-widest">{c.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <h3 className="rl-mono mb-3 mt-8 text-xs uppercase tracking-[0.25em] text-[#9aa6c8]">Find me</h3>
            <ul className="flex flex-wrap gap-2">
              <li>
                <a href="https://github.com/nikhilpaharia96-lang" target="_blank" rel="noopener noreferrer" className="rl-link border border-white/10">
                  <RiGithubFill className="h-5 w-5" aria-hidden="true" /> GitHub
                </a>
              </li>
              <li>
                <a href="mailto:nikhilpaharia96@gmail.com" className="rl-link border border-white/10">
                  <Mail className="h-5 w-5" aria-hidden="true" /> Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Export bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
          <p className="rl-mono text-xs text-[#8793b8]">
            © {new Date().getFullYear()} Nikhil Paharia · Exported in Assam, for the world.
          </p>
          <button type="button" onClick={scrollToTop} className="rl-btn bg-[#ff6a1a] text-[#1a0a00]" aria-label="Back to start of page">
            <ArrowUp className="h-4 w-4" aria-hidden="true" /> Replay from start
          </button>
        </div>
      </div>
      {/* keep room above the sticky buttons on phones */}
      <div className="h-32 md:hidden" aria-hidden="true" />
    </footer>
  );
}
