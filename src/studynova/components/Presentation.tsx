import { useCallback, useEffect, useState } from "react";
import { getMedia } from "../data/media";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Brand from "./Brand";
import NovaBrain from "./NovaBrain";
import WhatsAppDemo from "./WhatsAppDemo";
import Architecture from "./Architecture";
import MediaSlot from "./MediaSlot";
import SimBadge from "./SimBadge";
import { useNovaRun } from "../hooks/useNovaRun";
import { EXAMPLE_PROMPTS } from "../data/demos";

function Bullets({ items }: { items: string[] }) {
  return <ul style={{ margin: "1rem 0 0", padding: 0, listStyle: "none", display: "grid", gap: ".8rem", fontSize: "clamp(1rem,2.2vw,1.5rem)" }}>{items.map((t) => <li key={t} style={{ display: "flex", gap: ".7rem" }}><span style={{ color: "var(--sn-cyan)" }}>▸</span>{t}</li>)}</ul>;
}

function LiveDemo() {
  const { state, run, skip, reset } = useNovaRun(0.5);
  return (
    <div>
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".8rem" }}>
        {EXAMPLE_PROMPTS.map((p) => <button key={p.text} className="sn-chip" onClick={() => run(p.text, p.demo)} style={{ cursor: "pointer" }}>{p.text}</button>)}
      </div>
      {state.phase === "idle" ? <p className="sn-muted">Pick a prompt to run the scripted Nova Brain workflow.</p> : <NovaBrain state={state} onSkip={skip} onReset={reset} onReplay={() => run(state.prompt, state.demo!)} compact />}
    </div>
  );
}

const SLIDES: { title: string; body: () => JSX.Element }[] = [
  { title: "Problem Statement", body: () => <Bullets items={["People juggle many separate AI tools for learning, work and creating.", "Each tool needs different skills, prompts and subscriptions.", "Many learners can't get quality help in their own language (e.g. Assamese).", "Result: lost time and unfinished goals."]} /> },
  { title: "Vision", body: () => <><p style={{ fontSize: "clamp(1.4rem,3.4vw,2.6rem)", fontWeight: 700, margin: "1rem 0" }}>One AI. <span className="sn-grad">Your Entire World.</span></p><Bullets items={["Tell it your goal in plain words.", "It plans, picks the right tools and delivers the result.", "Available where people already are — including WhatsApp."]} /></> },
  { title: "Proposed Solution", body: () => <Bullets items={["Nova Brain: one assistant that understands the goal.", "Specialised modules: Learn, Business, Creator, Builder, Life, Research, Memory, Automation.", "Multilingual, consent-first and simple to use.", "This hackathon build is a working prototype with sample data."]} /> },
  { title: "How It Works", body: () => <Bullets items={["1 Understanding — what does the user want?", "2 Planning — which tasks are needed?", "3 Selecting AI tools — which modules fit?", "4 Processing — tasks run with visible progress.", "5 Completed — one finished result."]} /> },
  { title: "Live Interactive Demo", body: () => <LiveDemo /> },
  { title: "WhatsApp Concept", body: () => <WhatsAppDemo compact /> },
  { title: "Innovation Architecture", body: () => <Architecture /> },
  { title: "Social Impact", body: () => <Bullets items={["Learning in regional languages lowers the barrier for students.", "Small businesses and creators get planning help without agencies.", "Reaching users on WhatsApp means no new app to install.", "Impact figures will be measured in pilots — none are claimed here."]} /> },
  { title: "Future Roadmap", body: () => <Bullets items={["Phase 1 — Prototype demo (this build).", "Phase 2 — Connect a real AI model and one working module (Nova Learn).", "Phase 3 — WhatsApp Business integration with user opt-in.", "Phase 4 — Memory, automation and the optional wearable concept."]} /> },
];

export default function Presentation({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const go = useCallback((n: number) => setI((c) => Math.max(0, Math.min(SLIDES.length - 1, typeof n === "number" ? n : c))), []);
  useEffect(() => {
    const prevOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && /input|textarea/i.test(t.tagName)) return;
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); setI((c) => Math.min(SLIDES.length - 1, c + 1)); }
      else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); setI((c) => Math.max(0, c - 1)); }
      else if (e.key === "Home") setI(0); else if (e.key === "End") setI(SLIDES.length - 1);
      else if (e.key === "Escape") { if (document.fullscreenElement) document.exitFullscreen(); else onClose(); }
      else if (e.key.toLowerCase() === "f") { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); }
      else if (/^[1-9]$/.test(e.key)) setI(Number(e.key) - 1);
    };
    window.addEventListener("keydown", h);
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = prevOverflow; if (document.fullscreenElement) document.exitFullscreen?.(); };
  }, [onClose]);
  const S = SLIDES[i];
  return (
    <div role="dialog" aria-modal="true" aria-label="Presentation mode" style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", flexDirection: "column", background: "#050914" }}>
      <div style={{ display: "flex", alignItems: "center", gap: ".8rem", padding: ".7rem 1.2rem" }}>
        <Brand size={28} /><SimBadge label="Prototype" />
        <span className="sn-muted" style={{ marginLeft: "auto", fontSize: ".85rem" }}>{i + 1} / {SLIDES.length}</span>
        <button className="sn-icon-btn" onClick={onClose} aria-label="Close presentation"><X size={16} /></button>
      </div>
      <div className="sn-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 clamp(1rem,5vw,4rem) 1rem" }}>
        <div key={i} className="sn-pop" style={{ maxWidth: "72rem", margin: "0 auto" }}>
          <p className="sn-eyebrow">Slide {i + 1}</p>
          <h2 className="sn-h2" style={{ fontSize: "clamp(1.8rem,4.4vw,3.4rem)", margin: 0 }}>{S.title}</h2>
          {i === 0 && getMedia("presentation-cover") ? <div style={{ maxWidth: "36rem", margin: "1rem 0" }}><MediaSlot slot="presentation-cover" kind="image" label="Presentation cover" /></div> : null}
          <div style={{ marginTop: "1.2rem" }}>{S.body()}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: ".6rem", padding: ".7rem 1.2rem", justifyContent: "center" }}>
        <button className="sn-btn sn-btn--ghost sn-btn--sm" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} aria-label="Previous slide"><ChevronLeft size={15} /> Prev</button>
        <div style={{ display: "flex", gap: ".3rem" }}>{SLIDES.map((s, n) => <button key={s.title} onClick={() => setI(n)} aria-label={`Go to slide ${n + 1}: ${s.title}`} style={{ width: n === i ? "1.6rem" : ".5rem", height: ".5rem", borderRadius: 99, border: 0, background: n === i ? "var(--sn-cyan)" : "rgba(255,255,255,.25)", transition: "width .2s" }} />)}</div>
        <button className="sn-btn sn-btn--sm" onClick={() => setI(Math.min(SLIDES.length - 1, i + 1))} disabled={i === SLIDES.length - 1} aria-label="Next slide">Next <ChevronRight size={15} /></button>
      </div>
      <p className="sn-muted" style={{ textAlign: "center", fontSize: ".72rem", margin: "0 0 .6rem" }}>← → / Space navigate · 1–9 jump · F fullscreen · Esc close</p>
    </div>
  );
}
