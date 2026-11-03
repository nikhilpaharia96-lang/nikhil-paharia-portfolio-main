import { useEffect, useRef } from "react";
import { X, ExternalLink } from "lucide-react";
import { parseVideoUrl } from "@/utils/videoEmbed";
import { lockBodyScroll } from "@/lib/scrollLock";

type Props = {
  /** Video to play (file URL, YouTube or Instagram link), or null when closed. */
  url: string | null;
  title: string;
  /** Small line shown under the video, e.g. "Priya Deka · Co-Founder, FitBite". */
  caption?: string;
  poster?: string;
  onClose: () => void;
};

const FILE_RE = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;

export default function TestimonialVideoModal({ url, title, caption, poster, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!url) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const unlock = lockBodyScroll();
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      unlock();
    };
  }, [url, onClose]);

  if (!url) return null;

  const isFile = FILE_RE.test(url);
  const parsed = isFile ? null : parseVideoUrl(url);
  const vertical = parsed?.isVertical;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Video message from ${title}`}
      onClick={onClose}
      className="testi-swap fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl ${vertical ? "max-w-sm" : "max-w-4xl"}`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {isFile ? (
          <video
            key={url}
            src={url}
            poster={poster}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[85vh] bg-black"
          >
            Your browser can&apos;t play this video.
          </video>
        ) : parsed && parsed.kind !== "unknown" ? (
          <div className={vertical ? "aspect-[9/16]" : "aspect-video"}>
            <iframe
              key={parsed.embedUrl}
              src={parsed.embedUrl}
              title={`Video message from ${title}`}
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
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold"
            >
              Open video <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        )}
        {caption && (
          <p className="px-4 py-3 text-sm font-medium text-white/85 bg-black">{caption}</p>
        )}
      </div>
    </div>
  );
}
