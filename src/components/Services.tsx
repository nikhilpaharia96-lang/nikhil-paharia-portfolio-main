import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  SiReact, SiTailwindcss, SiNextdotjs, SiChartdotjs,
  SiFigma, SiDavinciresolve, SiInstagram, SiBlender,
} from "react-icons/si";

const services = [
  { title: "Full Stack Web Dev", desc: "End-to-end web applications with React, Node.js, and databases.", icon: SiReact, color: "#61DAFB", price: "From $500" },
  { title: "Responsive Design", desc: "Websites that look perfect on every device and screen size.", icon: SiTailwindcss, color: "#06B6D4", price: "From $300" },
  { title: "Landing Pages", desc: "High-converting, beautiful landing pages that drive sales.", icon: SiNextdotjs, color: "#000000", price: "From $200" },
  { title: "Admin Dashboards", desc: "Complex data visualization and management panels.", icon: SiChartdotjs, color: "#FF6384", price: "From $600" },
  { title: "UI/UX Design", desc: "Wireframes, prototypes, and stunning user interfaces in Figma.", icon: SiFigma, color: "#F24E1E", price: "From $250" },
  { title: "Cinematic Editing", desc: "Premium video editing for YouTube, commercials, and events.", icon: SiDavinciresolve, color: "#233A51", price: "From $150" },
  { title: "Social Media Reels", desc: "Fast-paced, engaging short-form content for TikTok and IG.", icon: SiInstagram, color: "#E4405F", price: "From $50" },
  { title: "Motion Graphics", desc: "Custom animations, intros, and visual effects for videos.", icon: SiBlender, color: "#F5792A", price: "From $100" },
];

const spring = { type: "spring" as const, stiffness: 350, damping: 32, mass: 0.7 };

export default function Services() {
  // First card open by default so the stack reads correctly on load
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="services" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white -z-10" />

      <div className="container-tight relative z-10">

        {/* Header — slides in from RIGHT this time (reverse vs other sections) */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="section-title mb-4">What I <span className="text-gradient">Offer</span></h2>
          <div className="section-divider mx-auto" />
        </motion.div>

        {/* Stacked accordion — cards overlap vertically, one expands at a time */}
        <div className="max-w-3xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            const num = (index + 1).toString().padStart(2, "0");
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={service.title}
                layout
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-40px" }}
                transition={{ ...spring, delay: index * 0.05 }}
                style={{
                  marginTop: index === 0 ? 0 : -20,
                  zIndex: isOpen ? services.length + 1 : services.length - index,
                }}
                className="relative"
              >
                <motion.div
                  layout
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  aria-controls={`service-panel-${index}`}
                  id={`service-header-${index}`}
                  onClick={() => toggle(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(index);
                    }
                  }}
                  whileHover={{ y: -4 }}
                  transition={spring}
                  className="group interactive cursor-pointer relative overflow-hidden bg-white border border-blue-100 rounded-3xl transition-shadow duration-500 hover:shadow-[0_20px_40px_rgba(29,111,235,0.12)] gradient-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                  style={{
                    boxShadow: isOpen
                      ? "0 24px 48px rgba(29,111,235,0.16)"
                      : "0 6px 16px rgba(15,45,90,0.06)",
                  }}
                >
                  {/* Reverse-direction shine sweep on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ background: "linear-gradient(135deg, transparent 0%, rgba(29,111,235,0.04) 50%, transparent 100%)", animation: "lightSweep 1.2s ease-out forwards" }}
                  />

                  {/* Background number */}
                  <div className="absolute -right-4 -top-6 text-[120px] font-serif font-black text-blue-50/50 group-hover:text-primary/5 transition-colors duration-500 select-none z-0 pointer-events-none">
                    {num}
                  </div>

                  {/* Collapsed header row — always visible */}
                  <div className="flex items-center gap-5 p-6 sm:p-8 relative z-10">
                    <motion.div
                      whileHover={{ rotate: -8, scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-primary/10 to-sky-400/10 flex items-center justify-center shadow-inner"
                    >
                      <Icon className="text-3xl transition-colors duration-500" style={{ color: service.color }} />
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {service.title}
                      </h3>
                    </div>

                    <motion.span
                      whileHover={{ scale: 1.08 }}
                      className="hidden sm:inline-block shrink-0 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-sm font-bold"
                    >
                      {service.price}
                    </motion.span>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={spring}
                      className="shrink-0 text-slate-400 group-hover:text-primary transition-colors"
                      aria-hidden="true"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </div>

                  {/* Expandable content — description + price (mobile) */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        id={`service-panel-${index}`}
                        role="region"
                        aria-labelledby={`service-header-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={spring}
                        className="overflow-hidden relative z-10"
                      >
                        <div className="px-6 sm:px-8 pb-8">
                          <p className="text-slate-600 text-base leading-relaxed mb-8 font-light">
                            {service.desc}
                          </p>

                          <div className="pt-6 border-t border-blue-100/50 flex items-center justify-between">
                            <motion.span
                              whileHover={{ scale: 1.08 }}
                              className="sm:hidden px-4 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-sm font-bold inline-block"
                            >
                              {service.price}
                            </motion.span>
                            <span className="hidden sm:block text-xs text-slate-400 font-mono uppercase tracking-wide">
                              Tap to collapse
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
