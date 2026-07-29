import { motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";

type QuoteIconProps = {
  size?: number;
  color?: string;
  opacity?: number;
  float?: boolean;
  className?: string;
};

/** A gently bobbing quote glyph. Floating stops entirely for reduced-motion users. */
export default function QuoteIcon({
  size = 32,
  color = "currentColor",
  opacity = 0.18,
  float = true,
  className = "",
}: QuoteIconProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldFloat = float && !prefersReducedMotion;

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      animate={shouldFloat ? { y: [0, -8, 0] } : undefined}
      transition={shouldFloat ? { duration: 5, repeat: Infinity, ease: "easeInOut" } : undefined}
      style={{ opacity }}
    >
      <Quote style={{ width: size, height: size, color }} fill={color} />
    </motion.div>
  );
}
