import type { ComponentType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  SiReact,
  SiTailwindcss,
  SiNextdotjs,
  SiChartdotjs,
  SiFigma,
  SiDavinciresolve,
  SiInstagram,
  SiBlender,
} from "react-icons/si";
import { ArrowUpRight, Clock } from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import Tilt from "@/components/ui/Tilt";
import { useReducedFx } from "@/hooks/use-reduced-fx";

/* ────────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────────── */

type Service = {
  id: string;
  title: string;
  desc: string;
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  stack: string[];
  price: string;
  timeline: string;
  status: string;
  cta: string;
  featured?: boolean;
  /** grid placement — desktop (12-col), tablet (2-col) */
  span: string;
};

const services: Service[] = [
  {
    id: "fullstack",
    title: "Full Stack Web Dev",
    desc: "End-to-end web applications engineered with React, Node.js, and production-grade databases.",
    icon: SiReact,
    color: "#1D6FEB",
    stack: ["React", "Node.js", "PostgreSQL"],
    price: "₹40k+",
    timeline: "3–5 weeks",
    status: "Most Popular",
    cta: "Get Quote",
    featured: true,
    span: "lg:col-span-7 lg:row-span-2 md:col-span-2",
  },
  {
    id: "uiux",
    title: "UI/UX Design",
    desc: "Wireframes, prototypes, and interfaces crafted with intent in Figma.",
    icon: SiFigma,
    color: "#F24E1E",
    stack: ["Figma", "Prototyping"],
    price: "₹15k+",
    timeline: "1–2 weeks",
    status: "Recommended",
    cta: "View Details",
    span: "lg:col-span-5 lg:row-span-2 md:col-span-2",
  },
  {
    id: "responsive",
    title: "Responsive Design",
    desc: "Interfaces that hold their composure on every device and breakpoint.",
    icon: SiTailwindcss,
    color: "#06B6D4",
    stack: ["Tailwind", "CSS3"],
    price: "₹18k+",
    timeline: "1–2 weeks",
    status: "High Demand",
    cta: "View Details",
    span: "lg:col-span-4 md:col-span-1",
  },
  {
    id: "landing",
    title: "Landing Pages",
    desc: "High-converting pages engineered to turn visits into sales.",
    icon: SiNextdotjs,
    color: "#0F172A",
    stack: ["Next.js", "Framer Motion"],
    price: "₹12k+",
    timeline: "About 1 week",
    status: "Fast Turnaround",
    cta: "View Details",
    span: "lg:col-span-4 md:col-span-1",
  },
  {
    id: "dashboards",
    title: "Admin Dashboards",
    desc: "Complex data visualization and management panels, built to scale.",
    icon: SiChartdotjs,
    color: "#6366F1",
    stack: ["React", "Chart.js"],
    price: "₹35k+",
    timeline: "2–4 weeks",
    status: "Premium",
    cta: "View Details",
    span: "lg:col-span-4 md:col-span-2",
  },
  {
    id: "cinematic",
    title: "Cinematic Editing",
    desc: "Premium video editing for YouTube, commercials, and live events.",
    icon: SiDavinciresolve,
    color: "#233A51",
    stack: ["DaVinci Resolve", "Color Grading"],
    price: "₹8k+",
    timeline: "3–5 days",
    status: "Client Favorite",
    cta: "View Details",
    span: "lg:col-span-6 md:col-span-2",
  },
  {
    id: "reels",
    title: "Social Media Reels",
    desc: "Fast-paced, scroll-stopping short-form content for TikTok and IG.",
    icon: SiInstagram,
    color: "#E4405F",
    stack: ["Premiere Pro", "Sound Design"],
    price: "₹3k+",
    timeline: "2–3 days",
    status: "Quick Delivery",
    cta: "View Details",
    span: "lg:col-span-3 md:col-span-1",
  },
  {
    id: "motion",
    title: "Motion Graphics",
    desc: "Custom animation, intros, and visual effects that add polish.",
    icon: SiBlender,
    color: "#F5792A",
    stack: ["Blender", "After Effects"],
    price: "₹6k+",
    timeline: "About 1 week",
    status: "Creative",
    cta: "View Details",
    span: "lg:col-span-3 md:col-span-1",
  },
];

/* ────────────────────────────────────────────────────────────
   Ambient background — subtle blueprint grid + soft gradient
   blobs + a handful of drifting particles. Scoped to this
   section only (GlobalBackground already handles the page).
   ──────────────────────────────────────────────────────────── */

function ServicesBackdrop({ reducedFx }: { reducedFx: boolean }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-white" />

      {/* faint blueprint grid, faded at the edges */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(29,111,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(29,111,235,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 75%)",
        }}
      />

      {/* soft radial glow anchoring the heading */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[40vw] rounded-full bg-primary/[0.06] blur-[100px]" />

      {/* floating blurred blobs */}
      <div
        className={`absolute top-[10%] -left-[8%] w-[26rem] h-[26rem] rounded-full bg-gradient-to-br from-blue-200/25 to-sky-100/10 ${
          reducedFx ? "blur-[40px]" : "blur-[110px] animate-pulse"
        }`}
        style={{ animationDuration: "16s" }}
      />
      <div
        className={`absolute bottom-[5%] -right-[6%] w-[24rem] h-[24rem] rounded-full bg-gradient-to-tr from-indigo-100/30 to-blue-50/10 ${
          reducedFx ? "blur-[40px]" : "blur-[110px] animate-pulse"
        }`}
        style={{ animationDuration: "20s", animationDelay: "2s" }}
      />

      {/* tiny drifting particles */}
      {!reducedFx &&
        [
          { left: "6%", top: "18%", dur: "14s", delay: "0s" },
          { left: "92%", top: "12%", dur: "18s", delay: "1.2s" },
          { left: "18%", top: "78%", dur: "16s", delay: "2.4s" },
          { left: "80%", top: "70%", dur: "20s", delay: "0.6s" },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/30 blur-[0.5px]"
            style={{ left: p.left, top: p.top, animation: `floatY ${p.dur} ease-in-out infinite ${p.delay}` }}
          />
        ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Service card
   ──────────────────────────────────────────────────────────── */

function ServiceCard({
  service,
  index,
  rm,
  reducedFx,
}: {
  service: Service;
  index: number;
  rm: boolean;
  reducedFx: boolean;
}) {
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: 0.6, delay: rm ? 0 : (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={`relative ${service.span}`}
    >
      <Tilt
        maxRotate={rm || reducedFx ? 0 : 5}
        glowColor={service.color}
        glowOpacity={0.16}
        glowSize={420}
        className="h-full"
      >
        <motion.article
          aria-label={`${service.title} — ${service.status}`}
          whileHover={rm ? undefined : { y: -10 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={`group relative h-full flex flex-col p-7 sm:p-8 rounded-[28px] border overflow-hidden backdrop-blur-xl
            transition-[box-shadow,border-color] duration-500
            ${
              service.featured
                ? "bg-gradient-to-br from-primary/[0.07] via-white/92 to-sky-100/40 border-primary/25 shadow-[0_20px_60px_-18px_rgba(29,111,235,0.30)] hover:shadow-[0_30px_80px_-18px_rgba(29,111,235,0.38)]"
                : "bg-white/75 border-blue-100/70 shadow-[0_10px_36px_-18px_rgba(29,111,235,0.16)] hover:shadow-[0_26px_64px_-18px_rgba(29,111,235,0.28)]"
            }
            hover:border-primary/30`}
        >
          {/* reflection sweep on hover */}
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out"
              style={{
                background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
              }}
            />
          </span>

          {/* animated top accent line */}
          <span className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />

          {/* status badge */}
          <span className="absolute top-6 right-6 sm:top-7 sm:right-7 z-10 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/15 group-hover:bg-primary/15 group-hover:border-primary/25 transition-colors">
            {service.status}
          </span>

          {/* icon */}
          <motion.div
            whileHover={rm ? undefined : { rotate: -8, scale: 1.12 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative z-10"
            style={{ background: `linear-gradient(135deg, ${service.color}20, ${service.color}06)` }}
          >
            <Icon className="text-3xl" style={{ color: service.color }} />
          </motion.div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3 relative z-10 group-hover:text-primary transition-colors">
            {service.title}
          </h3>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-5 relative z-10 font-light max-w-md">
            {service.desc}
          </p>

          {/* tech stack */}
          <div className="flex flex-wrap gap-2 mb-6 relative z-10">
            {service.stack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-full bg-slate-50/90 border border-slate-200/80 text-[11px] font-mono text-slate-600 group-hover:border-primary/20 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* footer: timeline + price + CTA */}
          <div className="mt-auto pt-5 border-t border-blue-100/60 relative z-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-mono uppercase tracking-wide">
                <Clock className="w-3 h-3" aria-hidden="true" /> {service.timeline}
              </span>

              <motion.span
                whileHover={rm ? undefined : { scale: 1.05 }}
                className="inline-flex flex-col w-fit px-3.5 py-1.5 rounded-2xl bg-white/70 backdrop-blur border border-primary/15 transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(29,111,235,0.25)]"
              >
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono leading-none mb-0.5">
                  Starting From
                </span>
                <span className="text-base font-bold text-primary font-mono leading-none">{service.price}</span>
              </motion.span>
            </div>

            <button
              type="button"
              aria-label={`${service.cta} — ${service.title}`}
              className="group/btn relative inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wide overflow-hidden shadow-md shadow-blue-200/70 transition-transform duration-300 group-hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span className="relative z-10">{service.cta}</span>
              <ArrowUpRight
                className="w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                aria-hidden="true"
              />
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500 ease-out" />
            </button>
          </div>
        </motion.article>
      </Tilt>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main section
   ──────────────────────────────────────────────────────────── */

export default function Services() {
  const rm = !!useReducedMotion();
  const reducedFx = useReducedFx();

  return (
    <section id="services" className="section-padding relative overflow-hidden">
      <ServicesBackdrop reducedFx={reducedFx} />

      <div className="container-tight relative z-10">
        {/* ─── Header ─── */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_8px_24px_-10px_rgba(15,45,90,0.25)] mb-6"
          >
            <span className="text-primary text-sm" aria-hidden="true">
              ✦
            </span>
            <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-primary">
              What I Offer
            </span>
          </motion.div>

          <h2 className="font-serif font-bold text-[2rem] sm:text-4xl md:text-5xl leading-[1.1] text-foreground mb-5">
            <SplitText type="words" duration={0.65}>
              Crafting Digital
            </SplitText>{" "}
            <span className="text-gradient inline-block">
              <SplitText type="words" delay={0.15} duration={0.65}>
                Experiences
              </SplitText>
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed font-light"
          >
            From scalable web applications to cinematic content, I build products that help
            businesses grow.
          </motion.p>
        </div>

        {/* ─── Editorial bento grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(180px,auto)] gap-6 lg:gap-7">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} rm={rm} reducedFx={reducedFx} />
          ))}
        </div>
      </div>
    </section>
  );
}
