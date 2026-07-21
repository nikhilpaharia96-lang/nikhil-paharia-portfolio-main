import { useState, useRef, useMemo } from "react";
import {
  motion,
  useMotionValue,
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

type Skill = {
  name: string;
  level: number;
  color: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  logo?: string;
};

const webSkills: Skill[] = [
  { name: "React / Next.js", icon: SiReact, level: 95, color: "#61DAFB" },
  { name: "Node.js", icon: SiNodedotjs, level: 85, color: "#339933" },
  { name: "JavaScript / TS", icon: SiJavascript, level: 90, color: "#F7DF1E" },
  { name: "Tailwind CSS", icon: SiTailwindcss, level: 95, color: "#06B6D4" },
  { name: "MongoDB", icon: SiMongodb, level: 80, color: "#47A248" },
  { name: "Firebase", icon: SiFirebase, level: 75, color: "#FFCA28" },
  { name: "HTML5", icon: SiHtml5, level: 100, color: "#E34F26" },
  { name: "CSS", icon: SiCss, level: 95, color: "#1572B6" },
];

const videoSkills: Skill[] = [
  { name: "Premiere Pro", logo: premiereProLogo, level: 95, color: "#9999FF" },
  { name: "After Effects", logo: afterEffectsLogo, level: 85, color: "#9999FF" },
  { name: "YouTube Editing", icon: SiYoutube, level: 90, color: "#FF0000" },
  { name: "Instagram Reels", icon: SiInstagram, level: 95, color: "#E1306C" },
  { name: "Motion Graphics", icon: SiDavinciresolve, level: 80, color: "#233A51" },
  { name: "UI/UX Design", icon: SiFigma, level: 85, color: "#F24E1E" },
];

const stats = [
  { value: "15+", label: "Technologies" },
  { value: "3+", label: "Years Learning" },
  { value: "50+", label: "Projects Built" },
];

const features = ["Clean Code", "Performance", "Responsive", "Scalable"];

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
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
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
          className="relative h-full flex flex-col gap-7 rounded-[27px] p-6 sm:p-7
                     bg-white/45 backdrop-blur-2xl
                     shadow-[0_1px_1px_rgba(255,255,255,0.6)_inset,0_20px_50px_-20px_rgba(15,45,90,0.25)]
                     group-hover:shadow-[0_1px_1px_rgba(255,255,255,0.7)_inset,0_28px_60px_-18px_rgba(15,45,90,0.35)]
                     transition-shadow duration-500
                     group-hover:-translate-y-1.5"
          style={{ transform: "translateZ(24px)", transformStyle: "preserve-3d" }}
        >
          {/* faint inner highlight line */}
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <div className="flex items-center gap-4">
            <div
              className="relative w-14 h-14 shrink-0 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center
                         shadow-[0_8px_20px_-6px_rgba(15,45,90,0.25)] border border-white/70
                         transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3 overflow-hidden"
            >
              {skill.logo ? (
                <img src={skill.logo} alt="" className="w-9 h-9 rounded-lg" loading="lazy" decoding="async" />
              ) : Icon ? (
                <Icon className="text-[28px]" style={{ color: skill.color }} />
              ) : null}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-md"
                style={{ background: skill.color }}
              />
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
              <span
                className="text-sm font-bold font-mono tabular-nums"
                style={{ color: skill.color }}
              >
                {skill.level}%
              </span>
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
                className="h-full rounded-full relative"
                style={{
                  backgroundColor: skill.color,
                  boxShadow: `0 0 12px ${skill.color}90`,
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent" />
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
   Main section
   ──────────────────────────────────────────────────────────── */

export default function Skills() {
  const [activeTab, setActiveTab] = useState<"web" | "video">("web");
  const activeSkills = useMemo(
    () => (activeTab === "web" ? webSkills : videoSkills),
    [activeTab]
  );

  return (
    <section
      id="skills"
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
            {/* floating ambience chips */}
            <FloatingChip icon={SiReact} className="top-[-2rem] right-6" delay={0} duration={7} />
            <FloatingChip icon={SiFigma} className="top-24 -right-2" delay={1.2} duration={8} />
            <FloatingChip icon={Sparkles} className="bottom-16 right-10" delay={0.6} duration={6.5} />

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
                    {stat.value}
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

            {/* skill grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
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
                <div
                  key={feature}
                  className="flex items-center gap-2.5"
                  style={{ order: i }}
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <span className="text-sm sm:text-[15px] font-semibold text-slate-700 whitespace-nowrap">
                    {feature}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
