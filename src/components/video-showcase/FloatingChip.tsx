import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type FloatingChipProps = {
  icon: LucideIcon;
  className: string;
  delay?: number;
  duration?: number;
};

export default function FloatingChip({ icon: Icon, className, delay = 0, duration = 6 }: FloatingChipProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={`absolute hidden md:flex items-center justify-center w-12 h-12 rounded-2xl
                  bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-8px_rgba(15,45,90,0.3)] ${className}`}
      animate={prefersReducedMotion ? undefined : { y: [0, -14, 0], rotate: [0, -4, 0] }}
      transition={prefersReducedMotion ? undefined : { duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon className="w-5 h-5 text-primary/70" />
    </motion.div>
  );
}
