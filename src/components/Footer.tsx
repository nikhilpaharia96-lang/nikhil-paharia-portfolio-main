import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { RiArrowUpLine, RiGithubFill, RiLinkedinFill, RiInstagramLine, RiYoutubeFill } from "react-icons/ri";
import footerBg from "../assets/images/footer-bg.webp";
import Magnetic from "@/components/ui/Magnetic";
import FloatingParticles from "@/components/FloatingParticles";
import { getLenis } from "@/lib/smoothScroll";
import cloudB from "../assets/images/cloud2.895414a23f99e60c66ea.webp";
import "./footer-fx.css";

const ease = [0.16, 1, 0.3, 1] as const;
const FONT_CONDENSED = "'Anton', 'Impact', sans-serif";
const bigText = "text-4xl sm:text-6xl md:text-7xl leading-[0.95] uppercase text-foreground";

const socials = [
  { Icon: RiGithubFill,    href: "https://github.com/nikhilpaharia96-lang", label: "GitHub",    hoverBg: "hover:bg-slate-900"   },
  { Icon: RiLinkedinFill,  href: "#", label: "LinkedIn",  hoverBg: "hover:bg-[#0A66C2]"   },
  { Icon: RiInstagramLine, href: "#", label: "Instagram", hoverBg: "hover:bg-[#E1306C]"   },
  { Icon: RiYoutubeFill,   href: "#", label: "YouTube",   hoverBg: "hover:bg-[#FF0000]"   },
];

const navLinks = [
  { label: "Home",     href: "#home"     },
  { label: "About",    href: "#about"    },
  { label: "Projects", href: "#projects" },
  { label: "Videos",   href: "#videos"   },
];

// cloud2 is a clean stand-alone cumulus (cloud.webp is a hard-cropped cloud bank, so it is not used here).
const clouds = [cloudB, cloudB, cloudB];

/** Characters rise in one after another. */
function StaggerChars({ text, reduce, base = 0 }: { text: string; reduce: boolean; base?: number }) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block"
          variants={{
            hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 22 },
            show: { opacity: 1, y: 0, transition: { duration: 0.7, ease, delay: base + i * 0.05 } },
          }}
        >
          {ch}
        </motion.span>
      ))}
    </>
  );
}

export default function Footer() {
  const reduce = !!useReducedMotion();
  const footerRef = useRef<HTMLElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Pause every footer animation while the footer is off-screen.
  useEffect(() => {
    const el = footerRef.current;
    const fx = fxRef.current;
    if (!el || !fx) return;
    const io = new IntersectionObserver(
      ([e]) => { fx.dataset.paused = e.isIntersecting ? "false" : "true"; },
      { rootMargin: "120px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scroll-linked layered parallax: the further forward a layer, the more it travels.
  const { scrollYProgress } = useScroll({ target: footerRef, offset: ["start end", "end start"] });
  const k = reduce ? 0 : mobile ? 0.55 : 1;
  const bgY   = useTransform(scrollYProgress, [0, 1], [-36 * k, 36 * k]);
  const farY  = useTransform(scrollYProgress, [0, 1], [-18 * k, 18 * k]);
  const midY  = useTransform(scrollYProgress, [0, 1], [-40 * k, 40 * k]);
  const nearY = useTransform(scrollYProgress, [0, 1], [-76 * k, 76 * k]);

  const scrollToTop = () => {
    const lenis = getLenis();
    if (reduce) window.scrollTo({ top: 0, behavior: "auto" });
    else if (lenis) lenis.scrollTo(0, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reveal variants (a plain fade when the visitor prefers reduced motion).
  const dist = reduce ? 0 : 34;
  const rise = {
    hidden: { opacity: 0, y: dist },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.01 : 0.9, ease } },
  };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } };
  const child = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
  };
  const view = { once: true, amount: 0.25 } as const;
  const headingWords = "Let's build the future.".split(" ");

  return (
    <footer ref={footerRef} className="relative bg-blue-50 pt-20 md:pt-32 pb-12 border-t border-blue-100 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <img
            src={footerBg}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-[center_64%] scale-[1.12]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-white/30" />

        {/* Atmosphere: light, clouds, mist, particles */}
        <div ref={fxRef} className="ffx" data-paused="false">
          <div className="ffx-blue" />
          <div className="ffx-sun" />
          {([["far", farY], ["mid", midY], ["near", nearY]] as const).map(([depth, y]) => (
            <motion.div key={depth} className="absolute inset-0" style={{ y }}>
              <div className={`ffx-layer ffx-layer--${depth}`}>
                {[0, 1].map((g) => (
                  <div key={g} className="ffx-group">
                    {clouds.map((src, i) => (
                      <img key={i} src={src} alt="" loading="lazy" decoding="async" className="ffx-cloud" />
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
          <div className="ffx-mist ffx-mist--b" />
          <div className="ffx-mist ffx-mist--a" />
          {!reduce && <FloatingParticles variant="dust" count={22} />}
        </div>

        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/80 to-transparent" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container-tight relative z-10">

        {/* Hero text */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={view}
          className="text-center mb-12 md:mb-24 max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 text-center" aria-label="Let's build the future.">
            <span className="inline-flex flex-wrap justify-center" aria-hidden="true">
              {headingWords.map((w, i) => (
                <span key={i} className="relative inline-block overflow-hidden mr-[0.24em] py-[0.1em] -my-[0.1em]">
                  <motion.span
                    className="inline-block"
                    variants={{
                      hidden: { y: reduce ? 0 : "110%", opacity: reduce ? 1 : 0 },
                      show: { y: 0, opacity: 1, transition: { duration: 0.9, ease } },
                    }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </span>
          </h2>
          <motion.p variants={rise} className="text-lg text-slate-600 font-light">
            Available for freelance opportunities globally. Bring your boldest ideas.
          </motion.p>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 mb-10 md:mb-16">

          {/* Brand — from LEFT */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={view}
            className="text-center md:text-left"
          >
            <Magnetic range={50} strength={0.2}>
              <a href="#home" aria-label="Nikhil Paharia" className="font-mono text-3xl font-bold tracking-wider block mb-3 flex items-center justify-center md:justify-start gap-2 text-foreground hover:opacity-80 transition-opacity">
                <span><StaggerChars text="Nikhil" reduce={reduce} base={0.15} /></span>
                <span className="text-primary"><StaggerChars text="Paharia" reduce={reduce} base={0.45} /></span>
              </a>
            </Magnetic>
            <motion.p variants={rise} className="text-slate-600 text-base">Crafting cinematic digital experiences.</motion.p>
          </motion.div>

          {/* Nav + Socials — from RIGHT */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={view}
            className="flex flex-col items-center gap-6"
          >
            {/* Nav links */}
            <motion.h3 variants={child} className={`${bigText} footer-glow-title`} style={{ fontFamily: FONT_CONDENSED }}>Explore</motion.h3>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:gap-8 text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-600">
              {navLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}

                  variants={child}
                  className="footer-link hover:text-primary interactive"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            {/* Social icons wrapped in Magnetic */}
            <motion.h3 variants={child} className={`${bigText} mt-4`} style={{ fontFamily: FONT_CONDENSED }}>Social</motion.h3>
            <div className="flex gap-4">
              {socials.map(({ Icon, href, label, hoverBg }) => (
                <Magnetic key={label} range={45} strength={0.4} scaleHover={1.15}>
                  <motion.a
                    href={href}
                    aria-label={label}
                    {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}

                    variants={child}
                    className={`footer-social interactive w-10 h-10 rounded-full bg-white/55 flex items-center justify-center ${hoverBg} hover:text-white`}
                  >
                    <Icon className="text-lg" />
                  </motion.a>
                </Magnetic>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-blue-100"
        >
          <p className="text-slate-700 text-sm font-medium">
            © {new Date().getFullYear()} Nikhil Paharia. <span className="hidden sm:inline">All rights reserved.</span>
          </p>
          <p className="text-slate-700 text-sm italic">Crafted in Assam, for the world.</p>

          {/* Back-to-top — elastic morph button with Magnetic */}
          <Magnetic range={60} strength={0.45} scaleHover={1.1}>
            <motion.button
              onClick={scrollToTop}
              whileHover={reduce ? undefined : { y: -3, scale: 1.08 }}
              whileTap={reduce ? undefined : { scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="footer-top-btn interactive w-12 h-12 rounded-full bg-white/90 border border-blue-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary text-slate-600 overflow-hidden"
              aria-label="Scroll to top"
            >
              <span className="footer-arrow">
                <RiArrowUpLine className="text-2xl" />
              </span>
            </motion.button>
          </Magnetic>
        </motion.div>
      </div>
    </footer>
  );
}
