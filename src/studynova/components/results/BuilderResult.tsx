import { BUILDER as B } from "../../data/content";

export default function BuilderResult() {
  return (
    <div className="sn-pop" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))" }}>
      <section className="sn-card sn-pad"><p className="sn-eyebrow">Sitemap</p>
        <ul style={{ margin: ".6rem 0 0", paddingLeft: "1.1rem", display: "grid", gap: ".3rem" }}>{B.sitemap.map((s) => <li key={s}>{s}</li>)}</ul>
        <p className="sn-muted" style={{ fontSize: ".78rem", margin: ".8rem 0 0" }}>{B.note}</p>
        <p className="sn-eyebrow" style={{ marginTop: "1.2rem" }}>Suggested tech plan</p>
        <dl style={{ margin: ".5rem 0 0", display: "grid", gap: ".4rem" }}>{B.stack.map((s) => <div key={s.k} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}><dt className="sn-muted">{s.k}</dt><dd style={{ margin: 0, textAlign: "right" }}>{s.v}</dd></div>)}</dl>
      </section>
      <section className="sn-card sn-pad"><p className="sn-eyebrow">Wireframe (mock)</p>
        <div style={{ marginTop: ".7rem", border: "1px solid var(--sn-line2)", borderRadius: ".8rem", overflow: "hidden", background: "#0a1130" }} role="img" aria-label="Website wireframe">
          <div style={{ display: "flex", gap: ".3rem", padding: ".5rem .7rem", background: "#101a44" }}>{["#fb7185", "#fbbf24", "#34d399"].map((c) => <i key={c} style={{ width: ".55rem", height: ".55rem", borderRadius: "50%", background: c }} />)}</div>
          <div style={{ padding: ".8rem", display: "grid", gap: ".6rem" }}>
            <div style={{ height: "1.4rem", borderRadius: ".4rem", background: "var(--sn-surface2)" }} />
            <div style={{ height: "5rem", borderRadius: ".6rem", background: "linear-gradient(135deg, rgba(37,99,235,.5), rgba(124,58,237,.5))", display: "grid", placeItems: "center", fontSize: ".8rem" }}>Hero + call to action</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: ".5rem" }}>{[1, 2, 3].map((n) => <div key={n} style={{ height: "3rem", borderRadius: ".5rem", background: "var(--sn-surface2)", display: "grid", placeItems: "center", fontSize: ".7rem" }} className="sn-muted">Service {n}</div>)}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: ".4rem" }}>{[1, 2, 3, 4].map((n) => <div key={n} style={{ height: "2.4rem", borderRadius: ".4rem", background: "var(--sn-surface2)" }} />)}</div>
            <div style={{ height: "1.8rem", borderRadius: ".4rem", border: "1px dashed var(--sn-line2)", display: "grid", placeItems: "center", fontSize: ".7rem" }} className="sn-muted">Contact form</div>
          </div>
        </div>
        <ul style={{ margin: ".8rem 0 0", paddingLeft: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: ".4rem" }}>{B.blocks.map((b) => <li key={b} className="sn-chip" style={{ fontSize: ".72rem" }}>{b}</li>)}</ul>
      </section>
    </div>
  );
}
