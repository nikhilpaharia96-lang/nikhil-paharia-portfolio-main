import { useState } from "react";
import { MessageCircle } from "lucide-react";
import SimBadge from "./SimBadge";

const NODES = [
  { n: "USER", d: "A student, creator, founder or professional with a goal — not a tool to operate." },
  { n: "MULTIMODAL INPUT", d: "Text, voice, files and images (and later, WhatsApp messages) become one request." },
  { n: "NOVA BRAIN", d: "Understands the intent, remembers context and decides what has to happen." },
  { n: "ORCHESTRATION ENGINE", d: "Breaks the goal into tasks, sequences them and picks the right modules." },
  { n: "SPECIALIZED MODULES", d: "Learn · Business · Creator · Builder · Research · Life · Memory · Automation." },
  { n: "RESULT GENERATION", d: "Combines module outputs into one finished, readable package." },
  { n: "OUTPUT", d: "Notes, video, plan, website, dashboard — delivered in the app or on WhatsApp." },
];

export default function Architecture({ compact = false }: { compact?: boolean }) {
  const [sel, setSel] = useState(2);
  return (
    <div>
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".8rem" }}><SimBadge label="Concept diagram" dot={false} /></div>
      <div style={{ display: "grid", gap: ".35rem", gridTemplateColumns: compact ? "repeat(auto-fit, minmax(7rem,1fr))" : "repeat(auto-fit, minmax(9.5rem,1fr))", alignItems: "stretch" }}>
        {NODES.map((x, i) => (
          <button key={x.n} onClick={() => setSel(i)} className="sn-step" data-state={sel === i ? "active" : "idle"} style={{ textAlign: "left", display: "grid", gap: ".3rem", alignContent: "start", cursor: "pointer" }} aria-pressed={sel === i}>
            <span className="sn-step__num">{i + 1}</span><b style={{ fontSize: ".8rem", letterSpacing: ".04em" }}>{x.n}</b>
          </button>
        ))}
      </div>
      <div className="sn-card sn-pad sn-pop" key={sel} style={{ marginTop: ".9rem" }}><b>{NODES[sel].n}</b><p className="sn-muted" style={{ margin: ".3rem 0 0" }}>{NODES[sel].d}</p></div>
      <div style={{ marginTop: ".7rem", display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap" }}>
        <span className="sn-chip"><MessageCircle size={14} /> WhatsApp — extra input / output channel (future)</span>
        <span className="sn-muted" style={{ fontSize: ".8rem" }}>Messages enter at step 2 and the result returns from step 7.</span>
      </div>
    </div>
  );
}
