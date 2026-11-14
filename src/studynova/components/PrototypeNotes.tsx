const ROWS: [string, string, string][] = [
  ["Nova Brain workflow (5 steps)", "Scripted animation with local sample data", "Real AI understanding / planning"],
  ["Learn, Business, Creator, Life, Builder results", "Pre-written sample content", "Live AI-generated content"],
  ["Voice button", "Browser speech-to-text if supported, else simulated", "Custom voice assistant"],
  ["File upload", "File names shown only — nothing is uploaded", "File analysis"],
  ["WhatsApp chat + architecture", "Visual simulation", "WhatsApp Business API, webhooks, backend"],
  ["Wearable companion", "Concept + privacy-control mock", "Hardware or recording"],
  ["Presentation mode", "Fully working (real UI)", "—"],
];
export default function PrototypeNotes() {
  return (
    <div className="sn-card sn-pad sn-scroll" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem", minWidth: "32rem" }}>
        <thead><tr className="sn-muted" style={{ textAlign: "left" }}><th style={{ padding: ".4rem" }}>Feature</th><th>Implemented now</th><th>Not implemented (future)</th></tr></thead>
        <tbody>{ROWS.map((r) => <tr key={r[0]} style={{ borderTop: "1px solid var(--sn-line, rgba(255,255,255,.1))" }}>{r.map((c, i) => <td key={i} style={{ padding: ".5rem .4rem", verticalAlign: "top" }}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
