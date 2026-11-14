import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, CheckCheck, Play, PlayCircle, RotateCcw, Send, X, GraduationCap } from "lucide-react";
import { NovaMark } from "./Brand";
import SimBadge from "./SimBadge";
import MediaSlot, { StoryboardPreview } from "./MediaSlot";

type Msg = { id: number; from: "user" | "bot"; text?: string; card?: "learn" | "reminder" };
type Scenario = "learn" | "reminder";

const FLOW = [
  { n: "WhatsApp User", d: "Sends a text, voice note or photo from the app they already use every day." },
  { n: "WhatsApp Business API", d: "The official business channel delivers the message to StudyNova through a webhook. (Future step — needs Meta approval and the user's opt-in.)" },
  { n: "StudyNova Backend", d: "Verifies the request, applies privacy rules, loads the user's context and queues the job." },
  { n: "Nova Brain", d: "Understands the intent, plans the tasks and chooses the right specialised module." },
  { n: "Specialized AI Module", d: "Nova Learn, Life, Business… does the real work and produces the result." },
  { n: "Response to WhatsApp", d: "A formatted reply — text, buttons and links — is sent back into the same chat." },
];

const SCRIPT: Record<Scenario, { label: string; user: string; ack: string; steps: { stage: number; log: string }[]; module: string }> = {
  learn: {
    label: "Learn · Newton's Laws", user: "Explain Newton's Three Laws of Motion in Assamese.", ack: "Sure! I'll prepare a simple explanation in Assamese.", module: "Nova Learn",
    steps: [
      { stage: 0, log: "User message sent" }, { stage: 1, log: "Message received via WhatsApp Business API (simulated)" }, { stage: 2, log: "Backend validated and queued the request" },
      { stage: 3, log: "Nova Brain received the message" }, { stage: 3, log: "Nova Brain understood the request: learn · Physics · Assamese" }, { stage: 4, log: "Nova Learn activated" },
      { stage: 4, log: "Explanation prepared" }, { stage: 4, log: "Notes and quiz generated" }, { stage: 5, log: "Result returned to the WhatsApp conversation" },
    ],
  },
  reminder: {
    label: "Business · Client reminder", user: "Remind me to follow up with my client tomorrow.", ack: "Sure! Your client follow-up reminder has been added.", module: "Nova Life + Automation",
    steps: [
      { stage: 0, log: "User message sent" }, { stage: 1, log: "Message received via WhatsApp Business API (simulated)" }, { stage: 2, log: "Backend validated and queued the request" },
      { stage: 3, log: "Nova Brain received the message" }, { stage: 3, log: "Understood: set a reminder · tomorrow · client follow-up" }, { stage: 4, log: "Nova Life + Nova Automation activated" },
      { stage: 4, log: "Reminder created (sample)" }, { stage: 5, log: "Confirmation returned to the WhatsApp conversation" },
    ],
  },
};

const LAWS = [
  { as: "প্ৰথম সূত্ৰ: বস্তু স্থিৰ হৈ থাকিলে স্থিৰ হৈয়ে থাকে, আৰু গতিশীল হ'লে একে বেগত গতি কৰি থাকে—যদিহে বাহ্যিক বল ক্ৰিয়া নকৰে।", en: "1st law: an object stays at rest or in uniform motion unless a force acts on it." },
  { as: "দ্বিতীয় সূত্ৰ: বল = ভৰ × ত্বৰণ (F = ma)।", en: "2nd law: force = mass × acceleration (F = ma)." },
  { as: "তৃতীয় সূত্ৰ: প্ৰতিটো ক্ৰিয়াৰ সমান আৰু বিপৰীত প্ৰতিক্ৰিয়া থাকে।", en: "3rd law: every action has an equal and opposite reaction." },
];
const QUIZ = [
  { q: "নিউটনৰ দ্বিতীয় সূত্ৰ কোনটো?", o: ["F = ma", "E = mc²", "V = IR"], a: 0 },
  { q: "ৰকেট ওপৰলৈ উঠে কোনটো সূত্ৰৰ ফলত?", o: ["প্ৰথম সূত্ৰ", "দ্বিতীয় সূত্ৰ", "তৃতীয় সূত্ৰ"], a: 2 },
];

export default function WhatsAppDemo({ compact = false }: { compact?: boolean }) {
  const [sc, setSc] = useState<Scenario>("learn");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [stage, setStage] = useState(-1);
  const [log, setLog] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);
  const [sheet, setSheet] = useState<null | "notes" | "lecture" | "quiz">(null);
  const [picked, setPicked] = useState<(number | null)[]>(QUIZ.map(() => null));
  const [done, setDone] = useState(false);
  const token = useRef(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const k = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 0.2 : 1;

  useEffect(() => () => { token.current++; }, []);
  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing, sheet]);

  const reset = useCallback((s: Scenario = sc) => { token.current++; setSc(s); setMsgs([]); setTyping(false); setStage(-1); setLog([]); setPlaying(false); setSheet(null); setPicked(QUIZ.map(() => null)); setDone(false); }, [sc]);

  const play = useCallback(async () => {
    const my = ++token.current;
    const S = SCRIPT[sc];
    const wait = (ms: number) => new Promise<void>((res, rej) => setTimeout(() => (token.current === my ? res() : rej(new Error("x"))), ms * k));
    setMsgs([]); setLog([]); setStage(-1); setSheet(null); setDone(false); setPicked(QUIZ.map(() => null)); setPlaying(true);
    try {
      await wait(300);
      setMsgs([{ id: 1, from: "user", text: S.user }]);
      for (let i = 0; i < S.steps.length; i++) {
        const st = S.steps[i];
        await wait(i === 0 ? 400 : 750);
        setStage(st.stage); setLog((l) => [...l, st.log]);
        if (i === 2) { setTyping(true); await wait(400); setTyping(false); setMsgs((m) => [...m, { id: 2, from: "bot", text: S.ack }]); setTyping(true); }
      }
      await wait(600);
      setTyping(false);
      setMsgs((m) => [...m, { id: 3, from: "bot", card: sc === "learn" ? "learn" : "reminder" }]);
      setDone(true);
    } catch { /* cancelled */ }
    if (token.current === my) setPlaying(false);
  }, [sc, k]);

  return (
    <div style={{ display: "grid", gap: "1.4rem", gridTemplateColumns: compact ? "minmax(0, 20rem) 1fr" : "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))", alignItems: "start", justifyItems: compact ? "stretch" : "stretch" }}>
      {/* ───── phone ───── */}
      <div style={{ display: "grid", gap: ".8rem", justifyItems: "center" }}>
        <div className="sn-tabs" role="tablist" aria-label="WhatsApp scenario" style={{ maxWidth: "100%" }}>
          {(Object.keys(SCRIPT) as Scenario[]).map((s) => <button key={s} role="tab" aria-selected={sc === s} className="sn-tab" onClick={() => reset(s)}>{SCRIPT[s].label}</button>)}
        </div>
        <div style={{ width: "100%", maxWidth: "20.5rem", borderRadius: "2.2rem", border: "7px solid #1b2440", background: "#0b141a", overflow: "hidden", boxShadow: "0 30px 80px -30px rgba(59,130,246,.55)", position: "relative", display: "flex", flexDirection: "column", height: compact ? "30rem" : "34rem" }}>
          <div style={{ background: "#202c33", padding: ".7rem .9rem", display: "flex", alignItems: "center", gap: ".6rem" }}>
            <NovaMark size={34} />
            <div style={{ lineHeight: 1.2 }}><b style={{ fontSize: ".92rem" }}>StudyNova AI</b><br /><span style={{ fontSize: ".7rem", color: "#8696a0" }}>{typing ? "typing…" : "business account · simulated"}</span></div>
          </div>
          <div ref={chatRef} className="sn-scroll" style={{ flex: 1, overflowY: "auto", padding: ".8rem", display: "flex", flexDirection: "column", gap: ".5rem", background: "radial-gradient(circle at 20% 10%, rgba(255,255,255,.03), transparent 40%), #0b141a" }}>
            {msgs.length === 0 && <div style={{ margin: "auto", textAlign: "center", color: "#8696a0", fontSize: ".82rem", padding: "1rem" }}><Play size={22} style={{ margin: "0 auto .4rem" }} />Press “Play conversation” to start the simulation.</div>}
            {msgs.map((m) => (
              <div key={m.id} className="sn-pop" style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "88%", background: m.from === "user" ? "#005c4b" : "#202c33", borderRadius: ".7rem", padding: ".5rem .65rem", fontSize: ".86rem", lineHeight: 1.4 }}>
                {m.text}
                {m.card === "learn" && (<div>
                  <b>✅ Your learning package is ready!</b>
                  <p style={{ margin: ".3rem 0 .5rem", fontSize: ".78rem", color: "#a8b3bb" }}>Newton's Three Laws · notes, lecture and quiz</p>
                  <div style={{ display: "grid", gap: ".3rem" }}>
                    {([["notes", "Read Notes", BookOpen], ["lecture", "View Lecture", PlayCircle], ["quiz", "Take Quiz", GraduationCap]] as const).map(([id, lb, Ic]) => <button key={id} onClick={() => setSheet(id)} style={{ background: "#111b21", border: "1px solid #2a3942", color: "#53bdeb", borderRadius: ".5rem", padding: ".45rem", display: "flex", gap: ".4rem", alignItems: "center", justifyContent: "center", fontSize: ".82rem" }}><Ic size={14} />{lb}</button>)}
                  </div></div>)}
                {m.card === "reminder" && (<div><b>⏰ Reminder added</b><p style={{ margin: ".3rem 0 0", fontSize: ".82rem" }}>Follow up with client<br /><span style={{ color: "#a8b3bb" }}>Tomorrow · 10:00 AM (sample)</span></p></div>)}
                <div style={{ textAlign: "right", fontSize: ".62rem", color: "#8696a0", marginTop: ".15rem" }}>now {m.from === "user" && <CheckCheck size={11} style={{ display: "inline", color: "#53bdeb" }} />}</div>
              </div>
            ))}
            {typing && <div className="sn-typing" style={{ alignSelf: "flex-start", background: "#202c33", borderRadius: ".7rem", padding: ".55rem .75rem" }} aria-label="StudyNova is typing"><i /><i /><i /></div>}
          </div>
          <div style={{ background: "#202c33", padding: ".5rem .7rem", display: "flex", gap: ".5rem", alignItems: "center" }}>
            <span style={{ flex: 1, background: "#2a3942", borderRadius: "999px", padding: ".45rem .8rem", fontSize: ".8rem", color: "#8696a0" }}>Message (simulation)</span>
            <span style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "#00a884", display: "grid", placeItems: "center" }}><Send size={14} /></span>
          </div>

          {sheet && (
            <div role="dialog" aria-label={sheet} style={{ position: "absolute", inset: "3.2rem 0 0 0", background: "#111b21", padding: ".9rem", overflowY: "auto", zIndex: 2 }} className="sn-pop sn-scroll">
              <button onClick={() => setSheet(null)} aria-label="Close" style={{ position: "absolute", top: ".6rem", right: ".6rem", background: "#2a3942", border: 0, width: "1.8rem", height: "1.8rem", borderRadius: "50%", display: "grid", placeItems: "center" }}><X size={14} /></button>
              {sheet === "notes" && <><b>📘 Notes · নিউটনৰ গতিৰ সূত্ৰ</b><ul style={{ margin: ".6rem 0 0", paddingLeft: 0, listStyle: "none", display: "grid", gap: ".6rem", fontSize: ".84rem" }}>{LAWS.map((l) => <li key={l.en} style={{ borderLeft: "3px solid #00a884", paddingLeft: ".6rem" }}>{l.as}<br /><span style={{ color: "#8696a0", fontSize: ".76rem" }}>{l.en}</span></li>)}</ul></>}
              {sheet === "lecture" && <><b>🎬 Lecture</b><div style={{ marginTop: ".6rem" }}><MediaSlot slot="whatsapp-demo" kind="video" label="Lecture video" fallback={<StoryboardPreview title="Newton's Laws — lecture" caption="Lecture preview (concept)" />} /></div></>}
              {sheet === "quiz" && <><b>📝 Quick quiz</b>{QUIZ.map((q, qi) => <div key={qi} style={{ margin: ".7rem 0" }}><p style={{ margin: "0 0 .35rem", fontSize: ".85rem" }}>{qi + 1}. {q.q}</p><div style={{ display: "grid", gap: ".3rem" }}>{q.o.map((o, oi) => { const p = picked[qi]; const st = p === null ? "" : oi === q.a ? "r" : oi === p ? "w" : ""; return <button key={oi} disabled={p !== null} onClick={() => setPicked((a) => a.map((v, i) => (i === qi ? oi : v)))} style={{ textAlign: "left", padding: ".4rem .6rem", borderRadius: ".5rem", border: `1px solid ${st === "r" ? "#34d399" : st === "w" ? "#fb7185" : "#2a3942"}`, background: st === "r" ? "rgba(52,211,153,.15)" : st === "w" ? "rgba(251,113,133,.15)" : "#202c33", fontSize: ".82rem" }}>{o}</button>; })}</div></div>)}</>}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button className="sn-btn" onClick={play} disabled={playing}><Play size={15} /> {done ? "Play again" : playing ? "Playing…" : "Play conversation"}</button>
          {(msgs.length > 0 || done) && <button className="sn-btn sn-btn--ghost" onClick={() => reset()}><RotateCcw size={15} /> Reset</button>}
        </div>
      </div>

      {/* ───── architecture flow ───── */}
      <div>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center", marginBottom: ".8rem" }}>
          <p className="sn-eyebrow" style={{ margin: 0 }}>Future integration architecture</p><SimBadge label="Visual simulation only" />
        </div>
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 0 }}>
          {FLOW.map((f, i) => {
            const active = stage === i; const passed = stage > i;
            return (
              <li key={f.n}>
                <div className="sn-step" data-state={active ? "active" : passed ? "done" : "idle"} style={{ opacity: stage < 0 ? 0.85 : undefined }}>
                  <span className="sn-step__num">{i + 1}</span>
                  <div><b>{f.n}</b>{i === 4 && <span className="sn-chip" style={{ marginLeft: ".5rem", fontSize: ".7rem", padding: ".1rem .5rem" }}>{SCRIPT[sc].module}</span>}<p className="sn-muted" style={{ margin: ".15rem 0 0", fontSize: ".85rem" }}>{f.d}</p></div>
                </div>
                {i < FLOW.length - 1 && <div className="sn-arrow" style={{ height: "1rem" }} aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
        {log.length > 0 && <div className="sn-card sn-pad" style={{ marginTop: "1rem", padding: ".8rem 1rem" }}><p className="sn-eyebrow" style={{ marginBottom: ".4rem" }}>Live pipeline log (simulated)</p><ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".2rem", fontSize: ".8rem", fontFamily: "ui-monospace, monospace" }}>{log.map((l, i) => <li key={i} className="sn-pop" style={{ color: i === log.length - 1 ? "var(--sn-cyan)" : "var(--sn-muted)" }}>› {l}</li>)}</ul></div>}
        <p className="sn-muted" style={{ fontSize: ".78rem", marginTop: ".8rem" }}>No real WhatsApp, Meta API, Twilio or messaging service is connected. No messages are sent.</p>
      </div>
    </div>
  );
}
