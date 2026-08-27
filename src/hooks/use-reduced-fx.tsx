import * as React from "react";

/**
 * Detects contexts where heavy ambient effects (large blurred blobs, infinite
 * pulse/float animations, particle fields) should be scaled back:
 *  - the user has `prefers-reduced-motion: reduce`
 *  - the viewport is small (phones) — GPU/compositing budget is tighter, and
 *    large blur radii are proportionally more expensive on lower-end panels
 *  - the device reports few logical cores or low memory (best-effort signal
 *    for low-end Android hardware; not available in every browser)
 *
 * Returns `true` when Claude should render the cheaper/simplified variant of
 * an ambient effect.
 */
export function useReducedFx() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(max-width: 767px)");

    const nav = navigator as Navigator & {
      deviceMemory?: number;
      hardwareConcurrency?: number;
    };
    const lowEndHardware =
      (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) ||
      (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4);

    const evaluate = () => {
      setReduced(motionQuery.matches || widthQuery.matches || lowEndHardware);
    };

    evaluate();
    motionQuery.addEventListener("change", evaluate);
    widthQuery.addEventListener("change", evaluate);
    return () => {
      motionQuery.removeEventListener("change", evaluate);
      widthQuery.removeEventListener("change", evaluate);
    };
  }, []);

  return reduced;
}
