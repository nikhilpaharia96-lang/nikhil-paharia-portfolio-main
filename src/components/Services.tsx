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
    title: "Social Media Marketing",
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

  // text grows while scrolling DOWN, shrinks while scrolling UP — reverses with direction
  const scaleRaw = useMotionValue(1);
  const scale = useSpring(scaleRaw, { stiffness: 120, damping: 22, mass: 0.5 });
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (rm) return;
    const diff = latest - lastY.current;
    lastY.current = latest;
    const step = diff * 0.0022; // scroll sensitivity
    const next = Math.min(1.4, Math.max(0.7, scaleRaw.get() + step));
    scaleRaw.set(next);
  });

  return (
    <section id="services" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white -z-10" />

      <div className="container-tight relative z-10">

        {/* Header — enters from the RIGHT; grows on scroll-down, shrinks on scroll-up */}
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

        {/* Fanned overlapping card stack — same on mobile and desktop
            (width capped on large screens so the cards don't stretch) */}
        <div className="max-w-xl md:max-w-2xl mx-auto">
          <ServicesMobileStack services={services} />
        </div>
      </div>
    </section>
  );
}
