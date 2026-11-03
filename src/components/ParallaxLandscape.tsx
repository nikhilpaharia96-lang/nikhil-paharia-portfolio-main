import { useEffect, useRef, type CSSProperties } from "react";
import "./parallax-landscape.css";

/**
 * ParallaxLandscape — the hero's tea-garden photo with drifting fog and a pulsing sunlight glow.
 * (Despite the name there is no scroll parallax: the background stays fixed with the page.)
 *
 * The photo is stacked in a few depth layers so the fog can sit *between* them: the same image is
 * repeated and cut out with soft alpha masks (`*-mid / -terrace.webp`, authored in the photo's own
 * coordinates so they line up under the same `cover` + position). Fog hides behind the nearer hills.
 *
 *   far      sky + distant mountains (whole photo)
 *   fog A    valley mist
 *   mid      misty hills + tree line
 *   fog B    mist drifting across the hills (opposite direction)
 *   terrace  tea terraces + foreground
 *   light    warm sun glow + faint rays, slowly swelling and fading
 *
 * Everything animates with transform/opacity only. Paused when off-screen; static for
 * `prefers-reduced-motion`.
 */

export interface LandscapeMasks {
  mid: string;
  terrace: string;
  fogA: string;
  fogB: string;
  light: string;
}

interface Props {
  src: string;
  /** CSS background-position / mask-position, identical for photo and masks. */
  position: string;
  /** Optional CSS filter applied to the photo layers (brightness/saturate tweaks). */
  filter?: string;
  masks: LandscapeMasks;
  className?: string;
}

const style = (vars: Record<string, string | number>) => vars as CSSProperties;

export default function ParallaxLandscape({ src, position, filter, masks, className = "" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Off-screen (or display:none on the other breakpoint) → pause fog/light.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        root.dataset.paused = entry.isIntersecting ? "false" : "true";
      },
      { threshold: 0 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const base = { "--src": `url(${src})`, "--pos": position, "--filter": filter ?? "none" };
  const mask = (url: string) => `url(${url})`;

  return (
    <div
      ref={rootRef}
      className={`px-stage ${className}`}
      aria-hidden="true"
      data-paused="false"
      style={style(base)}
    >
      {/* far: sky + distant mountains */}
      <div className="px-layer px-img" />

      {/* fog A — valley between the far mountains and the misty hills */}
      <div className="px-layer px-masked px-fog" style={style({ "--mask": mask(masks.fogA), "--fog-o": 0.34, "--fog-dur": "110s" })}>
        <div className="px-fog__drift" />
      </div>

      {/* mid: misty hills + tree line */}
      <div className="px-layer px-img px-masked" style={style({ "--mask": mask(masks.mid) })} />

      {/* fog B — drifting across the hills, opposite direction */}
      <div className="px-layer px-masked px-fog px-fog--rev" style={style({ "--mask": mask(masks.fogB), "--fog-o": 0.3, "--fog-dur": "150s" })}>
        <div className="px-fog__drift" />
      </div>

      {/* terraces + foreground plants */}
      <div className="px-layer px-img px-masked" style={style({ "--mask": mask(masks.terrace) })} />


      {/* sunlight: glow + faint rays, tracks the sun in the far layer */}
      <div className="px-layer px-masked px-light" style={style({ "--mask": mask(masks.light) })} />
    </div>
  );
}
