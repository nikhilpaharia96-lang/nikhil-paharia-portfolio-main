import { motion } from "framer-motion";
import {
  RiArrowUpLine, RiGithubFill, RiLinkedinFill, RiInstagramLine, RiYoutubeFill,
  RiMailFill, RiPhoneFill, RiMapPinFill, RiHeartLine,
  RiHome4Line, RiUser3Line, RiBriefcaseLine, RiPlayCircleLine,
} from "react-icons/ri";
import teaBg from "../assets/images/tea-garden-bg.webp";
import Magnetic from "@/components/ui/Magnetic";
import SplitText from "@/components/ui/SplitText";

const socials = [
  { Icon: RiGithubFill,    href: "https://github.com/nikhilpaharia96-lang", label: "GitHub",    hoverBg: "hover:bg-slate-900"   },
  { Icon: RiLinkedinFill,  href: "#", label: "LinkedIn",  hoverBg: "hover:bg-[#0A66C2]"   },
  { Icon: RiInstagramLine, href: "#", label: "Instagram", hoverBg: "hover:bg-[#E1306C]"   },
  { Icon: RiYoutubeFill,   href: "#", label: "YouTube",   hoverBg: "hover:bg-[#FF0000]"   },
];

const navLinks = [
  { label: "Home",     href: "#home",     Icon: RiHome4Line     },
  { label: "About",    href: "#about",    Icon: RiUser3Line     },
  { label: "Projects", href: "#projects", Icon: RiBriefcaseLine },
  { label: "Videos",   href: "#videos",   Icon: RiPlayCircleLine},
];

const contactInfo = [
  { Icon: RiMailFill,  label: "Email",    value: "nikhilpaharia96@gmail.com", href: "mailto:nikhilpaharia96@gmail.com", bg: "bg-primary/10",  fg: "text-primary"  },
  { Icon: RiPhoneFill, label: "Phone",    value: "+91 00000 00000",           href: "tel:+910000000000",                bg: "bg-violet-100",  fg: "text-violet-500" },
  { Icon: RiMapPinFill,label: "Location", value: "Assam, India",              href: undefined,                          bg: "bg-emerald-100", fg: "text-emerald-500" },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative bg-gradient-to-b from-blue-50/30 to-white pt-28 pb-12 border-t border-blue-100 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none">
        <img src={teaBg} className="w-full h-full object-cover object-center grayscale" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Ambient background glow, matches the reference's soft blue orb */}
      <div className="absolute -top-24 right-0 w-[32rem] h-[32rem] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-0" />

      <div className="container-tight relative z-10">

        {/* Availability badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-green-200/80 shadow-[0_2px_12px_rgba(16,185,129,0.12)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs sm:text-sm font-semibold text-green-700 tracking-wide">
              Available for freelance opportunities globally
            </span>
          </div>
        </motion.div>

        {/* Hero-style heading */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8 max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground leading-[1.08] mb-2">
            <SplitText type="words">Let's build</SplitText>
            <br />
            <SplitText type="words" delay={0.1}>the</SplitText>{" "}
            <span className="text-gradient">
              <SplitText type="words" delay={0.16}>future</SplitText>
            </span>
          </h2>
          <p className="font-serif italic text-4xl md:text-6xl text-primary/90 -mt-1 mb-6">
            together.
          </p>
          <div className="section-divider mx-auto mb-6" />
          <p className="text-lg text-slate-500 font-light leading-relaxed">
            From full-stack web apps to cinematic video and brand design — tell
            me about your project and let's turn it into something exceptional.
          </p>
        </motion.div>

        {/* Contact info glass card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="glass-premium rounded-3xl p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
            {contactInfo.map(({ Icon, label, value, href, bg, fg }, i) => {
              const Wrapper = href ? motion.a : motion.div;
              return (
                <Wrapper
                  key={label}
                  {...(href ? { href } : {})}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  whileHover={{ y: -3 }}
                  className="interactive flex items-center gap-3 sm:flex-col sm:items-center sm:text-center"
                >
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full ${bg} flex items-center justify-center`}>
                    <Icon className={`${fg} text-lg`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                    <p className="text-sm sm:text-[0.95rem] text-foreground font-semibold break-words">{value}</p>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </motion.div>

        {/* Nav links row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="flex flex-wrap justify-center gap-x-10 gap-y-4 mb-10"
        >
          {navLinks.map((link, i) => {
            const NavIcon = link.Icon;
            return (
              <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="interactive group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-600 hover:text-primary transition-colors relative"
              >
                <NavIcon className="text-base" />
                {link.label}
                <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </motion.a>
            );
          })}
        </motion.div>

        {/* Heart doodle divider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
          className="flex justify-center mb-8"
        >
          <RiHeartLine className="text-2xl text-primary/40" />
        </motion.div>

        {/* Social icons wrapped in Magnetic */}
        <div className="flex justify-center gap-4 mb-16">
          {socials.map(({ Icon, href, label, hoverBg }, i) => (
            <Magnetic key={label} range={45} strength={0.4} scaleHover={1.15}>
              <motion.a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={label}
                whileTap={{ scale: 0.88 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.25 + i * 0.07, type: "spring", stiffness: 300 }}
                className={`interactive w-11 h-11 rounded-full bg-white border border-blue-100 shadow-sm flex items-center justify-center ${hoverBg} hover:text-white hover:border-transparent transition-colors duration-300 text-slate-700`}
              >
                <Icon className="text-lg" />
              </motion.a>
            </Magnetic>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center gap-3 pt-8 border-t border-blue-100 text-center"
        >
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} Nikhil Paharia. <span className="hidden sm:inline">All rights reserved.</span>
          </p>
          <p className="text-slate-500 text-sm italic flex items-center gap-1.5">
            <RiMapPinFill className="text-primary/60 text-sm" />
            Crafted in North East India, Assam, for the world.
          </p>

          {/* Back-to-top — elastic morph button with Magnetic */}
          <Magnetic range={60} strength={0.45} scaleHover={1.1}>
            <motion.button
              onClick={scrollToTop}
              whileHover={{
                scale: 1.15,
                y: -4,
                borderRadius: "14px",
                boxShadow: "0 0 24px rgba(29,111,235,0.45)",
              }}
              whileTap={{ scale: 0.9, rotate: 180 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="interactive w-12 h-12 rounded-full bg-white border border-blue-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors duration-300 text-slate-600 mt-2"
              aria-label="Scroll to top"
            >
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <RiArrowUpLine className="text-2xl" />
              </motion.div>
            </motion.button>
          </Magnetic>
        </motion.div>
      </div>
    </footer>
  );
}
