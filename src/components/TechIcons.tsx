import { useEffect, useRef, useState, type CSSProperties } from "react";
import { RiCodeSSlashLine, RiVideoLine } from "react-icons/ri";
import { SiJavascript, SiNodedotjs, SiReact } from "react-icons/si";
import "./tech-icons.css";

/**
 * TechIcons — the floating tech badges around the hero portrait, now interactive.
 *
 * Idle:   React rotates slowly · JavaScript floats + glows · Node.js pulses · Code drifts sideways
 *         · Video editing stays still until touched.
 * Active: the badge scales up, a glow halo appears, a tooltip names the technology, and (mouse only)
 *         the badge leans a few px toward the cursor.
 *
 * Mouse  → hover activates it.
 * Touch  → tap toggles it (auto-dismisses after 3s or on tapping elsewhere), since there is no hover.
 * Keyboard → each badge is a real button; focus shows the same state.
 *
 * Render inside a `position: absolute; inset: 0` container (pointer-events can stay `none` there —
 * the badges opt back in themselves).
 */

type Kind = "react" | "js" | "node" | "code" | "video";

interface Item {
  kind: Kind;
  label: string;
  pos: CSSProperties;
  box: string; // tailwind size classes for the badge
  badge?: string; // tailwind bg override (defaults to the white glass badge)
  glyph: number; // px
  glyphClass: string;
  tip: "top" | "bottom";
  align: "center" | "start" | "end";
  delay?: string;
}

const BASE_BADGE = "bg-white/90 backdrop-blur border border-blue-100";

const MOBILE: Item[] = [
  { kind: "react", label: "React", pos: { top: "3%", left: "27%" }, box: "w-8 h-8 sm:w-10 sm:h-10", glyph: 15, glyphClass: "text-primary", tip: "bottom", align: "center" },
  { kind: "node", label: "Node.js", pos: { top: "20%", right: "19%" }, box: "w-8 h-8 sm:w-9 sm:h-9", glyph: 14, glyphClass: "text-green-500", tip: "top", align: "end", delay: "-1.2s" },
  { kind: "video", label: "Video Editing", pos: { top: "35%", right: "4%" }, box: "w-8 h-8 sm:w-9 sm:h-9", glyph: 14, glyphClass: "text-rose-500", tip: "top", align: "end" },
  { kind: "code", label: "Coding", pos: { top: "49%", right: "19%" }, box: "w-8 h-8 sm:w-9 sm:h-9", glyph: 14, glyphClass: "text-slate-700", tip: "top", align: "end", delay: "-2s" },
  { kind: "js", label: "JavaScript", pos: { top: "64%", right: "65%" }, box: "w-7 h-7 sm:w-9 sm:h-9", badge: "bg-yellow-400", glyph: 13, glyphClass: "text-white", tip: "top", align: "start", delay: "-0.6s" },
];

const DESKTOP: Item[] = [
  { kind: "react", label: "React", pos: { top: "20%", left: "6%" }, box: "w-11 h-11", glyph: 18, glyphClass: "text-primary", tip: "top", align: "start" },
  { kind: "node", label: "Node.js", pos: { top: "30%", right: "7%" }, box: "w-11 h-11", glyph: 18, glyphClass: "text-green-500", tip: "top", align: "end", delay: "-1.2s" },
  { kind: "video", label: "Video Editing", pos: { top: "55%", right: "3%" }, box: "w-10 h-10", glyph: 16, glyphClass: "text-rose-500", tip: "top", align: "end" },
  { kind: "js", label: "JavaScript", pos: { bottom: "7%", left: "2%" }, box: "w-10 h-10", glyph: 16, glyphClass: "text-yellow-400", tip: "top", align: "start", delay: "-0.6s" },
  { kind: "code", label: "Coding", pos: { bottom: "12%", right: "2%" }, box: "w-10 h-10", glyph: 16, glyphClass: "text-slate-700", tip: "top", align: "end", delay: "-2s" },
];

function Glyph({ kind, size, className }: { kind: Kind; size: number; className: string }) {
  const props = { className: `tech-icon__glyph ${className}`, style: { fontSize: size } as CSSProperties };
  switch (kind) {
    case "react":
      return <SiReact {...props} />;
    case "js":
      return <SiJavascript {...props} />;
    case "node":
      return <SiNodedotjs {...props} />;
    case "code":
      return <RiCodeSSlashLine {...props} />;
    case "video":
      return <RiVideoLine {...props} />;
  }
}

const TAP_DISMISS_MS = 3000;
const MAX_SHIFT = 6; // px the badge leans toward the cursor

function TechIcon({ item }: { item: Item }) {
  const [active, setActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const moveRef = useRef<HTMLSpanElement>(null);
  const lastPointer = useRef<string>("mouse");

  // Touch: tapping anywhere else (or waiting) dismisses the active badge.
  useEffect(() => {
    if (!active || lastPointer.current !== "touch") return;
    const onOutside = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setActive(false);
    };
    const timer = window.setTimeout(() => setActive(false), TAP_DISMISS_MS);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [active]);

  const shift = (x: number, y: number) => {
    const el = moveRef.current;
    if (!el) return;
    el.style.setProperty("--tx", `${x.toFixed(1)}px`);
    el.style.setProperty("--ty", `${y.toFixed(1)}px`);
  };

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    lastPointer.current = e.pointerType;
    setActive(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
    const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    shift(nx * MAX_SHIFT, ny * MAX_SHIFT);
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    setActive(false);
    shift(0, 0);
  };

  return (
    <div
      ref={rootRef}
      className="tech-icon"
      data-kind={item.kind}
      data-active={active}
      style={{ ...item.pos, ["--d" as string]: item.delay ?? "0s" }}
    >
      <button
        ref={btnRef}
        type="button"
        className="tech-icon__btn"
        aria-label={item.label}
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
        }}
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={() => {
          if (lastPointer.current === "touch") setActive((a) => !a);
        }}
      >
        <span ref={moveRef} className="tech-icon__move">
          <span
            className={`tech-icon__badge rounded-full shadow-md flex items-center justify-center ${item.box} ${item.badge ?? BASE_BADGE}`}
          >
            <Glyph kind={item.kind} size={item.glyph} className={item.glyphClass} />
          </span>
        </span>
        <span className="tech-icon__tip" data-side={item.tip} data-align={item.align} aria-hidden="true">
          {item.label}
        </span>
      </button>
    </div>
  );
}

export default function TechIcons({ layout }: { layout: "mobile" | "desktop" }) {
  const items = layout === "mobile" ? MOBILE : DESKTOP;
  return (
    <>
      {items.map((item) => (
        <TechIcon key={item.kind} item={item} />
      ))}
    </>
  );
}
