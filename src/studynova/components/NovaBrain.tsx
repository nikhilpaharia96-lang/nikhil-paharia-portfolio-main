import { CheckCircle2, Loader2, SkipForward, RotateCcw } from "lucide-react";
import { DEMOS } from "../data/demos";
import type { RunState } from "../hooks/useNovaRun";
import SimBadge from "./SimBadge";
import LearnResult from "./results/LearnResult";
import BusinessResult from "./results/BusinessResult";
import CreatorResult from "./results/CreatorResult";
import LifeResult from "./results/LifeResult";
import BuilderResult from "./results/BuilderResult";

const STEPS = ["Understanding request", "Planning", "Selecting AI tools", "Processing", "Completed result"];

const Result = ({ id }: { id: keyof typeof DEMOS }) =>
  id === "learn" ? <LearnResult /> : id === "business" ? <BusinessResult /> : id === "creator" ? <CreatorResult /> : id === "life" ? <LifeResult /> : <BuilderResult />;

export default function NovaBrain({ state: s, onSkip, onReset, onReplay, compact = false }: { state: RunState; onSkip: () => void; onReset: () => void; onReplay: () => void; compact?: boolean }) {
  if (s.phase === "idle" || !s.demo) return null;
  const d = DEMOS[s.demo];
  const stateOf = (n: number) => (s.step > n || s.phase === "done" ? "done" : s.step === n ? "active" : "idle");

  return (
    <section id="nova-brain" className="sn-card sn-card--glow sn-pad sn-pop" aria-live="polite" style={{ scrollMarginTop: "5rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: ".6rem", marginBottom: "1rem" }}>
        <div>
          <p className="sn-eyebrow">Nova Brain · {d.module}</p>
          <p style={{ margin: ".2rem 0 0", fontWeight: 600 }}>“{s.prompt}”</p>
        </div>
        <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
          <SimBadge label="Prototype simulation — no real AI" />
          {s.phase === "running" && <button className="sn-btn sn-btn--ghost sn-btn--sm" onClick={onSkip}><SkipForward size={14} /> Skip to result</button>}
          {s.phase === "done" && <><button className="sn-btn sn-btn--ghost sn-btn--sm" onClick={onReplay}><RotateCcw size={14} /> Replay</button><button className="sn-btn sn-btn--ghost sn-btn--sm" onClick={onReset}>Clear</button></>}
        </div>
      </div>
      {!s.exact && <p className="sn-chip" style={{ marginBottom: ".9rem", borderColor: "rgba(251,191,36,.4)", color: "var(--sn-amber)" }}>The prototype has 5 pre-built workflows — your request was matched to the closest one: {d.module}.</p>}

      <div style={{ display: "grid", gap: ".6rem", gridTemplateColumns: compact ? "1fr" : "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))" }}>
        {/* 1 */}
        <div className="sn-step" data-state={stateOf(1)}><span className="sn-step__num">{stateOf(1) === "done" ? <CheckCircle2 size={16} /> : stateOf(1) === "active" ? <Loader2 size={16} className="sn-spin" /> : 1}</span>
          <div><b>{STEPS[0]}</b>{s.understood > 0 && <ul style={{ margin: ".35rem 0 0", paddingLeft: "1rem", fontSize: ".85rem" }} className="sn-muted">{d.understanding.slice(0, s.understood).map((u) => <li key={u} className="sn-pop">{u}</li>)}</ul>}</div></div>
        {/* 2 */}
        <div className="sn-step" data-state={stateOf(2)}><span className="sn-step__num">{stateOf(2) === "done" ? <CheckCircle2 size={16} /> : stateOf(2) === "active" ? <Loader2 size={16} className="sn-spin" /> : 2}</span>
          <div><b>{STEPS[1]}</b>{s.planShown > 0 && <ol style={{ margin: ".35rem 0 0", paddingLeft: "1.1rem", fontSize: ".85rem" }} className="sn-muted">{d.plan.slice(0, s.planShown).map((p) => <li key={p} className="sn-pop">{p}</li>)}</ol>}</div></div>
        {/* 3 */}
        <div className="sn-step" data-state={stateOf(3)}><span className="sn-step__num">{stateOf(3) === "done" ? <CheckCircle2 size={16} /> : stateOf(3) === "active" ? <Loader2 size={16} className="sn-spin" /> : 3}</span>
          <div><b>{STEPS[2]}</b>{s.toolsShown > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginTop: ".4rem" }}>{d.tools.slice(0, s.toolsShown).map((tl) => <span key={tl.name} className="sn-chip sn-pop" title={tl.why} style={{ borderColor: "rgba(34,211,238,.4)" }}>{tl.name}<span className="sn-muted" style={{ fontSize: ".72rem" }}>· {tl.why}</span></span>)}</div>}</div></div>
        {/* 4 */}
        <div className="sn-step" data-state={stateOf(4)}><span className="sn-step__num">{stateOf(4) === "done" ? <CheckCircle2 size={16} /> : stateOf(4) === "active" ? <Loader2 size={16} className="sn-spin" /> : 4}</span>
          <div style={{ flex: 1, minWidth: 0 }}><b>{STEPS[3]}</b>
            {s.step >= 4 && <>
              <div className="sn-bar" style={{ margin: ".5rem 0" }}><i style={{ width: `${s.overall}%` }} /></div>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".2rem", fontSize: ".85rem" }}>
                {d.tasks.map((t, i) => (
                  <li key={t.label} style={{ display: "flex", gap: ".5rem", alignItems: "center", opacity: i > s.taskIndex ? .35 : 1 }} className="sn-muted">
                    {i < s.taskIndex || s.phase === "done" ? <CheckCircle2 size={13} color="var(--sn-green)" /> : i === s.taskIndex ? <Loader2 size={13} className="sn-spin" color="var(--sn-cyan)" /> : <span style={{ width: 13 }} />}
                    <span style={{ color: i === s.taskIndex ? "var(--sn-text)" : undefined }}>{t.label}</span>
                  </li>
                ))}
              </ul></>}
          </div></div>
      </div>

      {s.phase === "done" && (
        <div style={{ marginTop: "1.2rem" }}>
          <div className="sn-step" data-state="done" style={{ marginBottom: "1rem" }}><span className="sn-step__num"><CheckCircle2 size={16} /></span><div><b>{STEPS[4]}</b><p className="sn-muted" style={{ margin: ".1rem 0 0", fontSize: ".85rem" }}>Sample output below was pre-written for this prototype; it was not generated by an AI model.</p></div></div>
          <Result id={s.demo} />
        </div>
      )}
    </section>
  );
}
