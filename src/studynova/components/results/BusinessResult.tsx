import { BUSINESS as B } from "../../data/content";

const H = ({ children }: { children: React.ReactNode }) => <p className="sn-eyebrow" style={{ marginBottom: ".6rem" }}>{children}</p>;
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function BusinessResult() {
  return (
    <div className="sn-pop" style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 19rem), 1fr))" }}>
        <section className="sn-card sn-pad"><H>1 · Requirement analysis</H>
          <dl style={{ margin: 0, display: "grid", gap: ".5rem" }}>{B.requirement.map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", borderBottom: "1px solid var(--sn-line)", paddingBottom: ".4rem" }}><dt className="sn-muted">{k}</dt><dd style={{ margin: 0, textAlign: "right" }}>{v}</dd></div>)}</dl>
        </section>
        <section className="sn-card sn-pad"><H>2 · Marketing strategy</H>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".6rem" }}>{B.strategy.map((s) => <li key={s.t}><b>{s.t}</b><br /><span className="sn-muted" style={{ fontSize: ".88rem" }}>{s.d}</span></li>)}</ul>
        </section>
      </div>

      <section className="sn-card sn-pad"><H>3 · Target audience</H>
        <div style={{ display: "grid", gap: ".8rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))" }}>{B.audience.map((a) => <div key={a.n} className="sn-card sn-pad" style={{ padding: ".9rem" }}><b>{a.n}</b><p className="sn-muted" style={{ margin: ".3rem 0 0", fontSize: ".88rem" }}>{a.d}</p></div>)}</div>
      </section>

      <section className="sn-card sn-pad"><H>4 · Content calendar (4 weeks)</H>
        <div style={{ display: "grid", gap: ".7rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 13rem), 1fr))" }}>
          {B.calendar.map((w) => <div key={w.w} style={{ border: "1px solid var(--sn-line)", borderRadius: ".9rem", padding: ".8rem" }}><b className="sn-grad">{w.w}</b><ul style={{ margin: ".4rem 0 0", paddingLeft: "1rem", fontSize: ".88rem", display: "grid", gap: ".25rem" }}>{w.items.map((i) => <li key={i}>{i}</li>)}</ul></div>)}
        </div>
      </section>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))" }}>
        <section className="sn-card sn-pad"><H>5 · Advertisement ideas</H>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".7rem" }}>{B.ads.map((a) => <li key={a.t} style={{ borderLeft: "3px solid var(--sn-violet)", paddingLeft: ".8rem" }}><b>{a.t}</b><br /><span className="sn-muted" style={{ fontSize: ".88rem" }}>{a.d}</span></li>)}</ul>
        </section>
        <section className="sn-card sn-pad"><H>6 · Budget breakdown (sample)</H>
          <div style={{ display: "flex", height: ".8rem", borderRadius: "999px", overflow: "hidden", margin: ".2rem 0 .9rem" }} role="img" aria-label="Budget split">{B.budget.map((b) => <i key={b.k} style={{ width: `${b.p}%`, background: b.c }} />)}</div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".4rem" }}>{B.budget.map((b) => <li key={b.k} style={{ display: "flex", alignItems: "center", gap: ".6rem" }}><i style={{ width: ".7rem", height: ".7rem", borderRadius: "3px", background: b.c, flex: "none" }} /><span style={{ flex: 1 }}>{b.k}</span><span className="sn-muted">{b.p}%</span><b>{inr((B.total * b.p) / 100)}</b></li>)}</ul>
          <p className="sn-muted" style={{ fontSize: ".78rem", margin: ".8rem 0 0" }}>Total sample budget {inr(B.total)} — illustrative numbers, not a forecast.</p>
        </section>
      </div>

      <section className="sn-card sn-card--glow sn-pad"><H>7 · Final marketing plan</H>
        <p style={{ margin: 0 }}>Position the agency as a <b>results partner</b>, publish one helpful video each week, run three focused ad angles, route enquiries through chat and a booking form, and review leads versus cost weekly. Start with the 4-week calendar above and adjust the budget split once real data arrives.</p>
      </section>
    </div>
  );
}
