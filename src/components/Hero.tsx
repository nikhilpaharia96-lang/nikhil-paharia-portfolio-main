import { RiArrowRightLine, RiArrowDownLine, RiMapPinLine, RiCodeSSlashLine, RiVideoLine, RiPencilLine, RiSendPlaneLine, RiFolderOpenLine, RiFolderChartLine, RiGroupLine, RiTimeLine } from "react-icons/ri";
import { SiReact, SiNodedotjs, SiJavascript, SiTailwindcss } from "react-icons/si";
import { FaGithub, FaLinkedinIn, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import profileImg from "../assets/images/profile-nobg.webp";
import teaBg from "../assets/images/tea-sunset-landscape.webp";
import SplitText from "@/components/ui/SplitText";
import Magnetic from "@/components/ui/Magnetic";

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


const stats = [
  { value: "96+",   label: "Projects",   sub: "Completed",  Icon: RiFolderChartLine, color: "#1d6feb", bg: "from-blue-50 to-blue-100/60" },
  { value: "30+",   label: "Happy",      sub: "Clients",    Icon: RiGroupLine,        color: "#7c3aed", bg: "from-violet-50 to-violet-100/60" },
  { value: "1096+", label: "Days",       sub: "Experience", Icon: RiTimeLine,         color: "#0891b2", bg: "from-cyan-50 to-cyan-100/60" },
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

  const rawPlaneY  = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 1, 0]);

  const springCfg = { stiffness: 80, damping: 20, mass: 0.8 };
  const planeY   = useSpring(rawPlaneY,  springCfg);

  // NOTE: the hero background must never move on scroll — no parallax, no
  // translateY, no scale. It's rendered as a plain, non-motion, absolutely
  // positioned layer below (see "Fixed background" comment).


  /* ── Scroll-direction tracking — drives CTA converge AND the LHS/RHS cloud crossover ── */
  const { scrollY: pageScrollY } = useScroll();
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const lastScrollY = useRef(0);
  useMotionValueEvent(pageScrollY, "change", (latest) => {
    const diff = latest - lastScrollY.current;
    if (Math.abs(diff) > 4) {
      // Only react to scroll direction while the Hero section itself is still
      // in view (i.e. hasn't fully scrolled past yet) — once the user has
      // scrolled below Hero, the crossover stops responding.
      if (scrollYProgress.get() < 1) {
        setIsScrollingUp(diff < 0);
      }
      lastScrollY.current = latest;
    }
  });

  const cloudTransition = { layout: { type: "spring" as const, stiffness: 35, damping: 16, mass: 1.4 } };
  const cloudLeft = (
    <motion.img
      key="cloud-left"
      layout
      transition={cloudTransition}
      src={cloudImg}
      alt=""
      className="w-44 sm:w-72 lg:w-96 select-none pointer-events-none opacity-70"
    />
  );
  const cloudRight = (
    <motion.img
      key="cloud-right"
      layout
      transition={cloudTransition}
      src={cloudImg}
      alt=""
      className="w-44 sm:w-72 lg:w-96 select-none pointer-events-none opacity-70"
    />
  );

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden w-full max-w-full section-wrap" id="home">

      {/* Fixed background — absolutely positioned, filling the Hero section's own
          bounds (the section is exactly viewport height), with zero scroll-linked
          transform. It never moves; only the foreground content above it scrolls.
          This intentionally is NOT `background-attachment: fixed` (that's the classic
          iOS Safari jank/repaint trap) — it's a plain absolute layer, GPU-cheap and
          jitter-free on both iOS Safari and Android Chrome. */}
      <div className="absolute inset-0 z-0">
        <img src={teaBg} alt="" className="w-full h-full object-cover" style={{ filter: 'brightness(0.95) saturate(0.9)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-white/45 via-white/20 to-blue-50/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-white/15" />
      </div>


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

        /* circular GPU-accelerated orbits for tech bubbles */
        @keyframes orbit-react {
          from { transform: rotate(0deg) translate3d(70px, 0, 0) rotate(0deg); }
          to   { transform: rotate(360deg) translate3d(70px, 0, 0) rotate(-360deg); }
        }
        @keyframes orbit-node {
          from { transform: rotate(90deg) translate3d(85px, 0, 0) rotate(-90deg); }
          to   { transform: rotate(450deg) translate3d(85px, 0, 0) rotate(-450deg); }
        }
        @keyframes orbit-js {
          from { transform: rotate(180deg) translate3d(75px, 0, 0) rotate(-180deg); }
          to   { transform: rotate(540deg) translate3d(75px, 0, 0) rotate(-540deg); }
        }
        @keyframes orbit-tailwind {
          from { transform: rotate(270deg) translate3d(80px, 0, 0) rotate(-270deg); }
          to   { transform: rotate(630deg) translate3d(80px, 0, 0) rotate(-630deg); }
        }

        .orbit-icon-1 { animation: orbit-react 22s linear infinite !important; }
        .orbit-icon-2 { animation: orbit-node 28s linear infinite !important; }
        .orbit-icon-3 { animation: orbit-js 25s linear infinite !important; }
        .orbit-icon-4 { animation: orbit-tailwind 32s linear infinite !important; }


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

        /* ── Recurring shine sweep on the profile photo — same look as the one-shot
           light-sweep on load, but loops every 4.5s so the photo keeps "catching light" */
        @keyframes profileShine {
          0%   { transform: translateX(-160%) skewX(-20deg); }
          35%  { transform: translateX(160%) skewX(-20deg); }
          100% { transform: translateX(160%) skewX(-20deg); }
        }
        .profile-shine {
          animation: profileShine 4.5s ease-in-out infinite;
          animation-delay: 2.2s; /* start once the initial cinematic reveal has finished */
        }

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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-6">
        <div className="grid lg:grid-cols-[1fr_auto_auto] gap-6 lg:gap-12 items-center pt-24 pb-16 lg:pt-0 lg:pb-0 lg:min-h-screen">

          {/* ── LEFT: Text Content — order-2 on mobile (below profile) ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 lg:order-1 text-left w-full min-w-0"
          >
            {/* Available for Hire badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest whitespace-nowrap">𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗳𝗼𝗿 𝗛𝗶𝗿𝗲</span>
            </motion.div>

            {/* Hi, I'm */}
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.02em' }}
              className="text-foreground font-bold mb-1"
            >
              <SplitText type="chars" delay={0.1}>Hi, I'm</SplitText>
            </motion.p>

            {/* Name block — underline only under "Nikhil", paint drops above last "a" of Paharia */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.65 }}
              className="relative ul-wrap mb-4"
              style={{ display: 'inline-block', maxWidth: '100%' }}
            >
              {/* Paint drops — above the last "a" in Paharia (right side of name) */}
              <span
                className="paint-drops"
                style={{ position: 'absolute', top: '-10px', right: '-4px', pointerEvents: 'none', zIndex: 10, transformOrigin: 'center' }}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 22"
                  fill="none"
                  className="w-9 h-6 sm:w-5 sm:h-5 lg:w-6 lg:h-[22px]"
                >
                  <path d="M3 2 C3 6 1 10 3 14 C4 16 6 16 7 14 C8 10 6 6 3 2Z" fill="#1d6feb" opacity="0.92" style={{ transformOrigin:'5px 8px', transform:'rotate(165deg)' }} />
                  <path d="M11 2 C11 6 9 10 11 14 C12 16 14 16 15 14 C16 10 14 6 11 2Z" fill="#1d6feb" opacity="0.85" style={{ transformOrigin:'13px 8px', transform:'rotate(165deg)' }} />
                  <path d="M19 2 C19 6 17 10 19 14 C20 16 22 16 23 14 C24 10 22 6 19 2Z" fill="#1d6feb" opacity="0.75" style={{ transformOrigin:'21px 8px', transform:'rotate(165deg)' }} />
                </svg>
              </span>

              {/* Name */}
              <h1
  style={{ fontSize: 'clamp(2.4rem, 7.5vw, 5rem)', lineHeight: 1.0, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}
  className="font-bold"
>
  <SplitText type="chars" delay={0.25} className="gradient-text">Nikhil Paharia</SplitText>
</h1>


              {/* Underline — hand-drawn tapered brush stroke, draws on with a left-to-right reveal */}
              <motion.svg
                viewBox="60 4 640 29"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.7 }}
                style={{ display: 'block', width: '100%', maxWidth: '420px', height: 'auto', marginTop: '4px' }}
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
                  fill="#2563EB"
                />
              </motion.svg>
            </motion.div>

            {/* Cursive tagline — typewriter reveal with animated underline swoop */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.6 }}
              className="mb-3"
            >
              <svg
                viewBox="0 21 596 70"
                className="tagline-svg"
                style={{ width: '100%', maxWidth: '480px', height: 'auto', display: 'block' }}
                aria-label="Full-Stack Developer & Creative Developer"
              >
                <TaglineTyping text="Full-Stack Developer & Video Editor" />

                {/* subtle hand-drawn underline swoop, draws on after typing complete */}
                <motion.path
                  d="M4 58 Q160 49 350 60 T696 36"
                  stroke="#1a1a1a"
                  strokeWidth="1.73"
                  strokeLinecap="round"
                  fill="none"
                  opacity="1.85"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 2.3, duration: 0.8, ease: "easeOut" }}
                />
              </svg>
            </motion.div>


            {/* Location line + paper airplane */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative mb-5"
              style={{ paddingRight: '90px' }}
            >
              {/* Location text */}
              <div className="flex items-center gap-0.5 flex-wrap">
                <RiMapPinLine className="text-primary text-base sm:text-lg flex-shrink-0" />
                <p style={{ fontSize: 'clamp(0.85rem, 2vw, 1.15rem)' }} className="text-slate-700 font-medium flex items-center gap-1 sm:gap-2 flex-wrap">
                  <span className="whitespace-nowrap">𝑭𝒓𝒐𝒎 𝒕𝒉𝒆 𝑯𝒊𝒍𝒍𝒔 𝒐𝒇</span>
                  <span className="relative inline-block assam-text gradient-text font-bold whitespace-nowrap" style={{ fontSize: '1.96em', lineHeight: 1, paddingBottom: '5px' }}>
                    Assam
                    <svg viewBox="5 0 58 5" fill="none" aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 4, width: '100%' }}>
                      <path d="M1 3 Q29 -1 76 3" stroke="#1d6feb" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="whitespace-nowrap">𝒕𝒐 𝒕𝒉𝒆 𝒘𝒐𝒓𝒍𝒅</span>
                </p>
              </div>

              {/* Paper airplane — S-curve trail + sketch plane, absolutely positioned */}
              <motion.div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: '-30px',
                  top: '-55px',
                  y: planeY,
                  opacity: rawOpacity,
                  pointerEvents: 'none',
                }}
              >
                <svg
                  width="200" height="115"
                  viewBox="5 0 200 115"
                  fill="none"
                  overflow="visible"
                  className="scale-[0.7] sm:scale-[0.85] lg:scale-100 origin-bottom-left"
                >
                  {/* ── S-curve dashed trail ── */}
                  <path
                    d="M 8 100 C 28 105 52 112 72 106 C 92 100 100 84 118 66 C 136 48 152 30 172 18"
                    stroke="#1d6feb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="6 6"
                    fill="none"
                    className="trail-path"
                  />

                  {/* ── Sketch-style paper airplane at tip of trail ── */}
                  <g transform="translate(179,18) rotate(7)" className="plane-bob plane-glow">
                    <path d="M 0 0 L -32 14 L -22 20 Z"
                      stroke="#1d6feb" strokeWidth="2" strokeLinejoin="round"
                      fill="rgba(255,255,255,0.55)" />
                    <path d="M 0 0 L -32 14 L -26 24 Z"
                      stroke="#1d6feb" strokeWidth="2" strokeLinejoin="round"
                      fill="rgba(29,111,235,0.08)" />
                    <line x1="0" y1="0" x2="-22" y2="20"
                      stroke="#1d6feb" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="-22" y1="20" x2="-26" y2="24"
                      stroke="#1d6feb" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
                    <line x1="-10" y1="5" x2="-16" y2="8"
                      stroke="#1d6feb" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
                    <line x1="-18" y1="9" x2="-24" y2="13"
                      stroke="#1d6feb" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
                  </g>
                </svg>
              </motion.div>
            </motion.div>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.36, duration: 0.6 }}
              className="flex gap-3 mb-5 max-w-lg"
            >
              <div className="w-[3px] rounded-full bg-primary flex-shrink-0 self-stretch" />
              <p style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1rem)' }} className="text-slate-600 leading-relaxed">
                𝗜 𝗯𝘂𝗶𝗹𝗱 𝗳𝗮𝘀𝘁, 𝗺𝗼𝗱𝗲𝗿𝗻 𝗮𝗻𝗱 𝘀𝗰𝗮𝗹𝗮𝗯𝗹𝗲 𝘄𝗲𝗯 𝗲𝘅𝗽𝗲𝗿𝗶𝗲𝗻𝗰𝗲𝘀 𝘁𝗵𝗮𝘁 𝗵𝗲𝗹𝗽 𝗯𝘂𝘀𝗶𝗻𝗲𝘀𝘀𝗲𝘀 𝗴𝗿𝗼𝘄 𝗮𝗻𝗱 𝘀𝘁𝗮𝗻𝗱 𝗼𝘂𝘁.
              </p>
            </motion.div>

            {/* Roles */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.5 }}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6"
            >
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 font-medium whitespace-nowrap">
                <RiCodeSSlashLine className="text-primary flex-shrink-0" /> 𝐅𝐮𝐥𝐥-𝐒𝐭𝐚𝐜𝐤 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 font-medium whitespace-nowrap">
                <RiVideoLine className="text-primary flex-shrink-0" /> 𝐕𝐢𝐝𝐞𝐨 𝐄𝐝𝐢𝐭𝐨𝐫
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 font-medium whitespace-nowrap">
                <RiPencilLine className="text-primary flex-shrink-0" /> 𝐃𝐢𝐠𝐢𝐭𝐚𝐥 𝐂𝐫𝐞𝐚𝐭𝐨𝐫
              </span>
            </motion.div>

            {/* CTA Buttons — static split, LHS/RHS, now with idle pulse/shimmer effects */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.5 }}
              className="flex items-center justify-between mb-7 w-full"
            >
              <Magnetic range={60} strength={0.35} scaleHover={1.03}>
                <a
                  href="#contact"
                  className="relative overflow-hidden cta-pulse inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-8 rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(29,111,235,0.45)] transition-shadow duration-300"
                  style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', height: '56px' }}
                >
                  <span className="cta-shimmer absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: 'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)' }} />
                  <RiSendPlaneLine className="flex-shrink-0 plane-wiggle" /> Hire Me <RiArrowRightLine className="flex-shrink-0 arrow-nudge" />
                </a>
              </Magnetic>
              
              <Magnetic range={60} strength={0.35} scaleHover={1.03}>
                <a
                  href="#projects"
                  className="relative overflow-hidden inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur border border-blue-200 text-primary font-bold px-8 rounded-full hover:bg-blue-50 transition-colors duration-300 mr-3 sm:mr-4"
                  style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', height: '56px' }}
                >
                  <span className="cta-shimmer absolute inset-0 pointer-events-none" aria-hidden="true" />
                  <RiFolderOpenLine className="flex-shrink-0 folder-bounce" /> View Projects
                </a>
              </Magnetic>
            </motion.div>


            {/* Social Dock — centered on mobile, no overflow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.54, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 bg-white/70 backdrop-blur border border-blue-100 rounded-2xl px-4 sm:px-5 py-3 w-full sm:w-auto"
            >
              <div className="flex-shrink-0">
                <p style={{ fontFamily:"'Caveat',cursive", fontSize:'14px', color:'#1d6feb', lineHeight:1.2, fontWeight:700 }}>Let's ←</p>
                <p style={{ fontFamily:"'Caveat',cursive", fontSize:'14px', color:'#1d6feb', lineHeight:1.2, fontWeight:700 }}>Connect</p>
                <svg viewBox="0 0 44 6" fill="none" style={{ width:'40px', marginTop:'2px' }} aria-hidden="true">
                  <line x1="0" y1="1.5" x2="44" y2="1.5" stroke="#1d6feb" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="0" y1="4.5" x2="44" y2="4.5" stroke="#1d6feb" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
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
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className={`w-7 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-blue-100 flex items-center justify-center hover:border-primary transition-all duration-200 text-sm sm:text-base shadow-sm flex-shrink-0 ${s.color}`}
                  >
                    {s.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Stats — 3 equal columns, mobile only */}
            <div className="grid grid-cols-3 gap-3 mt-6 lg:hidden">
              {stats.map(({ value, label, sub, Icon, color, bg }) => (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.04 }}
                  className={`bg-gradient-to-br ${bg} border border-white/80 backdrop-blur rounded-2xl p-3 flex flex-col items-center text-center shadow-sm`}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1.5" style={{ backgroundColor: color + '20' }}>
                    <Icon style={{ color, fontSize: '16px' }} />
                  </div>
                  <div className="font-bold leading-tight" style={{ color, fontSize: 'clamp(1rem, 4.5vw, 1.3rem)' }}>
                    <StatCounter value={value} />
                  </div>
                  <div className="text-slate-700 font-semibold leading-tight mt-0.5" style={{ fontSize: 'clamp(0.58rem, 2vw, 0.7rem)' }}>{label}</div>

                  <div className="text-slate-400" style={{ fontSize: 'clamp(0.52rem, 1.8vw, 0.62rem)' }}>{sub}</div>
                </motion.div>
              ))}
            </div>

          </motion.div>

          {/* ── CENTER: Profile Image — cinematic reveal transformation (matches uploaded reference video) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease: "easeOut" }}
            className="order-1 lg:order-2 flex justify-center items-center w-full"
          >
            <div className="relative mx-auto" style={{ width: 'clamp(180px, 52vw, 380px)', height: 'clamp(220px, 63vw, 460px)' }}>

              {/* Ambient glow blob behind — soft bloom, like the video's backlight */}
              <div
                className="absolute inset-[-30px] rounded-[40%_60%_55%_45%] bg-gradient-to-br from-sky-200/35 via-primary/20 to-blue-300/30 blur-3xl animate-pulse"
                style={{ animationDuration: '6s' }}
              />

              {/* Blue rim light — left side, fades in after the sweep passes */}
              <div
                className="rim-blue absolute inset-[-18px] rounded-[40%_60%_55%_45%] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 15% 50%, rgba(59,130,246,0.55), transparent 60%)',
                  filter: 'blur(18px)',
                  zIndex: 5,
                }}
                aria-hidden="true"
              />
              {/* Orange rim light — right side */}
              <div
                className="rim-orange absolute inset-[-18px] rounded-[40%_60%_55%_45%] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 85% 50%, rgba(249,115,22,0.4), transparent 60%)',
                  filter: 'blur(18px)',
                  zIndex: 5,
                }}
                aria-hidden="true"
              />

              {/* Rotating gradient border ring */}
              <div className="absolute inset-[-4px] rounded-[40%_60%_55%_45%] border-2 border-transparent"
                style={{ background:'linear-gradient(white,white) padding-box, linear-gradient(90deg,transparent 30%,rgba(29,111,235,0.5) 50%,transparent 70%) border-box', animation:'spin 10s linear infinite' }} />

              {/* Glass base */}
              <div className="absolute inset-0 rounded-[38%_62%_55%_45%] bg-white/60 backdrop-blur-sm border-2 border-white/80 shadow-[0_8px_48px_rgba(29,111,235,0.25)]" />

              {/* Photo — clipped to the same blob shape, with cinematic reveal + light sweep + idle float */}
              <div className="absolute inset-0 rounded-[38%_62%_55%_45%] overflow-hidden" style={{ zIndex: 10 }}>
                <img
                  src={profileImg}
                  alt="Nikhil"
                  className="w-full h-full object-cover object-center"
                  style={{ animation: 'cinematicReveal 1.6s cubic-bezier(0.22,1,0.36,1) forwards, floatY 6s ease-in-out infinite 1.6s' }}
                />
                <div className="light-sweep" aria-hidden="true" />
                <div
                  className="profile-shine"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 20,
                    pointerEvents: 'none',
                    background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.75) 50%, rgba(180,210,255,0.45) 54%, transparent 65%)',
                    mixBlendMode: 'screen',
                  }}
                />
              </div>

              {/* Recurring soft glow pulse around the blob — sits outside the clip so the glow isn't cut off */}
              <div className="profile-glow rounded-[38%_62%_55%_45%]" aria-hidden="true" style={{ zIndex: 11 }} />

              <div className="absolute bottom-[-2px] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent blur-sm" style={{ zIndex: 15 }} />

              {/* Tech icon bubbles — delayed so they appear after the reveal finishes */}
              {[
                { Icon: SiReact,       color: "text-primary",    size: "text-base lg:text-lg",   pos: "absolute -top-3 -left-3 w-8 h-8 lg:w-10 lg:h-10",       dur:'3s',   delay:'0s'   },
                { Icon: SiNodedotjs,   color: "text-green-500",  size: "text-lg lg:text-xl",     pos: "absolute top-1/4 -right-4 lg:-right-5 w-9 h-9 lg:w-11 lg:h-11", dur:'4s', delay:'1s' },
                { Icon: SiJavascript,  color: "text-yellow-400", size: "text-sm lg:text-base",   pos: "absolute bottom-10 -left-4 lg:-left-5 w-8 h-8 lg:w-9 lg:h-9",  dur:'2.8s', delay:'0.5s' },
                { Icon: SiTailwindcss, color: "text-cyan-500",   size: "text-sm lg:text-base",   pos: "absolute -bottom-2 right-3 lg:right-4 w-8 h-8 lg:w-10 lg:h-10", dur:'3.5s', delay:'1.5s' },
              ].map(({ Icon, color, size, pos, dur, delay }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.7 + i * 0.12, duration: 0.5, ease: "backOut" }}
                  whileHover={{ scale: 1.25, rotate: 10 }}
                  className={`${pos} bg-white/90 backdrop-blur border border-blue-100 shadow-md rounded-full flex items-center justify-center z-30`}
                  style={{ animation:`floatY ${dur} ease-in-out infinite ${delay}` }}
                >
                  <Icon className={`${color} ${size}`} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT: Stat Cards — desktop only ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
            className="order-3 hidden lg:flex flex-col gap-4 self-stretch justify-center"
          >
            {stats.map(({ value, label, sub, Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5, type: "spring", stiffness: 160 }}
                whileHover={{ scale: 1.05, x: -4 }}
                className={`bg-gradient-to-br ${bg} border border-white/80 backdrop-blur rounded-2xl px-5 py-4 shadow-md flex items-center gap-4 min-w-[150px]`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18' }}>
                  <Icon style={{ color, fontSize: '20px' }} />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground leading-none mb-0.5" style={{ color }}>
                    <StatCounter value={value} />
                  </div>

                  <div className="text-xs font-semibold text-slate-700">{label}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{sub}</div>
                  <div className="flex gap-1 mt-1.5">
                    <div className="h-0.5 w-6 rounded-full" style={{ backgroundColor: color }} />
                    <div className="h-0.5 w-3 rounded-full opacity-40" style={{ backgroundColor: color }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-slate-500 tracking-widest uppercase font-mono">Scroll</span>
        <RiArrowDownLine className="text-primary text-xl" />
      </div>
    </section>
  );
}
