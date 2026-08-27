import { motion } from "framer-motion";
import { pillSpring } from "@/animations/videoShowcase.motion";

type PaginationProps = {
  count: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export default function Pagination({ count, selectedIndex, onSelect }: PaginationProps) {
  return (
    <div className="flex gap-2" role="tablist" aria-label="Select project">
      {Array.from({ length: count }).map((_, i) => {
        const active = i === selectedIndex;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`Go to project ${i + 1} of ${count}`}
            onClick={() => onSelect(i)}
            className="interactive py-2 focus-visible:outline-none"
          >
            <motion.span
              animate={{ width: active ? 24 : 8, backgroundColor: active ? "#1d6feb" : "#cbd5e1" }}
              transition={pillSpring}
              className="block rounded-full h-2 focus-visible:ring-2 focus-visible:ring-primary/50"
            />
          </button>
        );
      })}
    </div>
  );
}
