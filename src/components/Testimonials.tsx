import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import {
  Quote,
  Star,
  Users,
  Layers,
  ThumbsUp,
  Globe2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import teaBg from "../assets/images/tea-sunset-portrait.webp";
import SplitText from "@/components/ui/SplitText";

/* ────────────────────────────────────────────────────────────
   Data
   ──────────────────────────────────────────────────────────── */

type Testimonial = {
  id: number;
  name: string;
  role: string;
  company: string;
  companyShort: string;
  companyColor: string;
  avatarFrom: string;
  avatarTo: string;
  initials: string;
  avatarImg: string;
  companyLogo: string;
  flag: string;
  country: string;
  projectType: string;
  result: string;
  content: string;
};

const featuredTestimonial: Testimonial = {
  id: 0,
  name: "Rohan Sharma",
  role: "Founder",
  company: "ApunBazar",
  companyShort: "AB",
  companyColor: "#1d6feb",
  avatarFrom: "#1d6feb",
  avatarTo: "#3b82f6",
  initials: "RS",
  avatarImg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr7vL5Zw5rT5ojGVEJqaziZD5Jmi8l5K_BtahvYUh6Rw&s=10",
  companyLogo: "data:image/png;base64,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",
  flag: "🇮🇳",
  country: "India",
  projectType: "E-Commerce Platform",
  result: "↑ 40% Conversion",
  content:
    "Nikhil is a highly skilled developer who delivers clean, modern and scalable solutions. He understood our vision instantly and shipped a platform that genuinely moved the needle on our business. Professional, dedicated and a pleasure to work with from day one.",
};

const testimonials: Testimonial[] = [
  featuredTestimonial,
  {
    id: 1,
    name: "Anjan Kalita",
    role: "Student Leader",
    company: "Jagiroad College",
    companyShort: "JC",
    companyColor: "#7c3aed",
    avatarFrom: "#7c3aed",
    avatarTo: "#a78bfa",
    initials: "AK",
    avatarImg: "https://api.dicebear.com/9.x/avataaars/svg?seed=Anjan-Kalita-JagiroadCollege&backgroundColor=e0d4fd,f1e4fd",
    companyLogo: "https://api.dicebear.com/9.x/initials/svg?seed=JagiroadCollege&backgroundType=gradientLinear&backgroundColor=7c3aed,a78bfa&fontFamily=Arial&fontWeight=700&radius=20",
    flag: "🇮🇳",
    country: "India",
    projectType: "Community Web Platform",
    result: "3x More Engagement",
    content:
      "Working with Nikhil was a smooth experience from start to finish. He understood the requirements perfectly and built a fantastic platform for our entire college community.",
  },
  {
    id: 2,
    name: "Priya Deka",
    role: "Co-Founder",
    company: "FitBite",
    companyShort: "FB",
    companyColor: "#059669",
    avatarFrom: "#059669",
    avatarTo: "#34d399",
    initials: "PD",
    avatarImg: "https://api.dicebear.com/9.x/avataaars/svg?seed=Priya-Deka-FitBite&backgroundColor=c7f2dc,d4f7e5",
    companyLogo: "https://api.dicebear.com/9.x/initials/svg?seed=FitBite&backgroundType=gradientLinear&backgroundColor=059669,34d399&fontFamily=Arial&fontWeight=700&radius=20",
    flag: "🇮🇳",
    country: "India",
    projectType: "Mobile App Landing",
    result: "500K+ Views",
    content:
      "Nikhil is not just a developer but a genuine problem solver. He has a great eye for detail and consistently delivers results before the deadline.",
  },
  {
    id: 3,
    name: "Meera Bora",
    role: "Marketing Head",
    company: "Travel Assam",
    companyShort: "TA",
    companyColor: "#f59e0b",
    avatarFrom: "#f59e0b",
    avatarTo: "#fbbf24",
    initials: "MB",
    avatarImg: "https://api.dicebear.com/9.x/avataaars/svg?seed=Meera-Bora-TravelAssam&backgroundColor=fde7c4,ffe9c7",
    companyLogo: "https://api.dicebear.com/9.x/initials/svg?seed=TravelAssam&backgroundType=gradientLinear&backgroundColor=f59e0b,fbbf24&fontFamily=Arial&fontWeight=700&radius=20",
    flag: "🇮🇳",
    country: "India",
    projectType: "Travel Website",
    result: "2x More Leads",
    content:
      "The website Nikhil built captured the soul of Assam perfectly. Bookings picked up almost immediately after launch, and clients keep complimenting the design.",
  },
  {
    id: 4,
    name: "Kabir Singh",
    role: "Product Manager",
    company: "Nexlify",
    companyShort: "NX",
    companyColor: "#0ea5e9",
    avatarFrom: "#0ea5e9",
    avatarTo: "#38bdf8",
    initials: "KS",
    avatarImg: "https://api.dicebear.com/9.x/avataaars/svg?seed=Kabir-Singh-Nexlify&backgroundColor=c5eefc,d6f2fd",
    companyLogo: "https://api.dicebear.com/9.x/initials/svg?seed=Nexlify&backgroundType=gradientLinear&backgroundColor=0ea5e9,38bdf8&fontFamily=Arial&fontWeight=700&radius=20",
    flag: "🇦🇪",
    country: "UAE",
    projectType: "SaaS Dashboard",
    result: "↑ 55% Retention",
    content:
      "Even working across time zones, Nikhil was responsive, sharp and precise. The dashboard he shipped is faster and cleaner than what our last agency delivered.",
  },
  {
    id: 5,
    name: "Ishita Bhattacharya",
    role: "Creative Director",
    company: "PixelCraft Studio",
    companyShort: "PC",
    companyColor: "#e1306c",
    avatarFrom: "#e1306c",
    avatarTo: "#f472b6",
    initials: "IB",
    avatarImg: "https://api.dicebear.com/9.x/avataaars/svg?seed=Ishita-Bhattacharya-PixelCraft&backgroundColor=fbd5e4,fde2ec",
    companyLogo: "https://api.dicebear.com/9.x/initials/svg?seed=PixelCraftStudio&backgroundType=gradientLinear&backgroundColor=e1306c,f472b6&fontFamily=Arial&fontWeight=700&radius=20",
    flag: "🇬🇧",
    country: "UK",
    projectType: "Brand Video Campaign",
    result: "1M+ Impressions",
    content:
      "Rare to find someone who edits with this much taste. Every cut, transition and grade felt intentional. The campaign outperformed everything we've run before.",
  },
];

const trustStats = [
  { icon: Users, value: "30+", label: "Trusted by Clients" },
  { icon: Layers, value: "40+", label: "Projects Delivered" },
  { icon: Star, value: "5 Star", label: "Rated by Clients" },
  { icon: ThumbsUp, value: "98%", label: "Client Satisfaction" },
  { icon: Globe2, value: "Global", label: "Remote Work" },
];

const ease = [0.16, 1, 0.3, 1] as const;

/* ────────────────────────────────────────────────────────────
   Real avatar / logo image — with graceful initials fallback
   ──────────────────────────────────────────────────────────── */

function AvatarImg({
  src,
  alt,
  fallback,
  className = "",
}: {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full h-full object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

/* ────────────────────────────────────────────────────────────
   Star rating
   ──────────────────────────────────────────────────────────── */

function Stars({ size = "sm" }: { size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-1" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.25 + i * 0.07, duration: 0.35, ease: "backOut" }}
        >
          <Star className={`${dim} text-amber-400 fill-amber-400`} />
        </motion.div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Magnetic wrapper — buttons subtly follow the cursor
   ──────────────────────────────────────────────────────────── */

function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Featured testimonial — large glass hero card
   ──────────────────────────────────────────────────────────── */

function FeaturedTestimonial({ t }: { t: Testimonial }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springCfg = { stiffness: 150, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(my, [0, 1], [3, -3]), springCfg);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-3, 3]), springCfg);
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(520px circle at ${x} ${y}, ${t.avatarFrom}22, transparent 70%)`
  );

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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-80px" }}
      transition={{ duration: 0.9, ease }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative rounded-[32px] p-[1.5px]"
      >
        <div
          className="absolute -inset-[1.5px] rounded-[32px] opacity-70 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${t.avatarFrom}70, rgba(255,255,255,0.25) 45%, ${t.avatarFrom}40)`,
          }}
        />
        <div className="absolute -inset-8 rounded-[44px] bg-primary/15 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 -z-10" />

        <div
          className="relative rounded-[31px] overflow-hidden p-7 sm:p-10 md:p-12
                     bg-white/50 backdrop-blur-2xl
                     shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_40px_80px_-24px_rgba(15,45,90,0.32)]"
        >
          {/* mouse-follow glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: glowBg }}
          />
          {/* inner highlight line */}
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          {/* floating giant quote mark */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-6 right-7 sm:top-8 sm:right-10 opacity-15"
          >
            <Quote
              className="w-16 h-16 sm:w-24 sm:h-24"
              style={{ color: t.avatarFrom }}
              fill={t.avatarFrom}
            />
          </motion.div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4 flex-wrap">
              <Stars size="lg" />
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs sm:text-sm font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                {t.result}
              </div>
            </div>

            <p className="font-serif text-xl sm:text-2xl md:text-[1.75rem] leading-snug sm:leading-snug text-foreground max-w-3xl mb-8 sm:mb-10">
              "{t.content}"
            </p>

            <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/60">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex items-center justify-center text-white text-lg sm:text-xl font-black shrink-0 shadow-[0_10px_24px_-8px_rgba(15,45,90,0.4)]"
                  style={{ background: `linear-gradient(135deg, ${t.avatarFrom}, ${t.avatarTo})` }}
                >
                  <AvatarImg src={t.avatarImg} alt={t.name} fallback={t.initials} />
                </div>
                <div>
                  <p className="font-serif font-bold text-foreground text-base sm:text-lg leading-tight flex items-center gap-1.5">
                    {t.name} <span aria-label={t.country}>{t.flag}</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {t.role} ·{" "}
                    <span className="font-semibold" style={{ color: t.companyColor }}>
                      {t.company}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{ backgroundColor: t.companyColor }}
                  aria-label={`${t.company} logo`}
                >
                  <AvatarImg src={t.companyLogo} alt={`${t.company} logo`} fallback={t.companyShort} />
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur border border-white/70 text-xs font-semibold text-slate-600 whitespace-nowrap">
                  {t.projectType}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Carousel testimonial card
   ──────────────────────────────────────────────────────────── */

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springCfg = { stiffness: 200, damping: 20, mass: 0.4 };
  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), springCfg);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), springCfg);
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(260px circle at ${x} ${y}, ${t.avatarFrom}2e, transparent 70%)`
  );

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease }}
      className="h-full"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={{ y: -8 }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative h-full rounded-[28px] p-[1px] interactive cursor-default"
      >
        <div
          className="absolute inset-0 rounded-[28px] opacity-45 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${t.avatarFrom}55, transparent 45%, ${t.avatarFrom}25)`,
          }}
        />

        <div
          className="relative h-full flex flex-col rounded-[27px] p-6 sm:p-7
                     bg-white/50 backdrop-blur-2xl
                     shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_18px_46px_-20px_rgba(15,45,90,0.28)]
                     group-hover:shadow-[0_1px_0_rgba(255,255,255,0.75)_inset,0_26px_56px_-18px_rgba(15,45,90,0.36)]
                     transition-shadow duration-500"
        >
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[27px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: glowBg }}
          />

          <div className="flex items-start justify-between mb-4">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Quote
                className="w-8 h-8"
                style={{ color: t.avatarFrom }}
                fill={t.avatarFrom}
                fillOpacity={0.18}
              />
            </motion.div>
            <Stars />
          </div>

          <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-6">
            {t.content}
          </p>

          <div className="h-px bg-white/70 mb-5" />

          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm"
              style={{ background: `linear-gradient(135deg, ${t.avatarFrom}, ${t.avatarTo})` }}
            >
              <AvatarImg src={t.avatarImg} alt={t.name} fallback={t.initials} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm leading-tight flex items-center gap-1.5 truncate">
                {t.name} <span className="shrink-0">{t.flag}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                {t.role} ·{" "}
                <span className="font-semibold" style={{ color: t.companyColor }}>
                  {t.company}
                </span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Embla carousel wrapper — autoplay, pause on hover, magnetic arrows
   ──────────────────────────────────────────────────────────── */

function TestimonialCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const id = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(id);
  }, [emblaApi, isPaused]);

  return (
    <div
      className="relative mt-10 sm:mt-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 sm:gap-6 -ml-5 sm:-ml-6">
          {testimonials.map((t, index) => (
            <div
              key={t.id}
              className="pl-5 sm:pl-6 shrink-0 grow-0 basis-[85%] xs:basis-[75%] sm:basis-[55%] lg:basis-[38%]"
            >
              <TestimonialCard t={t} index={index} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        {/* dot progress */}
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className="interactive py-2"
            >
              <motion.span
                animate={{
                  width: i === selectedIndex ? 24 : 8,
                  backgroundColor: i === selectedIndex ? "#1d6feb" : "#cbd5e1",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="block rounded-full h-2"
              />
            </button>
          ))}
        </div>

        {/* magnetic nav arrows */}
        <div className="flex items-center gap-3">
          <Magnetic strength={0.4}>
            <button
              aria-label="Previous testimonial"
              onClick={() => emblaApi?.scrollPrev()}
              className="interactive w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/55 backdrop-blur-xl border border-white/70 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/40 shadow-[0_10px_28px_-12px_rgba(15,45,90,0.3)] transition-colors duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Magnetic>
          <Magnetic strength={0.4}>
            <button
              aria-label="Next testimonial"
              onClick={() => emblaApi?.scrollNext()}
              className="interactive w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/55 backdrop-blur-xl border border-white/70 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/40 shadow-[0_10px_28px_-12px_rgba(15,45,90,0.3)] transition-colors duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Trust bar
   ──────────────────────────────────────────────────────────── */

function TrustBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: 0.7 }}
      className="mt-16 sm:mt-20 rounded-3xl p-6 sm:p-8
                 bg-white/45 backdrop-blur-2xl border border-white/70
                 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_55px_-22px_rgba(15,45,90,0.28)]
                 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8"
    >
      {trustStats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            whileHover={{ y: -5 }}
            className="group flex flex-col items-start gap-3"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-white/70 backdrop-blur border border-white/80 flex items-center justify-center shadow-[0_10px_24px_-10px_rgba(15,45,90,0.3)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3">
              <Icon className="w-5 h-5 text-primary" />
              <div className="absolute inset-0 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />
            </div>
            <div className="font-serif font-extrabold text-xl sm:text-2xl text-foreground">
              {stat.value}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-snug">{stat.label}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main section
   ──────────────────────────────────────────────────────────── */

export default function Testimonials() {
  const particles = useMemo(() => Array.from({ length: 14 }), []);

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden section-wrap max-w-full py-20 sm:py-28 md:py-36 lg:py-40"
      aria-label="Testimonials — Client Stories"
    >
      {/* ── Cinematic parallax background ── */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src={teaBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center scale-110"
          style={{ filter: "brightness(0.9) saturate(0.9)" }}
          animate={{ scale: [1.1, 1.16, 1.1], x: [0, -10, 0] }}
          transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/93 via-white/80 to-white/93" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-transparent to-blue-50/60" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_20%,rgba(8,20,45,0.06)_100%)]" />
      </div>

      {/* ── Light rays ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-50 mix-blend-overlay">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute top-[-20%] w-[3px] h-[140%] bg-gradient-to-b from-amber-100/60 via-white/20 to-transparent"
            style={{ left: `${20 + i * 28}%`, rotate: "18deg" }}
            animate={{ opacity: [0.2, 0.55, 0.2] }}
            transition={{
              duration: 6 + i * 1.5,
              delay: i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── Fog orbs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[8%] left-[8%] w-[26rem] h-[26rem] bg-blue-200/20 rounded-full blur-[130px]"
          style={{ animation: "fogDrift 15s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[6%] right-[6%] w-[22rem] h-[22rem] bg-amber-100/25 rounded-full blur-[110px]"
          style={{ animation: "fogDrift 19s ease-in-out infinite reverse" }}
        />
      </div>

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/70"
            style={{
              left: `${(i * 43) % 100}%`,
              top: `${(i * 61) % 100}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              boxShadow: "0 0 6px rgba(255,255,255,0.8)",
            }}
            animate={{ y: [0, -26, 0], opacity: [0.15, 0.55, 0.15] }}
            transition={{
              duration: 6 + (i % 5),
              delay: i * 0.32,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container-tight relative z-10 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-10 items-start mb-4">
          {/* ═══════════════ LEFT COLUMN ═══════════════ */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 relative">
            {/* floating giant quote mark decoration */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 -left-2 hidden lg:block opacity-10 pointer-events-none"
            >
              <Quote className="w-28 h-28 text-primary" fill="currentColor" />
            </motion.div>

            {/* decorative shapes */}
            <div className="absolute top-24 right-2 w-14 h-14 rounded-2xl border border-primary/20 hidden lg:block pointer-events-none" />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-16 right-10 w-8 h-8 rounded-full border border-dashed border-primary/30 hidden lg:block pointer-events-none"
            />

            {/* subtle arrow illustration pointing toward the testimonial */}
            <svg
              aria-hidden="true"
              className="absolute left-full top-52 hidden lg:block opacity-40 pointer-events-none -ml-4"
              width="140"
              height="90"
              viewBox="0 0 140 90"
              fill="none"
            >
              <motion.path
                d="M4 10 C 60 10, 60 70, 130 70"
                stroke="url(#arrowGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <motion.path
                d="M116 62 L130 70 L118 78"
                stroke="url(#arrowGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 1.6 }}
              />
              <defs>
                <linearGradient id="arrowGradient" x1="0" y1="0" x2="140" y2="90">
                  <stop offset="0%" stopColor="#1d6feb" stopOpacity="0" />
                  <stop offset="50%" stopColor="#1d6feb" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#1d6feb" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.7, ease }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-white/60 backdrop-blur-xl border border-white/70
                         shadow-[0_8px_24px_-10px_rgba(15,45,90,0.25)] mb-7"
            >
              <span aria-hidden="true">💬</span>
              <span className="text-xs font-mono font-semibold tracking-[0.18em] uppercase text-primary">
                Client Stories
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.8, ease }}
              className="font-serif font-bold text-[2.4rem] sm:text-5xl lg:text-[3.1rem] leading-[1.08] text-foreground mb-6"
            >
              <SplitText type="words">Loved by Clients.</SplitText>
              <br />
              <SplitText type="words" delay={0.15}>
                Built on Trust.
              </SplitText>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-md"
            >
              Real stories from founders, creators and businesses I've worked
              with. Every project is crafted with attention to detail,
              performance and long-term impact.
            </motion.p>
          </div>

          {/* ═══════════════ RIGHT COLUMN ═══════════════ */}
          <div className="lg:col-span-8">
            <FeaturedTestimonial t={featuredTestimonial} />
            <TestimonialCarousel />
          </div>
        </div>

        <TrustBar />
      </div>
    </section>
  );
}
