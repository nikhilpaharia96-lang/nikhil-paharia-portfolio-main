import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { parseVideoUrl } from "@/utils/videoEmbed";

type VideoLightboxProps = {
  /** The raw YouTube / Instagram URL to play, or null when closed. */
  url: string | null;
  title?: string;
  onClose: () => void;
};

export default function VideoLightbox({ url, title, onClose }: VideoLightboxProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const parsed = parseVideoUrl(url);

  // Escape-to-close + lock background scroll while open.
  useEffect(() => {
    if (!url) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [url, onClose]);

  return (
    <AnimatePresence>
      {url && parsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={title ? `Playing ${title}` : "Video player"}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl ${
              parsed.isVertical ? "max-w-sm" : "max-w-4xl"
            }`}
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close video"
              className="interactive absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            {parsed.kind !== "unknown" ? (
              <div className={parsed.isVertical ? "aspect-[9/16]" : "aspect-video"}>
                <iframe
                  key={parsed.embedUrl}
                  src={parsed.embedUrl}
                  title={title || "Video player"}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                />
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-4 text-white/80 p-8 text-center">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
