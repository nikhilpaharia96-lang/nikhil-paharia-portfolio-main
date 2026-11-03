/**
 * Static, zero-animation stand-in for the small slice of the framer-motion API
 * the portable UI components use.
 *
 * The site must have NO animation. Instead of rewriting ~600 call sites, every
 * `motion.*` element renders as the plain DOM element and is painted directly in
 * its FINAL state: the values from `animate` (or `whileInView`, or the resolved
 * variant label) are applied as ordinary inline styles. `initial`, `exit`,
 * `transition`, `whileHover`, `whileTap`, drag, layout etc. are discarded, so
 * nothing ever interpolates, springs, reveals, tilts or follows the pointer.
 *
 * Motion values are inert: they hold a number, can be read and written, but never
 * drive a render loop. Scroll-linked hooks report "scrolled 0" and
 * `useReducedMotion` reports true so component code takes its static branch.
 */
import * as React from "react";

/* ───────────────────────── motion values (inert) ───────────────────────── */

export class MotionValue<T = any> {
  private v: T;
  constructor(v: T) {
    this.v = v;
  }
  get() {
    return this.v;
  }
  set(v: T) {
    this.v = v;
  }
  getPrevious() {
    return this.v;
  }
  on() {
    return () => {};
  }
  onChange() {
    return () => {};
  }
  stop() {}
  jump(v: T) {
    this.v = v;
  }
}

const isMV = (x: any): x is MotionValue => x instanceof MotionValue;

export function useMotionValue<T>(initial: T) {
  const ref = React.useRef<MotionValue<T>>();
  if (!ref.current) ref.current = new MotionValue(initial);
  return ref.current;
}

/** No spring physics: just the source value, read once. */
export function useSpring<T>(source: MotionValue<T> | T, _cfg?: unknown) {
  const initial = isMV(source) ? source.get() : source;
  return useMotionValue<T>(initial as T);
}

function interpolate(v: number, input: number[], output: any[]) {
  if (typeof output[0] !== "number") return output[0];
  if (v <= input[0]) return output[0];
  if (v >= input[input.length - 1]) return output[output.length - 1];
  for (let i = 0; i < input.length - 1; i++) {
    if (v >= input[i] && v <= input[i + 1]) {
      const t = (v - input[i]) / (input[i + 1] - input[i] || 1);
      return output[i] + (output[i + 1] - output[i]) * t;
    }
  }
  return output[0];
}

export function useTransform(source: any, inputOrFn?: any, output?: any[]) {
  const sources = Array.isArray(source) ? source : [source];
  const vals = sources.map((s: any) => (isMV(s) ? s.get() : s));
  let result: any;
  if (typeof inputOrFn === "function") {
    result = Array.isArray(source) ? inputOrFn(vals) : inputOrFn(vals[0]);
  } else if (Array.isArray(inputOrFn) && output) {
    result = interpolate(vals[0], inputOrFn, output);
  } else {
    result = vals[0];
  }
  return useMotionValue<any>(result);
}

export function useMotionTemplate(strings: TemplateStringsArray, ...values: any[]) {
  let out = strings[0];
  values.forEach((v, i) => {
    out += (isMV(v) ? v.get() : v) + strings[i + 1];
  });
  return useMotionValue<string>(out);
}

export function useMotionValueEvent(..._args: any[]) {
  /* no scroll/animation subscriptions */
}

export function useScroll(_opts?: unknown) {
  const scrollX = useMotionValue(0);
  const scrollY = useMotionValue(0);
  const scrollXProgress = useMotionValue(0);
  const scrollYProgress = useMotionValue(0);
  return { scrollX, scrollY, scrollXProgress, scrollYProgress };
}

export function useInView(_ref?: unknown, _opts?: unknown) {
  return true;
}

export function useReducedMotion() {
  return true;
}

export type PanInfo = {
  point: { x: number; y: number };
  delta: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
};

/* ───────────────────────── element rendering ───────────────────────── */

const DROP_PROPS = new Set([
  "initial", "animate", "exit", "transition", "variants", "custom", "inherit",
  "whileHover", "whileTap", "whileFocus", "whileInView", "whileDrag",
  "viewport", "layout", "layoutId", "layoutDependency", "layoutScroll",
  "drag", "dragConstraints", "dragElastic", "dragMomentum", "dragSnapToOrigin",
  "dragTransition", "dragControls", "dragListener", "dragDirectionLock",
  "onDrag", "onDragStart", "onDragEnd", "onDirectionLock", "onPan", "onPanStart",
  "onPanEnd", "onTap", "onTapStart", "onTapCancel", "onHoverStart", "onHoverEnd",
  "onViewportEnter", "onViewportLeave", "onAnimationStart", "onAnimationComplete",
  "onUpdate", "onLayoutAnimationComplete", "transformTemplate",
]);

const TRANSFORM_KEYS = new Set([
  "x", "y", "z", "scale", "scaleX", "scaleY", "rotate", "rotateX", "rotateY",
  "rotateZ", "skew", "skewX", "skewY", "originX", "originY", "originZ",
  "transformPerspective",
]);

const UNITLESS = new Set([
  "opacity", "zIndex", "flex", "flexGrow", "flexShrink", "fontWeight", "lineHeight", "order",
]);

const px = (v: any) => (typeof v === "number" ? `${v}px` : v);
const deg = (v: any) => (typeof v === "number" ? `${v}deg` : v);

/** Turn a motion target/style object into a plain React style object. */
function toStyle(src: Record<string, any> | undefined, skipTransformMotionValues = false) {
  const out: Record<string, any> = {};
  if (!src) return out;
  const t: string[] = [];
  for (const [key, raw] of Object.entries(src)) {
    const mv = isMV(raw);
    const val = mv ? raw.get() : raw;
    if (val === undefined || val === null) continue;
    if (TRANSFORM_KEYS.has(key)) {
      if (mv && skipTransformMotionValues) continue;
      switch (key) {
        case "x": t.push(`translateX(${px(val)})`); break;
        case "y": t.push(`translateY(${px(val)})`); break;
        case "z": t.push(`translateZ(${px(val)})`); break;
        case "scale": t.push(`scale(${val})`); break;
        case "scaleX": t.push(`scaleX(${val})`); break;
        case "scaleY": t.push(`scaleY(${val})`); break;
        case "rotate": case "rotateZ": t.push(`rotate(${deg(val)})`); break;
        case "rotateX": t.push(`rotateX(${deg(val)})`); break;
        case "rotateY": t.push(`rotateY(${deg(val)})`); break;
        case "skew": case "skewX": t.push(`skewX(${deg(val)})`); break;
        case "skewY": t.push(`skewY(${deg(val)})`); break;
        default: break; // origins / perspective handled below
      }
      if (key === "originX") out.transformOrigin = `${typeof val === "number" ? val * 100 + "%" : val} ${out.__oy ?? "50%"}`;
      continue;
    }
    if (typeof val === "object") continue; // keyframe arrays etc. — not a static value
    out[key] = val;
  }
  // identity transforms add nothing visually; only emit meaningful ones
  const meaningful = t.filter(
    (s) => !/^(translate[XYZ]\(0(px)?\)|scale[XY]?\(1\)|rotate[XYZ]?\(0(deg)?\)|skew[XY]\(0(deg)?\))$/.test(s),
  );
  if (meaningful.length) out.transform = meaningful.join(" ");
  delete out.__oy;
  return out;
}

const VariantCtx = React.createContext<string | undefined>(undefined);

function resolveFinalTarget(props: any, inherited: string | undefined) {
  const label = typeof props.animate === "string" ? props.animate
    : typeof props.whileInView === "string" ? props.whileInView
    : inherited;
  let target: any;
  if (props.animate && typeof props.animate === "object") target = props.animate;
  else if (props.whileInView && typeof props.whileInView === "object") target = props.whileInView;
  else if (label && props.variants) {
    const v = props.variants[label];
    target = typeof v === "function" ? v(props.custom) : v;
  }
  return { label, target };
}

function makeStatic(tag: string) {
  const Comp = React.forwardRef<any, any>(function StaticMotion(props, ref) {
    const inherited = React.useContext(VariantCtx);
    const { label, target } = resolveFinalTarget(props, inherited);

    const dom: Record<string, any> = {};
    for (const k of Object.keys(props)) {
      if (!DROP_PROPS.has(k) && k !== "style") dom[k] = props[k];
    }

    const base = toStyle(props.style, true);
    const fin = toStyle(target && typeof target === "object"
      ? Object.fromEntries(Object.entries(target).filter(([k]) => k !== "transition" && k !== "transitionEnd"))
      : undefined);
    const style = { ...base, ...fin };
    // Merge any author transform with the final-state transform instead of dropping it
    if (base.transform && fin.transform) style.transform = `${base.transform} ${fin.transform}`;

    const el = React.createElement(tag, { ...dom, ref, style: Object.keys(style).length ? style : undefined });
    const node = React.cloneElement(el, undefined, props.children);
    return label ? <VariantCtx.Provider value={label}>{node}</VariantCtx.Provider> : node;
  });
  Comp.displayName = `static.${tag}`;
  return Comp;
}

const cache = new Map<string, React.ComponentType<any>>();

export const motion: Record<string, React.ForwardRefExoticComponent<any>> = new Proxy(
  {},
  {
    get(_t, tag: string) {
      if (!cache.has(tag)) cache.set(tag, makeStatic(tag));
      return cache.get(tag);
    },
  },
) as any;

export function AnimatePresence({ children }: { children?: React.ReactNode; [k: string]: any }) {
  return <>{children}</>;
}

export function MotionConfig({ children }: { children?: React.ReactNode; [k: string]: any }) {
  return <>{children}</>;
}
