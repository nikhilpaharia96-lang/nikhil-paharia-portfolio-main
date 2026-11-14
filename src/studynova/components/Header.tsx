import { Link } from "wouter";
import { ArrowLeft, Presentation as Pres } from "lucide-react";
import Brand from "./Brand";

const NAV = [["#command", "Try it"], ["#whatsapp", "WhatsApp"], ["#ecosystem", "Ecosystem"], ["#wearable", "Wearable"], ["#architecture", "Architecture"], ["#notes", "Prototype notes"]];

export default function Header({ onPresent }: { onPresent: () => void }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(14px)", background: "rgba(5,9,20,.72)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
      <div className="sn-wrap" style={{ display: "flex", alignItems: "center", gap: ".8rem", padding: ".6rem 1rem", flexWrap: "wrap" }}>
        <Link href="/" aria-label="Back to portfolio" className="sn-icon-btn"><ArrowLeft size={16} /></Link>
        <Brand size={30} showTag />
        <span className="sn-sim" style={{ marginLeft: ".2rem" }}><span className="sn-live-dot" />Demo Mode</span>
        <nav aria-label="StudyNova sections" className="sn-scroll" style={{ display: "flex", gap: ".9rem", marginLeft: "auto", overflowX: "auto", fontSize: ".85rem" }}>
          {NAV.map(([h, l]) => <a key={h} href={h} className="sn-muted" style={{ whiteSpace: "nowrap" }}>{l}</a>)}
        </nav>
        <button className="sn-btn sn-btn--sm" onClick={onPresent}><Pres size={14} /> Launch Presentation Mode</button>
        <span title="Sample profile" aria-label="Demo user" style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: "linear-gradient(135deg,#22d3ee,#8b5cf6)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: ".8rem" }}>N</span>
      </div>
    </header>
  );
}
