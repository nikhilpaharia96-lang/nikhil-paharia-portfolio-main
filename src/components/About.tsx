diff --git a/src/components/About.tsx b/src/components/About.tsx
index 435fcda..38e1110 100644
--- a/src/components/About.tsx
+++ b/src/components/About.tsx
@@ -1,240 +1,331 @@
-import { motion, useScroll, useTransform, useInView } from "framer-motion";
-import { useEffect, useRef, useState } from "react";
-import teaAboutBg from "../assets/images/tea-sunset-person-wide.webp";
-import { RiCodeSSlashLine, RiVideoAddLine, RiPaletteLine } from "react-icons/ri";
-import Tilt from "@/components/ui/Tilt";
-import SplitText from "@/components/ui/SplitText";
-
-/* ── Animated counter ─────────────────────────────────── */
-function AboutCounter({ value }: { value: string }) {
-  const [count, setCount] = useState(0);
-  const ref = useRef(null);
-  const inView = useInView(ref, { once: true, margin: "-40px" });
-
-  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
-  const suffix = value.replace(/[0-9]/g, "");
-
-  useEffect(() => {
-    if (!inView || isNaN(numericValue)) return;
-    let start = 0;
-    const end = numericValue;
-    const totalMs = 1500;
-    const timer = setInterval(() => {
-      start += Math.ceil(end / (totalMs / 16));
-      if (start >= end) {
-        setCount(end);
-        clearInterval(timer);
-      } else {
-        setCount(start);
-      }
-    }, 16);
-    return () => clearInterval(timer);
-  }, [numericValue, inView]);
-
-  return <span ref={ref}>{count}{suffix}</span>;
-}
+import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
+import { useRef } from "react";
+import {
+  SiReact, SiNextdotjs, SiNodedotjs, SiExpress, SiMongodb,
+  SiTailwindcss, SiTypescript, SiFirebase, SiGithub,
+} from "react-icons/si";
 
-/* ── Hand-drawn SVG signature ─────────────────────────── */
-function Signature() {
-  const ref = useRef(null);
-  const inView = useInView(ref, { once: true });
+import silhouettePhoto from "../assets/images/tea-sunset-person-wide.webp";
+import polaroidPhoto from "../assets/images/profile-nobg.webp";
 
-  return (
-    <svg
-      ref={ref}
-      className="w-28 h-10 text-primary/70 mt-6 mx-auto"
-      viewBox="0 0 100 40"
-      fill="none"
-      xmlns="http://www.w3.org/2000/svg"
-    >
-      <motion.path
-        d="M10 28 Q22 4 32 24 T55 12 T75 22 T90 16"
-        stroke="currentColor"
-        strokeWidth="1.75"
-        strokeLinecap="round"
-        strokeLinejoin="round"
-        initial={{ pathLength: 0 }}
-        animate={inView ? { pathLength: 1 } : {}}
-        transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }}
-      />
-      <motion.path
-        d="M18 26 Q42 30 70 22"
-        stroke="currentColor"
-        strokeWidth="1.25"
-        strokeLinecap="round"
-        initial={{ pathLength: 0 }}
-        animate={inView ? { pathLength: 1 } : {}}
-        transition={{ duration: 1.1, ease: "easeInOut", delay: 1.2 }}
-      />
-    </svg>
-  );
-}
+import SplitText from "@/components/ui/SplitText";
+import MarkerHighlight from "@/components/about/MarkerHighlight";
+import Polaroid from "@/components/about/Polaroid";
+import StickyNote from "@/components/about/StickyNote";
+import HandDrawnArrow from "@/components/about/HandDrawnArrow";
+import FloatingStickers from "@/components/about/FloatingStickers";
+import "@/components/about/notebook.css";
 
 /* ── Data ─────────────────────────────────────────────── */
-const timeline = [
-  { year: "2020", title: "Started Video Editing", desc: "Discovered the art of visual storytelling. Spent countless hours mastering Premiere Pro and After Effects." },
-  { year: "2021", title: "Learned Web Development", desc: "HTML, CSS, JavaScript became my new tools. Realized I could build the things I imagined." },
-  { year: "2022", title: "Built First Client Projects", desc: "Turned skills into freelance income. Delivered high-quality websites and edits to local businesses." },
-  { year: "2023", title: "Full Stack Mastery", desc: "React, Node.js, MongoDB became my stack. Started building complex, interactive web applications." },
-  { year: "2024", title: "Premium Digital Creator", desc: "Fusing code and video to build truly cinematic digital experiences for global clients." },
+const techStack = [
+  { Icon: SiReact, label: "React", color: "#61DAFB" },
+  { Icon: SiNextdotjs, label: "Next.js", color: "#000000" },
+  { Icon: SiNodedotjs, label: "Node.js", color: "#5FA04E" },
+  { Icon: SiExpress, label: "Express", color: "#000000" },
+  { Icon: SiMongodb, label: "MongoDB", color: "#47A248" },
+  { Icon: SiTailwindcss, label: "Tailwind", color: "#38BDF8" },
+  { Icon: SiTypescript, label: "TypeScript", color: "#3178C6" },
+  { Icon: SiFirebase, label: "Firebase", color: "#FFCA28" },
+  { Icon: SiGithub, label: "GitHub", color: "#181717" },
 ];
 
-const statCards = [
-  { Icon: RiCodeSSlashLine, color: "text-primary",   val: "15+",  label: "Techs"   },
-  { Icon: RiVideoAddLine,   color: "text-accent",    val: "50+",  label: "Videos"  },
-  { Icon: RiPaletteLine,    color: "text-secondary", val: "100%", label: "Passion" },
+const favoriteThings = [
+  { emoji: "☕", label: "Assam Tea" },
+  { emoji: "⚽", label: "Football" },
+  { emoji: "💻", label: "Coding" },
+  { emoji: "🎬", label: "Video Editing" },
+  { emoji: "📖", label: "Learning" },
 ];
 
 /* ── Component ────────────────────────────────────────── */
 export default function About() {
-  const timelineRef = useRef<HTMLDivElement>(null);
-  const { scrollYProgress } = useScroll({
-    target: timelineRef,
-    offset: ["start end", "end start"],
-  });
-  const scaleY = useTransform(scrollYProgress, [0.08, 0.92], [0, 1]);
+  const notebookRef = useRef<HTMLDivElement>(null);
+  const prefersReducedMotion = useReducedMotion();
 
-  return (
-    <section id="about" className="section-padding relative overflow-hidden section-wrap max-w-full">
-      {/* Background */}
-      <div className="absolute inset-0 z-0">
-        <img
-          src={teaAboutBg}
-          alt=""
-          loading="lazy"
-          decoding="async"
-          className="w-full h-full object-cover object-center max-w-full"
-          style={{ filter: "brightness(0.82) saturate(0.8)" }}
-        />
-        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/70 to-white/80" />
-        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/80" />
-      </div>
+  // Raw normalized mouse offset from the notebook's center, range roughly [-1, 1].
+  const mx = useMotionValue(0);
+  const my = useMotionValue(0);
+
+  const tiltSpring = { stiffness: 120, damping: 16, mass: 0.6 };
+  const rotateX = useSpring(useTransform(my, [-1, 1], [3.5, -3.5]), tiltSpring);
+  const rotateY = useSpring(useTransform(mx, [-1, 1], [-3.5, 3.5]), tiltSpring);
 
-      <div className="container-tight relative z-10 max-w-full">
+  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
+    if (prefersReducedMotion || !notebookRef.current) return;
+    const rect = notebookRef.current.getBoundingClientRect();
+    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
+    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
+  };
 
-        {/* Header */}
+  const handleMouseLeave = () => {
+    mx.set(0);
+    my.set(0);
+  };
+
+  return (
+    <section
+      id="about"
+      className="notebook relative overflow-hidden py-20 sm:py-28 md:py-36"
+      style={{
+        background: "radial-gradient(ellipse at 50% 0%, #232323 0%, #141414 55%, #0d0d0d 100%)",
+      }}
+    >
+      {/* Faint vignette so the dark backdrop doesn't feel flat */}
+      <div
+        className="absolute inset-0 opacity-40 pointer-events-none"
+        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
+      />
+
+      <div className="container-tight relative z-10 max-w-6xl">
+        {/* ── Section eyebrow ── */}
         <motion.div
-          initial={{ opacity: 0, x: -60 }}
-          whileInView={{ opacity: 1, x: 0 }}
-          viewport={{ once: false, margin: "-80px" }}
-          transition={{ duration: 0.7, ease: "easeOut" }}
-          className="mb-20"
+          initial={{ opacity: 0, y: 20 }}
+          whileInView={{ opacity: 1, y: 0 }}
+          viewport={{ once: true, margin: "-80px" }}
+          transition={{ duration: 0.6 }}
+          className="mb-12 md:mb-16 text-center"
         >
-          <h2 className="section-title mb-4">
-            <SplitText type="words">The Story</SplitText>
+          <span className="text-xs font-mono uppercase tracking-[0.35em] text-blue-400/80 font-bold mb-4 block">
+            02 — About Me
+          </span>
+          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">
+            <SplitText type="words">My Diary</SplitText>
           </h2>
-          <div className="section-divider" />
+          <p className="handwriting text-blue-300/70 text-2xl mt-2">a page from my story, still being written</p>
         </motion.div>
 
-        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 w-full">
+        {/* ── The notebook ── */}
+        <div style={{ perspective: 1600 }}>
+          <motion.div
+            ref={notebookRef}
+            onMouseMove={handleMouseMove}
+            onMouseLeave={handleMouseLeave}
+            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
+            className="relative"
+          >
+            {/* Decorative floating stickers around the notebook */}
+            <FloatingStickers rawX={mx} rawY={my} />
+
+            <div className="notebook-page relative grid md:grid-cols-2 gap-x-0 gap-y-14 p-6 sm:p-10 md:p-14 lg:p-16">
+              {/* Book spine / center fold (desktop only) */}
+              <div className="hidden md:block absolute top-6 bottom-6 left-1/2 w-px bg-black/10 -translate-x-1/2" />
+              <div className="hidden md:block absolute top-6 bottom-6 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-black/[0.06] via-transparent to-black/[0.06]" />
 
-          {/* ── Timeline ── */}
-          <div ref={timelineRef} className="flex-1 order-2 lg:order-1 relative w-full">
-            {/* Faint track */}
-            <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-[2px] bg-slate-200/50 -translate-x-1/2 rounded-full" />
+              {/* Coffee stains, purely decorative */}
+              <div className="coffee-stain w-28 h-28 top-4 right-6 md:right-[52%]" />
+              <div className="coffee-stain w-16 h-16 bottom-10 left-4" />
 
-            {/* Scroll-drawn animated track */}
-            <motion.div
-              style={{ scaleY, transformOrigin: "top" }}
-              className="absolute left-4 md:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-primary via-accent to-sky-300 rounded-full -translate-x-1/2"
-            />
+              {/* ══════════════ LEFT PAGE ══════════════ */}
+              <div className="relative md:pr-10 flex flex-col gap-8">
+                <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
+                  <span>The Beginning</span>
+                  <span>Assam, India</span>
+                </div>
+
+                {/* Headline */}
+                <motion.h3
+                  initial={{ opacity: 0, y: 30 }}
+                  whileInView={{ opacity: 1, y: 0 }}
+                  viewport={{ once: true, margin: "-60px" }}
+                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
+                  className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-[1.15] text-[#1c1a17] font-sans uppercase"
+                >
+                  I started learning{" "}
+                  <MarkerHighlight delay={0.4}>code</MarkerHighlight> because I
+                  wanted to change my{" "}
+                  <MarkerHighlight delay={0.7}>family's</MarkerHighlight>{" "}
+                  future.
+                </motion.h3>
+
+                <motion.p
+                  initial={{ opacity: 0, y: 20 }}
+                  whileInView={{ opacity: 1, y: 0 }}
+                  viewport={{ once: true, margin: "-40px" }}
+                  transition={{ duration: 0.6, delay: 0.1 }}
+                  className="text-black/70 leading-relaxed text-base sm:text-lg"
+                >
+                  I didn't have expensive gadgets. I only had curiosity. Every
+                  small project made me a little better than the day before.
+                </motion.p>
 
-            <div className="flex flex-col gap-12 w-full">
-              {timeline.map((item, index) => {
-                const isRight = index % 2 !== 0;
-                return (
+                <motion.p
+                  initial={{ opacity: 0, y: 20 }}
+                  whileInView={{ opacity: 1, y: 0 }}
+                  viewport={{ once: true, margin: "-40px" }}
+                  transition={{ duration: 0.6, delay: 0.2 }}
+                  className="text-black/70 leading-relaxed text-base sm:text-lg -mt-4"
+                >
+                  Growing up in <MarkerHighlight delay={1.0}>Assam</MarkerHighlight>, surrounded by
+                  tea gardens, I had one small{" "}
+                  <MarkerHighlight delay={1.3}>dream</MarkerHighlight> — to
+                  build a <MarkerHighlight delay={1.6}>better life</MarkerHighlight> for the
+                  people I love.
+                </motion.p>
+
+                {/* Sticky note */}
+                <StickyNote rotate={-3} delay={0.2} className="handwriting text-xl leading-snug -ml-1 self-start">
+                  <p className="font-bold underline decoration-black/30 mb-1">Note to self</p>
+                  <p>✓ No big background</p>
+                  <p>✓ No perfect conditions</p>
+                  <p>✓ Just a dream and a laptop</p>
+                </StickyNote>
+
+                {/* Silhouette photo */}
+                <div className="relative">
                   <motion.div
-                    key={item.year}
-                    initial={{ opacity: 0, x: isRight ? 60 : -60 }}
-                    whileInView={{ opacity: 1, x: 0 }}
-                    viewport={{ once: false, margin: "-80px" }}
-                    transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
-                    className="relative pl-14 md:pl-0 md:w-1/2 group max-w-full overflow-hidden"
-                    style={{ marginLeft: isRight ? "auto" : "0" }}
+                    initial={{ opacity: 0, scale: 0.92, y: 30 }}
+                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
+                    viewport={{ once: true, margin: "-80px" }}
+                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
+                    className="rounded-md overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] rotate-[-1.5deg] w-full max-w-sm mx-auto md:mx-0"
                   >
-                    {/* Dot */}
-                    <div
-                      className="absolute left-0 md:left-auto md:right-[-20px] top-1 w-10 h-10 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10 shadow-[0_0_15px_rgba(29,111,235,0.4)] group-hover:scale-110 transition-transform"
-                      style={isRight ? { left: "-20px", right: "auto" } : {}}
-                    >
-                      <motion.div
-                        whileHover={{ scale: 1.4 }}
-                        className="w-3 h-3 rounded-full bg-primary group-hover:shadow-[0_0_10px_rgba(29,111,235,0.8)]"
-                      />
-                    </div>
+                    <img
+                      src={silhouettePhoto}
+                      alt="Silhouette against a tea-garden sunset, looking forward"
+                      loading="lazy"
+                      decoding="async"
+                      className="w-full h-56 sm:h-64 object-cover"
+                      style={{ filter: "brightness(0.85) saturate(0.9)" }}
+                    />
+                  </motion.div>
+
+                  <HandDrawnArrow
+                    d="M10 5 C 40 20, 30 45, 70 55"
+                    viewBox="0 0 100 70"
+                    className="w-16 h-14 absolute -bottom-8 left-6 text-blue-700/70"
+                    delay={0.3}
+                    headX={70}
+                    headY={55}
+                    headRotate={35}
+                  />
+
+                  <p className="handwriting text-xl sm:text-2xl text-[#1c1a17] mt-10 pl-8 leading-tight max-w-[80%]">
+                    "It started as curiosity. Then it became a way of thinking."
+                  </p>
+                </div>
+
+                {/* Polaroid */}
+                <div className="flex justify-center md:justify-end pt-4">
+                  <Polaroid
+                    src={polaroidPhoto}
+                    alt="Portrait photo"
+                    caption="A boy from a small tea garden in Assam."
+                    rotate={-4}
+                    delay={0.15}
+                  />
+                </div>
+              </div>
+
+              {/* ══════════════ RIGHT PAGE ══════════════ */}
+              <div className="relative md:pl-10 flex flex-col gap-8 border-t md:border-t-0 border-black/10 pt-10 md:pt-0">
+                <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono uppercase tracking-widest text-black/40">
+                  <span>One Yes Led To The Next</span>
+                  <span>Still Writing…</span>
+                </div>
+
+                <motion.h3
+                  initial={{ opacity: 0, y: 30 }}
+                  whileInView={{ opacity: 1, y: 0 }}
+                  viewport={{ once: true, margin: "-60px" }}
+                  transition={{ duration: 0.7 }}
+                  className="text-2xl sm:text-3xl font-serif font-bold text-[#1c1a17]"
+                >
+                  <SplitText type="words">My Purpose</SplitText>
+                </motion.h3>
+
+                {/* Purpose paper card, torn-edge style */}
+                <motion.div
+                  initial={{ opacity: 0, y: 30, rotate: 1.5 }}
+                  whileInView={{ opacity: 1, y: 0, rotate: 1.5 }}
+                  viewport={{ once: true, margin: "-60px" }}
+                  transition={{ duration: 0.7, delay: 0.1 }}
+                  className="bg-white/90 p-5 sm:p-6 shadow-md max-w-md"
+                  style={{
+                    clipPath:
+                      "polygon(2% 4%, 20% 0%, 45% 3%, 70% 0%, 98% 5%, 100% 96%, 78% 100%, 50% 97%, 25% 100%, 0% 95%)",
+                  }}
+                >
+                  <p className="text-black/70 leading-relaxed">
+                    I use my skills to build digital products that{" "}
+                    <MarkerHighlight delay={0.5}>solve real problems</MarkerHighlight> and help
+                    people connect. That's what drives me, every day.
+                  </p>
+                </motion.div>
+
+                <motion.p
+                  initial={{ opacity: 0, y: 20 }}
+                  whileInView={{ opacity: 1, y: 0 }}
+                  viewport={{ once: true, margin: "-40px" }}
+                  transition={{ duration: 0.6, delay: 0.15 }}
+                  className="handwriting text-2xl sm:text-3xl text-blue-700/90 -mt-2"
+                >
+                  "I want to build things that solve real problems."
+                </motion.p>
 
-                    <Tilt maxRotate={5} glowColor="#1d6feb" glowOpacity={0.1} className="md:mr-10">
+                {/* Tech stack, styled as a scattered handwritten list rather than a grid */}
+                <div>
+                  <p className="handwriting-alt text-sm uppercase tracking-widest text-black/40 mb-3">
+                    Tools I reach for
+                  </p>
+                  <div className="flex flex-wrap gap-3">
+                    {techStack.map(({ Icon, label, color }, i) => (
                       <motion.div
-                        whileHover={{ scale: 1.01 }}
-                        transition={{ type: "spring", stiffness: 300 }}
-                        className="glass-card p-6"
-                        style={isRight ? { marginLeft: "2.5rem", marginRight: "0" } : {}}
+                        key={label}
+                        initial={{ opacity: 0, y: 16, rotate: 0 }}
+                        whileInView={{ opacity: 1, y: 0, rotate: (i % 2 === 0 ? -1 : 1) * 3 }}
+                        whileHover={{ rotate: 0, scale: 1.08, y: -3 }}
+                        viewport={{ once: true, margin: "-40px" }}
+                        transition={{ duration: 0.4, delay: i * 0.05 }}
+                        className="flex items-center gap-1.5 bg-white/85 border border-black/10 rounded-md px-2.5 py-1.5 shadow-sm text-xs font-medium text-black/70"
                       >
-                        <div className="text-sm font-mono text-primary mb-2 tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-full">
-                          {item.year}
-                        </div>
-                        <h3 className="text-xl font-bold text-foreground mb-3 font-serif">{item.title}</h3>
-                        <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
+                        <Icon style={{ color }} className="w-3.5 h-3.5" />
+                        {label}
                       </motion.div>
-                    </Tilt>
-                  </motion.div>
-                );
-              })}
-            </div>
-          </div>
-
-          {/* ── Right panel ── */}
-          <div className="flex-1 order-1 lg:order-2">
-            <Tilt maxRotate={3} glowColor="#1d6feb" glowOpacity={0.08} className="sticky top-32">
-              <motion.div
-                initial={{ opacity: 0, x: 70 }}
-                whileInView={{ opacity: 1, x: 0 }}
-                viewport={{ once: false, margin: "-80px" }}
-                transition={{ duration: 0.8, ease: "easeOut" }}
-                className="glass-card p-8 md:p-12 glow-border"
-              >
-                <div className="mb-8 pb-6 border-b border-blue-100/60">
-                  <p className="text-primary/80 italic font-serif text-lg text-center">
-                    "From the green hills of Assam to the digital world..."
-                  </p>
+                    ))}
+                  </div>
                 </div>
 
-                <h3 className="text-3xl font-serif font-bold mb-6 text-foreground">
-                  <SplitText type="words">Who am I?</SplitText>
-                </h3>
-                <p className="text-lg text-slate-700 leading-relaxed mb-6 font-light">
-                  From learning to edit videos at 16, to building full-stack web apps, this is the story of a creator who never stopped learning.
-                </p>
-                <p className="text-slate-500 leading-relaxed mb-10">
-                  I don't just write code or cut clips. I craft experiences. Whether it's a high-converting e-commerce platform, a stunning portfolio, or a high-retention YouTube reel, my goal is always the same: capture attention and leave a lasting impression.
-                </p>
-
-                <div className="grid grid-cols-3 gap-4">
-                  {statCards.map(({ Icon, color, val, label }, i) => (
-                    <motion.div
-                      key={label}
-                      initial={{ opacity: 0, y: 30 }}
-                      whileInView={{ opacity: 1, y: 0 }}
-                      viewport={{ once: false }}
-                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1, type: "spring", stiffness: 200 }}
-                      whileHover={{ scale: 1.08, y: -4 }}
-                      className="glass-card p-4 text-center cursor-default"
-                    >
-                      <Icon className={`text-3xl ${color} mx-auto mb-2`} />
-                      <div className="text-xl font-bold text-foreground">
-                        <AboutCounter value={val} />
-                      </div>
-                      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
-                    </motion.div>
-                  ))}
+                {/* Favorite things */}
+                <div>
+                  <p className="handwriting-alt text-sm uppercase tracking-widest text-black/40 mb-3">
+                    Favorite things
+                  </p>
+                  <div className="flex flex-wrap gap-4">
+                    {favoriteThings.map(({ emoji, label }, i) => (
+                      <motion.div
+                        key={label}
+                        initial={{ opacity: 0, scale: 0.7 }}
+                        whileInView={{ opacity: 1, scale: 1 }}
+                        viewport={{ once: true, margin: "-40px" }}
+                        transition={{ duration: 0.4, delay: i * 0.06, type: "spring", stiffness: 260 }}
+                        whileHover={{ scale: 1.15, rotate: -6 }}
+                        className="flex flex-col items-center gap-1"
+                      >
+                        <span className="text-2xl">{emoji}</span>
+                        <span className="handwriting text-lg text-black/70 leading-none">{label}</span>
+                      </motion.div>
+                    ))}
+                  </div>
                 </div>
 
-                {/* Hand-drawn signature */}
-                <Signature />
-              </motion.div>
-            </Tilt>
-          </div>
-
+                {/* Emotional closing line */}
+                <motion.div
+                  initial={{ opacity: 0, y: 30 }}
+                  whileInView={{ opacity: 1, y: 0 }}
+                  viewport={{ once: true, margin: "-60px" }}
+                  transition={{ duration: 0.8, delay: 0.1 }}
+                  className="mt-4 pt-6 border-t border-dashed border-black/15"
+                >
+                  <p className="handwriting text-3xl sm:text-4xl text-[#1c1a17] leading-tight">
+                    Still figuring things out.
+                  </p>
+                  <p className="handwriting text-2xl sm:text-3xl text-blue-700/90 mt-1">
+                    And that's the best part. <span aria-hidden="true">♥</span>
+                  </p>
+                </motion.div>
+              </div>
+            </div>
+          </motion.div>
         </div>
       </div>
     </section>
diff --git a/src/components/Contact.tsx b/src/components/Contact.tsx
index 74f057a..e976455 100644
--- a/src/components/Contact.tsx
+++ b/src/components/Contact.tsx
@@ -263,7 +263,7 @@ const BUDGET_OPTIONS = [
 const contactInfo = [
   { Icon: RiMailFill,  label: "Email",    value: "nikhilpaharia96@gmail.com", href: "mailto:nikhilpaharia96@gmail.com" },
   { Icon: RiPhoneFill, label: "Phone",    value: "+91 94010 58667",           href: "tel:+919401058667" },
-  { Icon: RiMapPinFill,label: "Location", value: "Northh East India, Assam",              href: undefined ,
+  { Icon: RiMapPinFill,label: "Location", value: "Northh East India, Assam",              href: undefined },
 ];
 
 const socials = [
