import "./marquee.css";

const Chevrons = () => (
  <svg className="marquee-chevrons" viewBox="0 0 66 44" fill="none" aria-hidden="true">
    {[0, 18, 36].map((x) => (
      <path
        key={x}
        d={`M${x + 2} 2 L${x + 20} 22 L${x + 2} 42 L${x + 12} 42 L${x + 30} 22 L${x + 12} 2 Z`}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    ))}
  </svg>
);

const Star = () => (
  <svg className="marquee-star" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill="currentColor" />
  </svg>
);

const Dot = () => <span className="marquee-dot" aria-hidden="true" />;

export default function Marquee() {
  // Each group is repeated so it is wider than a 4K screen; the track holds two groups for a seamless loop.
  const reps = Array.from({ length: 3 });

  const topGroup = (
    <span className="marquee-group marquee-group--top">
      {reps.map((_, i) => (
        <span key={i} className="marquee-item">
          <Chevrons />
          <span>DIGITAL CREATOR</span>
          <Star />
          <span>ASSAM, INDIA</span>
          <Star />
        </span>
      ))}
    </span>
  );

  const bottomGroup = (
    <span className="marquee-group marquee-group--bottom">
      {reps.map((_, i) => (
        <span key={i} className="marquee-item">
          <span>FULL-STACK DEVELOPER</span>
          <Dot />
          <span>VIDEO EDITING</span>
          <Dot />
          <span>DIGITAL MARKETING</span>
          <Dot />
          <span>FREELANCER</span>
          <Dot />
          <span>STORYTELLER</span>
          <Dot />
        </span>
      ))}
    </span>
  );

  return (
    <div className="marquee-section section-wrap" role="marquee" aria-label="Digital Creator, Assam India. Full-stack developer, video editing, digital marketing, freelancer, storyteller.">
      {/* Black band (tilted) — moves RIGHT */}
      <div className="marquee-band marquee-band--black">
        <div className="marquee-row">
          <div className="marquee-track marquee-track--right">
            {topGroup}
            <span aria-hidden="true">{topGroup}</span>
          </div>
        </div>
      </div>

      {/* Coral band — moves LEFT */}
      <div className="marquee-band marquee-band--coral">
        <div className="marquee-row">
          <div className="marquee-track">
            {bottomGroup}
            <span aria-hidden="true">{bottomGroup}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
