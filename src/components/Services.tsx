import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { SiReact, SiCss, SiNextdotjs, SiMongodb, SiFigma, SiInstagram } from "react-icons/si";
import ServicesMobileStack from "@/components/ServicesMobileStack";
import { playCardPop } from "@/lib/sound";
import premiereProLogo from "../assets/logos/premiere-pro.svg";
import afterEffectsLogo from "../assets/logos/after-effects.svg";

export const services = [
  {
    title: "Full Stack Web Dev",
    desc: "End-to-end web applications with React, Node.js, and databases.",
    icon: SiReact,
    color: "#61DAFB",
    price: "From $500",
  },
  {
    title: "Responsive Design",
    desc: "Websites that look perfect on every device and screen size.",
    icon: SiCss,
    color: "#1572B6",
    price: "From $300",
  },
  {
    title: "Landing Pages",
    desc: "High-converting, beautiful landing pages that drive sales.",
    icon: SiNextdotjs,
    color: "#111827",
    price: "From $200",
  },
  {
    title: "Admin Dashboards",
    desc: "Complex data visualization and management panels.",
    icon: SiMongodb,
    color: "#47A248",
    price: "From $600",
  },
  {
    title: "UI/UX Design",
    desc: "Wireframes, prototypes, and stunning user interfaces in Figma.",
    icon: SiFigma,
    color: "#F24E1E",
    price: "From $250",
  },
  {
    title: "Cinematic Editing",
    desc: "Premium video editing for YouTube, commercials, and events.",
    logo: premiereProLogo,
    price: "From $150",
  },
  {
    title: "Social Media Reels",
    desc: "Fast-paced, engaging short-form content for TikTok and IG.",
    icon: SiInstagram,
    color: "#E1306C",
    price: "From $50",
  },
  {
    title: "Motion Graphics",
    desc: "Custom animations, intros, and visual effects for videos.",
    logo: afterEffectsLogo,
    price: "From $100",
  },
];

export default function Services() {
  const headerRef = useRef<HTMLDivElement>(null);
  const rm = useReducedMotion();
  const { scrollY } = useScroll();

  // text grows while scrolling UP, shrinks while scrolling DOWN — reverses with direction
  const scaleRaw = useMotionValue(1);
  const scale = useSpring(scaleRaw, { stiffness: 120, damping: 22, mass: 0.5 });
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (rm) return;
    const diff = latest - lastY.current;
    lastY.current = latest;
    const step = diff * 0.0022; // scroll sensitivity
    const next = Math.min(1.4, Math.max(0.7, scaleRaw.get() - step));
    scaleRaw.set(next);
  });

  return (
    <section id="services" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white -z-10" />

      <div className="container-tight relative z-10">

        {/* Header — enters from the RIGHT; grows on scroll-up, shrinks on scroll-down */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, x: rm ? 0 : 140 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <motion.h2 style={{ scale }} className="section-title mb-4 inline-block">
            What I <span className="text-gradient">Offer</span>
          </motion.h2>
          <div className="section-divider mx-auto" />
        </motion.div>

        {/* Desktop — unchanged grid, lg+ only */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            const num = (index + 1).toString().padStart(2, '0');
            const col = index % 4;
            const fromX = col < 2 ? -50 : 50;

            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, x: fromX, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: false, margin: "-40px" }}
                onViewportEnter={() => !rm && playCardPop()}
                transition={{ duration: 0.55, delay: (index % 4) * 0.08, type: "spring", stiffness: 120 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group p-8 interactive cursor-pointer relative overflow-hidden bg-white border border-blue-100 rounded-3xl transition-shadow duration-500 hover:shadow-[0_20px_40px_rgba(29,111,235,0.12)] gradient-border"
              >
                {/* Reverse-direction shine sweep on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, transparent 0%, rgba(29,111,235,0.04) 50%, transparent 100%)', animation: 'lightSweep 1.2s ease-out forwards' }} />

                {/* Background number */}
                <div className="absolute -right-4 -top-6 text-[120px] font-serif font-black text-blue-50/50 group-hover:text-primary/5 transition-colors duration-500 select-none z-0">
                  {num}
                </div>

                <motion.div
                  whileHover={{ rotate: -8, scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-sky-400/10 flex items-center justify-center mb-8 relative z-10 shadow-inner overflow-hidden"
                >
                  {service.logo ? (
                    <img src={service.logo} alt="" className="w-9 h-9 rounded-md" />
                  ) : Icon ? (
                    <Icon className="text-3xl transition-colors duration-500" style={{ color: service.color }} />
                  ) : null}
                </motion.div>

                <h3 className="text-2xl font-serif font-bold text-foreground mb-4 relative z-10 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-slate-600 text-base leading-relaxed mb-8 relative z-10 font-light">{service.desc}</p>

                <div className="mt-auto pt-6 border-t border-blue-100/50 flex items-center justify-between relative z-10">
                  <motion.span whileHover={{ scale: 1.08 }} className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-sm font-bold inline-block">
                    {service.price}
                  </motion.span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile / tablet — fanned overlapping card stack */}
        <div className="lg:hidden">
          <ServicesMobileStack services={services} />
        </div>
      </div>
    </section>
  );
}
