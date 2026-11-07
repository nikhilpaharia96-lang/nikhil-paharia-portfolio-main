import { useMemo, useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Play, X, MapPin, ExternalLink } from "lucide-react";
import bgVideo from "@/assets/videos/loading-bg-desktop.mp4";
import { featuredVideo, projects, reelProjects } from "@/constants/videoShowcase";
import { parseVideoUrl } from "@/utils/videoEmbed";
import { ease, tiltSpring } from "@/animations/videoShowcase.motion";

type PlaylistItem = {
  key: string;
  title: string;
  desc: string;
  image: string;
  url: string;
};

/**
 * Cinematic featured card. Looks like a video player; pressing play swaps the
 * poster for the real video *inside the card* (no popup) and shows a thumbnail
 * playlist underneath so visitors can switch films without leaving the section.
 */
export default function FeaturedVideoCard() {
  const prefersReducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Hover preview only while the poster is showing.
  const active = hovered && !playing;

  // Playable videos — featured first, duplicate links removed.
  const playlist = useMemo<PlaylistItem[]>(() => {
    const seen = new Set<string>();
    const items: PlaylistItem[] = [];
    const add = (item: PlaylistItem) => {
      const parsed = parseVideoUrl(item.url);
      if (!parsed || parsed.kind === "unknown" || seen.has(parsed.embedUrl)) return;
      seen.add(parsed.embedUrl);
      items.push(item);
    };
    const match = projects.find((p) => p.videoUrl && p.videoUrl === featuredVideo.videoUrl);
    if (featuredVideo.videoUrl) {
      add({
        key: "featured",
        title: match?.title ?? `${featuredVideo.title} — ${featuredVideo.subtitle}`,
        desc: match?.description ?? featuredVideo.category,
        image: featuredVideo.image,
        url: featuredVideo.videoUrl,
      });
    }
    reelProjects.forEach(
      (p) => p.videoUrl && add({ key: `p-${p.id}`, title: p.title, desc: p.description, image: p.image, url: p.videoUrl }),
    );
    return items;
  }, []);

  useEffect(() => setLoaded(false), [activeIdx, playing]);

  const current = playlist[activeIdx];
  const parsed = parseVideoUrl(current?.url);
  const hasVideos = playlist.length > 0;
  const featuredLocation = projects.find((p) => p.videoUrl && p.videoUrl === featuredVideo.videoUrl)?.location;

  const open = (idx = 0) => {
    if (!hasVideos) return;
    setHovered(false);
    setActiveIdx(idx);
    setPlaying(true);
  };

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [4, -4]), tiltSpring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-4, 4]), tiltSpring);
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(480px circle at ${x} ${y}, rgba(29,111,235,0.25), transparent 70%)`,
  );

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (active) {
      vid.currentTime = 0;
      vid.play().catch(() => {});
    } else {
      vid.pause();
      vid.currentTime = 0;
    }
  }, [active]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || playing) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    setHovered(false);
    mx.set(0.5);
    my.set(0.5);
  };

  const still = prefersReducedMotion || playing;

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 40 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease }}
    >
      <motion.div
        animate={still || active ? { y: 0 } : { y: [0, -10, 0] }}
        transition={still || active ? { duration: 0.4 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          ref={ref}
          onMouseEnter={() => setHovered(true)}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{
            rotateX: still ? 0 : rotateX,
            rotateY: still ? 0 : rotateY,
            transformStyle: "preserve-3d",
          }}
          className="group relative rounded-[32px] p-[3px] sm:p-[4px]"
        >
          <div className="absolute -inset-[1.5px] rounded-[32px] bg-gradient-to-br from-white/90 via-white/50 to-white/80 opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -inset-6 rounded-[40px] bg-primary/20 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 -z-10" />

          {!playing ? (
            /* ───────── Poster: same look as the reference design ───────── */
            <div className="relative rounded-[31px] overflow-hidden bg-[#0a1220] aspect-video w-full shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_50px_100px_-28px_rgba(8,20,45,0.6)]">
              <motion.img
                src={featuredVideo.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                animate={{
                  scale: active ? 1.1 : prefersReducedMotion ? 1 : [1.02, 1.09, 1.02],
                  filter: active ? "blur(1px) brightness(0.6)" : "brightness(0.95)",
                }}
                transition={
                  active || prefersReducedMotion
                    ? { duration: 0.7, ease: "easeOut" }
                    : { scale: { duration: 22, repeat: Infinity, ease: "easeInOut" }, filter: { duration: 0.7 } }
                }
                className="absolute inset-0 w-full h-full object-cover"
              />

              <video
                ref={videoRef}
                src={bgVideo}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/30 pointer-events-none" />
              {/* cinema finish: vignette + a touch of film grain */}
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.5) 100%)" }} />
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none opacity-[0.13] mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                }}
              />

              <motion.div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: glowBg }}
              />

              {/* Badges */}
              <div className="absolute top-3 left-3 right-3 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[12px] font-bold uppercase tracking-[0.16em]">
                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-70 animate-ping motion-reduce:hidden" />
                      <span className="relative inline-flex h-full w-full rounded-full bg-red-500" />
                    </span>
                    Now showing
                  </span>
                  <span className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-full bg-white/95 border border-white text-slate-800 text-[9px] sm:text-[13px] font-bold uppercase tracking-[0.14em] shadow-sm">
                    {featuredVideo.category}
                  </span>
                </div>
                <span className="px-2.5 py-1 sm:px-4 sm:py-2 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white/95 text-[10px] sm:text-sm font-mono font-semibold">
                  {featuredVideo.duration}
                </span>
              </div>

              {/* Centered stack: play button, title, script subtitle with side lines */}
              <div className="absolute inset-x-0 top-8 sm:top-0 bottom-9 sm:bottom-14 lg:bottom-[4.5rem] z-20 flex flex-col items-center justify-center gap-1.5 sm:gap-5 sm:pt-12 px-4 text-center">
                <motion.button
                  type="button"
                  onClick={() => open(0)}
                  disabled={!hasVideos}
                  aria-label={`Play ${featuredVideo.title}`}
                  className="interactive relative focus-visible:outline-none disabled:cursor-default"
                  animate={{ scale: active ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  {!prefersReducedMotion && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-white/40"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <motion.svg
                    aria-hidden="true"
                    viewBox="0 0 120 120"
                    className="hidden sm:block absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] text-white/85 pointer-events-none"
                    animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                  >
                    <defs>
                      <path id="play-ring" d="M60,60 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
                    </defs>
                    <text fontSize="9" fontWeight="700" fill="currentColor">
                      <textPath href="#play-ring" textLength="305" lengthAdjust="spacing">PLAY THE FILM • PLAY THE FILM •</textPath>
                    </text>
                  </motion.svg>
                  <div className="relative w-11 h-11 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white flex items-center justify-center shadow-[0_18px_40px_-10px_rgba(0,0,0,0.45)] focus-visible:ring-4 focus-visible:ring-primary/50">
                    <Play className="w-4 h-4 sm:w-9 sm:h-9 text-primary ml-0.5 sm:ml-1" fill="currentColor" aria-hidden="true" />
                  </div>
                </motion.button>

                <div className="pointer-events-none">
                  <h3 className="font-sans font-extrabold uppercase text-xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.5)]">
                    {featuredVideo.title}
                  </h3>
                  <div className="mt-0.5 sm:mt-3 flex items-center justify-center gap-2 sm:gap-4">
                    <span aria-hidden="true" className="h-px w-6 sm:w-16 bg-white/70" />
                    <span className="font-script font-medium italic text-base sm:text-4xl leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                      {featuredVideo.subtitle}
                    </span>
                    <span aria-hidden="true" className="h-px w-8 sm:w-16 bg-white/70" />
                  </div>
                </div>
              </div>

              {/* Info bar — real details + a clear call to action (no fake progress bar) */}
              <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 px-3 sm:px-8 pb-2.5 sm:pb-6 pt-6 sm:pt-10 text-white bg-gradient-to-t from-black/55 to-transparent">
                <div className="min-w-0 flex items-center gap-x-3 text-[10px] sm:text-sm text-white/90 font-medium">
                  {featuredLocation && (
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{featuredLocation}</span>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => open(0)}
                  disabled={!hasVideos}
                  className="interactive shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white text-slate-900 text-[10px] sm:text-sm font-bold shadow-lg hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:opacity-60"
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-primary" fill="currentColor" aria-hidden="true" />
                  Watch film
                </button>
              </div>
            </div>
          ) : (
            /* ───────── Inline player + playlist ───────── */
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease }}
              className="relative rounded-[31px] overflow-hidden bg-black shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_50px_100px_-28px_rgba(8,20,45,0.6)]"
            >
              <div
                className={`relative mx-auto bg-black ${
                  parsed?.isVertical ? "w-[min(100%,300px)] aspect-[9/16]" : "w-full aspect-video"
                }`}
              >
                <div className={`absolute inset-0 transition-opacity duration-500 ${loaded ? "opacity-0 pointer-events-none" : "opacity-100"}`} aria-hidden={loaded}>
                  <img src={current.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3 text-white/90">
                    <span className="w-10 h-10 rounded-full border-2 border-white/25 border-t-white animate-spin motion-reduce:animate-none" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Loading film…</span>
                  </div>
                </div>
                {parsed && parsed.kind !== "unknown" && (
                  <iframe
                    key={parsed.embedUrl}
                    src={parsed.embedUrl}
                    title={current.title}
                    onLoad={() => setLoaded(true)}
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                )}
              </div>

              <div className="bg-[#0a1220] px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-bold text-white truncate">{current.title}</p>
                    <p className="text-xs text-white/55 line-clamp-1">{current.desc}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                  {parsed && (
                    <a
                      href={parsed.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open original video in a new tab"
                      className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setPlaying(false)}
                    aria-label="Close video"
                    className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                  </div>
                </div>

                {playlist.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1" role="tablist" aria-label="More videos">
                    {playlist.map((item, i) => {
                      const isCurrent = i === activeIdx;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          role="tab"
                          aria-selected={isCurrent}
                          onClick={() => setActiveIdx(i)}
                          className={`shrink-0 w-28 sm:w-32 rounded-lg overflow-hidden text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            isCurrent ? "opacity-100 ring-2 ring-primary" : "opacity-60 hover:opacity-100 hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="relative aspect-video bg-slate-800">
                            <img src={item.image} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                            {isCurrent && (
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <Play className="w-4 h-4 text-white" fill="currentColor" aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-white leading-tight px-1.5 pt-1 pb-1.5 line-clamp-2">{item.title}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
