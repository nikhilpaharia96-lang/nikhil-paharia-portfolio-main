import { motion } from "@/lib/static-motion";
import { RiArrowUpLine, RiGithubFill, RiLinkedinFill, RiInstagramLine, RiYoutubeFill } from "react-icons/ri";
import footerBg from "../assets/images/footer-bg.webp";
import Magnetic from "@/components/ui/Magnetic";
import SplitText from "@/components/ui/SplitText";
import { staggerContainer, cinChildSmall } from "@/lib/revealVariants";

const ease = [0.16, 1, 0.3, 1] as const;
const FONT_CONDENSED = "'Anton', 'Impact', sans-serif";
const bigText = "text-6xl sm:text-7xl leading-[0.95] uppercase text-foreground";

const socials = [
  { Icon: RiGithubFill,    href: "#", label: "GitHub",    hoverBg: "hover:bg-slate-900"   },
  { Icon: RiLinkedinFill,  href: "#", label: "LinkedIn",  hoverBg: "hover:bg-[#0A66C2]"   },
  { Icon: RiInstagramLine, href: "#", label: "Instagram", hoverBg: "hover:bg-[#E1306C]"   },
  { Icon: RiYoutubeFill,   href: "#", label: "YouTube",   hoverBg: "hover:bg-[#FF0000]"   },
];

const navLinks = [
  { label: "Home",     href: "#home"     },
  { label: "About",    href: "#about"    },
  { label: "Projects", href: "#projects" },
  { label: "Videos",   href: "#videos"   },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "auto" });

  return (
    <footer className="relative bg-blue-50 pt-32 pb-12 border-t border-blue-100 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <img
          src={footerBg}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-[center_64%]"
        />
        <div className="absolute inset-0 bg-white/30" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/80 to-transparent" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container-tight relative z-10">

        {/* Hero text */}
        <motion.div

          whileInView={{ opacity: 1, y: 0 }}


          className="text-center mb-24 max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            <SplitText type="words">Let's build the future.</SplitText>
          </h2>
          <p className="text-lg text-slate-600 font-light">
            Available for freelance opportunities globally. Bring your boldest ideas.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">

          {/* Brand — from LEFT */}
          <motion.div

            whileInView={{ opacity: 1, x: 0 }}


            className="text-center md:text-left"
          >
            <Magnetic range={50} strength={0.2}>
              <a href="#home" className="font-mono text-3xl font-bold tracking-wider block mb-3 flex items-center justify-center md:justify-start gap-2 text-foreground hover:opacity-80 ">
                Nikhil <span className="text-primary">Paharia</span>
              </a>
            </Magnetic>
            <p className="text-slate-600 text-base">Crafting cinematic digital experiences.</p>
          </motion.div>

          {/* Nav + Socials — from RIGHT */}
          <motion.div
            variants={staggerContainer}

            whileInView="show"


            className="flex flex-col items-center gap-6"
          >
            {/* Nav links */}
            <h3 className={bigText} style={{ fontFamily: FONT_CONDENSED }}>Explore</h3>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-600">
              {navLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}

                  variants={cinChildSmall}
                  className="hover:text-primary  interactive"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

            {/* Social icons wrapped in Magnetic */}
            <h3 className={`${bigText} mt-4`} style={{ fontFamily: FONT_CONDENSED }}>Social</h3>
            <div className="flex gap-4">
              {socials.map(({ Icon, href, label, hoverBg }) => (
                <Magnetic key={label} range={45} strength={0.4} scaleHover={1.15}>
                  <motion.a
                    href={href}
                    aria-label={label}

                    variants={cinChildSmall}
                    className={`interactive w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center ${hoverBg} hover:text-white  `}
                  >
                    <Icon className="text-lg" />
                  </motion.a>
                </Magnetic>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div

          whileInView={{ opacity: 1, y: 0 }}


          className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-blue-100"
        >
          <p className="text-slate-700 text-sm font-medium">
            © {new Date().getFullYear()} Nikhil Paharia. <span className="hidden sm:inline">All rights reserved.</span>
          </p>
          <p className="text-slate-700 text-sm italic">Crafted in Assam, for the world.</p>

          {/* Back-to-top — elastic morph button with Magnetic */}
          <Magnetic range={60} strength={0.45} scaleHover={1.1}>
            <motion.button
              onClick={scrollToTop}



              className="interactive w-12 h-12 rounded-full bg-white/90 border border-blue-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary   text-slate-600"
              aria-label="Scroll to top"
            >
              <motion.div


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
