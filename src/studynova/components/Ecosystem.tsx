import { useState } from "react";
import { Brain, GraduationCap, Database, CalendarCheck, Briefcase, Clapperboard, Code2, Search, Workflow, Play, type LucideIcon } from "lucide-react";
import type { DemoId } from "../data/demos";

interface Mod { name: string; icon: LucideIcon; desc: string; preview: string[]; status: "Prototype demo" | "Concept"; demo?: DemoId; color: string }
const MODS: Mod[] = [
  { name: "Nova Brain", icon: Brain, color: "#3b82f6", desc: "The core that understands goals and coordinates every module.", preview: ["Understand intent", "Plan tasks", "Choose modules", "Deliver result"], status: "Prototype demo", demo: "learn" },
  { name: "Nova Learn", icon: GraduationCap, color: "#22d3ee", desc: "Explanations, notes, diagrams and quizzes in your language.", preview: ["Explanation (Assamese / English)", "Study notes", "Diagram", "Quiz"], status: "Prototype demo", demo: "learn" },
  { name: "Nova Memory", icon: Database, color: "#8b5cf6", desc: "Remembers your language, level and preferences — with your consent.", preview: ["Language: Assamese", "Level: Class 10 (sample)", "Forget-me control"], status: "Concept" },
  { name: "Nova Life", icon: CalendarCheck, color: "#34d399", desc: "Daily tasks, deadlines and reminders in one calm dashboard.", preview: ["Today's schedule", "Deadlines", "Next actions"], status: "Prototype demo", demo: "life" },
  { name: "Nova Business", icon: Briefcase, color: "#fbbf24", desc: "Marketing plans, content calendars and budgets.", preview: ["Strategy", "Audience", "Content calendar", "Budget"], status: "Prototype demo", demo: "business" },
  { name: "Nova Creator", icon: Clapperboard, color: "#fb7185", desc: "Scripts, scenes, voiceover plans and a mock video editor.", preview: ["Script", "Scenes", "Timeline editor"], status: "Prototype demo", demo: "creator" },
  { name: "Nova Builder", icon: Code2, color: "#60a5fa", desc: "Websites and app structures from a plain description.", preview: ["Sitemap", "Page blocks", "Suggested stack"], status: "Prototype demo", demo: "builder" },
  { name: "Nova Research", icon: Search, color: "#a78bfa", desc: "Finds, compares and summarises sources with citations.", preview: ["Search", "Compare", "Cited summary"], status: "Concept" },
  { name: "Nova Automation", icon: Workflow, color: "#2dd4bf", desc: "Repeats routine work: reminders, follow-ups, exports.", preview: ["Trigger", "Action", "Confirmation"], status: "Concept" },
];

export default function Ecosystem({ onRun }: { onRun: (d: DemoId) => void }) {
  const [open, setOpen] = useState<string | null>("Nova Brain");
  return (
    <div style={{ display: "grid", gap: ".9rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))" }}>
      {MODS.map((m) => {
        const I = m.icon; const o = open === m.name;
        return (
          <div key={m.name} className="sn-card sn-pad" style={{ borderColor: o ? m.color : undefined }}>
            <button onClick={() => setOpen(o ? null : m.name)} aria-expanded={o} style={{ all: "unset", cursor: "pointer", display: "block", width: "100%" }}>
              <span style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>
                <span style={{ width: "2.4rem", height: "2.4rem", borderRadius: ".7rem", display: "grid", placeItems: "center", background: `${m.color}26`, color: m.color }}><I size={20} /></span>
                <b>{m.name}</b>
                <span className="sn-chip" style={{ marginLeft: "auto", fontSize: ".65rem", padding: ".1rem .5rem" }}>{m.status}</span>
              </span>
              <span className="sn-muted" style={{ display: "block", margin: ".6rem 0 0", fontSize: ".86rem" }}>{m.desc}</span>
            </button>
            {o && (
              <div className="sn-pop" style={{ marginTop: ".7rem" }}>
                <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: ".82rem" }}>{m.preview.map((p) => <li key={p}>{p}</li>)}</ul>
                {m.demo ? <button className="sn-btn sn-btn--sm" style={{ marginTop: ".7rem" }} onClick={() => onRun(m.demo!)}><Play size={13} /> Run this demo</button> : <p className="sn-muted" style={{ fontSize: ".75rem", marginTop: ".6rem" }}>Concept only — no demo built yet.</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
