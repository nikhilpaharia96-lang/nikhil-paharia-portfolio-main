import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play, Video, X } from "lucide-react";
import { getGallery, getMedia, getPoster } from "../data/media";

const isVideo = (u: string) => /\.(mp4|webm|mov)(\?|$)/i.test(u);

/**
 * Shows the provided asset for a slot at its ORIGINAL aspect ratio (never cropped),
 * or a clear placeholder when the asset has not been supplied yet.
 */
export default function MediaSlot({ slot, kind, label, hint, fallback, className = "" }: {
  slot: string; kind: "video" | "image"; label: string; hint?: string; fallback?: React.ReactNode; className?: string;
}) {
  const url = getMedia(slot);
  if (url) {
    return isVideo(url) || kind === "video" ? (
      <video className={className} src={url} poster={getPoster(slot)} controls playsInline preload="metadata" style={{ width: "100%", height: "auto", borderRadius: "1rem", background: "#000", display: "block" }} aria-label={label} />
    ) : (
      <ZoomImage src={url} alt={label} className={className} />
    );
  }
  if (fallback) return <>{fallback}</>;
  const Icon = kind === "video" ? Video : ImageIcon;
  return (
    <div className={`sn-ph ${className}`} style={{ minHeight: kind === "video" ? "13rem" : "10rem" }} role="img" aria-label={`${label} — placeholder`}>
      <Icon size={30} aria-hidden="true" />
      <b style={{ color: "var(--sn-text)" }}>{label}</b>
      <span>{hint ?? "Preview placeholder — media will appear here"}</span>
    </div>
  );
}

/** Image that opens a full-screen viewer on click. */
export function ZoomImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Open ${alt}`} className={className} style={{ display: "block", width: "100%", padding: 0, border: 0, background: "none", cursor: "zoom-in" }}>
        <img src={src} alt={alt} loading="lazy" style={{ width: "100%", height: "auto", display: "block", borderRadius: "1rem" }} />
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={alt} onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(3,6,16,.92)", display: "grid", placeItems: "center", padding: "1rem" }}>
          <img src={src} alt={alt} style={{ maxWidth: "100%", maxHeight: "92vh", objectFit: "contain", borderRadius: ".8rem" }} />
          <button className="sn-icon-btn" onClick={() => setOpen(false)} aria-label="Close" style={{ position: "absolute", top: "1rem", right: "1rem" }}><X size={18} /></button>
        </div>
      )}
    </>
  );
}

/** Interactive gallery (images named gallery-01, gallery-02 …) with a lightbox. Placeholders until supplied. */
export function Gallery() {
  const imgs = getGallery();
  const [i, setI] = useState<number | null>(null);
  useEffect(() => {
    if (i === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setI(null);
      if (e.key === "ArrowRight") setI((x) => (x === null ? x : (x + 1) % imgs.length));
      if (e.key === "ArrowLeft") setI((x) => (x === null ? x : (x - 1 + imgs.length) % imgs.length));
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [i, imgs.length]);

  return (
    <>
      <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 15rem), 1fr))" }}>
        {imgs.length
          ? imgs.map((u, n) => (
              <button key={u} onClick={() => setI(n)} className="sn-card" aria-label={`Open gallery image ${n + 1}`} style={{ padding: 0, overflow: "hidden", cursor: "zoom-in" }}>
                <img src={u} alt={`Prototype screenshot ${n + 1}`} loading="lazy" style={{ width: "100%", height: "auto", display: "block" }} />
              </button>
            ))
          : [1, 2, 3].map((n) => (
              <div key={n} className="sn-ph" style={{ minHeight: "9rem" }} role="img" aria-label={`Gallery placeholder ${n}`}>
                <ImageIcon size={26} aria-hidden="true" /><b style={{ color: "var(--sn-text)" }}>Screenshot placeholder {n}</b><span>Project image will appear here</span>
              </div>
            ))}
      </div>
      {i !== null && imgs[i] && (
        <div role="dialog" aria-modal="true" aria-label="Gallery viewer" onClick={() => setI(null)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(3,6,16,.94)", display: "grid", placeItems: "center", padding: "1rem" }}>
          <img src={imgs[i]} alt={`Prototype screenshot ${i + 1}`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: ".8rem" }} />
          <button className="sn-icon-btn" onClick={() => setI(null)} aria-label="Close" style={{ position: "absolute", top: "1rem", right: "1rem" }}><X size={18} /></button>
          {imgs.length > 1 && <>
            <button className="sn-icon-btn" onClick={(e) => { e.stopPropagation(); setI((i - 1 + imgs.length) % imgs.length); }} aria-label="Previous" style={{ position: "absolute", left: ".8rem", top: "50%" }}><ChevronLeft size={18} /></button>
            <button className="sn-icon-btn" onClick={(e) => { e.stopPropagation(); setI((i + 1) % imgs.length); }} aria-label="Next" style={{ position: "absolute", right: ".8rem", top: "50%" }}><ChevronRight size={18} /></button>
          </>}
        </div>
      )}
    </>
  );
}

/** Mock video preview used when no real video is supplied: storyboard-style poster with a disabled-looking play control. */
export function StoryboardPreview({ title, caption, accent = "#22d3ee" }: { title: string; caption: string; accent?: string }) {
  return (
    <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: "1rem", overflow: "hidden", border: "1px solid var(--sn-line2)", background: `radial-gradient(600px 300px at 20% 10%, ${accent}33, transparent 60%), linear-gradient(135deg, #0b1230, #141c4a)` }} role="img" aria-label={`${title} — video preview placeholder`}>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", padding: "1rem" }}>
        <div>
          <span style={{ display: "inline-grid", placeItems: "center", width: "3.6rem", height: "3.6rem", borderRadius: "50%", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.3)" }}><Play size={22} fill="#fff" aria-hidden="true" /></span>
          <p style={{ margin: ".7rem 0 .1rem", fontWeight: 700 }}>{title}</p>
          <p className="sn-muted" style={{ margin: 0, fontSize: ".8rem" }}>{caption}</p>
        </div>
      </div>
      <span className="sn-sim" style={{ position: "absolute", top: ".7rem", left: ".7rem" }}>Preview placeholder</span>
    </div>
  );
}
