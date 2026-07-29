import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

export default function StarRating({ size = "sm" }: { size?: "sm" | "lg" }) {
  const prefersReducedMotion = useReducedMotion();
  const dim = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";

  return (
    <div className="flex gap-1" aria-label="Rated 5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={prefersReducedMotion ? undefined : { scale: 0, opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.06, duration: 0.35, ease: "backOut" }}
        >
          <Star className={`${dim} text-amber-400 fill-amber-400`} aria-hidden="true" />
        </motion.div>
      ))}
    </div>
  );
}
