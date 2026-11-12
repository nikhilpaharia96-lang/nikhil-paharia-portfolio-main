import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ExternalLink, ChevronLeft, ChevronRight, Link2, Check, Play, MapPin, Building2 } from "lucide-react";
import { parseVideoUrl } from "@/utils/videoEmbed";
import { lockBodyScroll } from "@/lib/scrollLock";

export type LightboxItem = {
  key: string;
  url: string;
  title: string;
  /** Poster — used as the loading frame, the ambient backdrop and the thumbnail. */
  image?: string;
  category?: string;
  location?: string;
  client?: string;
  description?: string;
};

type VideoLightboxProps = {
  items: LightboxItem[];
  /** Index of the video that is open, or null when closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const platformName = (kind: string) => (kind === "instagram" ? "Instagram" : kind === "youtube" ? "YouTube" : kind === "drive" ? "Google Drive" : "original site");

/**
 * Cinematic video player. Opens over the page with an ambient, blurred copy of the
 * poster behind it, shows a poster + spinner until the embed has loaded, and lets
 * you move through the whole playlist (arrows, keyboard, or the "More" strip).
 */
export default function VideoLightbox({ items, index, onIndexChange, onClose }: VideoLightboxProps) {
  const reduce = !!useReducedMotion();
  const open = index !== null && !!items[index];
  const item = open ? items[index as number] : null;
  const parsed = parseVideoUrl(item?.url);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const direction = useRef(1);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const total = items.length;
  const go = useCallback(
    (delta: number) => {
      if (index === null || total < 2) return;
      direction.current = delta;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange],
  );

  // Fresh loading state (and copy feedback) for every video.
  useEffect(() => {
    setLoaded(false);
    setCopied(false);
  }, [item?.key]);

  // Latest handlers, so the key listener below never has to be re-attached.
  const handlers = useRef({ go, onClose });
  handlers.current = { go, onClose };

  // Lock scroll, remember where focus was, trap Tab, handle keys — once per open.
  useEffect(() => {
    if (!open) return;
    returnFocusTo.current = document.activeElement as HTMLElement | null;
    const unlock = lockBodyScroll();
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return handlers.current.onClose();
      if (e.key === "ArrowLeft") return handlers.current.go(-1);
      if (e.key === "ArrowRight") return handlers.current.go(1);
      if (e.key !== "Tab" || !dialogRef.current) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
      returnFocusTo.current?.focus?.();
    };
  }, [open]);

  // Warm the neighbours' posters so next/prev feels instant.
  useEffect(() => {
    if (index === null || total < 2) return;
    [1, -1].forEach((d) => {
      const src = items[(index + d + total) % total]?.image;
      if (src) new Image().src = src;
    });
  }, [index, items, total]);

  const copyLink = async () => {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the "open on" link still works */
    }
  };

  const vertical = !!parsed?.isVertical;
  const dur = reduce ? 0.01 : 0.35;

  return (
    <AnimatePresence>
      {open && item && parsed && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: dur }}
          className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-label={`Playing ${item.title}`}
          onClick={onClose}
        >
          {/* ambient backdrop: a blurred, enlarged copy of the current poster */}
          <div aria-hidden="true" className="fixed inset-0 bg-[#05070d]">
            <AnimatePresence mode="sync">
              {item.image && (
                <motion.img
                  key={item.key}
                  src={item.image}
                  alt=""
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.55 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0.01 : 0.7 }}
                  className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl saturate-150"
                />
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/55 to-black/80" />
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close video"
            className="interactive fixed top-3 right-3 sm:top-5 sm:right-5 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="relative min-h-full flex items-center justify-center px-3 pt-14 pb-6 sm:px-8 sm:py-10">
            <div
              onClick={(e) => e.stopPropagation()}
              className={`flex w-full items-center justify-center gap-5 lg:gap-9 ${
                vertical ? "flex-col lg:flex-row" : "flex-col"
              }`}
            >
              {/* ───── player ───── */}
              <div className="relative flex items-center">
                <motion.div
                  key={item.key}
                  initial={reduce ? undefined : { opacity: 0, x: direction.current * 36, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: dur + 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative overflow-hidden rounded-2xl bg-black ring-1 ring-white/15 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] ${
                    vertical
                      ? "aspect-[9/16] h-[58dvh] sm:h-[70dvh] lg:h-[84dvh] max-h-[800px] w-auto max-w-[92vw]"
                      : "aspect-video w-[92vw] max-w-4xl"
                  }`}
                >
                  {/* poster + spinner while the embed loads */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 ${loaded ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                    aria-hidden={loaded}
                  >
                    {item.image && <img loading="lazy" decoding="async" src={item.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/55" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/90">
                      <span className="w-10 h-10 rounded-full border-2 border-white/25 border-t-white animate-spin motion-reduce:animate-none" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Loading reel…</span>
                    </div>
                  </div>

                  {parsed.kind !== "unknown" ? (
                    <iframe
                      key={parsed.embedUrl}
                      src={parsed.embedUrl}
                      title={item.title}
                      tabIndex={-1}
                      onLoad={() => setLoaded(true)}
                      className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      frameBorder="0"
                    />
                  ) : (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 text-white/85 p-8 text-center">
                      <p>This link can&apos;t be embedded here.</p>
                      <a
                        href={parsed.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="interactive inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold"
                      >
                        Watch on original site <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </motion.div>

              </div>

              {/* ───── info panel ───── */}
              <div className={`w-full text-white ${vertical ? "max-w-[92vw] sm:max-w-sm lg:w-72 lg:max-w-none" : "max-w-4xl"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {item.category && (
                    <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#f3d9a0] to-[#d9b36c] text-[#3a2208] text-[10px] font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                  )}
                  <span className="text-[11px] font-mono tabular-nums text-white/60">
                    {String((index ?? 0) + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl sm:text-2xl leading-tight text-balance">{item.title}</h3>

                {(item.location || item.client) && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/75">
                    {item.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#e8c88a]" aria-hidden="true" />
                        {item.location}
                      </span>
                    )}
                    {item.client && (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#e8c88a]" aria-hidden="true" />
                        {item.client}
                      </span>
                    )}
                  </div>
                )}

                {item.description && <p className="mt-2.5 text-sm leading-relaxed text-white/70 line-clamp-2 sm:line-clamp-3">{item.description}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a
                    href={parsed.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactive inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-slate-900 text-xs font-bold hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  >
                    Open on {platformName(parsed.kind)} <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="interactive inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" /> : <Link2 className="w-3.5 h-3.5" aria-hidden="true" />}
                    <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
                  </button>
                  {total > 1 && (
                    <div className="ml-auto flex gap-2">
                      <button type="button" onClick={() => go(-1)} aria-label="Previous video" className="interactive w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => go(1)} aria-label="Next video" className="interactive w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <ChevronRight className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>

                {/* more videos */}
                {total > 1 && (
                  <div className="mt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 mb-2">More</p>
                    <ul className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
                      {items.map((it, i) => (
                        <li key={it.key} className="snap-start shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              direction.current = i > (index ?? 0) ? 1 : -1;
                              onIndexChange(i);
                            }}
                            aria-label={`Play ${it.title}`}
                            aria-current={i === index ? "true" : undefined}
                            className={`interactive group relative block w-14 aspect-[3/4] rounded-lg overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
                              i === index ? "ring-2 ring-[#e8c88a] scale-100" : "ring-1 ring-white/20 opacity-70 hover:opacity-100 hover:scale-105"
                            }`}
                          >
                            {it.image && <img src={it.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />}
                            <span className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/15 transition-colors">
                              <Play className="w-3.5 h-3.5 text-white" fill="currentColor" aria-hidden="true" />
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
