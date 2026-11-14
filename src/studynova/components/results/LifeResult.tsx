import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { LIFE as D } from "../../data/content";

const H = ({ children }: { children: React.ReactNode }) => <p className="sn-eyebrow" style={{ marginBottom: ".6rem" }}>{children}</p>;
const PRI: Record<string, string> = { High: "var(--sn-rose)", Medium: "var(--sn-amber)", Low: "var(--sn-green)" };

export default function LifeResult() {
  const [done, setDone] = useState<boolean[]>(D.schedule.map((s) => s.done));
  const [added, setAdded] = useState<boolean[]>(D.next.map(() => false));
  const pct = Math.round((done.filter(Boolean).length / done.length) * 100);
  return (
    <div className="sn-pop" style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))" }}>
        <section className="sn-card sn-pad"><H>Today's schedule · {pct}% done</H>
          <div className="sn-bar" style={{ marginBottom: ".8rem" }}><i style={{ width: `${pct}%` }} /></div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".4rem" }}>
            {D.schedule.map((s, i) => (
              <li key={s.t}><button onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))} aria-pressed={done[i]} style={{ width: "100%", display: "flex", gap: ".7rem", alignItems: "center", textAlign: "left", background: "transparent", border: "1px solid var(--sn-line)", borderRadius: ".8rem", padding: ".55rem .7rem" }}>
                <span style={{ width: "1.2rem", height: "1.2rem", borderRadius: "6px", display: "grid", placeItems: "center", background: done[i] ? "var(--sn-green)" : "transparent", border: "1.5px solid var(--sn-green)", flex: "none" }}>{done[i] && <Check size={12} color="#04130d" strokeWidth={3} />}</span>
                <span className="sn-muted" style={{ fontVariantNumeric: "tabular-nums", flex: "none" }}>{s.t}</span>
                <span style={{ textDecoration: done[i] ? "line-through" : "none", opacity: done[i] ? .6 : 1 }}>{s.x}</span>
              </button></li>
            ))}
          </ul>
        </section>
        <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
          <section className="sn-card sn-pad"><H>Completed tasks</H><ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".35rem" }}>{D.completed.map((c) => <li key={c} style={{ display: "flex", gap: ".5rem" }}><Check size={16} color="var(--sn-green)" />{c}</li>)}</ul></section>
          <section className="sn-card sn-pad"><H>Pending assignments</H><ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".5rem" }}>{D.assignments.map((a) => <li key={a.x} style={{ display: "flex", justifyContent: "space-between", gap: ".6rem", alignItems: "center" }}><span>{a.x}</span><span className="sn-chip" style={{ borderColor: PRI[a.p], color: PRI[a.p], fontSize: ".72rem", whiteSpace: "nowrap" }}>{a.due}</span></li>)}</ul></section>
        </div>
      </div>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))" }}>
        <section className="sn-card sn-pad"><H>Upcoming deadlines</H><ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".5rem" }}>{D.deadlines.map((d) => <li key={d.x}><b>{d.x}</b><br /><span className="sn-muted" style={{ fontSize: ".85rem" }}>{d.when}</span></li>)}</ul></section>
        <section className="sn-card sn-pad"><H>Important notes</H><ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: ".4rem" }}>{D.notes.map((n) => <li key={n}>{n}</li>)}</ul></section>
        <section className="sn-card sn-card--glow sn-pad"><H>Suggested next actions</H>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".6rem" }}>
            {D.next.map((n, i) => <li key={n.x} style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", justifyContent: "space-between" }}><span><span className="sn-chip" style={{ fontSize: ".68rem", padding: ".1rem .5rem", marginRight: ".4rem" }}>{n.tag}</span>{n.x}</span>
              <button className="sn-btn sn-btn--ghost sn-btn--sm" onClick={() => setAdded((a) => a.map((v, j) => (j === i ? !v : v)))} aria-pressed={added[i]}>{added[i] ? <><Check size={13} /> Added</> : <><Plus size={13} /> Add</>}</button></li>)}
          </ul>
        </section>
      </div>
      <p className="sn-muted" style={{ fontSize: ".78rem", margin: 0 }}>All information shown is sample data created for the prototype.</p>
    </div>
  );
}
