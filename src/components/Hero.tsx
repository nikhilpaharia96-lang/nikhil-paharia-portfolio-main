import { RiArrowRightLine, RiArrowDownLine, RiMapPinLine, RiCodeSSlashLine, RiVideoLine, RiPencilLine, RiSendPlaneLine, RiFolderOpenLine, RiFolderChartLine, RiGroupLine, RiTimeLine, RiStarLine } from "react-icons/ri";
import { SiReact, SiNodedotjs, SiJavascript } from "react-icons/si";
import { FaGithub, FaLinkedinIn, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { motion, useScroll, useTransform, useSpring, useVelocity, useMotionValueEvent, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import teaBg from "../assets/images/file_0000000066b08207b18b1ec1e8269869.png";
import teaBgMobile from "../assets/images/tea-brush-mobile.webp";
import SplitText from "@/components/ui/SplitText";
import Magnetic from "@/components/ui/Magnetic";

// ── Desktop-only Hero assets ──────────────────────────────────────────────
import desktopPortrait from "../assets/images/Desktop Nikhil Paharia profile photo.png";
import brushStroke from "../assets/images/blue-brush-stroke.png";
import botamLeft from "../assets/images/botam-left.png";
import ovalLandscape from "../assets/images/Assam landscape.png";
import threeStrokes from "../assets/images/three-strokes.png.png";
// assam-map-clean.webp ships with its "transparent" background baked in as an
// opaque checkerboard (no real alpha channel) — assam-map-transparent.png is
// a chroma-keyed export of the same artwork with a real alpha channel.
import assamMapImg from "../assets/images/assam-map-transparent.png";
// paper-airplane.png has the same baked-checkerboard problem; this Picsart
// export of the identical artwork has genuine transparency.
import cleanPaperPlane from "../assets/images/Picsart_26-08-04_10-20-09-507.png";
import cloudPhoto from "../assets/images/cloud.1ec8ee4225bd9e83bdc5.webp";

// NOTE: "Desktop Background 01" (the intended white-left / tea-garden-right
// composition) was uploaded to the repo as a 0-byte/corrupted file, so it
// cannot be used yet. `teaBg` (the same landscape photo already used by the
// mobile Hero) is used below as a TEMPORARY stand-in with adjusted
// object-position — swap this for the real asset the moment it's
// re-uploaded with valid image data; no other code needs to change.
const desktopBg = teaBg;

const cloudImg = "https://www.gopalkrishnatea.com/static/media/cloud2.895414a23f99e60c66ea.webp";

function TaglineTyping({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayed(text.substring(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 55);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <text
      x="10"
      y="47"
      style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        fontSize: 'clamp(24px, 4vw, 38px)',
        fill: '#1a1a1a',
        letterSpacing: '0.5px',
      }}
      transform="skewX(-4)"
    >
      {displayed}
    </text>
  );
}

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

    const totalMiliseconds = duration * 1000;

    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / 16));
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [numericValue, inView, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}


// Shared between mobile (2x2 grid) and desktop (stacked column) Hero layouts
// so both surfaces show the exact same four stats.
const desktopStats = [
  { value: "96+",   label: "Projects Completed",     Icon: RiFolderChartLine, color: "#1d6feb", bg: "from-blue-50 to-blue-100/60" },
  { value: "30+",   label: "Happy Clients",          Icon: RiGroupLine,       color: "#7c3aed", bg: "from-violet-50 to-violet-100/60" },
  { value: "1096+", label: "Days of Experience",     Icon: RiTimeLine,        color: "#0891b2", bg: "from-cyan-50 to-cyan-100/60" },
  { value: "100%",  label: "Commitment to Quality",  Icon: RiStarLine,        color: "#d97706", bg: "from-amber-50 to-amber-100/60" },
];

const socials = [
  { icon: <FaGithub />,     href: "#", label: "GitHub",    color: "text-slate-800" },
  { icon: <FaLinkedinIn />, href: "#", label: "LinkedIn",  color: "text-blue-600"  },
  { icon: <FaInstagram />,  href: "#", label: "Instagram", color: "text-pink-500"  },
  { icon: <FaYoutube />,    href: "#", label: "YouTube",   color: "text-red-500"   },
  { icon: <FaXTwitter />,   href: "#", label: "X",         color: "text-slate-900" },
  { icon: <FaWhatsapp />,   href: "#", label: "WhatsApp",  color: "text-green-500" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const scrollVelocity = useVelocity(scrollYProgress);

  const rawPlaneY  = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const rawPlaneX  = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const rawRotate  = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [-38, -55, -25, -10]);
  const rawScale   = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.15, 0.85]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 1, 0]);
  const trailOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [1, 0.6, 0]);

  const springCfg = { stiffness: 80, damping: 20, mass: 0.8 };
  const planeY   = useSpring(rawPlaneY,  springCfg);
  const planeX   = useSpring(rawPlaneX,  springCfg);
  const planeRot = useSpring(rawRotate,  { stiffness: 60, damping: 18 });
  const planeScl = useSpring(rawScale,   springCfg);

  // Background landscape parallax
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const smoothBgY = useSpring(bgY, { stiffness: 45, damping: 20 });

  const rm = useReducedMotion();


  /* ── Scroll-direction tracking — drives CTA converge AND the LHS/RHS cloud crossover ──
     This used to re-render (and re-trigger a Framer Motion `layout` FLIP
     animation on the two cloud images) on every scroll frame where the
     finger moved more than 4px in a new direction. A touch swipe is never
     perfectly monotonic — the finger naturally jitters a few px back and
     forth — so on mobile this was flipping `isScrollingUp` back and forth
     several times *during a single swipe*, each flip forcing a synchronous
     layout re-measure on the main thread mid-gesture. That's exactly what
     was cutting the scroll fling short and making it take 2-3 swipes to
     get anywhere: the browser was busy doing layout work instead of
     running the momentum scroll. Two changes fix it: a much larger
     jitter-tolerant threshold (48px, roughly "did the user meaningfully
     change direction" rather than "did the finger wobble"), and only
     calling setState when the direction actually flipped (skips the
     re-render + layout animation entirely on same-direction frames). */
  const { scrollY: pageScrollY } = useScroll();
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const lastScrollY = useRef(0);
  const isScrollingUpRef = useRef(false);
  useMotionValueEvent(pageScrollY, "change", (latest) => {
    const diff = latest - lastScrollY.current;
    if (Math.abs(diff) > 48) {
      lastScrollY.current = latest;
      // Only react to scroll direction while the Hero section itself is still
      // in view (i.e. hasn't fully scrolled past yet) — once the user has
      // scrolled below Hero, the crossover stops responding.
      if (scrollYProgress.get() < 1) {
        const nextIsScrollingUp = diff < 0;
        if (nextIsScrollingUp !== isScrollingUpRef.current) {
          isScrollingUpRef.current = nextIsScrollingUp;
          setIsScrollingUp(nextIsScrollingUp);
        }
      }
    }
  });

  const cloudTransition = { layout: { type: "spring" as const, stiffness: 35, damping: 16, mass: 1.4 } };
  // One-time entrance on first mount (page load): each cloud drifts in
  // smoothly from its own side and fades in, independent of the `layout`
  // crossover transition above (which only fires on scroll-direction
  // changes, never on mount).
  const cloudLeft = (
    <motion.img
      key="cloud-left"
      layout
      initial={{ opacity: 0, x: -60 }}
      animate={{ opacity: 0.7, x: 0 }}
      transition={{ ...cloudTransition, opacity: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }, x: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 } }}
      src={cloudImg}
      alt=""
      className="w-44 sm:w-72 lg:w-96 select-none pointer-events-none"
    />
  );
  const cloudRight = (
    <motion.img
      key="cloud-right"
      layout
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 0.7, x: 0 }}
      transition={{ ...cloudTransition, opacity: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.45 }, x: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.45 } }}
      src={cloudImg}
      alt=""
      className="w-44 sm:w-72 lg:w-96 select-none pointer-events-none"
    />
  );

  return (
    <section ref={ref} className="relative lg:min-h-screen flex items-start lg:items-center overflow-hidden w-full max-w-full section-wrap" id="home">

      {/* Background with scroll parallax — MOBILE/TABLET ONLY, untouched */}
      <motion.div style={{ y: smoothBgY }} className="absolute inset-0 z-0 lg:hidden">
        <img src={teaBgMobile} alt="" className="w-full h-full object-cover" style={{ objectPosition: 'center', filter: 'brightness(0.97) saturate(0.95)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-white/45 via-white/20 to-blue-50/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-white/15" />
      </motion.div>

      {/* Background — DESKTOP ONLY (1024px+). Uses the "Desktop Background 01"
          composition (white-left / tea-garden-right) once that asset is
          re-uploaded; see the desktopBg note near the imports above. */}
      <motion.div style={{ y: smoothBgY }} className="absolute inset-0 z-0 hidden lg:block">
        <img
          src={desktopBg}
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: '68% 50%', filter: 'brightness(0.97) saturate(0.92)' }}
        />
        {/* Minimal left-side readability scrim only — the real background
            already bakes its own white-left area in, so this stays light
            and will likely shrink further (or be removed) once swapped in. */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
      </motion.div>


      {/* Fog orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/15 rounded-full blur-[120px]" style={{ animation: 'fogDrift 12s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-200/20 rounded-full blur-[100px]" style={{ animation: 'fogDrift 16s ease-in-out infinite reverse' }} />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-1.5 h-1.5 rounded-full bg-primary/40" style={{ animation: 'floatY 4s ease-in-out infinite' }} />
        <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 rounded-full bg-primary/40" style={{ animation: 'floatY 5s ease-in-out infinite 1s' }} />
        <div className="absolute bottom-[30%] left-[30%] w-1.5 h-1.5 rounded-full bg-primary/40" style={{ animation: 'floatY 6s ease-in-out infinite 0.5s' }} />
        <div className="absolute top-[60%] left-[80%] w-1.5 h-1.5 rounded-full bg-primary/40" style={{ animation: 'floatY 4.5s ease-in-out infinite 2s' }} />
        <div className="absolute bottom-[10%] right-[10%] w-1.5 h-1.5 rounded-full bg-primary/40" style={{ animation: 'floatY 5.5s ease-in-out infinite 1.5s' }} />
      </div>

      {/* Cloud photo — sits at the bottom of Hero itself (not a separate
          section below it), so it's visible within the opening scene, near
          its lower edge. Spans the full width of the section on both mobile
          and desktop, and animates in on first load. */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-[1] w-full pointer-events-none"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <img
          src={cloudPhoto}
          alt=""
          className="w-full h-24 sm:h-32 lg:h-40 object-cover select-none"
        />
      </motion.div>

      {/* Decorative side clouds — LHS/RHS, vertically centered in the middle of the Hero section;
          cross over to opposite sides (slowly) on scroll-up, reverse on scroll-down */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 flex justify-between px-1 sm:px-4 pointer-events-none">
        {isScrollingUp ? [cloudRight, cloudLeft] : [cloudLeft, cloudRight]}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
        .assam-text { font-family: 'Caveat', cursive; }

        @keyframes ulGlow {
          0%,100% { filter: drop-shadow(0 0 2px rgba(29,111,235,0.4)); }
          50%      { filter: drop-shadow(0 0 6px rgba(29,111,235,0.8)); }
        }
        .ul-svg { animation: ulGlow 3s ease-in-out infinite; }
        .ul-wrap:hover .ul-svg { filter: drop-shadow(0 0 10px rgba(29,111,235,1)) !important; animation: none; }
        @keyframes ulShine {
          0%,100% { opacity:0; stroke-dashoffset:220; }
          10%     { opacity:0.85; }
          70%     { stroke-dashoffset:0; opacity:0.85; }
          85%     { opacity:0; }
        }
        .ul-shine { stroke-dasharray:220; stroke-dashoffset:220; animation: ulShine 4s ease-in-out infinite; animation-delay:2s; }

        @keyframes dropFloat {
          0%,100% { transform: translateY(0px) rotate(165deg); }
          50%      { transform: translateY(-5px) rotate(162deg); }
        }
        @keyframes dropPulse {
          0%,80%,100% { filter: drop-shadow(0 0 1px rgba(29,111,235,0.3)); }
          88%          { filter: drop-shadow(0 0 6px rgba(29,111,235,0.9)); }
        }
        .paint-drops { animation: dropFloat 3.5s ease-in-out infinite, dropPulse 5s ease-in-out infinite; }

        @keyframes planeFloat {
          0%,100% { transform: translateY(0px); }
          40%      { transform: translateY(-6px); }
          70%      { transform: translateY(3px); }
        }
        @keyframes trailDraw {
          0%   { stroke-dashoffset: 320; opacity: 0; }
          12%  { opacity: 1; }
          72%  { stroke-dashoffset: 0;   opacity: 1; }
          88%  { stroke-dashoffset: 0;   opacity: 0.35; }
          100% { stroke-dashoffset: 0;   opacity: 0; }
        }
        .trail-path { stroke-dasharray: 320; stroke-dashoffset: 320; animation: trailDraw 3.2s ease-out infinite; }
        @keyframes planeBob {
          0%,100% { transform: translateY(0px) rotate(-42deg); }
          40%     { transform: translateY(-7px) rotate(-46deg); }
          70%     { transform: translateY(3px)  rotate(-39deg); }
        }
        .plane-bob { animation: planeBob 3.8s ease-in-out infinite; }
        @keyframes planeGlow {
          0%,100% { filter: drop-shadow(0 0 2px rgba(29,111,235,0.4)); }
          50%      { filter: drop-shadow(0 0 8px rgba(29,111,235,0.85)) drop-shadow(0 0 16px rgba(29,111,235,0.25)); }
        }
        .plane-glow { animation: planeGlow 2.6s ease-in-out infinite; }

        @keyframes taglineGlow {
          0%,100% { filter: drop-shadow(0 0 1px rgba(0,0,0,0.15)); }
          50%      { filter: drop-shadow(0 0 3px rgba(29,111,235,0.35)); }
        }
        .tagline-svg { animation: taglineGlow 4s ease-in-out infinite; }

        /* Fixed-quadrant idle bobs for the tech icon badges — small vertical
           drift only, so each icon stays parked in its assigned corner
           (never sweeps across the face like a full orbit would) */
        @keyframes iconBobA { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
        @keyframes iconBobB { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(5px); } }
        @keyframes iconBobC { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        @keyframes iconBobD { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(4px); } }

        .orbit-bob-a { animation: iconBobA 4.6s ease-in-out infinite; }
        .orbit-bob-b { animation: iconBobB 5.2s ease-in-out infinite 0.4s; }
        .orbit-bob-c { animation: iconBobC 4.8s ease-in-out infinite 0.8s; }
        .orbit-bob-d { animation: iconBobD 5.6s ease-in-out infinite 1.2s; }


        /* ── Cinematic profile reveal (matches the uploaded reference video) ── */
        @keyframes cinematicReveal {
          0%   { filter: brightness(0.25) saturate(0) contrast(1.15); transform: scale(0.94); }
          55%  { filter: brightness(0.75) saturate(0.4) contrast(1.08); }
          100% { filter: brightness(1) saturate(1) contrast(1); transform: scale(1); }
        }
        .light-sweep {
          position: absolute; inset: 0; z-index: 20; pointer-events: none;
          background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.85) 48%, rgba(180,210,255,0.55) 52%, transparent 65%);
          transform: translateX(-140%);
          animation: sweepAcross 1.7s cubic-bezier(0.22,1,0.36,1) 0.15s forwards;
          mix-blend-mode: screen;
        }
        @keyframes sweepAcross {
          0%   { transform: translateX(-140%); opacity: 0; }
          10%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(140%); opacity: 0; }
        }
        @keyframes rimGlowIn {
          0%   { opacity: 0; }
          60%  { opacity: 0; }
          100% { opacity: 1; }
        }
        .rim-blue { animation: rimGlowIn 1.8s ease-out forwards; }
        .rim-orange { animation: rimGlowIn 1.8s ease-out 0.1s forwards; }

        /* ── Recurring glow pulse — soft breathing glow around the profile photo ── */
        .profile-glow {
          position: absolute; inset: 0; z-index: 21; pointer-events: none;
          box-shadow: 0 0 25px 6px rgba(59,130,246,0.35), 0 0 55px 18px rgba(29,111,235,0.18);
          animation: glowPulse 3.2s ease-in-out 1.8s infinite;
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 25px 6px rgba(59,130,246,0.35), 0 0 55px 18px rgba(29,111,235,0.18); }
          50%      { box-shadow: 0 0 40px 12px rgba(59,130,246,0.6), 0 0 80px 28px rgba(29,111,235,0.32); }
        }

        /* ── CTA button idle effects ── */
        @keyframes ctaPulse {
          0%,100% { box-shadow: 0 4px 14px rgba(29,111,235,0.35); }
          50%      { box-shadow: 0 4px 28px rgba(29,111,235,0.65), 0 0 0 6px rgba(29,111,235,0.08); }
        }
        .cta-pulse { animation: ctaPulse 2.6s ease-in-out infinite; }

        @keyframes ctaShimmerSweep {
          0%   { transform: translateX(-120%); }
          55%  { transform: translateX(120%); }
          100% { transform: translateX(120%); }
        }
        .cta-shimmer {
          background: linear-gradient(100deg, transparent 30%, rgba(29,111,235,0.18) 50%, transparent 70%);
          transform: translateX(-120%);
          animation: ctaShimmerSweep 3.2s ease-in-out infinite;
        }

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
      `}</style>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-6">
        <div className="lg:hidden pt-[4.75rem] pb-4 relative">

          {/* Bottom-left brush decoration — sits behind all content, tucked
              into the bottom-left corner of the mobile Hero section. */}
          <img
            src={botamLeft}
            alt=""
            aria-hidden="true"
            className="absolute pointer-events-none select-none z-0"
            style={{
              width: 'clamp(140px, 45vw, 220px)',
              bottom: '0%',
              left: '-4%',
              opacity: 0.85,
            }}
          />

          {/* ── Hero composition: text content flows normally on the left;
              the portrait (same real desktop asset) is absolutely
              positioned toward the right/center, large and prominent,
              partially overlapping the blue brushstroke behind it. Text
              sits on z-10 with opaque backgrounds so it is always legible
              even where it passes in front of the portrait's shoulder. ── */}
          <div className="relative">

          {/* ── Text Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 text-left"
          >
            {/* Available for Hire badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur border border-blue-200 rounded-full px-2.5 sm:px-3.5 py-1 mb-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-[9px] sm:text-[11px] font-mono text-primary uppercase tracking-widest whitespace-nowrap">Available for Hire</span>
            </motion.div>

            {/* Hi, I'm */}
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              style={{ fontSize: 'clamp(1.375rem, 5vw, 1.75rem)', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.02em' }}
              className="text-foreground font-bold mb-0.5"
            >
              <SplitText type="chars" delay={0.1}>Hi, I'm</SplitText>
            </motion.p>

            {/* Name block — underline only under "Nikhil", paint drops above last "a" of Paharia.
                Sized to land at ~42–56px across the 320–430px mobile range while
                never overflowing the viewport (clamp caps both ends). */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.65 }}
              className="relative ul-wrap mb-2"
              style={{ display: 'inline-block', maxWidth: '100%' }}
            >
              <img
                src={threeStrokes}
                alt=""
                aria-hidden="true"
                className="absolute pointer-events-none select-none w-6"
                style={{ top: '-10px', right: '-14px', opacity: 0.85 }}
              />
              <h1
                style={{ fontSize: 'clamp(2.625rem, calc(-1rem + 11.7vw), 3.5rem)', lineHeight: 0.78, letterSpacing: '-0.04em' }}
                className="font-bold"
              >
                <span className="block relative" style={{ width: 'fit-content', maxWidth: '100%' }}>
                  <SplitText type="chars" delay={0.25}>Nikhil</SplitText>
                  {/* Underline — hand-drawn tapered brush stroke under "Nikhil" only,
                      followed by a one-time shine sweep once the stroke finishes drawing. */}
                  <motion.svg
                    viewBox="60 3 775 29"
                    initial={{ clipPath: 'inset(0 100% 0 0)' }}
                    animate={{ clipPath: 'inset(0 0% 0 0)' }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.7 }}
                    style={{ display: 'block', width: '100%', height: 'auto', marginTop: '0px' }}
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="underline-shine-mobile" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="42%" stopColor="#2563EB" />
                        <stop offset="50%" stopColor="#bfdcff" />
                        <stop offset="58%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#2563EB" />
                        {/* Sweeps left-to-right over 1.1s, then holds off-screen for the
                            rest of a 2s cycle before repeating — so the shine passes
                            over the underline once every 2 seconds, indefinitely. */}
                        <animateTransform
                          attributeName="gradientTransform"
                          type="translate"
                          keyTimes="0; 0.55; 1"
                          values="-1 0; 1 0; 1 0"
                          begin="1.5s"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="
                        M 34 30
                        C 30 21, 160 10, 270 9.5
                        C 350 9, 439 12, 500 30
                        C 452 25, 50 9.0, 270 24.5
                        C 290 24.5, 96 23.5, 14 29
                        Z
                      "
                      fill="url(#underline-shine-mobile)"
                    />
                  </motion.svg>
                </span>
                <span className="block relative" style={{ width: 'fit-content', maxWidth: '100%' }}>
                  <SplitText type="chars" delay={0.35} charClassName="gradient-text">Paharia</SplitText>
                  {/* Paint drops — above the last "a" in Paharia */}
                  <span
                    className="paint-drops"
                    style={{ position: 'absolute', top: '-10px', right: '-14px', pointerEvents: 'none', zIndex: 10, transformOrigin: 'center' }}
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 22" fill="none" className="w-6 h-5 sm:w-7 sm:h-6">
                      <path d="M3 2 C3 6 1 10 3 14 C4 16 6 16 7 14 C8 10 6 6 3 2Z" fill="#1d6feb" opacity="0.92" style={{ transformOrigin:'5px 8px', transform:'rotate(165deg)' }} />
                      <path d="M11 2 C11 6 9 10 11 14 C12 16 14 16 15 14 C16 10 14 6 11 2Z" fill="#1d6feb" opacity="0.85" style={{ transformOrigin:'13px 8px', transform:'rotate(165deg)' }} />
                      <path d="M19 2 C19 6 17 10 19 14 C20 16 22 16 23 14 C24 10 22 6 19 2Z" fill="#1d6feb" opacity="0.75" style={{ transformOrigin:'21px 8px', transform:'rotate(165deg)' }} />
                    </svg>
                  </span>
                </span>
              </h1>
            </motion.div>

            {/* Tagline — "Full-Stack Developer & Video Editor" as one
                hand-written line (matching the desktop tagline treatment).
                Placed above the location line per request. */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.5 }}
              className="relative inline-block mb-2"
              style={{ transform: 'rotate(-1.5deg)' }}
            >
              <p
                className="text-slate-800"
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontWeight: 700,
                  fontSize: 'clamp(1.05rem, 5vw, 1.4rem)',
                  letterSpacing: '0.3px',
                }}
              >
                Full-Stack Developer <span className="text-primary">&</span> Video Editor
              </p>
              <svg
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute left-0 w-full"
                style={{ bottom: '-4px', height: '8px' }}
              >
                <motion.path
                  d="M3 6 Q40 1 78 6 T153 6 T228 5 T297 7"
                  fill="none"
                  stroke="#1d6feb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.85 }}
                  transition={{ delay: 0.75, duration: 0.7, ease: "easeOut" }}
                />
              </svg>
            </motion.div>

            {/* Location line — small paper-airplane accent added to match
                the desktop version, sized down and tucked to the right of
                "to the world" so it doesn't crowd the narrow column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative mb-2"
              style={{ paddingRight: '40px' }}
            >
              <div className="flex items-center gap-0.5 flex-wrap">
                <RiMapPinLine className="text-primary text-sm sm:text-base flex-shrink-0" />
                <p style={{ fontSize: 'clamp(0.68rem, 2.6vw, 0.85rem)' }} className="text-slate-700 font-medium flex items-center gap-1 flex-wrap">
                  <span className="whitespace-nowrap">From the Hills of</span>
                  <span className="relative inline-block assam-text gradient-text font-bold whitespace-nowrap" style={{ fontSize: '1.7em', lineHeight: 1, paddingBottom: '4px' }}>
                    Assam
                    <svg viewBox="5 0 58 5" fill="none" aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 4, width: '100%' }}>
                      <path d="M1 3 Q29 -1 76 3" stroke="#1d6feb" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </p>
              </div>
              <p style={{ fontSize: 'clamp(0.68rem, 2.6vw, 0.85rem)', marginLeft: '1.1em' }} className="text-slate-700 font-medium">
                to the world
              </p>

              {/* Real-transparency paper airplane, subtle float-in */}
              <motion.img
                src={cleanPaperPlane}
                alt=""
                aria-hidden="true"
                className="absolute pointer-events-none select-none w-14 sm:w-16"
                style={{ right: '-18px', top: '-22px' }}
                initial={{ opacity: 0, y: rm ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.7 }}
              />
            </motion.div>

            {/* Bio — width capped so it wraps into readable multi-word
                lines and stays clear of the portrait's face area, never
                one/two words per line */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.36, duration: 0.6 }}
              className="flex gap-2 mb-2"
              style={{ maxWidth: 'min(64vw, 250px)' }}
            >
              <div className="w-[3px] rounded-full bg-primary flex-shrink-0 self-stretch" />
              <p style={{ fontSize: 'clamp(0.72rem, 2.8vw, 0.85rem)', lineHeight: 1.35 }} className="text-slate-600">
                I build fast, modern and scalable web experiences that help businesses grow and stand out.
              </p>
            </motion.div>

            {/* Capabilities — bullet role list, stacked vertically (one per
                line) with icons restored to original size */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col items-start gap-1 mb-3"
            >
              <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium whitespace-nowrap" style={{ fontSize: 'clamp(0.66rem, 2.4vw, 0.78rem)' }}>
                <RiCodeSSlashLine className="text-primary flex-shrink-0" /> Full-Stack Developer
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium whitespace-nowrap" style={{ fontSize: 'clamp(0.66rem, 2.4vw, 0.78rem)' }}>
                <RiVideoLine className="text-primary flex-shrink-0" /> Video Editor
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium whitespace-nowrap" style={{ fontSize: 'clamp(0.66rem, 2.4vw, 0.78rem)' }}>
                <RiPencilLine className="text-primary flex-shrink-0" /> Digital Creator
              </span>
            </motion.div>

            {/* CTA Buttons — "Hire Me" pill + round icon-only "Work" button.
                Both comfortably tappable (≥46px). Sits on z-10 with a solid/
                blurred background so it stays fully legible even where the
                portrait passes behind it. */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.5 }}
              className="relative z-10 flex items-center gap-2.5 mb-1"
            >
              <Magnetic range={60} strength={0.35} scaleHover={1.03}>
                <a
                  href="#contact"
                  className="relative overflow-hidden cta-pulse inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-5 rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(29,111,235,0.45)] transition-shadow duration-300"
                  style={{ fontSize: 'clamp(0.78rem, 2.8vw, 0.88rem)', height: '46px' }}
                >
                  <span className="cta-shimmer absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: 'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)' }} />
                  <RiSendPlaneLine className="flex-shrink-0 plane-wiggle" /> Hire Me <RiArrowRightLine className="flex-shrink-0 arrow-nudge" />
                </a>
              </Magnetic>

              <Magnetic range={60} strength={0.35} scaleHover={1.03}>
                <a
                  href="#projects"
                  aria-label="View Projects"
                  className="relative overflow-hidden inline-flex flex-col items-center justify-center gap-0.5 bg-white/90 backdrop-blur border border-blue-200 text-primary font-semibold rounded-full hover:bg-blue-50 transition-colors duration-300 flex-shrink-0"
                  style={{ width: '54px', height: '54px' }}
                >
                  <RiFolderOpenLine className="flex-shrink-0 folder-bounce" style={{ fontSize: '16px' }} />
                  <span style={{ fontSize: '8.5px' }}>Work</span>
                </a>
              </Magnetic>
            </motion.div>

          </motion.div>

          {/* ── Portrait — same real desktop portrait + brushstroke +
              orbit tech icons + Assam location card, absolutely positioned
              toward the right/center so it reads large and important
              (never tiny), overlapping the brushstroke behind it. Kept
              behind the text (z-0) and clamped so nothing ever crosses the
              viewport edge or covers the face/heading. ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease: "easeOut" }}
            className="absolute z-0 pointer-events-none"
            style={{
              width: 'clamp(329px, 92vw, 345px)',
              top: 'clamp(36px, 8vw, 42px)',
              right: '-21%',
            }}
          >
            {/* Soft glow behind the portrait to blend its white background
                into the tea-garden/brush backdrop (no new assets needed) */}
            <div
              className="absolute rounded-full"
              style={{
                inset: '-8%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0) 72%)',
                filter: 'blur(6px)',
                zIndex: 0,
              }}
              aria-hidden="true"
            />

            {/* Brush stroke — behind the portrait, diagonal sweep echoing desktop */}
            <motion.img
              src={brushStroke}
              alt=""
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.9, ease: "easeOut" }}
              className="absolute pointer-events-none select-none z-0"
              style={{
                width: '150%',
                top: '29%',
                left: '7%',
                transform: 'translate(-50%, 0) rotate(-7deg)',
              }}
            />

            {/* Orbit ring — a thin arc behind the React icon only */}
            <svg
              aria-hidden="true"
              className="absolute pointer-events-none z-0"
              style={{ width: '92%', height: 'auto', aspectRatio: '1/1', top: '-5%', left: '11%' }}
              viewBox="0 0 200 200"
            >
              <path d="M 20 100 A 80 80 0 0 1 140 25" fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            {/* Orbit badges — React sits just above/left of the portrait's
                head, briefcase/Node/Code stack down the right edge outside
                the portrait, all confined so nothing overflows the viewport
                or drifts over the face. */}
            <div className="absolute inset-0 pointer-events-none z-20" aria-hidden="true">
              <div className="orbit-bob-a absolute" style={{ top: '3%', left: '27%' }}>
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1, duration: 0.5, ease: "backOut" }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur border border-blue-100 shadow-md flex items-center justify-center">
                  <SiReact className="text-primary" style={{ fontSize: '15px' }} />
                </motion.div>
              </div>
              <div className="orbit-bob-b absolute" style={{ top: '20%', right: '19%' }}>
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.18, duration: 0.5, ease: "backOut" }} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur border border-blue-100 shadow-md flex items-center justify-center">
                  <SiNodedotjs className="text-green-500" style={{ fontSize: '14px' }} />
                </motion.div>
              </div>
              <div className="orbit-bob-c absolute" style={{ top: '49%', right: '19%' }}>
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3, duration: 0.5, ease: "backOut" }} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur border border-blue-100 shadow-md flex items-center justify-center">
                  <RiCodeSSlashLine className="text-slate-700" style={{ fontSize: '14px' }} />
                </motion.div>
              </div>
              <div className="orbit-bob-d absolute" style={{ top: '64%', right: '65%' }}>
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.42, duration: 0.5, ease: "backOut" }} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-yellow-400 shadow-md flex items-center justify-center">
                  <SiJavascript className="text-white" style={{ fontSize: '13px' }} />
                </motion.div>
              </div>
            </div>

            {/* Portrait — same untouched desktop asset, full width of this block */}
            <div className="relative z-10 w-full">
              <motion.div
                initial={{ opacity: 0, y: rm ? 0 : 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: rm ? 0.3 : 0.9, delay: 0.35, ease: "easeOut" }}
              >
                <img
                  src={desktopPortrait}
                  alt="Nikhil Paharia"
                  className="w-full h-auto object-contain"
                  style={{ filter: 'drop-shadow(0 20px 28px rgba(15,23,42,0.25))' }}
                />
              </motion.div>

              {/* Assam location card — pinned to the portrait's own bottom
                  edge, kept within the viewport (right: 0, not negative)
                  and away from the text column. */}
              <motion.div
                initial={{ opacity: 0, y: rm ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.6, ease: "easeOut" }}
                className="absolute z-20 pointer-events-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-blue-100/70 rounded-xl px-2 py-1.5"
                style={{
                  bottom: '7%',
                  right: '24%',
                  maxWidth: '140px',
                  boxShadow: '0 10px 26px rgba(29,111,235,0.16), 0 0 0 1px rgba(29,111,235,0.06)',
                }}
              >
                <img src={assamMapImg} alt="" aria-hidden="true" className="w-5 h-5 sm:w-7 sm:h-7 object-contain flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[8px] sm:text-[10px] font-bold text-foreground flex items-center gap-1 leading-tight whitespace-nowrap">
                    From Assam <span className="w-1 h-1 rounded-full bg-primary inline-block flex-shrink-0" />
                  </p>
                  <p className="text-[6.5px] sm:text-[8px] text-slate-500 leading-snug whitespace-nowrap">Inspired by nature</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          </div>


          {/* Stats — 4 cards, same as desktop, wrapped in a single white
              rounded card (matches the reference's stat panel) instead of
              floating individually over the landscape background */}
          <div className="relative z-20 grid grid-cols-4 gap-0 bg-white rounded-2xl shadow-lg mt-3 overflow-hidden divide-x divide-slate-100">
            {desktopStats.map(({ value, label, Icon, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: rm ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center text-center py-2 px-1"
              >
                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mb-1 flex-shrink-0" style={{ backgroundColor: color + '18' }}>
                  <Icon style={{ color, fontSize: '10px' }} />
                </div>
                <div className="font-bold leading-tight text-foreground whitespace-nowrap" style={{ fontSize: 'clamp(0.68rem, 3vw, 1rem)' }}>
                  <StatCounter value={value} />
                </div>
                <div className="text-slate-500 font-medium leading-tight mt-0.5" style={{ fontSize: 'clamp(0.44rem, 1.7vw, 0.6rem)' }}>{label}</div>
              </motion.div>
            ))}
          </div>

          {/* Let's Connect + socials — centered below the stats card, no box,
              matching the reference */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col items-center gap-1.5 mt-3"
          >
            <p style={{ fontFamily: "'Caveat',cursive", fontSize: '20px', color: '#1d6feb', fontWeight: 700 }} className="relative">
              Let's Connect
              <svg viewBox="0 0 120 8" fill="none" style={{ width: '70px', margin: '0 auto', display: 'block' }} aria-hidden="true">
                <path d="M2 3 Q60 -1 118 3" stroke="#1d6feb" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </p>
            <div className="flex items-center gap-2 flex-nowrap justify-center">
              {socials.map((s, i) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.05 }}
                  className={`w-8 h-8 rounded-full bg-white border border-blue-100 flex items-center justify-center hover:border-primary transition-all duration-200 text-sm shadow-sm flex-shrink-0 ${s.color}`}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Scroll indicator — compact, sits inside the normal flow right
              after the social row so it never overlaps content even when
              the Hero is trimmed to exactly one screen. */}
          <div className="flex flex-col items-center gap-0.5 mt-2 animate-bounce">
            <span className="text-[9px] text-slate-500 tracking-widest uppercase font-mono">Scroll</span>
            <RiArrowDownLine className="text-primary text-sm" />
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════
            DESKTOP HERO (1024px and up) — fully independent markup.
            The mobile grid above is `lg:hidden`; this block is `hidden`
            below `lg:`, so mobile/tablet renders exactly as before and
            never downloads any of these desktop-only images.
            Sizes below intentionally use fixed lg:/xl:/2xl: breakpoint
            classes rather than vw-based fluid clamps, because the content
            container is capped at max-w-7xl (1280px) — vw units would keep
            growing past that cap on wide monitors and overflow their box.
           ═══════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid grid-cols-12 gap-6 xl:gap-10 items-center min-h-screen py-16">

          {/* Flight path — subtle dotted trail that carries the paper
              airplane's storytelling from the Assam/location line toward
              the portrait, staying secondary to the text and figure */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <motion.path
              d="M 33 45 Q 46 35 59 47"
              fill="none"
              stroke="#1d6feb"
              strokeWidth="0.15"
              strokeDasharray="1.1 1.6"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ delay: 1.0, duration: 1.4, ease: "easeOut" }}
            />
          </svg>

          {/* ── LEFT: content ── */}
          <motion.div
            initial={{ opacity: 0, x: rm ? 0 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: rm ? 0.3 : 0.7, ease: "easeOut" }}
            className="col-span-5 relative z-20"
          >
            {/* Availability pill */}
            <motion.div
              initial={{ opacity: 0, y: rm ? 0 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-blue-200 rounded-full px-4 py-1.5 mb-4 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest whitespace-nowrap">Available for Hire</span>
            </motion.div>

            {/* Hi, I'm */}
            <motion.p
              initial={{ opacity: 0, x: rm ? 0 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16, duration: 0.6 }}
              className="text-foreground font-bold mb-1 text-3xl xl:text-4xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Hi, I'm
            </motion.p>

            {/* Name + hand-drawn underline + three-strokes accent */}
            <motion.div
              initial={{ opacity: 0, x: rm ? 0 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.65 }}
              className="relative mb-2"
              style={{ display: 'inline-block', maxWidth: '100%' }}
            >
              <img
                src={threeStrokes}
                alt=""
                aria-hidden="true"
                className="absolute pointer-events-none select-none w-9 xl:w-11"
                style={{ top: '-16px', right: '-24px', opacity: 0.85 }}
              />
              <h1
                className="font-bold text-4xl xl:text-5xl 2xl:text-6xl"
                style={{ lineHeight: 1.0, letterSpacing: '-0.02em' }}
              >
                <SplitText type="chars" delay={0.3} className="gradient-text">Nikhil Paharia</SplitText>
              </h1>
              <motion.svg
                viewBox="60 4 640 29"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.85 }}
                style={{ display: 'block', width: '100%', maxWidth: '340px', height: 'auto', marginTop: '3px' }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="underline-shine-desktop" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="42%" stopColor="#2563EB" />
                    <stop offset="50%" stopColor="#bfdcff" />
                    <stop offset="58%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#2563EB" />
                    {/* Sweeps left-to-right over 1.1s, then holds off-screen for the
                        rest of a 2s cycle before repeating — so the shine passes
                        over the underline once every 2 seconds, indefinitely. */}
                    <animateTransform
                      attributeName="gradientTransform"
                      type="translate"
                      keyTimes="0; 0.55; 1"
                      values="-1 0; 1 0; 1 0"
                      begin="1.65s"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M 34 30 C 30 21, 160 10, 270 9.5 C 350 9, 439 12, 500 30 C 452 25, 50 9.0, 270 24.5 C 290 24.5, 96 23.5, 14 29 Z"
                  fill="url(#underline-shine-desktop)"
                />
              </motion.svg>
            </motion.div>

            {/* Subtitle — hand-written signature style (Caveat cursive),
                matching the handwritten tagline used elsewhere in the Hero,
                with a hand-drawn wavy underline beneath it */}
            <motion.div
              initial={{ opacity: 0, y: rm ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.55 }}
              className="relative inline-block mb-4"
              style={{ transform: 'rotate(-1.5deg)' }}
            >
              <p
                className="flex items-center gap-2 text-slate-800"
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontWeight: 700,
                  fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)',
                  letterSpacing: '0.3px',
                }}
              >
                Full-Stack Developer <span className="text-primary">&</span> Video Editor
              </p>
              {/* Hand-drawn wavy underline */}
              <svg
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute left-0 w-full"
                style={{ bottom: '-6px', height: '10px' }}
              >
                <motion.path
                  d="M3 6 Q40 1 78 6 T153 6 T228 5 T297 7"
                  fill="none"
                  stroke="#1d6feb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.85 }}
                  transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
                />
              </svg>
            </motion.div>

            {/* Location line */}
            <motion.div
              initial={{ opacity: 0, x: rm ? 0 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative mb-4"
              style={{ paddingRight: '64px' }}
            >
              <div className="flex items-center gap-1 flex-wrap">
                <RiMapPinLine className="text-primary flex-shrink-0 text-lg" />
                <p className="text-slate-700 font-medium flex items-center gap-2 flex-wrap text-base xl:text-lg">
                  <span className="whitespace-nowrap">From the Hills of</span>
                  <span className="relative inline-block assam-text gradient-text font-bold whitespace-nowrap" style={{ fontSize: '1.85em', lineHeight: 1, paddingBottom: '4px' }}>
                    Assam
                    <svg viewBox="5 0 58 5" fill="none" aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 4, width: '100%' }}>
                      <path d="M1 3 Q29 -1 76 3" stroke="#1d6feb" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="whitespace-nowrap">to the world</span>
                </p>
              </div>

              {/* Real-transparency paper airplane, subtle float-in */}
              <motion.img
                src={cleanPaperPlane}
                alt=""
                aria-hidden="true"
                className="absolute pointer-events-none select-none w-32 xl:w-36"
                style={{ right: '-56px', top: '-42px' }}
                initial={{ opacity: 0, y: rm ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.7 }}
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: rm ? 0 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.46, duration: 0.6 }}
              className="flex gap-3 mb-4 max-w-md"
            >
              <div className="w-[3px] rounded-full bg-primary flex-shrink-0 self-stretch" />
              <p className="text-slate-600 leading-relaxed text-base">
                I build fast, modern and scalable web experiences that help businesses grow and stand out.
              </p>
            </motion.div>

            {/* Capabilities */}
            <motion.div
              initial={{ opacity: 0, y: rm ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.5 }}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5"
            >
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 font-medium whitespace-nowrap">
                <RiCodeSSlashLine className="text-primary flex-shrink-0" /> Full-Stack Developer
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 font-medium whitespace-nowrap">
                <RiVideoLine className="text-primary flex-shrink-0" /> Video Editor
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 font-medium whitespace-nowrap">
                <RiPencilLine className="text-primary flex-shrink-0" /> Digital Creator
              </span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: rm ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58, duration: 0.5 }}
              className="flex items-center gap-4 mb-6"
            >
              <Magnetic range={60} strength={0.35} scaleHover={1.03}>
                <a
                  href="#contact"
                  className="relative overflow-hidden cta-pulse inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-8 rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(29,111,235,0.45)] hover:-translate-y-0.5 transition-all duration-300"
                  style={{ fontSize: '0.95rem', height: '54px' }}
                >
                  <span className="cta-shimmer absolute inset-0 pointer-events-none" aria-hidden="true" />
                  <RiSendPlaneLine className="flex-shrink-0" /> Hire Me <RiArrowRightLine className="flex-shrink-0 arrow-nudge" />
                </a>
              </Magnetic>
              <Magnetic range={60} strength={0.35} scaleHover={1.03}>
                <a
                  href="#projects"
                  className="relative overflow-hidden inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur border border-blue-200 text-primary font-bold px-8 rounded-full hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-300"
                  style={{ fontSize: '0.95rem', height: '54px' }}
                >
                  <RiFolderOpenLine className="flex-shrink-0" /> View My Work
                </a>
              </Magnetic>
            </motion.div>

            {/* Social */}
            <motion.div
              initial={{ opacity: 0, y: rm ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.64, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="flex-shrink-0 leading-none">
                <p style={{ fontFamily: "'Caveat',cursive", fontSize: '15px', color: '#1d6feb', lineHeight: 1.1, fontWeight: 700 }}>Let's</p>
                <p style={{ fontFamily: "'Caveat',cursive", fontSize: '15px', color: '#1d6feb', lineHeight: 1.1, fontWeight: 700 }}>Connect</p>
              </div>
              <div className="flex items-center gap-2.5">
                {socials.map((s, i) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.92 }}
                    initial={{ opacity: 0, y: rm ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    className={`w-9 h-9 rounded-full bg-white/85 backdrop-blur border border-blue-100 flex items-center justify-center hover:border-primary transition-colors duration-200 text-base shadow-sm flex-shrink-0 ${s.color}`}
                  >
                    {s.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: portrait + orbit + Assam card + stat cards ── */}
          <div className="col-span-7 relative flex items-stretch gap-3 xl:gap-6">

            {/* Portrait visual area */}
            <div className="relative flex-1 flex items-center justify-center min-h-[480px] xl:min-h-[560px] 2xl:min-h-[620px]">

              {/* Oval landscape — subtle secondary depth layer, sized off its
                  own (relatively-positioned) container so it can't bleed
                  past it at any breakpoint */}
              <motion.img
                src={ovalLandscape}
                alt=""
                aria-hidden="true"
                initial={{ opacity: 2 }}
                animate={{ opacity: 2.2 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="absolute pointer-events-none select-none object-contain"
                style={{ width: '82%', left: '10%', bottom: '-2%' }}
              />

              {/* Brush stroke — widened and rotated so it reads as one diagonal
                  sweep from the white left area toward the tea garden, rather
                  than a separate horizontal patch. Stays behind the portrait. */}
              <motion.img
                src={brushStroke}
                alt=""
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 0.85, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.9, ease: "easeOut" }}
                className="absolute pointer-events-none select-none w-[420px] xl:w-[540px] 2xl:w-[640px] z-0"
                style={{ top: '36%', left: '2%', transform: 'rotate(-7deg)' }}
              />

              {/* Orbit ring — subtle dotted/dashed path only, sized to sit
                  just outside the enlarged portrait */}
              <svg
                aria-hidden="true"
                className="absolute pointer-events-none w-[320px] h-[320px] xl:w-[400px] xl:h-[400px] 2xl:w-[470px] 2xl:h-[470px]"
                viewBox="0 0 200 200"
                style={{ opacity: 0.7 }}
              >
                <circle cx="100" cy="100" r="94" fill="none" stroke="#1d6feb" strokeOpacity="0.28" strokeWidth="1" strokeDasharray="3 6" />
              </svg>

              {/* Orbit badges — React / Node / JS / </>, 4 max per spec.
                  Each icon is PARKED at a fixed quadrant (not continuously
                  orbiting), so it can never drift over the face. Only a
                  small idle bob (a few px) is applied, and it's applied to
                  a wrapping div so it never fights the icon's own entrance
                  animation. */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="orbit-bob-a absolute" style={{ top: '20%', left: '6%' }}>
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1, duration: 0.5, ease: "backOut" }} className="w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-blue-100 shadow-md flex items-center justify-center">
                    <SiReact className="text-primary" style={{ fontSize: '18px' }} />
                  </motion.div>
                </div>
                <div className="orbit-bob-b absolute" style={{ top: '30%', right: '7%' }}>
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.22, duration: 0.5, ease: "backOut" }} className="w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-blue-100 shadow-md flex items-center justify-center">
                    <SiNodedotjs className="text-green-500" style={{ fontSize: '18px' }} />
                  </motion.div>
                </div>
                <div className="orbit-bob-c absolute" style={{ bottom: '7%', left: '2%' }}>
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.34, duration: 0.5, ease: "backOut" }} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-blue-100 shadow-md flex items-center justify-center">
                    <SiJavascript className="text-yellow-400" style={{ fontSize: '16px' }} />
                  </motion.div>
                </div>
                <div className="orbit-bob-d absolute" style={{ bottom: '12%', right: '2%' }}>
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.46, duration: 0.5, ease: "backOut" }} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-blue-100 shadow-md flex items-center justify-center">
                    <RiCodeSSlashLine className="text-slate-700" style={{ fontSize: '16px' }} />
                  </motion.div>
                </div>
              </div>

              {/* Portrait — untouched supplied asset. Sized up further
                  (~13% on top of the previous pass) and shifted further
                  left so the person clearly reads bigger than the
                  landscape. Head stays clear of the navbar and orbit
                  icons; nothing is cropped. */}
              <div className="relative z-0 w-[320px] xl:w-[400px] 2xl:w-[480px]" style={{ transform: 'translate(5%, 5%)' }}>
                <motion.div
                  initial={{ opacity: 0, y: rm ? 0 : 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: rm ? 0.3 : 0.9, delay: 0.35, ease: "easeOut" }}
                >
                  <img
                    src={desktopPortrait}
                    alt="Nikhil Paharia"
                    className="w-full h-auto object-contain"
                    style={{ filter: 'drop-shadow(0 30px 40px rgba(15,23,42,0.28))' }}
                  />
                </motion.div>
              </div>

              {/* Assam location card — moved off the detached bottom-left
                  spot onto the portrait's lower-right / torso-bottom area,
                  as a premium floating glass card with a subtle blue glow */}
              <motion.div
                initial={{ opacity: 0, y: rm ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
                className="absolute z-20 flex items-center gap-3 bg-white/75 backdrop-blur-md border border-blue-100/70 rounded-2xl px-4 py-3 max-w-[250px]"
                style={{ right: '2%', bottom: '8%', boxShadow: '0 12px 32px rgba(29,111,235,0.16), 0 0 0 1px rgba(29,111,235,0.06)' }}
              >
                <img src={assamMapImg} alt="" aria-hidden="true" className="w-12 h-12 object-contain flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    From Assam, India <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  </p>
                  <p className="text-xs text-slate-500 leading-snug">Inspired by nature, driven by code.</p>
                </div>
              </motion.div>
            </div>

            {/* Stat cards — 4 per spec, stacked, far right */}
            <motion.div
              initial={{ opacity: 0, x: rm ? 0 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
              className="flex flex-col gap-3 xl:gap-4 justify-center flex-shrink-0 w-[148px] xl:w-[168px]"
            >
              {desktopStats.map(({ value, label, Icon, color, bg }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: rm ? 0 : 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.1, duration: 0.5, type: "spring", stiffness: 160 }}
                  whileHover={{ scale: 1.05, x: -4 }}
                  className={`bg-gradient-to-br ${bg} border border-white/80 backdrop-blur rounded-2xl px-3.5 py-3 xl:px-4 xl:py-3.5 shadow-md flex items-center gap-2.5`}
                >
                  <div className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18' }}>
                    <Icon style={{ color, fontSize: '16px' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base xl:text-lg font-bold leading-none mb-0.5" style={{ color }}>
                      <StatCounter value={value} />
                    </div>
                    <div className="text-[10px] xl:text-[11px] font-semibold text-slate-700 leading-tight">{label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>

      {/* Scroll indicator — desktop: absolutely pinned to the bottom of the
          (screen-height) section. Mobile has its own compact copy inside
          the normal content flow (see below) so it can never overlap the
          social row when the Hero is trimmed to exactly one screen. */}
      <div className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-slate-500 tracking-widest uppercase font-mono">Scroll</span>
        <RiArrowDownLine className="text-primary text-xl" />
      </div>
    </section>
  );
}
