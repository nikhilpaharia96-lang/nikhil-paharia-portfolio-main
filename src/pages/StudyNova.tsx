import { useCallback, useEffect, useRef, useState } from "react";
import "../studynova/studynova.css";
import Header from "../studynova/components/Header";
import CommandBox from "../studynova/components/CommandBox";
import NovaBrain from "../studynova/components/NovaBrain";
import WhatsAppDemo from "../studynova/components/WhatsAppDemo";
import Ecosystem from "../studynova/components/Ecosystem";
import Wearable from "../studynova/components/Wearable";
import Architecture from "../studynova/components/Architecture";
import PrototypeNotes from "../studynova/components/PrototypeNotes";
import Presentation from "../studynova/components/Presentation";
import SimBadge from "../studynova/components/SimBadge";
import { Gallery } from "../studynova/components/MediaSlot";
import { useNovaRun } from "../studynova/hooks/useNovaRun";
import { EXAMPLE_PROMPTS, type DemoId, DEMOS } from "../studynova/data/demos";

export default function StudyNova() {
  const [fast, setFast] = useState(false);
  const { state, run, skip, reset } = useNovaRun(fast ? 0.4 : 1);
  const [text, setText] = useState("");
  const [present, setPresent] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const prev = document.title; document.title = "StudyNova AI — Prototype"; return () => { document.title = prev; }; }, []);

  const start = useCallback((p: string, forced?: DemoId) => {
    run(p, forced);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [run]);
  const runDemo = (d: DemoId) => { setText(DEMOS[d].prompt); start(DEMOS[d].prompt, d); };

  return (
    <div className="sn-root" style={{ minHeight: "100vh" }}>
      <div className="sn-bg" aria-hidden="true" />
      <Header onPresent={() => setPresent(true)} />
      <main>
        <section id="command" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">Hackathon prototype</p>
          <h1 className="sn-h2" style={{ fontSize: "clamp(2rem,5.5vw,4rem)", margin: 0 }}>Your entire world, <span className="sn-grad">powered by one AI.</span></h1>
          <p className="sn-lead">Learn, create, work and grow with an intelligent AI companion.</p>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap", margin: ".6rem 0 1rem" }}>
            <SimBadge label="Scripted prototype — sample data, no real AI" />
            <button className="sn-chip" onClick={() => setFast(!fast)} aria-pressed={fast} style={{ cursor: "pointer" }}>Speed: {fast ? "Fast" : "Normal"}</button>
          </div>
          <CommandBox value={text} setValue={setText} busy={state.phase === "running"} onSubmit={(p) => start(p)} />
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".8rem" }}>
            {EXAMPLE_PROMPTS.map((p) => <button key={p.text} className="sn-chip" style={{ cursor: "pointer" }} onClick={() => { setText(p.text); start(p.text, p.demo); }}>{p.text}</button>)}
          </div>
          <div ref={resultRef} style={{ marginTop: "1.5rem", scrollMarginTop: "5rem" }}>
            {state.phase !== "idle" && <NovaBrain state={state} onSkip={skip} onReset={reset} onReplay={() => start(state.prompt, state.demo!)} />}
          </div>
        </div></section>

        <section id="whatsapp" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">Coming soon</p><h2 className="sn-h2">StudyNova AI — Coming to WhatsApp</h2>
          <p className="sn-lead">A visual simulation of how a learner or business owner could use StudyNova inside WhatsApp.</p>
          <WhatsAppDemo />
        </div></section>

        <section id="ecosystem" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">Ecosystem</p><h2 className="sn-h2">Nine modules, one Nova Brain</h2>
          <Ecosystem onRun={(d) => { runDemo(d); }} />
        </div></section>

        <section id="wearable" className="sn-section"><div className="sn-wrap"><Wearable /></div></section>

        <section id="architecture" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">Innovation</p><h2 className="sn-h2">How it fits together</h2><Architecture />
        </div></section>

        <section id="gallery" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">Media</p><h2 className="sn-h2">Gallery</h2><Gallery />
        </div></section>

        <section id="notes" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">Transparency</p><h2 className="sn-h2">Prototype notes — what is real?</h2><PrototypeNotes />
          <p className="sn-muted" style={{ fontSize: ".8rem", marginTop: ".8rem" }}>StudyNova AI is a hackathon prototype. All results are pre-written samples; no real AI, WhatsApp or server is used.</p>
        </div></section>
      </main>
      {present && <Presentation onClose={() => setPresent(false)} />}
    </div>
  );
}
