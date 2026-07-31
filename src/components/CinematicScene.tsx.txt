/**
 * CinematicScene — the 12-layer Assam tea-garden sunrise environment behind the Hero.
 *
 * Every layer is its own component, its own z-index, and its own parallax "depth".
 * Depth drives two independent things at once, on two separate DOM nodes so the
 * transforms never fight each other:
 *
 *   1. MOUSE parallax — cheap, non-React, reads the same --mx/--my custom
 *      properties Hero.tsx already writes on the section root via rAF. A
 *      shared `.cine-layer` CSS rule multiplies them by --depth. Zero re-renders.
 *
 *   2. SCROLL "camera push" — a real Framer Motion transform (y + scale) driven
 *      by the scrollYProgress passed down from Hero, scaled by depth so far
 *      layers barely move and near layers push/zoom the most (dolly-in feel).
 *
 * Layers 1–9 render behind the main content (CinematicBackdrop).
 * Layers 11–12 render in front of it (CinematicForeground) — pointer-events-none,
 * so nothing ever becomes unclickable — anchored to the bottom edge so the tea
 * bushes naturally overlap the lower body of the portrait (Layer 10, in Hero.tsx).
 *
 * Respects prefers-reduced-motion (all animation/transition killed) and the
 * existing `useReducedFx` signal (fewer birds/particles on phones + low-end GPUs).
 */
import { motion, useTransform, type MotionValue } from "framer-motion";
import { useMemo } from "react";

interface SceneProps {
  scrollYProgress: MotionValue<number>;
  reducedFx?: boolean;
}

/* ── Shared depth wrapper: outer node = scroll dolly, inner node = mouse parallax ── */
function DepthLayer({
  depth,
  scrollYProgress,
  zIndex,
  className = "",
  scrollY = 46,
  scrollScale = 0.05,
  children,
}: {
  depth: number;
  scrollYProgress: MotionValue<number>;
  zIndex: number;
  className?: string;
  scrollY?: number;
  scrollScale?: number;
  children: React.ReactNode;
}) {
  const y = useTransform(scrollYProgress, [0, 1], [0, -depth * scrollY]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 + depth * scrollScale]);
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ y, scale, zIndex, willChange: "transform" }}
      aria-hidden="true"
    >
      <div className={`cine-layer w-full h-full ${className}`} style={{ ["--depth" as string]: depth }}>
        {children}
      </div>
    </motion.div>
  );
}

/* ── Layer 08: Birds — random paths, heights, speeds, directions ── */
const BIRD_CONFIGS = [
  { top: "18%", dur: 17, delay: 0, scale: 1,    reverse: false },
  { top: "26%", dur: 23, delay: 3, scale: 0.75, reverse: false },
  { top: "14%", dur: 20, delay: 7, scale: 0.6,  reverse: true  },
  { top: "33%", dur: 27, delay: 2, scale: 0.85, reverse: true  },
  { top: "22%", dur: 19, delay: 11, scale: 0.55, reverse: false },
];

function Bird({ top, dur, delay, scale, reverse }: (typeof BIRD_CONFIGS)[number]) {
  return (
    <div
      className="absolute left-0"
      style={{
        top,
        width: `${28 * scale}px`,
        height: `${14 * scale}px`,
        animation: `${reverse ? "cineBirdFlyReverse" : "cineBirdFly"} ${dur}s linear infinite`,
        animationDelay: `${delay}s`,
        transform: reverse ? "scaleX(-1)" : undefined,
      }}
    >
      <svg viewBox="0 0 40 20" className="w-full h-full overflow-visible">
        <path className="cine-wing-up" d="M2,14 Q10,2 20,10 Q30,2 38,14" fill="none" stroke="#3a2f26" strokeWidth="2.4" strokeLinecap="round" />
        <path className="cine-wing-down" d="M2,10 Q10,16 20,10 Q30,16 38,10" fill="none" stroke="#3a2f26" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ── Layer 09: Atmospheric particles — dust / pollen / tea leaves / light motes ── */
type ParticleKind = "dust" | "leaf" | "light";
const PARTICLE_CONFIGS: { left: string; size: number; dur: number; delay: number; kind: ParticleKind; dx: number }[] = [
  { left: "6%",  size: 5, dur: 13, delay: 0,   kind: "light", dx: 14 },
  { left: "14%", size: 3, dur: 10, delay: 2.2, kind: "dust",  dx: -10 },
  { left: "23%", size: 6, dur: 15, delay: 4.4, kind: "leaf",  dx: 18 },
  { left: "34%", size: 3, dur: 9,  delay: 1.1, kind: "dust",  dx: 8 },
  { left: "45%", size: 4, dur: 12, delay: 5.6, kind: "light", dx: -16 },
  { left: "55%", size: 6, dur: 17, delay: 0.6, kind: "leaf",  dx: 12 },
  { left: "64%", size: 3, dur: 11, delay: 3.3, kind: "dust",  dx: -14 },
  { left: "73%", size: 5, dur: 14, delay: 6.1, kind: "light", dx: 10 },
  { left: "82%", size: 6, dur: 16, delay: 2.8, kind: "leaf",  dx: -18 },
  { left: "90%", size: 3, dur: 10, delay: 4.9, kind: "dust",  dx: 12 },
  { left: "38%", size: 4, dur: 13.5, delay: 7.4, kind: "light", dx: -8 },
  { left: "78%", size: 3, dur: 9.5, delay: 8.2, kind: "dust", dx: 16 },
];
const PARTICLE_COLOR: Record<ParticleKind, string> = {
  dust: "rgba(255,255,255,0.55)",
  leaf: "#6f8f3f",
  light: "#ffd98a",
};

function Particle({ left, size, dur, delay, kind, dx }: (typeof PARTICLE_CONFIGS)[number]) {
  const style = {
    left,
    bottom: "-4%",
    width: size,
    height: kind === "leaf" ? size * 1.6 : size,
    background: PARTICLE_COLOR[kind],
    borderRadius: kind === "leaf" ? "0% 70% 0% 70%" : "50%",
    boxShadow: kind === "light" ? `0 0 ${size * 2}px ${size / 2}px rgba(255,217,138,0.5)` : "none",
    animation: `cineParticleDrift ${dur}s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    ["--pdx" as string]: `${dx}px`,
    ["--pop" as string]: kind === "dust" ? 0.5 : 0.75,
  } as React.CSSProperties;
  return <div className="absolute" style={style} />;
}

export function CinematicBackdrop({ scrollYProgress, reducedFx = false }: SceneProps) {
  const birds = useMemo(() => (reducedFx ? BIRD_CONFIGS.slice(0, 2) : BIRD_CONFIGS), [reducedFx]);
  const particles = useMemo(() => (reducedFx ? PARTICLE_CONFIGS.slice(0, 5) : PARTICLE_CONFIGS), [reducedFx]);

  return (
    <div className="absolute inset-0 overflow-hidden cine-root pointer-events-none" aria-hidden="true">
      {/* Layer 01 — SKY: sunrise gradient + soft drifting clouds */}
      <DepthLayer depth={0.15} scrollYProgress={scrollYProgress} zIndex={0} scrollY={20} scrollScale={0.02}>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <linearGradient id="cineSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bfe3ff" />
              <stop offset="38%" stopColor="#ffe3be" />
              <stop offset="72%" stopColor="#ffb578" />
              <stop offset="100%" stopColor="#ff9a56" />
            </linearGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#cineSky)" />
          <g className="cine-clouds" fill="#fff" opacity="0.35">
            <ellipse cx="220" cy="160" rx="140" ry="26" />
            <ellipse cx="330" cy="180" rx="100" ry="20" />
            <ellipse cx="980" cy="120" rx="160" ry="24" />
            <ellipse cx="1120" cy="145" rx="110" ry="18" />
            <ellipse cx="640" cy="90" rx="120" ry="16" />
          </g>
        </svg>
      </DepthLayer>

      {/* Layer 02 — SUN: bloom + god rays, slow rise/glow */}
      <DepthLayer depth={0.25} scrollYProgress={scrollYProgress} zIndex={1} scrollY={-30} scrollScale={0.04}>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <radialGradient id="cineSunCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff8e6" />
              <stop offset="45%" stopColor="#ffd37a" />
              <stop offset="100%" stopColor="#ff9a4d" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cineSunBloom" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd37a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffd37a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="cine-godrays" style={{ transformOrigin: "1060px 420px" }}>
            {[...Array(8)].map((_, i) => (
              <polygon
                key={i}
                points="1060,420 1015,900 1105,900"
                fill="#ffdca0"
                opacity="0.08"
                transform={`rotate(${i * 45} 1060 420)`}
              />
            ))}
          </g>
          <circle cx="1060" cy="420" r="230" fill="url(#cineSunBloom)" className="cine-sun-pulse" />
          <circle cx="1060" cy="420" r="72" fill="url(#cineSunCore)" />
        </svg>
      </DepthLayer>

      {/* Layer 03 — FAR MOUNTAINS: hazy, blurred, barely moving */}
      <DepthLayer depth={0.35} scrollYProgress={scrollYProgress} zIndex={2} scrollY={14} scrollScale={0.02}>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full" style={{ filter: "blur(6px)" }}>
          <path
            d="M0,560 C120,480 240,500 360,460 C480,420 600,470 720,440 C840,410 960,460 1080,430 C1200,400 1320,450 1440,420 L1440,900 L0,900 Z"
            fill="#c7c9e0"
            opacity="0.55"
          />
        </svg>
      </DepthLayer>

      {/* Layer 04 — MID MOUNTAINS: second range, a touch faster */}
      <DepthLayer depth={0.45} scrollYProgress={scrollYProgress} zIndex={3} scrollY={16} scrollScale={0.03}>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full" style={{ filter: "blur(2.5px)" }}>
          <path
            d="M0,620 C150,540 300,560 450,520 C600,480 750,540 900,510 C1050,480 1200,540 1350,510 L1440,520 L1440,900 L0,900 Z"
            fill="#8fa89f"
            opacity="0.75"
          />
        </svg>
      </DepthLayer>

      {/* Layer 05 — FRONT HILLS / TEA ESTATE SLOPES: highest mountain detail, golden rim light */}
      <DepthLayer depth={0.60} scrollYProgress={scrollYProgress} zIndex={4} scrollY={20} scrollScale={0.035}>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <linearGradient id="cineFrontHill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8b264" />
              <stop offset="18%" stopColor="#4c6a45" />
              <stop offset="100%" stopColor="#2c4227" />
            </linearGradient>
          </defs>
          <path
            d="M0,720 C200,650 350,680 500,630 C650,580 800,650 950,620 C1100,590 1250,650 1440,630 L1440,900 L0,900 Z"
            fill="url(#cineFrontHill)"
          />
          {/* faint tea-row terracing */}
          <g stroke="#1f3320" strokeOpacity="0.35" strokeWidth="2" fill="none">
            <path d="M120,760 Q400,720 700,750 T1300,730" />
            <path d="M100,800 Q400,760 720,790 T1340,770" />
            <path d="M80,840 Q420,800 740,830 T1380,810" />
          </g>
        </svg>
      </DepthLayer>

      {/* Layer 06 — FOG: multiple layered bands, different speeds + opacity zones */}
      <DepthLayer depth={0.75} scrollYProgress={scrollYProgress} zIndex={5} scrollY={10} scrollScale={0.01}>
        <div className="absolute inset-x-0" style={{ top: "48%", height: "22%" }}>
          <div className="cine-fog-band cine-fog-a" />
        </div>
        <div className="absolute inset-x-0" style={{ top: "58%", height: "18%" }}>
          <div className="cine-fog-band cine-fog-b" />
        </div>
        <div className="absolute inset-x-0" style={{ top: "68%", height: "16%" }}>
          <div className="cine-fog-band cine-fog-c" />
        </div>
      </DepthLayer>

      {/* Layer 07 — TREES + TEA GARDEN: bushes/trees swaying gently in the wind */}
      <DepthLayer depth={0.85} scrollYProgress={scrollYProgress} zIndex={6} scrollY={24} scrollScale={0.03}>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <g className="cine-trees-sway" style={{ transformOrigin: "50% 100%" }}>
            {[...Array(14)].map((_, i) => {
              const x = 40 + i * 104 + (i % 2 === 0 ? 0 : 30);
              const isTree = i % 5 === 0;
              return isTree ? (
                <g key={i}>
                  <rect x={x - 3} y={800} width="6" height="46" fill="#3a2a1c" />
                  <ellipse cx={x} cy={796} rx="26" ry="34" fill="#2f4a28" />
                </g>
              ) : (
                <ellipse key={i} cx={x} cy={830} rx="34" ry="18" fill={i % 3 === 0 ? "#345c2e" : "#3f6a37"} />
              );
            })}
          </g>
        </svg>
      </DepthLayer>

      {/* Layer 08 — BIRDS: random timings, paths, heights, speeds */}
      <DepthLayer depth={0.5} scrollYProgress={scrollYProgress} zIndex={7} scrollY={6} scrollScale={0}>
        {birds.map((b, i) => (
          <Bird key={i} {...b} />
        ))}
      </DepthLayer>

      {/* Layer 09 — ATMOSPHERIC PARTICLES: dust, pollen, tea leaves, light */}
      <DepthLayer depth={0.95} scrollYProgress={scrollYProgress} zIndex={8} scrollY={8} scrollScale={0}>
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </DepthLayer>

      <SceneStyles />
    </div>
  );
}

/* ── Layer 11: Foreground tea bushes + Layer 12: Ultra-foreground (grass/insects/lens dust) ── */
export function CinematicForeground({ scrollYProgress, reducedFx = false }: SceneProps) {
  return (
    <>
      {/* Layer 11 — FOREGROUND TEA BUSHES: overlaps ~20–30% of the portrait's lower body */}
      <DepthLayer
        depth={1.25}
        scrollYProgress={scrollYProgress}
        zIndex={15}
        scrollY={30}
        scrollScale={0.05}
        className="pointer-events-none"
      >
        <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: "clamp(150px, 26vh, 300px)" }}>
          <svg viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" className="w-full h-full cine-bushes-sway" style={{ transformOrigin: "50% 100%" }}>
            <defs>
              <linearGradient id="cineBushGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e9a85b" />
                <stop offset="22%" stopColor="#33502c" />
                <stop offset="100%" stopColor="#1c2f19" />
              </linearGradient>
            </defs>
            {[
              { cx: 90,   cy: 420, rx: 160, ry: 110 },
              { cx: 300,  cy: 440, rx: 200, ry: 130 },
              { cx: 560,  cy: 400, rx: 190, ry: 150 },
              { cx: 820,  cy: 430, rx: 230, ry: 170 },
              { cx: 1080, cy: 400, rx: 210, ry: 150 },
              { cx: 1320, cy: 430, rx: 190, ry: 130 },
            ].map((c, i) => (
              <ellipse key={i} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="url(#cineBushGrad)" />
            ))}
          </svg>
        </div>
      </DepthLayer>

      {/* Layer 12 — ULTRA FOREGROUND: grass, insects, lens dust — nearly touches the camera */}
      <DepthLayer
        depth={1.4}
        scrollYProgress={scrollYProgress}
        zIndex={16}
        scrollY={38}
        scrollScale={0.06}
        className="pointer-events-none"
      >
        <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: "clamp(70px, 12vh, 140px)" }}>
          <svg viewBox="0 0 1440 160" preserveAspectRatio="xMidYMax slice" className="w-full h-full cine-grass-sway" style={{ transformOrigin: "50% 100%" }}>
            <g stroke="#2e4a28" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.85">
              {[...Array(28)].map((_, i) => {
                const x = i * 52 + 10;
                return <path key={i} d={`M${x},160 Q${x + 6},110 ${x - 4},70`} />;
              })}
            </g>
            {[...Array(6)].map((_, i) => (
              <circle key={i} cx={140 + i * 220} cy={90 - (i % 2) * 20} r="5" fill={i % 2 ? "#ffd37a" : "#f2f2f2"} opacity="0.9" />
            ))}
          </svg>

          {!reducedFx && (
            <>
              <div className="cine-insect" style={{ left: "22%", bottom: "40%", animationDelay: "0s" }} />
              <div className="cine-insect" style={{ left: "68%", bottom: "55%", animationDelay: "2.4s" }} />
            </>
          )}

          {/* soft lens-dust bokeh, anamorphic-close feel */}
          <div className="absolute -left-10 bottom-2 w-40 h-40 rounded-full bg-amber-200/25 blur-3xl mix-blend-screen" />
          <div className="absolute -right-8 bottom-6 w-32 h-32 rounded-full bg-orange-200/20 blur-3xl mix-blend-screen" />
        </div>
      </DepthLayer>
    </>
  );
}

function SceneStyles() {
  return (
    <style>{`
      /* Mouse-driven depth parallax — reuses the --mx/--my custom properties
         Hero.tsx already writes on the section root; --depth scales per layer. */
      .cine-layer {
        transform: translate3d(calc(var(--mx, 0) * var(--depth) * 22px), calc(var(--my, 0) * var(--depth) * 14px), 0);
        transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        will-change: transform;
      }

      @keyframes cineCloudDrift {
        0%   { transform: translate3d(-3%, 0, 0); }
        50%  { transform: translate3d(3%, 0, 0); }
        100% { transform: translate3d(-3%, 0, 0); }
      }
      .cine-clouds { animation: cineCloudDrift 60s ease-in-out infinite; }

      @keyframes cineSunPulse {
        0%, 100% { opacity: 0.85; transform: scale(1); }
        50%       { opacity: 1;    transform: scale(1.06); }
      }
      .cine-sun-pulse { animation: cineSunPulse 5s ease-in-out infinite; transform-origin: 1060px 420px; }

      @keyframes cineRayRotate {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      .cine-godrays { animation: cineRayRotate 140s linear infinite; }

      @keyframes cineFogDriftA {
        0%   { transform: translate3d(-6%, 0, 0); }
        100% { transform: translate3d(6%, 0, 0); }
      }
      @keyframes cineFogDriftB {
        0%   { transform: translate3d(5%, 0, 0); }
        100% { transform: translate3d(-7%, 0, 0); }
      }
      @keyframes cineFogDriftC {
        0%   { transform: translate3d(-4%, 0, 0); }
        100% { transform: translate3d(8%, 0, 0); }
      }
      .cine-fog-band {
        position: absolute; inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255,247,232,0.55) 25%, rgba(255,247,232,0.75) 50%, rgba(255,247,232,0.5) 75%, transparent 100%);
        filter: blur(18px);
      }
      .cine-fog-a { opacity: 0.55; animation: cineFogDriftA 26s ease-in-out infinite alternate; }
      .cine-fog-b { opacity: 0.4;  animation: cineFogDriftB 34s ease-in-out infinite alternate; }
      .cine-fog-c { opacity: 0.3;  animation: cineFogDriftC 20s ease-in-out infinite alternate; }

      @keyframes cineTreesSway {
        0%, 100% { transform: skewX(-1.2deg); }
        50%       { transform: skewX(1.2deg); }
      }
      .cine-trees-sway { animation: cineTreesSway 7s ease-in-out infinite; }

      @keyframes cineBushesSway {
        0%, 100% { transform: skewX(-0.8deg); }
        50%       { transform: skewX(0.8deg); }
      }
      .cine-bushes-sway { animation: cineBushesSway 5.5s ease-in-out infinite; }

      @keyframes cineGrassSway {
        0%, 100% { transform: skewX(-2deg); }
        50%       { transform: skewX(2deg); }
      }
      .cine-grass-sway { animation: cineGrassSway 3.2s ease-in-out infinite; }

      @keyframes cineBirdFly {
        0%   { transform: translate3d(-10vw, 0, 0); opacity: 0; }
        8%   { opacity: 1; }
        45%  { transform: translate3d(55vw, -18px, 0); }
        92%  { opacity: 1; }
        100% { transform: translate3d(120vw, 10px, 0); opacity: 0; }
      }
      @keyframes cineBirdFlyReverse {
        0%   { transform: scaleX(-1) translate3d(-10vw, 0, 0); opacity: 0; }
        8%   { opacity: 1; }
        45%  { transform: scaleX(-1) translate3d(55vw, 14px, 0); }
        92%  { opacity: 1; }
        100% { transform: scaleX(-1) translate3d(120vw, -12px, 0); opacity: 0; }
      }
      @keyframes cineBirdFlap { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
      .cine-wing-up   { animation: cineBirdFlap 0.5s steps(1) infinite; }
      .cine-wing-down { animation: cineBirdFlap 0.5s steps(1) infinite reverse; }

      @keyframes cineParticleDrift {
        0%   { transform: translate3d(0, 20px, 0) rotate(0deg);   opacity: 0; }
        10%  { opacity: var(--pop, 0.6); }
        50%  { transform: translate3d(var(--pdx, 10px), -70px, 0) rotate(180deg); }
        90%  { opacity: var(--pop, 0.6); }
        100% { transform: translate3d(calc(var(--pdx, 10px) * 2), -150px, 0) rotate(360deg); opacity: 0; }
      }

      @keyframes cineInsectFloat {
        0%   { transform: translate3d(0,0,0); }
        25%  { transform: translate3d(14px,-10px,0); }
        50%  { transform: translate3d(-6px,-18px,0); }
        75%  { transform: translate3d(-16px,-4px,0); }
        100% { transform: translate3d(0,0,0); }
      }
      .cine-insect {
        position: absolute; width: 5px; height: 5px; border-radius: 50%;
        background: #2b2318; opacity: 0.75;
        box-shadow: 0 0 6px 2px rgba(255,217,138,0.35);
        animation: cineInsectFloat 4.5s ease-in-out infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .cine-root, .cine-root * {
          animation: none !important;
          transition: none !important;
          transform: none !important;
        }
      }
    `}</style>
  );
}
