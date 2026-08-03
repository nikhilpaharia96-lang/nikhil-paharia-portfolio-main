import {
  RiArrowRightLine,
  RiArrowDownLine,
  RiMapPinLine,
  RiCodeSSlashLine,
  RiVideoLine,
  RiPencilLine,
  RiSendPlaneLine,
  RiFolderOpenLine,
  RiFolderChartLine,
  RiGroupLine,
  RiTimeLine,
  RiAwardLine,
} from "react-icons/ri";
import { FaGithub, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

import profileImg from "../assets/images/profile-nobg.png";
import teaGarden from "../assets/images/tea-garden-hero.webp";
import blueBrush from "../assets/images/blue-brush-stroke-clean.webp";
import threeStrokes from "../assets/images/three-strokes-clean.webp";
import assamMap from "../assets/images/assam-map-clean.webp";

import SplitText from "@/components/ui/SplitText";
import Magnetic from "@/components/ui/Magnetic";

/* ────────────────────────────────────────────────────────────────────────
   Animated count-up used inside every stat card (desktop stack + mobile
   scroller). Counts once, the first time the card scrolls into view.
   ──────────────────────────────────────────────────────────────────────── */
function StatCounter({ value, duration = 1.6 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = numericValue;
    if (start === end) return;

    const totalMs = duration * 1000;
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMs / 16));
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [numericValue, inView, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* Four stat cards — values preserved exactly as they exist elsewhere in the
   repo (About/Skills sections use the same figures); nothing invented here. */
const stats = [
  { value: "96+", label: "Projects Completed", Icon: RiFolderChartLine },
  { value: "30+", label: "Happy Clients", Icon: RiGroupLine },
  { value: "1096+", label: "Days of Experience", Icon: RiTimeLine },
  { value: "100%", label: "Commitment to Quality", Icon: RiAwardLine },
];

const socials = [
  { icon: <FaGithub />, href: "#", label: "GitHub" },
  { icon: <FaLinkedinIn />, href: "#", label: "LinkedIn" },
  { icon: <FaInstagram />, href: "#", label: "Instagram" },
  { icon: <FaYoutube />, href: "#", label: "YouTube" },
];

/* ── Reused pieces shared between the desktop and mobile layouts ── */

function AvailabilityBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5"
    >
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
      <span className="text-xs font-mono text-primary uppercase tracking-widest whitespace-nowrap">
        Available for Hire
      </span>
    </motion.div>
  );
}

function NameHeading({ align = "left" }: { align?: "left" | "center" }) {
  return (
    <>
      <motion.p
        initial={{ opacity: 0, x: align === "left" ? -30 : 0, y: align === "center" ? 10 : 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.02em" }}
        className="text-[#071225]"
      >
        <SplitText type="chars" delay={0.1}>Hi, I'm</SplitText>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, x: align === "left" ? -30 : 0, y: align === "center" ? 10 : 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.22, duration: 0.65 }}
        className="relative mt-1"
        style={{ display: "inline-block", maxWidth: "100%" }}
      >
        {/* three-strokes decorative accent near the name */}
        <img
          src={threeStrokes}
          alt=""
          aria-hidden="true"
          className="absolute -top-4 -right-7 w-9 h-auto opacity-90 pointer-events-none hidden sm:block"
        />

        <h1
          style={{
            fontSize: "clamp(1.85rem, 8.2vw, 4.6rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            fontWeight: 900,
            color: "#0A66FF",
            wordBreak: "keep-all",
          }}
        >
          <SplitText type="chars" delay={0.25}>Nikhil Paharia</SplitText>
        </h1>

        {/* Hand-drawn tapered underline */}
        <motion.svg
          viewBox="60 4 640 29"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
          style={{
            display: align === "center" ? "block" : "block",
            width: "100%",
            maxWidth: "440px",
            height: "auto",
            marginTop: "2px",
            marginLeft: align === "center" ? "auto" : undefined,
            marginRight: align === "center" ? "auto" : undefined,
          }}
          aria-hidden="true"
        >
          <path
            d="
              M 34 30
              C 30 21, 160 10, 270 9.5
              C 350 9, 439 12, 500 30
              C 452 25, 50 9.0, 270 24.5
              C 290 24.5, 96 23.5, 14 29
              Z
            "
            fill="#0A66FF"
          />
        </motion.svg>
      </motion.div>
    </>
  );
}

function LocationLine({ align = "left" }: { align?: "left" | "center" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className={`relative ${align === "center" ? "flex justify-center" : ""}`}
    >
      <div className={`flex items-center gap-1 flex-wrap ${align === "center" ? "justify-center" : ""}`}>
        <RiMapPinLine className="text-primary text-lg sm:text-xl flex-shrink-0" aria-hidden="true" />
        <p
          style={{ fontSize: "clamp(0.9rem, 2vw, 1.15rem)" }}
          className={`text-slate-700 font-medium flex items-center gap-1 sm:gap-2 flex-wrap ${align === "center" ? "justify-center" : ""}`}
        >
          <span className="whitespace-nowrap">From the Hills of</span>
          <span
            className="relative inline-block assam-text font-bold whitespace-nowrap"
            style={{ fontSize: "1.9em", lineHeight: 1, paddingBottom: "6px", color: "#0A66FF" }}
          >
            Assam
            <svg
              viewBox="5 0 58 5"
              fill="none"
              aria-hidden="true"
              style={{ position: "absolute", bottom: 0, left: 4, width: "100%" }}
            >
              <path d="M1 3 Q29 -1 76 3" stroke="#0A66FF" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <span className="whitespace-nowrap">to the world</span>
        </p>
      </div>
    </motion.div>
  );
}

function DescriptionLine() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.36, duration: 0.6 }}
      className="flex gap-3 max-w-lg"
    >
      <div className="w-[3px] rounded-full flex-shrink-0 self-stretch" style={{ backgroundColor: "#0A66FF" }} />
      <p style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)" }} className="text-slate-600 leading-relaxed text-left">
        I build fast, modern and scalable web experiences that help businesses grow and stand out.
      </p>
    </motion.div>
  );
}

function RolesLine({ justify = "start" }: { justify?: "start" | "center" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.42, duration: 0.5 }}
      className={`flex flex-wrap items-center gap-x-2 xs:gap-x-3 gap-y-2 ${justify === "center" ? "justify-center" : ""}`}
    >
      <span className="inline-flex items-center gap-1.5 text-xs xs:text-sm text-slate-700 font-semibold whitespace-nowrap">
        <RiCodeSSlashLine className="text-primary flex-shrink-0" aria-hidden="true" /> Full-Stack Developer
      </span>
      <span className="w-1 h-1 rounded-full bg-primary/50 hidden xs:block" />
      <span className="inline-flex items-center gap-1.5 text-xs xs:text-sm text-slate-700 font-semibold whitespace-nowrap">
        <RiVideoLine className="text-primary flex-shrink-0" aria-hidden="true" /> Video Editor
      </span>
      <span className="w-1 h-1 rounded-full bg-primary/50 hidden xs:block" />
      <span className="inline-flex items-center gap-1.5 text-xs xs:text-sm text-slate-700 font-semibold whitespace-nowrap">
        <RiPencilLine className="text-primary flex-shrink-0" aria-hidden="true" /> Digital Creator
      </span>
    </motion.div>
  );
}

function CtaButtons({ justify = "start" }: { justify?: "start" | "center" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.48, duration: 0.5 }}
      className={`flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-3 lg:gap-2.5 xl:gap-4 w-full ${justify === "center" ? "xs:justify-center" : ""}`}
    >
      <Magnetic range={60} strength={0.35} scaleHover={1.03}>
        <a
          href="#contact"
          className="cta-pulse flex w-full xs:w-auto items-center justify-center gap-2 text-white font-bold px-5 lg:px-5 xl:px-8 rounded-full shadow-lg transition-shadow duration-300 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A66FF]"
          style={{ fontSize: "clamp(0.85rem, 1.4vw, 1rem)", height: "52px", backgroundColor: "#0A66FF" }}
        >
          <RiSendPlaneLine className="flex-shrink-0 plane-wiggle" aria-hidden="true" /> Hire Me{" "}
          <RiArrowRightLine className="flex-shrink-0 arrow-nudge" aria-hidden="true" />
        </a>
      </Magnetic>

      <Magnetic range={60} strength={0.35} scaleHover={1.03}>
        <a
          href="#projects"
          className="flex w-full xs:w-auto items-center justify-center gap-2 bg-white border border-blue-200 font-bold px-5 lg:px-5 xl:px-8 rounded-full hover:bg-blue-50 transition-colors duration-300 shadow-sm whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A66FF]"
          style={{ fontSize: "clamp(0.85rem, 1.4vw, 1rem)", height: "52px", color: "#0A66FF" }}
        >
          <RiFolderOpenLine className="flex-shrink-0 folder-bounce" aria-hidden="true" /> View My Work
        </a>
      </Magnetic>
    </motion.div>
  );
}

function ConnectSocials({ justify = "start" }: { justify?: "start" | "center" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.54, duration: 0.5 }}
      className={`flex flex-wrap items-center gap-4 ${justify === "center" ? "justify-center" : ""}`}
    >
      <div className="flex-shrink-0 text-center">
        <p style={{ fontFamily: "'Caveat',cursive", fontSize: "20px", color: "#0A66FF", lineHeight: 1.1, fontWeight: 700 }}>
          Let's
        </p>
        <p style={{ fontFamily: "'Caveat',cursive", fontSize: "20px", color: "#0A66FF", lineHeight: 1.1, fontWeight: 700 }}>
          Connect →
        </p>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap justify-center">
        {socials.map((s, i) => (
          <motion.a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            whileHover={{ scale: 1.15, y: -3 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.05 }}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200 text-slate-700 text-base flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A66FF]"
          >
            {s.icon}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Gentle landscape parallax on desktop only (kept lightweight and GPU-friendly).
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const smoothBgY = useSpring(bgY, { stiffness: 45, damping: 20 });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden w-full max-w-full section-wrap bg-white"
      id="home"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
        .assam-text { font-family: 'Caveat', cursive; }

        @keyframes heroFloatY {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        .hero-float { animation: heroFloatY 5s ease-in-out infinite; }

        @keyframes arrowNudge {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(4px); }
        }
        .arrow-nudge { display:inline-block; animation: arrowNudge 1.6s ease-in-out infinite; }

        @keyframes planeWiggle {
          0%,100% { transform: rotate(0deg); }
          50%      { transform: rotate(-14deg); }
        }
        .plane-wiggle { display:inline-block; animation: planeWiggle 2.2s ease-in-out infinite; }

        @keyframes folderBounce {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-2px) rotate(-6deg); }
        }
        .folder-bounce { display:inline-block; animation: folderBounce 2s ease-in-out infinite; }

        @keyframes ctaPulse {
          0%,100% { box-shadow: 0 4px 14px rgba(29,111,235,0.35); }
          50%      { box-shadow: 0 4px 28px rgba(29,111,235,0.6), 0 0 0 6px rgba(29,111,235,0.08); }
        }
        .cta-pulse { animation: ctaPulse 2.6s ease-in-out infinite; }

        @keyframes planeBob {
          0%,100% { transform: translateY(0px) rotate(-42deg); }
          40%     { transform: translateY(-6px) rotate(-46deg); }
          70%     { transform: translateY(3px)  rotate(-39deg); }
        }
        .plane-bob { animation: planeBob 3.8s ease-in-out infinite; }

        @keyframes trailDraw {
          0%   { stroke-dashoffset: 320; opacity: 0; }
          12%  { opacity: 1; }
          72%  { stroke-dashoffset: 0;   opacity: 1; }
          88%  { stroke-dashoffset: 0;   opacity: 0.35; }
          100% { stroke-dashoffset: 0;   opacity: 0; }
        }
        .trail-path { stroke-dasharray: 320; stroke-dashoffset: 320; animation: trailDraw 3.2s ease-out infinite; }

        /* Respect OS-level reduced-motion preference for the plain CSS
           keyframe animations above (framer-motion's own animations are
           already handled globally via <MotionConfig reducedMotion="user">). */
        @media (prefers-reduced-motion: reduce) {
          .hero-float, .arrow-nudge, .plane-wiggle, .folder-bounce,
          .cta-pulse, .plane-bob, .trail-path, .animate-bounce, .animate-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════
          DESKTOP composition (lg and up) — mirrors hero-reference.png:
          text column on the left, portrait emerging from a blue brush
          stroke over the Assam tea-garden landscape on the right, four
          stacked stat cards and the Assam glass card floating on top.
          ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block absolute inset-0">
        {/* Landscape + brush + portrait, confined to the right ~60% of the section */}
        <div className="absolute inset-y-0 right-0 w-[62%] overflow-hidden pointer-events-none">
          <motion.div style={{ y: smoothBgY }} className="absolute inset-0">
            <img
              src={teaGarden}
              alt=""
              className="w-full h-full object-cover object-[center_30%]"
              style={{ filter: "saturate(0.95) brightness(1.02)" }}
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/5 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-transparent to-transparent" />
          </motion.div>

          {/* Blue brush stroke — already alpha-cleaned, no blend-mode hacks needed */}
          <div className="absolute inset-0 flex items-end justify-center">
            <img
              src={blueBrush}
              alt=""
              aria-hidden="true"
              className="w-[115%] max-w-none opacity-100 translate-y-[2%] translate-x-[6%]"
            />
          </div>

          {/* Curved decorative line, top-left of the visual */}
          <svg viewBox="0 0 400 500" className="absolute top-[8%] left-[2%] w-40 h-auto opacity-60" fill="none">
            <path
              d="M 20 20 C 120 80, 40 220, 160 260 C 260 292, 220 400, 340 460"
              stroke="#1d6feb"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="1 14"
            />
          </svg>

          {/* Portrait — real photo (profile-nobg.png), untouched identity/pose */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="absolute bottom-0 left-[38%] -translate-x-1/2 h-full flex items-end"
          >
            <img
              src={profileImg}
              alt="Nikhil Paharia, wearing a black hoodie with arms crossed"
              className="h-full w-auto object-contain object-bottom drop-shadow-[0_25px_45px_rgba(10,20,40,0.25)]"
              loading="eager"
              fetchPriority="high"
              width={1254}
              height={1254}
            />
          </motion.div>
        </div>

        {/* Floating stat cards — stacked vertically on the right edge */}
        <div className="flex flex-col gap-4 absolute right-6 xl:right-10 top-1/2 -translate-y-1/2 z-20">
          {stats.map(({ value, label, Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5, type: "spring", stiffness: 160 }}
              whileHover={{ scale: 1.05, x: -4 }}
              className="bg-white/90 backdrop-blur border border-white shadow-lg rounded-2xl px-5 py-3.5 flex items-center gap-3 min-w-[190px]"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50">
                <Icon style={{ color: "#0A66FF", fontSize: "18px" }} />
              </div>
              <div>
                <div className="text-xl font-extrabold leading-none mb-0.5" style={{ color: "#0A66FF" }}>
                  <StatCounter value={value} />
                </div>
                <div className="text-xs font-semibold text-slate-700 leading-snug">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Assam location card — bottom-right glass card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="absolute bottom-8 right-8 xl:right-12 z-20 bg-white/85 backdrop-blur border border-white shadow-xl rounded-2xl px-5 py-4 flex items-center gap-4 max-w-[300px]"
        >
          <div className="relative flex-shrink-0 w-14 h-14">
            <img src={assamMap} alt="" aria-hidden="true" className="w-full h-full object-contain" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(10,102,255,0.25)]" />
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-snug font-medium">
            <span className="font-bold" style={{ color: "#0A66FF" }}>From Assam, India</span>
            <br />
            Inspired by nature, driven by code.
          </p>
        </motion.div>

        {/* Text column — width is capped as a percentage of the viewport (not a fixed
            breakpoint px value) so it scales proportionally and never runs under the
            right-side visual composition (which occupies the right 62% of the section),
            at any width from the lg floor (1024px) upward. */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 h-full">
          <div
            className="flex flex-col justify-start pt-32 xl:pt-36 gap-3.5"
            style={{ maxWidth: "min(576px, 34vw)" }}
          >
            <AvailabilityBadge />

            {/* Location line + paper airplane, needs relative positioning for the plane */}
            <div>
              <NameHeading />
            </div>

            <div className="relative" style={{ paddingRight: "70px" }}>
              <LocationLine />
              <div aria-hidden="true" className="absolute pointer-events-none hero-float" style={{ right: "-20px", top: "-48px" }}>
                <svg width="170" height="100" viewBox="5 0 200 115" fill="none" overflow="visible" className="scale-[0.85] origin-bottom-left">
                  <path
                    d="M 8 100 C 28 105 52 112 72 106 C 92 100 100 84 118 66 C 136 48 152 30 172 18"
                    stroke="#0A66FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="6 6"
                    fill="none"
                    className="trail-path"
                  />
                  <g transform="translate(179,18) rotate(7)" className="plane-bob">
                    <path d="M 0 0 L -32 14 L -22 20 Z" stroke="#0A66FF" strokeWidth="2" strokeLinejoin="round" fill="rgba(255,255,255,0.6)" />
                    <path d="M 0 0 L -32 14 L -26 24 Z" stroke="#0A66FF" strokeWidth="2" strokeLinejoin="round" fill="rgba(10,102,255,0.08)" />
                    <line x1="0" y1="0" x2="-22" y2="20" stroke="#0A66FF" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="-22" y1="20" x2="-26" y2="24" stroke="#0A66FF" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
                  </g>
                </svg>
              </div>
            </div>

            <DescriptionLine />
            <RolesLine />
            <CtaButtons />
            <ConnectSocials />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE / TABLET composition (below lg) — a dedicated vertical
          flow, not a scaled-down desktop layout:

          Portrait+landscape visual → Availability badge → Hi, I'm Nikhil
          Paharia → Location line → Description → Roles → CTAs → Socials
          → Stats (horizontal scroller)
          ══════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden relative w-full pt-24 pb-12">
        {/* Portrait / Assam visual — large and premium, own visual block */}
        <div className="relative w-full h-[62vh] min-h-[380px] max-h-[560px] overflow-hidden">
          <img
            src={teaGarden}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[center_28%]"
            style={{ filter: "saturate(0.95) brightness(1.02)" }}
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent" />

          {/* Brush stroke, centered behind the portrait */}
          <div className="absolute inset-0 flex items-end justify-center">
            <img src={blueBrush} alt="" aria-hidden="true" className="w-[150%] max-w-none opacity-95 translate-y-[6%]" />
          </div>

          {/* Portrait — height capped to leave clear space for the Assam chip below it */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute bottom-[64px] left-1/2 -translate-x-1/2 h-[calc(100%-64px)] flex items-end"
          >
            <img
              src={profileImg}
              alt="Nikhil Paharia, wearing a black hoodie with arms crossed"
              className="h-full w-auto object-contain object-bottom drop-shadow-[0_20px_35px_rgba(10,20,40,0.25)]"
              loading="eager"
              fetchPriority="high"
              width={1254}
              height={1254}
            />
          </motion.div>

          {/* Assam location chip — sits in its own reserved strip beneath the portrait, never overlapping the body */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute bottom-3 left-3 right-3 z-20 bg-white/90 backdrop-blur border border-white shadow-lg rounded-2xl px-4 py-2.5 flex items-center gap-3 h-[52px]"
          >
            <div className="relative flex-shrink-0 w-8 h-8">
              <img src={assamMap} alt="" aria-hidden="true" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs text-slate-700 leading-snug font-medium">
              <span className="font-bold" style={{ color: "#0A66FF" }}>From Assam, India</span>
              {" "}— Inspired by nature, driven by code.
            </p>
          </motion.div>
        </div>

        {/* Text content — centered vertical flow */}
        <div className="relative z-10 w-full max-w-lg mx-auto px-6 flex flex-col items-center gap-4 text-center mt-8">
          <AvailabilityBadge />
          <NameHeading align="center" />
          <LocationLine align="center" />
          <DescriptionLine />
          <RolesLine justify="center" />
          <CtaButtons justify="center" />
          <ConnectSocials justify="center" />

          {/* Stats — horizontal scroller, snap points, touch-friendly */}
          <div className="w-full flex gap-3 mt-4 overflow-x-auto pb-2 snap-x snap-mandatory -mx-6 px-6">
            {stats.map(({ value, label, Icon }) => (
              <div
                key={label}
                className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex flex-col items-start min-w-[150px] snap-start flex-shrink-0"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-blue-50">
                  <Icon style={{ color: "#0A66FF", fontSize: "16px" }} />
                </div>
                <div className="font-extrabold leading-tight text-xl" style={{ color: "#0A66FF" }}>
                  <StatCounter value={value} />
                </div>
                <div className="text-slate-600 font-medium text-xs leading-snug mt-0.5 text-left">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-slate-500 tracking-widest uppercase font-mono">Scroll</span>
        <RiArrowDownLine className="text-primary text-xl" aria-hidden="true" />
      </div>
    </section>
  );
}
