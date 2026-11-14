import { useState } from "react";
import { Pause, Play, Trash2, ShieldCheck } from "lucide-react";
import SimBadge from "./SimBadge";
import MediaSlot from "./MediaSlot";

export default function Wearable() {
  const [on, setOn] = useState(false);
  const [paused, setPaused] = useState(false);
  const [notes, setNotes] = useState(["Sample: Assignment due Friday", "Sample: Call client at 4 PM"]);
  const rec = on && !paused;
  return (
    <div style={{ display: "grid", gap: "1.4rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))", alignItems: "center" }}>
      <div>
        <MediaSlot slot="wearable-concept" kind="image" label="Wearable concept image" fallback={
          <div className="sn-card" style={{ display: "grid", placeItems: "center", padding: "1.5rem" }}>
            <svg viewBox="0 0 200 200" width="190" role="img" aria-label="Concept sketch of a small clip-on wearable with a status light">
              <defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
              <rect x="55" y="35" width="90" height="130" rx="30" fill="#0b1230" stroke="url(#wg)" strokeWidth="3" />
              <circle cx="100" cy="80" r="18" fill="none" stroke="url(#wg)" strokeWidth="3" />
              <circle cx="100" cy="125" r="7" fill={rec ? "#fb7185" : paused ? "#fbbf24" : "#334155"} className={rec ? "sn-float" : ""} />
            </svg>
            <span className="sn-muted" style={{ fontSize: ".75rem" }}>Concept sketch — not a real device</span>
          </div>} />
      </div>
      <div>
        <p className="sn-eyebrow">Future concept</p><SimBadge label="Not built — idea only" dot={false} />
        <h3 style={{ margin: ".6rem 0 .3rem", fontSize: "1.4rem" }}>A consent-first AI companion you can wear</h3>
        <p className="sn-muted">A tiny optional device that, only when you turn it on, captures lectures and meetings and turns them into notes and reminders. Privacy controls come first:</p>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", margin: ".8rem 0" }}>
          <button className="sn-btn sn-btn--sm" onClick={() => { setOn(!on); setPaused(false); }}>{on ? "Stop (consent off)" : "Give consent & start"}</button>
          <button className="sn-btn sn-btn--ghost sn-btn--sm" disabled={!on} onClick={() => setPaused(!paused)}>{paused ? <Play size={14} /> : <Pause size={14} />} {paused ? "Resume" : "Pause"}</button>
          <button className="sn-btn sn-btn--ghost sn-btn--sm" onClick={() => setNotes([])}><Trash2 size={14} /> Delete all</button>
        </div>
        <p role="status" className="sn-chip" style={{ color: rec ? "#fb7185" : undefined }}><ShieldCheck size={14} /> {rec ? "● Recording indicator ON (visible to everyone nearby)" : paused ? "Paused — nothing is captured" : "Off — nothing is captured"}</p>
        <ul style={{ margin: ".7rem 0 0", paddingLeft: "1.1rem", fontSize: ".85rem" }} className="sn-muted">{notes.length ? notes.map((n) => <li key={n}>{n}</li>) : <li>No saved items.</li>}</ul>
      </div>
    </div>
  );
}
