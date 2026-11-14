import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack } from "lucide-react";
import { CREATOR as C } from "../../data/content";
import MediaSlot, { StoryboardPreview } from "../MediaSlot";

const H = ({ children }: { children: React.ReactNode }) => <p className="sn-eyebrow" style={{ marginBottom: ".6rem" }}>{children}</p>;
const mmss = (s: number) => `0:${String(Math.floor(s)).padStart(2, "0")}`;

export default function CreatorResult() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((x) => { if (x >= C.duration) { setPlaying(false); return C.duration; } return Math.min(C.duration, x + 0.1); }), 100);
    return () => clearInterval(id);
  }, [playing]);

  const scene = C.scenes.find((s) => t >= s.from && t < s.to) ?? C.scenes[C.scenes.length - 1];
  const sub = C.tracks[3].clips.findIndex(([a, b]) => t >= a && t <= b);
  const pct = (t / C.duration) * 100;

  return (
    <div className="sn-pop" style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))" }}>
        <section className="sn-card sn-pad"><H>1 · Script & scene plan</H>
          <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".55rem" }}>
            {C.scenes.map((s, i) => (
              <li key={i}><button onClick={() => { setT(s.from + 0.01); setPlaying(false); }} style={{ width: "100%", textAlign: "left", display: "flex", gap: ".7rem", background: scene === s ? "rgba(59,130,246,.15)" : "transparent", border: `1px solid ${scene === s ? "var(--sn-line2)" : "var(--sn-line)"}`, borderRadius: ".8rem", padding: ".55rem .7rem" }}>
                <i style={{ width: ".3rem", borderRadius: "3px", background: s.color, flex: "none" }} />
                <span><b>{i + 1}. {s.title}</b> <span className="sn-muted" style={{ fontSize: ".78rem" }}>{mmss(s.from)}–{mmss(s.to)}</span><br /><span>“{s.line}”</span><br /><span className="sn-muted" style={{ fontSize: ".8rem" }}>Shot: {s.shot}</span></span>
              </button></li>
            ))}
          </ol>
        </section>
        <section className="sn-card sn-pad"><H>2 · Voiceover plan</H>
          <dl style={{ margin: 0, display: "grid", gap: ".5rem" }}>{Object.entries({ Tone: C.voice.tone, Pace: C.voice.pace, Language: C.voice.language, Music: C.voice.music }).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", borderBottom: "1px solid var(--sn-line)", paddingBottom: ".4rem" }}><dt className="sn-muted">{k}</dt><dd style={{ margin: 0, textAlign: "right" }}>{v}</dd></div>)}</dl>
          <H><span style={{ display: "block", marginTop: "1rem" }}>3 · Subtitles (auto-timed, sample)</span></H>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: ".3rem", fontSize: ".85rem" }}>
            {C.scenes.map((s, i) => <li key={i} style={{ display: "flex", gap: ".6rem", opacity: sub === i ? 1 : .55 }}><span className="sn-muted" style={{ fontVariantNumeric: "tabular-nums" }}>{mmss(C.tracks[3].clips[i][0])}</span>{s.line}</li>)}
          </ul>
        </section>
      </div>

      {/* Mock video editor */}
      <section className="sn-card sn-card--glow sn-pad" aria-label="Mock video editor">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem", marginBottom: ".8rem" }}>
          <H>4 · Video timeline (mock editor)</H><span className="sn-sim">Mock editor · no real rendering</span>
        </div>
        <div style={{ position: "relative", aspectRatio: "16 / 9", maxHeight: "22rem", width: "100%", borderRadius: ".9rem", overflow: "hidden", border: "1px solid var(--sn-line2)", background: `radial-gradient(500px 260px at 30% 20%, ${scene.color}55, transparent 65%), linear-gradient(135deg, #0b1230, #141c4a)`, transition: "background .5s" }}>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", padding: "1rem" }}>
            <div><p className="sn-eyebrow" style={{ justifyContent: "center" }}>Scene · {scene.title}</p><p style={{ fontSize: "clamp(1.1rem, 3vw, 1.8rem)", fontWeight: 700, margin: ".3rem 0" }}>{scene.title === "Meet StudyNova" || scene.title === "Call to action" ? <span className="sn-grad">StudyNova AI</span> : scene.shot}</p></div>
          </div>
          {sub >= 0 && <p style={{ position: "absolute", left: "5%", right: "5%", bottom: "6%", margin: 0, textAlign: "center", fontWeight: 600, background: "rgba(0,0,0,.6)", padding: ".3rem .7rem", borderRadius: ".5rem", fontSize: "clamp(.8rem, 2vw, 1.05rem)" }}>{C.scenes[sub].line}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem", margin: ".8rem 0" }}>
          <button className="sn-icon-btn" onClick={() => { setT(0); setPlaying(false); }} aria-label="Back to start"><SkipBack size={16} /></button>
          <button className="sn-btn sn-btn--sm" onClick={() => { if (t >= C.duration) setT(0); setPlaying((p) => !p); }}>{playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play preview</>}</button>
          <input aria-label="Timeline position" type="range" min={0} max={C.duration} step={0.1} value={t} onChange={(e) => { setT(+e.target.value); setPlaying(false); }} style={{ flex: 1, accentColor: "#3b82f6" }} />
          <span className="sn-muted" style={{ fontVariantNumeric: "tabular-nums", fontSize: ".85rem" }}>{mmss(t)} / {mmss(C.duration)}</span>
        </div>
        <div style={{ position: "relative", border: "1px solid var(--sn-line)", borderRadius: ".8rem", padding: ".6rem .6rem .6rem 5.2rem", background: "rgba(5,9,20,.5)", overflowX: "auto" }} className="sn-scroll">
          <div style={{ position: "relative", minWidth: "28rem" }}>
            {C.tracks.map((tr) => (
              <div key={tr.name} style={{ position: "relative", height: "1.5rem", marginBottom: ".35rem" }}>
                <span className="sn-muted" style={{ position: "absolute", left: "-4.7rem", top: 0, width: "4.4rem", fontSize: ".72rem", lineHeight: "1.5rem" }}>{tr.name}</span>
                {tr.clips.map(([a, b], i) => <i key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${(a / C.duration) * 100}%`, width: `${((b - a) / C.duration) * 100}%`, background: tr.color, opacity: .85, borderRadius: ".35rem", border: "1px solid rgba(255,255,255,.25)" }} />)}
              </div>
            ))}
            <i aria-hidden="true" style={{ position: "absolute", top: "-.3rem", bottom: 0, left: `${pct}%`, width: "2px", background: "#fff", boxShadow: "0 0 8px #fff" }} />
          </div>
        </div>
        <button className="sn-btn sn-btn--ghost sn-btn--sm" style={{ marginTop: ".7rem" }} onClick={() => { setT(0); setPlaying(true); }}><RotateCcw size={13} /> Replay</button>
      </section>

      <section className="sn-card sn-pad"><H>5 · Final video preview</H>
        <MediaSlot slot="creator-promo" kind="video" label="Promotional video" hint="Final video preview — placeholder" fallback={<StoryboardPreview title="StudyNova AI — promo (30 s)" caption="Final render preview (concept)" accent="#f472b6" />} />
      </section>
    </div>
  );
}
