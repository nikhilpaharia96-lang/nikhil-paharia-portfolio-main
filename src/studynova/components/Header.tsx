import { Presentation as Pres } from "lucide-react";

const NAV = [["#command", "Try it"], ["#whatsapp", "WhatsApp"], ["#ecosystem", "Ecosystem"], ["#wearable", "Wearable"], ["#architecture", "Architecture"], ["#notes", "Prototype notes"]];

export default function Header({ onPresent }: { onPresent: () => void }) {
  return (
    <div className="sn-subnav sn-wrap" style={{ position: "sticky", top: "4.5rem", zIndex: 30 }}>
      <div className="sn-card" style={{ display: "flex", alignItems: "center", gap: ".8rem", padding: ".5rem .6rem .5rem 1rem", borderRadius: "999px", backdropFilter: "blur(12px)", background: "rgba(255,255,255,.9)" }}>
        <span className="sn-sim"><span className="sn-live-dot" />Demo Mode</span>
        <nav aria-label="StudyNova sections" className="sn-scroll" style={{ display: "flex", gap: "1rem", marginLeft: "auto", overflowX: "auto", fontSize: ".8rem", fontWeight: 700 }}>
          {NAV.map(([h, l]) => <a key={h} href={h} className="sn-muted" style={{ whiteSpace: "nowrap" }}>{l}</a>)}
        </nav>
        <button className="sn-btn sn-btn--ghost sn-btn--sm" onClick={onPresent} style={{ flex: "none" }}><Pres size={14} /> Present</button>
      </div>
    </div>
  );
}
