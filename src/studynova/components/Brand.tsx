import { getMedia } from "../data/media";

/** StudyNova logo: uses images/logo.* if provided, otherwise a built-in vector mark. */
export function NovaMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <linearGradient id="snm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset=".55" stopColor="#3b82f6" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="#0b1230" stroke="url(#snm)" strokeWidth="1.5" />
      <path d="M20 7l3.2 8.4L32 18.6l-8.8 3.2L20 33l-3.2-11.2L8 18.6l8.8-3.2z" fill="url(#snm)" />
      <circle cx="30.5" cy="9.5" r="2" fill="#22d3ee" />
    </svg>
  );
}

export default function Brand({ size = 34, showTag = false }: { size?: number; showTag?: boolean }) {
  const logo = getMedia("logo");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: ".6rem" }}>
      {logo ? <img src={logo} alt="" style={{ height: size, width: "auto" }} /> : <NovaMark size={size} />}
      <span style={{ display: "grid", lineHeight: 1.1 }}>
        <b style={{ fontSize: size * 0.5, letterSpacing: "-.01em" }}>StudyNova <span className="sn-grad">AI</span></b>
        {showTag && <span className="sn-muted" style={{ fontSize: size * 0.3 }}>One AI. Your Entire World.</span>}
      </span>
    </span>
  );
}
