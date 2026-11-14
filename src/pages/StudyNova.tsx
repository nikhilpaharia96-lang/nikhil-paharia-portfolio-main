import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
import Board from "../studynova/components/Board";
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
  const [, navigate] = useLocation();

  // Open at top, and send the site Navbar/Footer anchors (#about, #contact…) to the home page.
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, []);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a || a.closest(".sn-subnav")) return;
      e.preventDefault(); e.stopPropagation();
      navigate(`/${a.getAttribute("href")}`);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  useEffect(() => { const prev = document.title; document.title = "StudyNova AI — Prototype"; return () => { document.title = prev; }; }, []);

  const start = useCallback((p: string, forced?: DemoId) => {
    run(p, forced);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [run]);
  const runDemo = (d: DemoId) => { setText(DEMOS[d].prompt); start(DEMOS[d].prompt, d); };

  return (
    <div className="sn-root" style={{ minHeight: "100vh" }}>
      <Navbar />
      <main style={{ paddingTop: "6rem" }}>
        <Header onPresent={() => setPresent(true)} />
        <section id="command" className="sn-section" style={{ paddingTop: "1.5rem" }}><div className="sn-wrap">
          <Board id="hero" alt="StudyNova AI — Meet the future of AI. One AI. Your entire world." />
          <div style={{ height: "2.2rem" }} />
          <p className="sn-eyebrow">Ideathon '26 · Prototype</p>
          <h1 className="sn-h2 sn-hero-h1" style={{ fontSize: "clamp(2.4rem,7vw,4.6rem)" }}>Your entire world, <span className="sn-mark">powered by one AI.</span></h1>
          <p className="sn-lead">Learn, create, work and grow with an intelligent AI companion. Type an instruction below and watch Nova Brain plan the result.</p>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap", margin: ".6rem 0 1rem" }}>
            <SimBadge label="Scripted prototype — sample data, no real AI" />
            <button className="sn-chip" onClick={() => setFast(!fast)} aria-pressed={fast} style={{ cursor: "pointer" }}>Speed: {fast ? "Fast" : "Normal"}</button>
          </div>
          <CommandBox value={text} setValue={setText} busy={state.phase === "running"} onSubmit={(p) => start(p)} />
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".9rem" }}>
            {EXAMPLE_PROMPTS.map((p) => <button key={p.text} className="sn-chip" style={{ cursor: "pointer" }} onClick={() => { setText(p.text); start(p.text, p.demo); }}>{p.text}</button>)}
          </div>
          <div ref={resultRef} style={{ marginTop: "1.5rem", scrollMarginTop: "5rem" }}>
            {state.phase !== "idle" && <NovaBrain state={state} onSkip={skip} onReset={reset} onReplay={() => start(state.prompt, state.demo!)} />}
          </div>
        </div></section>

        <section id="problem" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">01 · The problem</p><h2 className="sn-h2">Too many tools. <span className="sn-mark">One companion.</span></h2>
          <p className="sn-lead">Students, business owners and creators juggle disconnected apps. People need one intelligent companion.</p>
          <Board id="problem" alt="The problem: the world has too many tools, people need one intelligent companion." stamp="It's time for a change" />
        </div></section>

        <section id="vision" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">02 · Our vision</p><h2 className="sn-h2">Imagine one AI that <span className="sn-mark">understands what you need.</span></h2>
          <Board id="vision" alt="Vision: one intelligent ecosystem across education, business, creativity, research, development, productivity and automation." caption="One intelligent ecosystem. Unlimited possibilities." />
        </div></section>

        <section id="how" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">03 · Meet StudyNova AI</p><h2 className="sn-h2">One AI. <span className="sn-mark">Every possibility.</span></h2>
          <Board id="how" alt="From a simple instruction to a complete result: Nova Learn, Nova Business, Nova Creator, Nova Life." stamp="Proposed AI ecosystem" caption="You give the idea. StudyNova helps build the result." />
        </div></section>

        <section id="whatsapp" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">04 · Coming soon</p><h2 className="sn-h2">StudyNova AI — Coming to WhatsApp</h2>
          <p className="sn-lead">A visual simulation of how a learner or business owner could use StudyNova inside WhatsApp.</p>
          <WhatsAppDemo />
        </div></section>

        <section id="ecosystem" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">Ecosystem</p><h2 className="sn-h2">Nine modules, <span className="sn-mark">one Nova Brain</span></h2>
          <Ecosystem onRun={(d) => { runDemo(d); }} />
          <div style={{ height: "2rem" }} />
          <Board id="learn" alt="Nova Learn: one prompt becomes a complete learning package." stamp="Concept preview" caption="One prompt. A complete learning package." />
        </div></section>

        <section id="wearable" className="sn-section"><div className="sn-wrap"><Wearable /></div></section>

        <section id="architecture" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">Innovation</p><h2 className="sn-h2">How it fits together</h2>
          <Board id="brain" alt="Nova Brain: understand, plan, select, process, deliver." stamp="Proposed system architecture" caption="Not just answering questions — coordinating actions." />
          <div style={{ height: "2rem" }} /><Architecture />
        </div></section>

        <section id="gallery" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">Media</p><h2 className="sn-h2">Gallery</h2><Gallery />
        </div></section>

        <section id="notes" className="sn-section"><div className="sn-wrap">
          <p className="sn-eyebrow">Transparency</p><h2 className="sn-h2">Prototype notes — what is real?</h2><PrototypeNotes />
          <p className="sn-muted" style={{ fontSize: ".8rem", marginTop: ".8rem" }}>StudyNova AI is a hackathon prototype. All results are pre-written samples; no real AI, WhatsApp or server is used.</p>
        </div></section>
      </main>
      <Footer />
      {present && <Presentation onClose={() => setPresent(false)} />}
    </div>
  );
}
