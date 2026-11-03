import type { CSSProperties, MouseEvent } from "react";
import { FaGithub, FaInstagram, FaLinkedinIn, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { motion, useReducedMotion } from "framer-motion";
import "./hero-interactions.css";

/**
 * Social icons — hover scale + brand-colour glow, tooltip, press feedback, staggered reveal.
 * Touch targets are 44×44px (the visible circle is smaller).
 *
 * ▶ EDIT THE `href` VALUES BELOW with your real profile links.
 *   Entries left as "#" stay visible but are inert (they don't jump or open a blank tab).
 */
const SOCIALS = [
  { label: "GitHub",    href: "https://github.com/nikhilpaharia96-lang", Icon: FaGithub,     brand: "#24292f", glow: "36, 41, 47" },
  { label: "LinkedIn",  href: "#", Icon: FaLinkedinIn, brand: "#0a66c2", glow: "10, 102, 194" },
  { label: "Instagram", href: "#", Icon: FaInstagram,  brand: "#e4405f", glow: "228, 64, 95" },
  { label: "YouTube",   href: "#", Icon: FaYoutube,    brand: "#e62117", glow: "230, 33, 23" },
  { label: "X",         href: "#", Icon: FaXTwitter,   brand: "#0f1419", glow: "15, 20, 25" },
  { label: "WhatsApp",  href: "#", Icon: FaWhatsapp,   brand: "#25d366", glow: "37, 211, 102" },
];

export default function SocialLinks({ variant }: { variant: "mobile" | "desktop" }) {
  const reduced = useReducedMotion() ?? false;
  const isMobile = variant === "mobile";

  return (
    <div className={`flex items-center justify-center flex-nowrap ${isMobile ? "gap-0" : "gap-0.5"}`}>
      {SOCIALS.map(({ label, href, Icon, brand, glow }, i) => {
        const external = /^https?:\/\//.test(href);
        const style = {
          "--brand": brand,
          "--glow": `rgba(${glow}, 0.45)`,
          "--glow-soft": `rgba(${glow}, 0.14)`,
          "--dot": isMobile ? "34px" : "38px",
          "--ico": isMobile ? "0.95rem" : "1.05rem",
        } as CSSProperties;

        return (
          <motion.span
            key={label}
            className="inline-flex"
            initial={reduced ? false : { opacity: 0, y: 12, scale: 0.85 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 0.8, 0.24, 1] }}
          >
            <a
              href={href}
              className="social"
              style={style}
              aria-label={label}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                if (!external) e.preventDefault();
              }}
            >
              <span className="social__dot">
                <Icon aria-hidden="true" />
              </span>
              <span className="social__tip" aria-hidden="true">
                {label}
              </span>
            </a>
          </motion.span>
        );
      })}
    </div>
  );
}
