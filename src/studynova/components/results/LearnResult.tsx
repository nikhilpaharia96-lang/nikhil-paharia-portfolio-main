import { useState } from "react";
import { BookOpen, CheckCircle2, FileText, GraduationCap, Image as ImageIcon, RotateCcw, Video, XCircle } from "lucide-react";
import { LEARN, type L } from "../../data/content";
import MediaSlot, { StoryboardPreview } from "../MediaSlot";

type Tab = "explain" | "notes" | "diagram" | "lecture" | "quiz";
const TABS: { id: Tab; label: string; Icon: typeof BookOpen }[] = [
  { id: "explain", label: "Explanation", Icon: BookOpen }, { id: "notes", label: "Notes", Icon: FileText },
  { id: "diagram", label: "Diagram", Icon: ImageIcon }, { id: "lecture", label: "Lecture video", Icon: Video }, { id: "quiz", label: "Quiz", Icon: GraduationCap },
];

export function PhotosynthesisDiagram() {
  return (
    <svg viewBox="0 0 640 340" role="img" aria-label="Photosynthesis diagram: sunlight, water and carbon dioxide produce glucose and oxygen" style={{ width: "100%", height: "auto", borderRadius: "1rem", background: "linear-gradient(180deg,#0c1740,#0a1130)", border: "1px solid var(--sn-line2)" }}>
      <defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#22d3ee" /></marker></defs>
      <circle cx="80" cy="70" r="30" fill="#fbbf24" /><g stroke="#fbbf24" strokeWidth="3" strokeLinecap="round">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1={80 + 40 * Math.cos((a * Math.PI) / 180)} y1={70 + 40 * Math.sin((a * Math.PI) / 180)} x2={80 + 52 * Math.cos((a * Math.PI) / 180)} y2={70 + 52 * Math.sin((a * Math.PI) / 180)} />)}</g>
      <text x="80" y="140" fill="#fbbf24" fontSize="14" textAnchor="middle">Sunlight · সূৰ্যৰ পোহৰ</text>
      <path d="M130 90 C 200 110, 230 140, 270 160" stroke="#22d3ee" strokeWidth="2.5" fill="none" markerEnd="url(#arr)" />
      <path d="M320 70 C 430 80 480 170 420 250 C 380 300 300 300 260 250 C 220 200 240 100 320 70z" fill="#16a34a" opacity=".9" />
      <path d="M330 90 C 340 150 340 210 330 280" stroke="#bbf7d0" strokeWidth="2" fill="none" /><path d="M335 150 L385 125 M335 190 L395 165 M333 230 L380 210 M335 125 L290 110 M334 170 L285 150 M333 215 L292 195" stroke="#bbf7d0" strokeWidth="1.5" fill="none" />
      <text x="338" y="320" fill="#86efac" fontSize="13" textAnchor="middle">Leaf · পাত (ক্ল'ৰোফিল)</text>
      <path d="M40 210 L240 200" stroke="#22d3ee" strokeWidth="2.5" markerEnd="url(#arr)" /><text x="40" y="195" fill="#e0f2fe" fontSize="14">CO₂ · কাৰ্বন ডাই অক্সাইড</text>
      <path d="M150 320 L255 262" stroke="#22d3ee" strokeWidth="2.5" markerEnd="url(#arr)" /><text x="30" y="318" fill="#e0f2fe" fontSize="14">H₂O · পানী</text>
      <path d="M420 190 L600 190" stroke="#22d3ee" strokeWidth="2.5" markerEnd="url(#arr)" /><text x="470" y="180" fill="#e0f2fe" fontSize="14">O₂ · অক্সিজেন</text>
      <path d="M410 120 L600 100" stroke="#22d3ee" strokeWidth="2.5" markerEnd="url(#arr)" /><text x="460" y="92" fill="#e0f2fe" fontSize="14">Glucose · গ্লুকোজ</text>
    </svg>
  );
}

export default function LearnResult() {
  const [tab, setTab] = useState<Tab>("explain");
  const [lang, setLang] = useState<"as" | "en">("as");
  const [ans, setAns] = useState<(number | null)[]>(LEARN.quiz.map(() => null));
  const t = (x: L) => x[lang];
  const answered = ans.filter((a) => a !== null).length;
  const score = ans.reduce<number>((s, a, i) => s + (a === LEARN.quiz[i].a ? 1 : 0), 0);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem", justifyContent: "space-between", alignItems: "center", marginBottom: ".9rem" }}>
        <div className="sn-tabs" role="tablist" aria-label="Learning package">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} role="tab" aria-selected={tab === id} className="sn-tab" onClick={() => setTab(id)}><Icon size={14} style={{ display: "inline", marginRight: ".35rem", verticalAlign: "-2px" }} />{label}</button>
          ))}
        </div>
        <div role="group" aria-label="Language" style={{ display: "inline-flex", gap: ".25rem" }}>
          {(["as", "en"] as const).map((l) => <button key={l} className="sn-tab" aria-pressed={lang === l} aria-selected={lang === l} onClick={() => setLang(l)}>{l === "as" ? "অসমীয়া" : "English"}</button>)}
        </div>
      </div>

      {tab === "explain" && (
        <div className="sn-pop">
          <h4 style={{ fontSize: "1.4rem", margin: "0 0 .5rem" }}>{t(LEARN.title)} <span className="sn-muted" style={{ fontSize: ".9rem" }}>· {lang === "as" ? LEARN.title.en : LEARN.title.as}</span></h4>
          <p style={{ fontSize: "1.02rem" }}>{t(LEARN.intro)}</p>
          <p className="sn-chip" style={{ fontFamily: "ui-monospace, monospace", margin: ".4rem 0 1rem" }}>{LEARN.equation}</p>
          <ol style={{ display: "grid", gap: ".55rem", paddingLeft: 0, listStyle: "none", margin: 0 }}>
            {LEARN.steps.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: ".7rem", alignItems: "flex-start" }}>
                <span className="sn-step__num" style={{ width: "1.7rem", height: "1.7rem", fontSize: ".75rem" }}>{i + 1}</span><span>{t(s)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {tab === "notes" && (
        <ul className="sn-pop" style={{ display: "grid", gap: ".6rem", margin: 0, paddingLeft: 0, listStyle: "none" }}>
          {LEARN.notes.map((n, i) => <li key={i} className="sn-card sn-pad" style={{ padding: ".8rem 1rem", borderLeft: "3px solid var(--sn-cyan)" }}>{t(n)}</li>)}
        </ul>
      )}
      {tab === "diagram" && (
        <div className="sn-pop"><MediaSlot slot="learn-diagram" kind="image" label="Photosynthesis diagram" fallback={<PhotosynthesisDiagram />} /><p className="sn-muted" style={{ fontSize: ".8rem" }}>Sample diagram drawn in code for the prototype.</p></div>
      )}
      {tab === "lecture" && (
        <div className="sn-pop" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))" }}>
          <MediaSlot slot="learn-lecture" kind="video" label="Lecture video" hint="Lecture video preview — placeholder" fallback={<StoryboardPreview title={`${t(LEARN.title)} — lecture preview`} caption="Narrated lecture (concept)" />} />
          <div className="sn-card sn-pad">
            <p className="sn-eyebrow">Lecture narration (sample)</p>
            <ol style={{ margin: ".6rem 0 0", paddingLeft: "1.1rem", display: "grid", gap: ".5rem" }}>{LEARN.narration.map((n, i) => <li key={i}>{t(n)}</li>)}</ol>
          </div>
        </div>
      )}
      {tab === "quiz" && (
        <div className="sn-pop" style={{ display: "grid", gap: ".9rem" }}>
          {LEARN.quiz.map((q, qi) => {
            const picked = ans[qi];
            return (
              <div key={qi} className="sn-card sn-pad">
                <p style={{ fontWeight: 600, margin: "0 0 .6rem" }}>{qi + 1}. {t(q.q)}</p>
                <div style={{ display: "grid", gap: ".45rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 12rem), 1fr))" }}>
                  {q.opts.map((o, oi) => {
                    const state = picked === null ? "" : oi === q.a ? "right" : oi === picked ? "wrong" : "";
                    return (
                      <button key={oi} disabled={picked !== null} onClick={() => setAns((a) => a.map((v, i) => (i === qi ? oi : v)))}
                        style={{ textAlign: "left", padding: ".65rem .85rem", borderRadius: ".8rem", border: `1px solid ${state === "right" ? "var(--sn-green)" : state === "wrong" ? "var(--sn-rose)" : "var(--sn-line)"}`, background: state === "right" ? "rgba(52,211,153,.14)" : state === "wrong" ? "rgba(251,113,133,.14)" : "var(--sn-surface2)", display: "flex", justifyContent: "space-between", gap: ".5rem", alignItems: "center" }}>
                        <span>{t(o)}</span>{state === "right" && <CheckCircle2 size={16} color="var(--sn-green)" />}{state === "wrong" && <XCircle size={16} color="var(--sn-rose)" />}
                      </button>
                    );
                  })}
                </div>
                {picked !== null && <p className="sn-muted" style={{ margin: ".6rem 0 0", fontSize: ".88rem" }}>💡 {t(q.why)}</p>}
              </div>
            );
          })}
          <div style={{ display: "flex", alignItems: "center", gap: ".8rem", flexWrap: "wrap" }}>
            <span className="sn-chip">Score: <b>{score}</b> / {LEARN.quiz.length}{answered < LEARN.quiz.length ? ` · ${answered} answered` : " · complete"}</span>
            <button className="sn-btn sn-btn--ghost sn-btn--sm" onClick={() => setAns(LEARN.quiz.map(() => null))}><RotateCcw size={14} /> Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}
