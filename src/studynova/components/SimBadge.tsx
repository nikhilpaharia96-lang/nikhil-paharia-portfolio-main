import { FlaskConical } from "lucide-react";

/** Honest labelling: everything on this page is a scripted prototype. */
export default function SimBadge({ label = "Prototype simulation", dot = true }: { label?: string; dot?: boolean }) {
  return (
    <span className="sn-sim" title="Scripted demo with local sample data — no real AI model, WhatsApp or server is involved.">
      {dot ? <span className="sn-live-dot" aria-hidden="true" /> : <FlaskConical size={12} aria-hidden="true" />}
      {label}
    </span>
  );
}
