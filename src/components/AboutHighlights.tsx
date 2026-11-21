import { useRef } from "react";
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Code2, Layers, Users, Trophy, GraduationCap, Video, Rocket } from "lucide-react";
import { SiReact, SiNextdotjs, SiNodedotjs, SiMongodb, SiTailwindcss, SiTypescript, SiFirebase, SiFigma, SiGithub, SiExpress } from "react-icons/si";
import CountUp from "@/components/ui/CountUp";
import "./about-highlights.css";

/** Desktop-only band under the notebook: animated numbers, a drawn timeline and a tech marquee.
 *  (Phones/tablets already get the same content inside AboutMobile.) */

const STATS = [
  { Icon: Code2, value: "1+", label: "Years Experience", tone: "#1266F1" },
  { Icon: Layers, value: "10+", label: "Projects Completed", tone: "#7c3aed" },
  { Icon: Users, value: "5+", label: "Happy Clients", tone: "#ea7814" },
  { Icon: Trophy, value: "100%", label: "Client Satisfaction", tone: "#059669" },
];

const JOURNEY = [
  { Icon: GraduationCap, when: "2024", title: "Education", text: "BSc (Chemistry), Jagiroad College" },
  { Icon: Code2, when: "2025", title: "Started Building", text: "Web development and real projects" },
  { Icon: Video, when: "2025", title: "Video Editing", text: "Reels, ads and brand content" },
  { Icon: Rocket, when: "2026", title: "Now", text: "Web apps and video for businesses" },
];

const TECH = [
  { n: "React", I: SiReact, c: "#61DAFB" }, { n: "Next.js", I: SiNextdotjs, c: "currentColor" },
  { n: "Node.js", I: SiNodedotjs, c: "#5FA04E" }, { n: "Express", I: SiExpress, c: "currentColor" },
  { n: "MongoDB", I: SiMongodb, c: "#47A248" }, { n: "Tailwind", I: SiTailwindcss, c: "#38BDF8" },
  { n: "TypeScript", I: SiTypescript, c: "#3178C6" }, { n: "Firebase", I: SiFirebase, c: "#FFA000" },
  { n: "Figma", I: SiFigma, c: "#F24E1E" }, { n: "GitHub", I: SiGithub, c: "currentColor" },
];

/** Card that tilts toward the pointer and lights up under it. */
function StatCard({ s, i, rm }: { s: (typeof STATS)[number]; i: number; rm: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 220, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 220, damping: 20 });
  const move = (e: React.PointerEvent) => {
    if (rm || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
    ref.current.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const leave = () => { mx.set(0); my.set(0); };
  return (
    <motion.div
      initial={{ opacity: 0, y: rm ? 0 : 36, scale: rm ? 1 : 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: rm ? 0.01 : 0.7, delay: rm ? 0 : i * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 800 }}
    >
      <motion.div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        style={{ rotateX: rm ? 0 : rx, rotateY: rm ? 0 : ry, ["--tone" as string]: s.tone }}
        className="ah-stat"
      >
        <span className="ah-stat__icon"><s.Icon aria-hidden="true" /></span>
        <p className="ah-stat__value"><CountUp value={s.value} /></p>
        <p className="ah-stat__label">{s.label}</p>
      </motion.div>
    </motion.div>
  );
}

export default function AboutHighlights() {
  const rm = !!useReducedMotion();
  return (
    <section className="ah hidden lg:block" aria-label="About — highlights">
      <div className="container-tight">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-5">
          {STATS.map((s, i) => <StatCard key={s.label} s={s} i={i} rm={rm} />)}
        </div>

        {/* Journey — line draws itself, nodes pop in one by one */}
        <motion.h3
          className="ah-h"
          initial={{ opacity: 0, y: rm ? 0 : 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.6 }}
        >
          My Journey
        </motion.h3>
        <div className="ah-journey">
          <motion.span
            className="ah-journey__line" aria-hidden="true"
            initial={{ scaleX: rm ? 1 : 0 }} whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: rm ? 0.01 : 1.6, ease: [0.65, 0, 0.35, 1] }}
          />
          {JOURNEY.map(({ Icon, when, title, text }, i) => (
            <motion.div
              key={title}
              className="ah-step"
              initial={{ opacity: 0, y: rm ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: rm ? 0.01 : 0.6, delay: rm ? 0 : 0.35 + i * 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="ah-step__node"><Icon aria-hidden="true" /></span>
              <span className="ah-step__when">{when}</span>
              <p className="ah-step__title">{title}</p>
              <p className="ah-step__text">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tech marquee — pauses on hover, static for reduced motion */}
      <div className="ah-marquee" aria-label="Technologies I use">
        <div className={`ah-marquee__track ${rm ? "is-static" : ""}`}>
          {[0, 1].map((g) => (
            <ul key={g} className="ah-marquee__group" aria-hidden={g === 1}>
              {TECH.map(({ n, I, c }) => (
                <li key={n} className="ah-chip">
                  <I style={{ color: c }} aria-hidden="true" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
