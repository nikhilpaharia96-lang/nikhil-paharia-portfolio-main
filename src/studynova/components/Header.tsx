import { Presentation as Pres } from "lucide-react";

const NAV = [["#command", "Try it"], ["#problem", "Problem"], ["#vision", "Vision"], ["#whatsapp", "WhatsApp"], ["#ecosystem", "Ecosystem"], ["#architecture", "Brain"], ["#notes", "Notes"]];

export default function Header({ onPresent }: { onPresent: () => void }) {
  return (
    <div className="sn-subnav sn-wrap" style={{ position: "sticky", top: "4.5rem", zIndex: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: ".8rem", padding: ".45rem .5rem .45rem .9rem", borderRadius: ".7rem", border: "2.5px solid #0a0a0a", background: "#0a0a0a", boxShadow: "4px 4px 0 #1a35e8" }}>
        <span className="sn-sim" style={{ flex: "none" }}><span className="sn-live-dot" />Demo Mode</span>
        <nav aria-label="StudyNova sections" className="sn-scroll" style={{ display: "flex", gap: "1rem", marginLeft: "auto", overflowX: "auto", fontFamily: "var(--sn-display)", letterSpacing: ".06em", textTransform: "uppercase", fontSize: ".9rem" }}>
          {NAV.map(([h, l]) => <a key={h} href={h} style={{ whiteSpace: "nowrap", color: "#c8ff00" }}>{l}</a>)}
        </nav>
        <button className="sn-btn sn-btn--sm" onClick={onPresent} style={{ flex: "none", boxShadow: "none" }}><Pres size={14} /> Present</button>
      </div>
    </div>
  );
}
