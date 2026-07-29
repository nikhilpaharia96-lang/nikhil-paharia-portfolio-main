import { useState, useRef, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiMongodb,
  SiFirebase,
  SiTailwindcss,
  SiYoutube,
  SiInstagram,
  SiFigma,
  SiDavinciresolve,
} from "react-icons/si";
import { CodeXml, ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import teaBg from "../assets/images/tea-sunset-landscape.webp";
import premiereProLogo from "../assets/logos/premiere-pro.svg";
import afterEffectsLogo from "../assets/logos/after-effects.svg";
import SplitText from "@/components/ui/SplitText";

/* ────────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────────── */

type Signature = "orbit" | "pulse" | "leaf" | "wave" | "flame" | "shine" | "scan" | "spin";

type Skill = {
  name: string;
  level: number;
  color: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  logo?: string;
  signature?: Signature;
};

const webSkills: Skill[] = [
  { name: "React / Next.js", icon: SiReact, level: 95, color: "#61DAFB", signature: "orbit" },
  { name: "Node.js", icon: SiNodedotjs, level: 85, color: "#339933", signature: "pulse" },
  { name: "JavaScript / TS", icon: SiJavascript, level: 90, color: "#F7DF1E", signature: "shine" },
  { name: "Tailwind CSS", icon: SiTailwindcss, level: 95, color: "#06B6D4", signature: "wave" },
  { name: "MongoDB", icon: SiMongodb, level: 80, color: "#47A248", signature: "leaf" },
  { name: "Firebase", icon: SiFirebase, level: 75, color: "#FFCA28", signature: "flame" },
  { name: "HTML5", icon: SiHtml5, level: 100, color: "#E34F26", signature: "scan" },
  { name: "CSS", icon: SiCss, level: 95, color: "#1572B6", signature: "spin" },
];

const videoSkills: Skill[] = [
  { name: "Premiere Pro", logo: premiereProLogo, level: 95, color: "#9999FF", signature: "shine" },
  { name: "After Effects", logo: afterEffectsLogo, level: 85, color: "#9999FF", signature: "spin" },
  { name: "YouTube Editing", icon: SiYoutube, level: 90, color: "#FF0000", signature: "pulse" },
  { name: "Instagram Reels", icon: SiInstagram, level: 95, color: "#E1306C", signature: "wave" },
  { name: "Motion Graphics", icon: SiDavinciresolve, level: 80, color: "#233A51", signature: "flame" },
  { name: "UI/UX Design", icon: SiFigma, level: 85, color: "#F24E1E", signature: "scan" },
];

const stats = [
  { value: 15, suffix: "+", label: "Technologies" },
  { value: 3, suffix: "+", label: "Years Learning" },
  { value: 50, suffix: "+", label: "Projects Built" },
];

const features = ["Clean Code", "Performance", "Responsive", "Scalable"];

/* ────────────────────────────────────────────────────────────
   Count-up number — animates from 0 on viewport entry, with an
   optional post-completion glow (Apple-style completion pulse)
   ──────────────────────────────────────────────────────────── */

function CountUpValue({
  value,
  suffix = "",
  className,
  glow = false,
  delay = 0,
  color,
}: {
  value: number;
  suffix?: string;
  className?: string;
  glow?: boolean;
  delay?: number;
  color?: string;
}) {
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    const duration = 1300;
    const startTime = performance.now() + delay * 1000;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed < 0) {
        requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
      else setDone(true);
    };
    requestAnimationFrame(tick);
  };

  return (
    <motion.span
      onViewportEnter={start}
      viewport={{ once: true, margin: "-30px" }}
      className={className}
      style={color ? { color } : undefined}
      animate={glow && done ? { filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] } : {}}
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      {display}
      {suffix}
    </motion.span>
  );
}

/* ────────────────────────────────────────────────────────────
   Signature FX — a small "personality" layer unique per skill.
   Ring types sit around the icon chip; fill types sit clipped
   inside it. Purely decorative, GPU-friendly transforms only.
   ──────────────────────────────────────────────────────────── */

function SignatureRing({ type, color }: { type?: Signature; color: string }) {
  if (type === "orbit") {
    return (
      <motion.span
        className="absolute -inset-1.5 rounded-full border border-dashed pointer-events-none"
        style={{ borderColor: `${color}80` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      >
        <span
          className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </motion.span>
    );
  }
  if (type === "pulse") {
    return (
      <motion.span
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ boxShadow: [`0 0 0 0px ${color}66`, `0 0 0 9px ${color}00`] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />
    );
  }
  if (type === "spin") {
    return (
      <motion.span
        className="absolute -inset-1 rounded-2xl pointer-events-none"
        style={{ background: `conic-gradient(from 0deg, ${color}00, ${color}70, ${color}00)` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    );
  }
  return null;
}

function SignatureFill({ type, color }: { type?: Signature; color: string }) {
  if (type === "wave") {
    return (
      <motion.span
        className="absolute inset-[-40%] pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 30%, ${color}55, transparent 60%)` }}
        animate={{ x: ["-8%", "8%", "-8%"], y: ["-4%", "4%", "-4%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }
  if (type === "flame") {
    return (
      <motion.span
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 75%, ${color}66, transparent 65%)` }}
        animate={{ opacity: [0.3, 0.75, 0.4, 0.8, 0.3], scale: [1, 1.08, 0.97, 1.05, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }
  if (type === "shine") {
    return (
      <motion.span
        className="absolute inset-y-0 w-1/3 pointer-events-none"
        style={{ background: `linear-gradient(115deg, transparent, ${color}80, transparent)` }}
        animate={{ x: ["-140%", "240%"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.6 }}
      />
    );
  }
  if (type === "scan") {
    return (
      <motion.span
        className="absolute inset-x-1.5 h-[2px] rounded-full pointer-events-none"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        animate={{ y: [4, 44, 4], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }
  return null;
}

/* ────────────────────────────────────────────────────────────
   Glass skill card — mouse-parallax tilt + glow + progress bar
   ──────────────────────────────────────────────────────────── */

function GlassSkillCard({ skill, index }: { skill: Skill; index: number }) {
  const Icon = skill.icon;
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springCfg = { stiffness: 200, damping: 20, mass: 0.4 };
  const rotateX = useSpring(useTransform(my, [0, 1], [9, -9]), springCfg);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), springCfg);
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 32, scale: 0.94, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -16, scale: 0.94, filter: "blur(4px)" }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative h-full rounded-[28px] p-[1px] interactive cursor-pointer"
      >
        {/* gradient border sheen */}
        <div
          className="absolute inset-0 rounded-[28px] opacity-60 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${skill.color}55, transparent 40%, transparent 60%, ${skill.color}30)`,
          }}
        />

        {/* mouse-follow glow */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `radial-gradient(360px circle at ${x} ${y}, ${skill.color}35, transparent 70%)`
            ),
          }}
        />

        <div
          className="relative h-full flex flex-col gap-7 rounded-[27px] p-6 sm:p-7 overflow-hidden
                     bg-white/45 backdrop-blur-2xl
                     shadow-[0_1px_1px_rgba(255,255,255,0.6)_inset,0_20px_50px_-20px_rgba(15,45,90,0.25)]
                     group-hover:shadow-[0_1px_1px_rgba(255,255,255,0.7)_inset,0_28px_60px_-18px_rgba(15,45,90,0.35)]
                     transition-[box-shadow,filter] duration-500
                     group-hover:brightness-[1.04]
                     group-hover:-translate-y-1.5"
          style={{ transform: "translateZ(24px)", transformStyle: "preserve-3d" }}
        >
          {/* ambient glass reflection — a soft sweep every ~6-8s, like polished glass catching light */}
          <motion.div
            className="absolute inset-y-0 w-1/4 -skew-x-12 pointer-events-none z-20"
            style={{ background: "linear-gradient(115deg, transparent, rgba(255,255,255,0.4), transparent)" }}
            animate={{ x: ["-150%", "320%"] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatDelay: 6 + (index % 3) * 0.7,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
          />

          {/* faint inner highlight line */}
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0">
              <SignatureRing type={skill.signature} color={skill.color} />
              <div
                className="relative w-14 h-14 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center
                           shadow-[0_8px_20px_-6px_rgba(15,45,90,0.25)] border border-white/70
                           transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3 group-hover:scale-105 overflow-hidden"
              >
                <SignatureFill type={skill.signature} color={skill.color} />
                {skill.logo ? (
                  <img src={skill.logo} alt="" className="relative z-10 w-9 h-9 rounded-lg" loading="lazy" decoding="async" />
                ) : Icon ? (
                  skill.signature === "leaf" ? (
                    <motion.div
                      className="relative z-10"
                      animate={{ y: [0, -3, 0], rotate: [-4, 4, -4] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Icon className="text-[28px]" style={{ color: skill.color }} />
                    </motion.div>
                  ) : (
                    <Icon className="relative z-10 text-[28px]" style={{ color: skill.color }} />
                  )
                ) : null}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-md"
                  style={{ background: skill.color }}
                />
              </div>
            </div>
            <h4 className="font-serif font-bold text-lg sm:text-xl text-foreground leading-snug">
              {skill.name}
            </h4>
          </div>

          <div className="mt-auto">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[11px] uppercase tracking-[0.14em] font-mono text-slate-500/80">
                Proficiency
              </span>
              <CountUpValue
                value={skill.level}
                suffix="%"
                glow
                delay={0.15 + index * 0.06}
                color={skill.color}
                className="text-sm font-bold font-mono tabular-nums"
              />
            </div>
            <div className="relative h-[6px] w-full rounded-full bg-slate-900/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.level}%` }}
                viewport={{ once: false }}
                transition={{
                  duration: 1.3,
                  delay: 0.15 + index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  backgroundColor: skill.color,
                  boxShadow: `0 0 12px ${skill.color}90`,
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent" />
                <motion.span
                  className="absolute inset-y-0 w-1/4"
                  style={{ background: "linear-gradient(115deg, transparent, rgba(255,255,255,0.9), transparent)" }}
                  animate={{ x: ["-100%", "420%"] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5 + index * 0.15,
                    repeatDelay: 2.5,
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Floating decorative icon chip (left column ambience)
   ──────────────────────────────────────────────────────────── */

function FloatingChip({
  icon: Icon,
  className,
  delay = 0,
  duration = 6,
}: {
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={`absolute hidden md:flex items-center justify-center w-12 h-12 rounded-2xl
                  bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-8px_rgba(15,45,90,0.3)] ${className}`}
      animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon className="w-5 h-5 text-primary/70" />
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Blueprint connector lines — quiet technical-diagram ambience
   for the otherwise-empty left column
   ──────────────────────────────────────────────────────────── */

function BlueprintLines() {
  return (
    <svg
      className="hidden md:block absolute -left-8 -top-6 w-72 h-80 pointer-events-none opacity-[0.35] z-0"
      viewBox="0 0 220 240"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d="M12 14 C 70 40, 26 96, 96 118 S 168 176, 204 214"
        stroke="hsl(var(--primary))"
        strokeWidth="1"
        strokeDasharray="3 7"
        strokeLinecap="round"
        animate={{ strokeDashoffset: [0, -60] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />
      <circle cx="12" cy="14" r="2.5" fill="hsl(var(--primary))" opacity="0.6" />
      <circle cx="96" cy="118" r="2.5" fill="hsl(var(--primary))" opacity="0.6" />
      <motion.circle
        cx="204"
        cy="214"
        r="2.5"
        fill="hsl(var(--primary))"
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────
   Main section
   ──────────────────────────────────────────────────────────── */

export default function Skills() {
  const [activeTab, setActiveTab] = useState<"web" | "video">("web");
  const activeSkills = useMemo(
    () => (activeTab === "web" ? webSkills : videoSkills),
    [activeTab]
  );

  // Section-wide mouse spotlight — the whole panel reacts gently to the cursor
  const sectionRef = useRef<HTMLElement>(null);
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(35);
  const spotXs = useSpring(spotX, { stiffness: 45, damping: 20 });
  const spotYs = useSpring(spotY, { stiffness: 45, damping: 20 });
  const spotlightBg = useMotionTemplate`radial-gradient(700px circle at ${spotXs}% ${spotYs}%, rgba(255,255,255,0.35), transparent 60%)`;

  const handleSectionMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    spotX.set(((e.clientX - rect.left) / rect.width) * 100);
    spotY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <section
      id="skills"
      ref={sectionRef}
      onMouseMove={handleSectionMouseMove}
      className="relative overflow-hidden section-wrap max-w-full py-20 sm:py-28 md:py-36 lg:py-40"
      aria-label="Skills — My Arsenal"
    >
      {/* ── Cinematic background ── */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src={teaBg}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center scale-110"
          style={{ filter: "brightness(0.9) saturate(0.9)" }}
          animate={{ scale: [1.1, 1.16, 1.1], x: [0, -12, 0] }}
          transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* depth-of-field blur veil */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        {/* atmosphere + legibility gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/92 via-white/78 to-white/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-transparent to-blue-50/60" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_20%,rgba(8,20,45,0.06)_100%)]" />
      </div>

      {/* ── Animated aurora ribbon ── */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-soft-light"
        style={{
          background:
            "linear-gradient(120deg, rgba(125,211,252,0.35), rgba(167,139,250,0.3), rgba(244,114,182,0.25), rgba(125,211,252,0.35))",
          backgroundSize: "300% 300%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Cursor-reactive spotlight over the whole section ── */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay hidden lg:block"
        style={{ background: spotlightBg }}
      />

      {/* ── Animated golden light sweep ── */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
        style={{
          background:
            "linear-gradient(115deg, transparent 20%, rgba(255,214,140,0.35) 45%, transparent 65%)",
        }}
        animate={{ x: ["-30%", "30%", "-30%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Soft fog orbs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[8%] left-[6%] w-[28rem] h-[28rem] bg-blue-200/20 rounded-full blur-[130px]"
          style={{ animation: "fogDrift 14s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[6%] right-[8%] w-[24rem] h-[24rem] bg-amber-100/25 rounded-full blur-[110px]"
          style={{ animation: "fogDrift 17s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-sky-100/10 rounded-full blur-[160px]"
          style={{ animation: "fogDrift 22s ease-in-out infinite" }}
        />
      </div>

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/70"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              boxShadow: "0 0 6px rgba(255,255,255,0.8)",
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.15, 0.6, 0.15],
            }}
            transition={{
              duration: 6 + (i % 5),
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container-tight relative z-10 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-10 items-start">
          {/* ═══════════════ LEFT COLUMN ═══════════════ */}
          <div className="lg:col-span-4 relative">
            {/* blueprint connector lines — quiet technical ambience */}
            <BlueprintLines />

            {/* floating ambience chips */}
            <FloatingChip icon={SiReact} className="top-[-2rem] right-6" delay={0} duration={7} />
            <FloatingChip icon={SiFigma} className="top-24 -right-2" delay={1.2} duration={8} />
            <FloatingChip icon={Sparkles} className="bottom-16 right-10" delay={0.6} duration={6.5} />

            {/* tiny glowing dots */}
            <motion.span
              className="hidden md:block absolute top-1/3 left-1 w-1 h-1 rounded-full bg-primary/70"
              animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.6, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="hidden md:block absolute bottom-1/3 left-10 w-1 h-1 rounded-full bg-primary/50"
              animate={{ opacity: [0.15, 0.7, 0.15], scale: [1, 1.5, 1] }}
              transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-white/60 backdrop-blur-xl border border-white/70
                         shadow-[0_8px_24px_-10px_rgba(15,45,90,0.25)] mb-7"
            >
              <CodeXml className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-semibold tracking-[0.18em] uppercase text-primary">
                My Arsenal
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif font-bold text-[2.4rem] sm:text-5xl lg:text-[3.1rem] leading-[1.08] text-foreground mb-6"
            >
              <SplitText type="words">Skills That Build Solutions.</SplitText>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-md mb-10"
            >
              I combine creativity with technology to build fast, scalable and
              beautiful digital experiences.
            </motion.p>

            {/* stats */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-60px" }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
              }}
              className="grid grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4 }}
                  className="relative rounded-2xl p-4 sm:p-5
                             bg-white/50 backdrop-blur-xl border border-white/70
                             shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_16px_36px_-16px_rgba(15,45,90,0.28)]"
                >
                  <div className="text-2xl sm:text-3xl font-serif font-extrabold text-primary tabular-nums">
                    <CountUpValue value={stat.value} suffix={stat.suffix} glow />
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium tracking-wide">
                    {stat.label}
                  </div>
                  <ArrowUpRight className="absolute top-4 right-4 w-3.5 h-3.5 text-primary/30" />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ═══════════════ RIGHT COLUMN ═══════════════ */}
          <div className="lg:col-span-8">
            {/* pill toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-60px" }}
              transition={{ duration: 0.7 }}
              className="flex justify-center lg:justify-end mb-10"
            >
              <div
                className="relative flex p-1.5 rounded-full
                           bg-white/55 backdrop-blur-xl border border-white/70
                           shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_16px_40px_-16px_rgba(15,45,90,0.3)]"
              >
                {(["web", "video"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="interactive relative px-6 sm:px-8 py-3 rounded-full text-sm font-bold transition-colors duration-300 z-10"
                  >
                    {activeTab === tab && (
                      <motion.span
                        layoutId="skills-tab-pill"
                        className="absolute inset-0 rounded-full bg-primary shadow-[0_8px_24px_-6px_rgba(29,111,235,0.6)]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${
                        activeTab === tab ? "text-white" : "text-slate-600"
                      }`}
                    >
                      {tab === "web" ? "Web Development" : "Video Editing"}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* skill grid — cinematic morph on tab switch: shrink + blur out, then stagger back in */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.92, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.88, y: -18, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6"
              >
                {activeSkills.map((skill, index) => (
                  <GlassSkillCard key={skill.name} skill={skill} index={index} />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* feature bar */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-10 sm:mt-12 rounded-3xl p-5 sm:p-7
                         bg-white/45 backdrop-blur-2xl border border-white/70
                         shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_20px_50px_-20px_rgba(15,45,90,0.28)]
                         flex flex-wrap items-center justify-center sm:justify-between gap-5 sm:gap-4"
            >
              {features.map((feature, i) => (
                <motion.div
                  key={feature}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="group/feature flex items-center gap-2.5 rounded-xl px-3 py-2 -mx-3 -my-2
                             transition-colors duration-300 hover:bg-white/50 hover:shadow-[0_10px_24px_-14px_rgba(15,45,90,0.35)]"
                  style={{ order: i }}
                >
                  <motion.span
                    whileHover={{ scale: 1.15, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle2
                      className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 transition-[filter] duration-300
                                 drop-shadow-[0_0_0px_rgba(29,111,235,0)] group-hover/feature:drop-shadow-[0_0_6px_rgba(29,111,235,0.6)]"
                    />
                  </motion.span>
                  <span className="text-sm sm:text-[15px] font-semibold text-slate-700 whitespace-nowrap">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
