import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Paperclip, Send, X } from "lucide-react";
import { EXAMPLE_PROMPTS } from "../data/demos";

type SR = { new (): { lang: string; interimResults: boolean; onresult: (e: any) => void; onend: () => void; onerror: () => void; start: () => void; stop: () => void } };
const getSR = (): SR | null => (typeof window === "undefined" ? null : ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null));

export default function CommandBox({ onSubmit, busy, value, setValue }: { onSubmit: (p: string) => void; busy: boolean; value: string; setValue: (v: string) => void }) {
  const [files, setFiles] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<ReturnType<NonNullable<SR>["prototype"]["constructor"]> | null>(null as any);
  const timer = useRef<number>();
  useEffect(() => () => { clearTimeout(timer.current); (recRef.current as any)?.stop?.(); }, []);

  const submit = () => { const v = value.trim(); if (v && !busy) onSubmit(v); };

  const voice = () => {
    if (listening) { (recRef.current as any)?.stop?.(); clearTimeout(timer.current); setListening(false); return; }
    const SRc = getSR();
    setListening(true);
    if (SRc) {
      setVoiceNote("Listening… (browser speech recognition)");
      try {
        const r = new SRc(); r.lang = "en-IN"; r.interimResults = false;
        r.onresult = (e: any) => { setValue(e.results[0][0].transcript); setVoiceNote("Voice captured — press Send."); };
        r.onend = () => setListening(false); r.onerror = () => { setListening(false); setVoiceNote("Voice input unavailable — please type your request."); };
        recRef.current = r as any; r.start(); return;
      } catch { /* fall through to simulation */ }
    }
    setVoiceNote("Simulated voice input (this browser has no speech API)…");
    timer.current = window.setTimeout(() => { setValue(EXAMPLE_PROMPTS[0].text); setListening(false); setVoiceNote("Simulated: sample voice command inserted."); }, 1800);
  };

  return (
    <div className="sn-card sn-card--glow" style={{ padding: "1rem", textAlign: "left" }}>
      <label htmlFor="sn-cmd" className="sn-eyebrow" style={{ marginBottom: ".4rem", display: "flex" }}>Nova command</label>
      <textarea id="sn-cmd" className="sn-input" rows={2} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Tell StudyNova what you want to accomplish..."
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} aria-label="Tell StudyNova what you want to accomplish" />
      {files.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", margin: ".4rem 0" }}>{files.map((f) => <span key={f} className="sn-chip" style={{ fontSize: ".75rem" }}>📎 {f}<button aria-label={`Remove ${f}`} onClick={() => setFiles((x) => x.filter((y) => y !== f))} style={{ background: "none", border: 0, padding: 0, display: "inline-flex" }}><X size={12} /></button></span>)}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".5rem", flexWrap: "wrap" }}>
        <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" hidden onChange={(e) => { setFiles(Array.from(e.target.files ?? []).map((f) => f.name).slice(0, 4)); e.target.value = ""; }} />
        <button className="sn-icon-btn" onClick={() => fileRef.current?.click()} aria-label="Attach image or file (demo only)" title="Attach image or file (demo only — not uploaded)"><Paperclip size={17} /></button>
        <button className="sn-icon-btn" onClick={voice} aria-pressed={listening} aria-label={listening ? "Stop voice input" : "Voice input"} title="Voice input" style={listening ? { background: "rgba(251,113,133,.25)", borderColor: "var(--sn-rose)" } : undefined}>{listening ? <MicOff size={17} /> : <Mic size={17} />}</button>
        <span className="sn-muted" style={{ fontSize: ".75rem", flex: 1, minWidth: "8rem" }} aria-live="polite">{voiceNote || (files.length ? "Attachments are for demonstration only — nothing is uploaded." : "")}</span>
        <button className="sn-btn" onClick={submit} disabled={!value.trim() || busy}><Send size={16} /> {busy ? "Running…" : "Send"}</button>
      </div>
    </div>
  );
}
