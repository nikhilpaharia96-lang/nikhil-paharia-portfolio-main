import { motion, useReducedMotion } from "framer-motion";
import { MapPin, CalendarDays, GraduationCap, Code2, Layers, Users, Trophy, Video, Rocket } from "lucide-react";
import { SiReact, SiNextdotjs, SiNodedotjs, SiMongodb, SiTailwindcss, SiTypescript } from "react-icons/si";
import portrait from "../assets/images/Desktop Nikhil Paharia profile photo.png";
import "./about-mobile.css";

/**
 * About — phone / tablet layout (below the `lg` breakpoint).
 * Replaces the notebook flip-book on small screens with a clean, dark-purple
 * "story" page: intro + portrait, quick stats, journey timeline, what I do, tech stack.
 * Desktop keeps the notebook (see About.tsx). Edit the arrays below to change content.
 */

const CHIPS = [
  { Icon: MapPin, label: "Assam, India" },
  { Icon: CalendarDays, label: "21 Years" },
  { Icon: GraduationCap, label: "BSc (Chemistry)" },
];

const STATS = [
  { Icon: Code2, value: "1+", label: "Years Experience" },
  { Icon: Layers, value: "10+", label: "Projects Completed" },
  { Icon: Users, value: "5+", label: "Happy Clients" },
  { Icon: Trophy, value: "100%", label: "Client Satisfaction" },
];

const JOURNEY = [
  { Icon: GraduationCap, title: "Education", text: "BSc (Chemistry) – Jagiroad College (Gauhati University)", when: "2024 – Present" },
  { Icon: Code2, title: "Started Building", text: "Began learning web development and working on real projects.", when: "2025" },
  { Icon: Video, title: "Video Editing", text: "Started creating videos, reels and brand content for clients.", when: "2025" },
  { Icon: Rocket, title: "Now", text: "Building web apps, helping businesses go online and creating impactful video content.", when: "2026" },
];

const TECH: { name: string; node: React.ReactNode }[] = [
  { name: "React", node: <SiReact style={{ color: "#61DAFB" }} /> },
  { name: "Next.js", node: <SiNextdotjs /> },
  { name: "Node.js", node: <SiNodedotjs style={{ color: "#5FA04E" }} /> },
  { name: "MongoDB", node: <SiMongodb style={{ color: "#47A248" }} /> },
  { name: "Tailwind", node: <SiTailwindcss style={{ color: "#38BDF8" }} /> },
  { name: "TypeScript", node: <SiTypescript style={{ color: "#3178C6" }} /> },
  { name: "Premiere", node: <span className="am-adobe" style={{ color: "#9999FF", borderColor: "#9999FF" }}>Pr</span> },
  { name: "After Effects", node: <span className="am-adobe" style={{ color: "#9999FF", borderColor: "#9999FF" }}>Ae</span> },
];

export default function AboutMobile() {
  const rm = !!useReducedMotion();
  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: rm ? 0 : 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: rm ? 0.01 : 0.6, delay: rm ? 0 : delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section id="about" className="am-section" aria-label="About — My Story">
      <div className="am-glow am-glow--a" aria-hidden="true" />
      <div className="am-glow am-glow--b" aria-hidden="true" />

      <div className="am-wrap">
        {/* ── Intro ── */}
        <div className="am-hero">
          <motion.div className="am-hero__text" {...rise()}>
            <p className="am-eyebrow">About Me</p>
            <h2 className="am-title">
              The Story
              <br />
              <span className="am-grad">Behind the Work</span>
            </h2>
            <p className="am-lead">
              A developer and video editor from Assam, passionate about building useful digital products and creating impactful visual stories.
            </p>
          </motion.div>

          <motion.div className="am-portrait" {...rise(0.1)}>
            <div className="am-portrait__frame">
              <img src={portrait} alt="Nikhil Paharia" loading="lazy" decoding="async" />
            </div>
          </motion.div>

          <motion.ul className="am-chips" {...rise(0.05)}>
            {CHIPS.map(({ Icon, label }) => (
            <li key={label} className="am-chip">
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </motion.ul>
        </div>

        {/* ── Stats ── */}
        <motion.dl className="am-stats" {...rise(0.05)}>
          {STATS.map(({ Icon, value, label }) => (
            <div key={label} className="am-stat">
              <Icon className="am-stat__icon" aria-hidden="true" />
              <div>
                <dt className="am-stat__value">{value}</dt>
                <dd className="am-stat__label">{label}</dd>
              </div>
            </div>
          ))}
        </motion.dl>

        {/* ── Journey ── */}
        <motion.h3 className="am-h" {...rise()}>My Journey</motion.h3>
        <ol className="am-journey">
          {JOURNEY.map(({ Icon, title, text, when }, i) => (
            <motion.li key={title} className="am-step" {...rise(i * 0.06)}>
              <span className="am-step__dot" aria-hidden="true" />
              <span className="am-step__icon" aria-hidden="true"><Icon /></span>
              <div className="am-step__body">
                <p className="am-step__title">{title}</p>
                <p className="am-step__text">{text}</p>
              </div>
              <span className="am-step__when">{when}</span>
            </motion.li>
          ))}
        </ol>

        {/* ── What I do ── */}
        <motion.h3 className="am-h" {...rise()}>What I Do</motion.h3>
        <div className="am-do">
          <motion.div className="am-card am-card--dev" {...rise()}>
            <Code2 aria-hidden="true" />
            <p className="am-card__title">Full-Stack Development</p>
            <p className="am-card__text">Web apps, SaaS, eCommerce and custom solutions.</p>
          </motion.div>
          <motion.div className="am-card am-card--video" {...rise(0.08)}>
            <Video aria-hidden="true" />
            <p className="am-card__title">Video Editing</p>
            <p className="am-card__text">Cinematic edits, reels, ads and brand storytelling.</p>
          </motion.div>
        </div>

        {/* ── Tech ── */}
        <motion.h3 className="am-h" {...rise()}>Tech I Use</motion.h3>
        <motion.ul className="am-tech" {...rise()}>
          {TECH.map(({ name, node }) => (
            <li key={name} className="am-tech__item">
              <span className="am-tech__icon" aria-hidden="true">{node}</span>
              <span className="am-tech__name">{name}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
