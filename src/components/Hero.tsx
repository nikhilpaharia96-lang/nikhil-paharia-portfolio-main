import { RiArrowDownLine, RiMapPinLine, RiCodeSSlashLine, RiVideoLine, RiPencilLine, RiFolderChartLine, RiGroupLine, RiTimeLine, RiStarLine } from "react-icons/ri";
import { SiReact, SiNodedotjs, SiJavascript } from "react-icons/si";
import TechIcons from "@/components/TechIcons";
import FloatingParticles from "@/components/FloatingParticles";
import ParallaxLandscape from "@/components/ParallaxLandscape";
import { desktopMasks, mobileMasks } from "@/components/parallaxMasks";
import "@/components/brush-reveal.css";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, useInView, useReducedMotion } from "@/lib/static-motion";
import { useRef, useState, useEffect } from "react";
import teaBg from "../assets/images/file_0000000066b08207b18b1ec1e8269869.png";
import teaBgMobile from "../assets/images/tea-brush-mobile.webp";
import SplitText from "@/components/ui/SplitText";
import HeroCTAs from "@/components/HeroCTA";
import { DesktopStats, MobileStats } from "@/components/HeroStats";
import SocialLinks from "@/components/SocialLinks";
import FloatingLeaves from "@/components/FloatingLeaves";
import PortraitFX from "@/components/PortraitFX";

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

import cloudImg from "../assets/images/cloud2.895414a23f99e60c66ea.webp";

function TaglineTyping({ text }: { text: string }) {
  // Static: the full tagline is rendered immediately (no typing effect).
  const displayed = text;

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

// Shared between mobile (2x2 grid) and desktop (stacked column) Hero layouts
// so both surfaces show the exact same four stats.
const desktopStats = [
  { value: "96+",   label: "Projects Completed",     Icon: RiFolderChartLine, color: "#1d6feb", bg: "from-blue-50 to-blue-100/60" },
  { value: "30+",   label: "Happy Clients",          Icon: RiGroupLine,       color: "#7c3aed", bg: "from-violet-50 to-violet-100/60" },
  { value: "1096+", label: "Days of Experience",     Icon: RiTimeLine,        color: "#0891b2", bg: "from-cyan-50 to-cyan-100/60" },
  { value: "100%",  label: "Commitment to Quality",  Icon: RiStarLine,        color: "#d97706", bg: "from-amber-50 to-amber-100/60" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // NOTE: this section used to also compute a scroll-linked flying-plane
  // animation here (scrollVelocity + 4 useSpring-driven transforms for the
  // plane's position/rotation/scale + 2 opacity transforms). The plane is
  // now a simple one-time float-in on mount (see the <motion.img
  // src={cleanPaperPlane} .../> below, driven by initial/animate/transition,
  // not by scroll) — but those old scroll-linked hooks were left behind
  // unused. Each of the 4 useSpring calls runs its own continuous
  // requestAnimationFrame physics loop for as long as scrollYProgress is
  // actively changing, i.e. on every scroll frame while Hero is in view,
  // for zero visual effect (nothing ever read their output). Removed as
  // dead weight competing with native touch scrolling for main-thread time
  // during exactly the section where that's most likely to be felt.

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

  // Crossover effect, WITHOUT ever reordering the DOM or using Framer
  // Motion's `layout` prop. Each cloud has one fixed DOM slot (left/right)
  // for its entire lifetime; "crossing over" is done by animating `x` to
  // shift it to the opposite slot's position instead of swapping array
  // order. `layout` FLIP animations force a synchronous getBoundingClientRect
  // measurement on every reorder, and that measurement running mid-swipe on
  // mobile was stalling the momentum scroll for a frame or two — the exact
  // "first couple of swipes barely move, then it's smooth" symptom. A plain
  // `x` transform animation never triggers a layout reflow, so it can run
  // freely during a scroll fling with zero risk of stealing main-thread time
  // from it, however many times direction flips.
  const cloudCrossoverTransition = { type: "spring" as const, stiffness: 35, damping: 16, mass: 1.4 };
  const cloudLeft = (
    <motion.img
      key="cloud-left"

      animate={{ opacity: 0.7, x: isScrollingUp ? "calc(100% + 2rem)" : 0 }}

      src={cloudImg}
      alt=""
      className="w-44 sm:w-72 lg:w-96 select-none pointer-events-none"
    />
  );
  const cloudRight = (
    <motion.img
      key="cloud-right"

      animate={{ opacity: 0.7, x: isScrollingUp ? "calc(-100% - 2rem)" : 0 }}

      src={cloudImg}
      alt=""
      className="w-44 sm:w-72 lg:w-96 select-none pointer-events-none"
    />
  );


  return (
    <section ref={ref} className="relative lg:min-h-screen flex items-start lg:items-center overflow-hidden w-full max-w-full section-wrap" id="home">

      {/* Background with scroll parallax — MOBILE/TABLET ONLY, untouched */}
      <motion.div style={{ y: smoothBgY }} className="absolute inset-0 z-0 lg:hidden">
        <ParallaxLandscape src={teaBgMobile} position="center" filter="brightness(0.97) saturate(0.95)" masks={mobileMasks} />
        <div className="absolute inset-0 bg-gradient-to-r from-white/45 via-white/20 to-blue-50/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-white/15" />
      </motion.div>

      {/* Background — DESKTOP ONLY (1024px+). Uses the "Desktop Background 01"
          composition (white-left / tea-garden-right) once that asset is
          re-uploaded; see the desktopBg note near the imports above. */}
      <motion.div style={{ y: smoothBgY }} className="absolute inset-0 z-0 hidden lg:block">
        <ParallaxLandscape src={desktopBg} position="68% 50%" filter="brightness(0.97) saturate(0.92)" masks={desktopMasks} />
        {/* Minimal left-side readability scrim only — the real background
            already bakes its own white-left area in, so this stays light
            and will likely shrink further (or be removed) once swapped in. */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
      </motion.div>


      {/* Fog orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/15 rounded-full blur-[120px]" style={{ }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky-200/20 rounded-full blur-[100px]" style={{ }} />
      </div>

      {/* Particles — small blue dots drifting slowly */}
      <FloatingParticles />

      {/* Sunlit dust — tiny blue + white specks floating on the landscape side */}
      <FloatingParticles variant="dust" count={30} />

      {/* Cloud photo — sits at the bottom of Hero itself (not a separate
          section below it), so it's visible within the opening scene, near
          its lower edge. Spans the full width of the section on both mobile
          and desktop, and animates in on first load. */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-[1] w-full pointer-events-none"

        animate={{ opacity: 1, y: 0 }}

      >
        <img
          src={cloudPhoto}
          alt=""
          className="w-full h-24 sm:h-32 lg:h-40 object-cover select-none"
        />
      </motion.div>

      {/* Decorative side clouds — LHS/RHS, vertically centered in the middle of the Hero section;
          cross over to opposite sides (slowly) on scroll-up, reverse on scroll-down.
          Both stay in fixed DOM slots — see cloudLeft/cloudRight above for why
          (no `layout` FLIP / DOM reordering, so this never blocks a scroll fling). */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 flex justify-between px-1 sm:px-4 pointer-events-none overflow-hidden">
        {cloudLeft}
        {cloudRight}
      </div>

      {/* Cinematic falling leaves — behind all hero content (z-5 vs content z-10), never blocks clicks */}
      <FloatingLeaves />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
        .assam-text { font-family: 'Caveat', cursive; }

        
        .ul-svg {  }
        .ul-wrap:hover .ul-svg { filter: drop-shadow(0 0 10px rgba(29,111,235,1)) !important;  }
        
        .ul-shine { stroke-dasharray:220; stroke-dashoffset:220;   }

        
        
        .paint-drops {  }

        
        
        .trail-path { stroke-dasharray: 320; stroke-dashoffset: 320;  }
        
        .plane-bob {  }
        
        .plane-glow {  }

        
        .tagline-svg {  }

        /* Fixed-quadrant idle bobs for the tech icon badges — small vertical
           drift only, so each icon stays parked in its assigned corner
           (never sweeps across the face like a full orbit would) */
        
        
        
        

        .orbit-bob-a {  }
        .orbit-bob-b {  }
        .orbit-bob-c {  }
        .orbit-bob-d {  }


        /* ── Cinematic profile reveal (matches the uploaded reference video) ── */
        
        .light-sweep {
          position: absolute; inset: 0; z-index: 20; pointer-events: none;
          background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.85) 48%, rgba(180,210,255,0.55) 52%, transparent 65%);
          transform: translateX(-140%);
          mix-blend-mode: screen;
        }
        
        
        .rim-blue {  }
        .rim-orange {  }

        /* ── Recurring glow pulse — soft breathing glow around the profile photo ── */
        .profile-glow {
          position: absolute; inset: 0; z-index: 21; pointer-events: none;
          box-shadow: 0 0 25px 6px rgba(59,130,246,0.35), 0 0 55px 18px rgba(29,111,235,0.18);
        }
        

        /* ── CTA button idle effects ── */
        
        .cta-pulse {  }

        
        .cta-shimmer {
          background: linear-gradient(100deg, transparent 30%, rgba(29,111,235,0.18) 50%, transparent 70%);
          transform: translateX(-120%);
        }

        
        .arrow-nudge { display:inline-block;  }

        
        .plane-wiggle { display:inline-block;  }

        
        .folder-bounce { display:inline-block;  }
      `}</style>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-6">
        <div className="lg:hidden pt-[6.25rem] sm:pt-[6.75rem] pb-4 relative">

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

            animate={{ opacity: 1, x: 0 }}

            className="relative z-10 text-left"
          >
            {/* Available for Hire badge */}
            <motion.div

              animate={{ opacity: 1, y: 0 }}

              className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur border border-blue-200 rounded-full px-2.5 sm:px-3.5 py-1 mb-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400  flex-shrink-0" />
              <span className="text-[9px] sm:text-[11px] font-mono text-primary uppercase tracking-widest whitespace-nowrap">Available for Hire</span>
            </motion.div>

            {/* Hi, I'm */}
            <motion.p

              animate={{ opacity: 1, x: 0 }}

              style={{ fontSize: 'clamp(1.375rem, 5vw, 1.75rem)', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.02em' }}
              className="text-foreground font-bold mb-0.5"
            >
              <SplitText type="chars" delay={0.1}>Hi, I'm</SplitText>
            </motion.p>

            {/* Name block — underline only under "Nikhil", three-strokes accent above last "a" of Paharia.
                Sized to land at ~42–56px across the 320–430px mobile range while
                never overflowing the viewport (clamp caps both ends). */}
            <motion.div

              animate={{ opacity: 1, x: 0 }}

              className="relative ul-wrap mb-2"
              style={{ display: 'inline-block', maxWidth: '100%' }}
            >
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

                    animate={{ clipPath: 'inset(0 0% 0 0)' }}

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
                  {/* Three-strokes accent — above the last "a" in Paharia,
                      replacing the old paint-drops decoration */}
                  <img
                    src={threeStrokes}
                    alt=""
                    aria-hidden="true"
                    className="brush-reveal brush-reveal--accent absolute pointer-events-none select-none w-6"
                    style={{ top: '-14px', right: '-14px', opacity: 0.85, zIndex: 10 }}
                  />
                </span>
              </h1>
            </motion.div>

            {/* Tagline — "Full-Stack Developer & Video Editor" as one
                hand-written line (matching the desktop tagline treatment).
                Placed above the location line per request. */}
            <motion.div

              animate={{ opacity: 1, y: 0 }}

              className="relative inline-block mb-2"
              style={{ transform: 'rotate(-1.5deg)' }}
            >
              <p
                className="text-slate-800"
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontWeight: 700,
                  fontSize: 'clamp(1.07rem, 4vw, 2.4rem)',
                  letterSpacing: '0.3px',
                }}
              >
                Full-Stack Developer <span className="text-primary">&</span> Video Editor
              </p>
              {/* Premium hand-drawn brush-stroke underline (mobile) — same
                  tapered ink shape as desktop, scaled down proportionally
                  via the SVG's own width/height so it never grows past the
                  text or touches the portrait on narrow screens. */}
              <svg
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute left-0 w-full"
                style={{ bottom: '-3px', height: '8px' }}
              >
                <defs>
                  <linearGradient id="tagline-brush-mobile" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1546c4" />
                    <stop offset="45%" stopColor="#1d6feb" />
                    <stop offset="100%" stopColor="#3d8bff" stopOpacity="0.75" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M 3 7.2 C 3 5.3 4.6 4.1 8.4 4.3 C 46 5.4 96 3.7 151 4.6 C 197 5.4 233 6.9 262 8.4 C 277 9.1 289 9.6 297 9.9 C 291 10.3 282 10.2 272 9.7 C 245 8.4 205 7.2 160 7 C 105 6.7 55 8.4 8.4 9.6 C 4.6 9.8 3 8.8 3 7.2 Z"
                  fill="url(#tagline-brush-mobile)"

                  animate={{ clipPath: 'inset(0 0% 0 0)' }}

                />
                {/* Subtle secondary thin stroke — light hand-redrawn flick */}
                <motion.path
                  d="M 10 9.9 C 22 11.1 38 11.3 52 10.7"
                  fill="none"
                  stroke="#1d6feb"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity={0.35}

                  animate={{ pathLength: 1, opacity: 0.35 }}

                />
              </svg>
            </motion.div>

            {/* Location line — small paper-airplane accent added to match
                the desktop version, sized down and tucked to the right of
                "to the world" so it doesn't crowd the narrow column */}
            <motion.div

              animate={{ opacity: 1, x: 0 }}

              className="relative mb-2"
              style={{ paddingRight: '30px' }}
            >
              <div className="flex items-center gap-0.5 flex-wrap">
                <RiMapPinLine className="text-primary text-sm sm:text-base flex-shrink-0" />
                <p style={{ fontSize: 'clamp(0.68rem, 2.6vw, 0.85rem)' }} className="text-slate-700 font-medium flex items-center gap-1 flex-wrap">
                  <span className="whitespace-nowrap">𝑭𝒓𝒐𝒎 𝒕𝒉𝒆 𝑯𝒊𝒍𝒍𝒔 𝒐𝒇</span>
                  <span className="relative inline-block assam-text gradient-text font-bold whitespace-nowrap" style={{ fontSize: '1.7em', lineHeight: 1, paddingBottom: '4px' }}>
                    Assam
                    <svg viewBox="5 0 58 5" fill="none" aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 4, width: '100%' }}>
                      <path d="M1 3 Q29 -1 76 3" stroke="#1d6feb" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </p>
              </div>
              <p style={{ fontSize: 'clamp(0.68rem, 2.6vw, 0.85rem)', marginLeft: '1.1em' }} className="text-slate-700 font-medium">
                𝒕𝒐 𝒕𝒉𝒆 𝒘𝒐𝒓𝒍𝒅
              </p>

              {/* Real-transparency paper airplane, subtle float-in */}
              <motion.img
                src={cleanPaperPlane}
                alt=""
                aria-hidden="true"
                className="absolute pointer-events-none select-none w-29 sm:w-26"
                style={{ right: '145px', top: '-11px' }}

                animate={{ opacity: 1, y: 0 }}

              />
            </motion.div>

            {/* Bio — width capped so it wraps into readable multi-word
                lines and stays clear of the portrait's face area, never
                one/two words per line */}
            <motion.div

              animate={{ opacity: 1, x: 0 }}

              className="flex gap-2 mb-2 rounded-xl bg-white/70 backdrop-blur-[3px] px-2 py-1.5 shadow-[0_2px_12px_-6px_rgba(18,102,241,0.25)]"
              style={{ maxWidth: 'min(64vw, 250px)' }}
            >
              <div className="w-[3px] rounded-full bg-primary flex-shrink-0 self-stretch" />
              <p style={{ fontSize: 'clamp(0.72rem, 2.8vw, 0.85rem)', lineHeight: 1.35 }} className="text-slate-800">
                𝗜 𝗯𝘂𝗶𝗹𝗱 𝗳𝗮𝘀𝘁, 𝗺𝗼𝗱𝗲𝗿𝗻 𝗮𝗻𝗱 𝘀𝗰𝗮𝗹𝗮𝗯𝗹𝗲 𝘄𝗲𝗯 𝗲𝘅𝗽𝗲𝗿𝗶𝗲𝗻𝗰𝗲𝘀 𝘁𝗵𝗮𝘁 𝗵𝗲𝗹𝗽 𝗯𝘂𝘀𝗶𝗻𝗲𝘀𝘀𝗲𝘀 𝗴𝗿𝗼𝘄 𝗮𝗻𝗱 𝘀𝘁𝗮𝗻𝗱 𝗼𝘂𝘁.
              </p>
            </motion.div>

            {/* Capabilities — bullet role list, stacked vertically (one per
                line) with icons restored to original size */}
            <motion.div

              animate={{ opacity: 1, y: 0 }}

              className="flex flex-col items-start gap-1 mb-3"
            >
              <span className="inline-flex items-center gap-1.5 text-slate-800 font-medium whitespace-nowrap bg-white/70 backdrop-blur-[3px] rounded-full pl-1.5 pr-2.5 py-0.5" style={{ fontSize: 'clamp(0.66rem, 2.4vw, 0.78rem)' }}>
                <RiCodeSSlashLine className="text-primary flex-shrink-0" /> 𝐅𝐮𝐥𝐥-𝐒𝐭𝐚𝐜𝐤 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-800 font-medium whitespace-nowrap bg-white/70 backdrop-blur-[3px] rounded-full pl-1.5 pr-2.5 py-0.5" style={{ fontSize: 'clamp(0.66rem, 2.4vw, 0.78rem)' }}>
                <RiVideoLine className="text-primary flex-shrink-0" /> 𝐕𝐢𝐝𝐞𝐨 𝐄𝐝𝐢𝐭𝐨𝐫
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-800 font-medium whitespace-nowrap bg-white/70 backdrop-blur-[3px] rounded-full pl-1.5 pr-2.5 py-0.5" style={{ fontSize: 'clamp(0.66rem, 2.4vw, 0.78rem)' }}>
                <RiPencilLine className="text-primary flex-shrink-0" /> 𝐃𝐢𝐠𝐢𝐭𝐚𝐥 𝐂𝐫𝐞𝐚𝐭𝐨𝐫
              </span>
            </motion.div>

            {/* CTA Buttons — "Hire Me" pill + round icon-only "Work" button.
                Both comfortably tappable (≥46px). Sits on z-10 with a solid/
                blurred background so it stays fully legible even where the
                portrait passes behind it. */}
            <HeroCTAs variant="mobile" />

          </motion.div>

          {/* ── Portrait — same real desktop portrait + brushstroke +
              orbit tech icons + Assam location card, absolutely positioned
              toward the right/center so it reads large and important
              (never tiny), overlapping the brushstroke behind it. Kept
              behind the text (z-0) and clamped so nothing ever crosses the
              viewport edge or covers the face/heading. ── */}
          <motion.div

            animate={{ opacity: 1, scale: 1 }}

            className="absolute z-0 pointer-events-none"
            style={{
              width: 'clamp(329px, 92vw, 345px)',
              top: 'clamp(21px, 7vw, 49px)',
              right: '-26%',
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

              animate={{ opacity: 0.8, scale: 1 }}

              className="brush-reveal absolute pointer-events-none select-none z-0"
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
            <div className="absolute inset-0 pointer-events-none z-20">
              <TechIcons layout="mobile" />
            </div>

            {/* Portrait — same untouched desktop asset, full width of this block */}
            <div className="relative z-10 w-full">
              <PortraitFX src={desktopPortrait} alt="Nikhil Paharia" shadow="0 20px 28px rgba(15,23,42,0.25)" />
            </div>
          </motion.div>

          </div>


          {/* Stats — 4 cards, same as desktop, wrapped in a single white
              rounded card (matches the reference's stat panel) instead of
              floating individually over the landscape background */}
          <div className="relative">
            {/* From Assam badge — sits just above the stats panel on the right (never hidden behind it,
                clear of the CTA row; the map icon is dropped on very narrow screens to save room) */}
            <div
              className="absolute z-30 right-1 bottom-full mb-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-blue-100/70 rounded-xl px-2.5 max-[349px]:px-2 py-1.5"
              style={{ boxShadow: '0 10px 26px rgba(29,111,235,0.16), 0 0 0 1px rgba(29,111,235,0.06)' }}
            >
              <img src={assamMapImg} alt="" aria-hidden="true" className="hidden min-[350px]:block w-6 h-6 object-contain flex-shrink-0 mix-blend-multiply" />
              <div className="min-w-0">
                <p className="text-[10px] max-[349px]:text-[9px] sm:text-[11px] font-bold text-foreground flex items-center gap-1 leading-tight whitespace-nowrap">
                  From Assam <span className="w-1 h-1 rounded-full bg-primary inline-block flex-shrink-0" />
                </p>
                <p className="text-[8.5px] max-[349px]:text-[7.5px] sm:text-[9.5px] text-slate-500 leading-snug whitespace-nowrap">Inspired by nature</p>
              </div>
            </div>
            <MobileStats stats={desktopStats} />
          </div>

          {/* Let's Connect + socials — centered below the stats card, no box,
              matching the reference */}
          <motion.div

            animate={{ opacity: 1, y: 0 }}

            className="flex flex-col items-center gap-1.5 mt-3"
          >
            <p style={{ fontFamily: "'Caveat',cursive", fontSize: '20px', color: '#1d6feb', fontWeight: 700 }} className="relative">
              Let's Connect
              <svg viewBox="0 0 120 8" fill="none" style={{ width: '70px', margin: '0 auto', display: 'block' }} aria-hidden="true">
                <path d="M2 3 Q60 -1 118 3" stroke="#1d6feb" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </p>
            <SocialLinks variant="mobile" />
          </motion.div>

          {/* Scroll indicator — compact, sits inside the normal flow right
              after the social row so it never overlaps content even when
              the Hero is trimmed to exactly one screen. */}
          <div className="flex flex-col items-center gap-0.5 mt-2 ">
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

              animate={{ pathLength: 1, opacity: 0.4 }}

            />
          </svg>

          {/* ── LEFT: content ── */}
          <motion.div

            animate={{ opacity: 1, x: 0 }}

            className="col-span-5 relative z-20"
          >
            {/* Availability pill */}
            <motion.div

              animate={{ opacity: 1, y: 0 }}

              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-blue-200 rounded-full px-4 py-1.5 mb-4 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-green-400  flex-shrink-0" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest whitespace-nowrap">Available for Hire</span>
            </motion.div>

            {/* Hi, I'm */}
            <motion.p

              animate={{ opacity: 1, x: 0 }}

              className="text-foreground font-bold mb-1 text-3xl xl:text-4xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Hi, I'm
            </motion.p>

            {/* Name + hand-drawn underline + three-strokes accent */}
            <motion.div

              animate={{ opacity: 1, x: 0 }}

              className="relative mb-2"
              style={{ display: 'inline-block', maxWidth: '100%' }}
            >
              <img
                src={threeStrokes}
                alt=""
                aria-hidden="true"
                className="brush-reveal brush-reveal--accent absolute pointer-events-none select-none w-9 xl:w-11"
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

                animate={{ clipPath: 'inset(0 0% 0 0)' }}

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

              animate={{ opacity: 1, y: 0 }}

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
              {/* Premium hand-drawn brush-stroke underline — a single
                  filled, tapered ink shape (not a CSS line/border) so it
                  keeps a natural, organic pen-pressure feel at any width.
                  Rounded, confident stroke start; fine tapered tip at the
                  end; a subtle secondary thin flick adds a hand-redrawn
                  signature feel. Never overlaps the portrait — width is
                  bound to the text's own box (`w-full` of this wrapper). */}
              <svg
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute left-0 w-full"
                style={{ bottom: '-6px', height: '11px' }}
              >
                <defs>
                  <linearGradient id="tagline-brush-desktop" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1546c4" />
                    <stop offset="45%" stopColor="#1d6feb" />
                    <stop offset="100%" stopColor="#3d8bff" stopOpacity="0.75" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M 3 7.2 C 3 5.3 4.6 4.1 8.4 4.3 C 46 5.4 96 3.7 151 4.6 C 197 5.4 233 6.9 262 8.4 C 277 9.1 289 9.6 297 9.9 C 291 10.3 282 10.2 272 9.7 C 245 8.4 205 7.2 160 7 C 105 6.7 55 8.4 8.4 9.6 C 4.6 9.8 3 8.8 3 7.2 Z"
                  fill="url(#tagline-brush-desktop)"

                  animate={{ clipPath: 'inset(0 0% 0 0)' }}

                />
                {/* Subtle secondary thin stroke — a light hand-redrawn
                    flick near the start, for an authentic signature feel */}
                <motion.path
                  d="M 10 9.9 C 22 11.1 38 11.3 52 10.7"
                  fill="none"
                  stroke="#1d6feb"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity={0.35}

                  animate={{ pathLength: 1, opacity: 0.35 }}

                />
              </svg>
            </motion.div>

            {/* Location line */}
            <motion.div

              animate={{ opacity: 1, x: 0 }}

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

                animate={{ opacity: 1, y: 0 }}

              />
            </motion.div>

            {/* Description */}
            <motion.div

              animate={{ opacity: 1, x: 0 }}

              className="flex gap-3 mb-4 max-w-md"
            >
              <div className="w-[3px] rounded-full bg-primary flex-shrink-0 self-stretch" />
              <p className="text-slate-600 leading-relaxed text-base">
                I build fast, modern and scalable web experiences that help businesses grow and stand out.
              </p>
            </motion.div>

            {/* Capabilities */}
            <motion.div

              animate={{ opacity: 1, y: 0 }}

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
            <HeroCTAs variant="desktop" />

            {/* Social */}
            <motion.div

              animate={{ opacity: 1, y: 0 }}

              className="flex items-center gap-3"
            >
              <div className="flex-shrink-0 leading-none">
                <p style={{ fontFamily: "'Caveat',cursive", fontSize: '15px', color: '#1d6feb', lineHeight: 1.1, fontWeight: 700 }}>Let's</p>
                <p style={{ fontFamily: "'Caveat',cursive", fontSize: '15px', color: '#1d6feb', lineHeight: 1.1, fontWeight: 700 }}>Connect</p>
              </div>
              <SocialLinks variant="desktop" />
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

                animate={{ opacity: 2.2 }}

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

                animate={{ opacity: 0.85, scale: 1 }}

                className="brush-reveal absolute pointer-events-none select-none w-[420px] xl:w-[540px] 2xl:w-[640px] z-0"
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
              <div className="absolute inset-0 pointer-events-none">
                <TechIcons layout="desktop" />
              </div>

              {/* Portrait — untouched supplied asset. Sized up further
                  (~13% on top of the previous pass) and shifted further
                  left so the person clearly reads bigger than the
                  landscape. Head stays clear of the navbar and orbit
                  icons; nothing is cropped. */}
              <div className="relative z-0 w-[320px] xl:w-[400px] 2xl:w-[480px]" style={{ transform: 'translate(5%, 5%)' }}>
                <PortraitFX src={desktopPortrait} alt="Nikhil Paharia" shadow="0 30px 40px rgba(15,23,42,0.28)" />
              </div>

              {/* Assam location card — moved off the detached bottom-left
                  spot onto the portrait's lower-right / torso-bottom area,
                  as a premium floating glass card with a subtle blue glow */}
              <div
                className="absolute z-20 flex items-center gap-2.5 bg-white/80 backdrop-blur-md border border-blue-100/70 rounded-2xl px-3 py-2.5 max-w-[225px]"
                style={{ right: '-22%', bottom: '-2%', boxShadow: '0 12px 32px rgba(29,111,235,0.16), 0 0 0 1px rgba(29,111,235,0.06)' }}
              >
                <img src={assamMapImg} alt="" aria-hidden="true" className="w-9 h-9 object-contain flex-shrink-0 mix-blend-multiply" />
                <div>
                  <p className="text-[13px] font-bold text-foreground flex items-center gap-1.5 leading-tight">
                    From Assam, India <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">Inspired by nature, driven by code.</p>
                </div>
              </div>
            </div>

            {/* Stat cards — 4 per spec, stacked, far right */}
            <DesktopStats stats={desktopStats} />
          </div>

        </div>
      </div>

      {/* Scroll indicator — desktop: absolutely pinned to the bottom of the
          (screen-height) section. Mobile has its own compact copy inside
          the normal content flow (see below) so it can never overlap the
          social row when the Hero is trimmed to exactly one screen. */}
      <div className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2 ">
        <span className="text-xs text-slate-500 tracking-widest uppercase font-mono">Scroll</span>
        <RiArrowDownLine className="text-primary text-xl" />
      </div>
    </section>
  );
}
