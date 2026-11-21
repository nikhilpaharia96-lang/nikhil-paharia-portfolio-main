import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/** "100%" → counts 0→100 and keeps the "%" ; "10+" → 0→10 and keeps the "+". */
export default function CountUp({ value, duration = 1.6 }: { value: string; duration?: number }) {
  const m = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = m ? parseFloat(m[1]) : 0;
  const suffix = m ? m[2] : "";
  const rm = !!useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(rm ? target : 0);

  const numeric = !!m;
  useEffect(() => {
    if (!numeric) return;
    if (rm) { setN(target); return; }
    if (!inView) return;
    const c = animate(0, target, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, rm, target, duration, numeric]);

  if (!m) return <span>{value}</span>;
  return <span ref={ref} aria-label={value}>{n}{suffix}</span>;
}
