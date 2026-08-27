import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { magneticSpring } from "@/animations/videoShowcase.motion";

function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, magneticSpring);
  const springY = useSpring(y, magneticSpring);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={reset} style={{ x: springX, y: springY }} className={className}>
      {children}
    </motion.div>
  );
}

type CarouselControlsProps = {
  onPrev: () => void;
  onNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

export default function CarouselControls({ onPrev, onNext, canScrollPrev, canScrollNext }: CarouselControlsProps) {
  return (
    <div className="hidden md:flex items-center gap-3 justify-end mt-6">
      <Magnetic strength={0.4}>
        <button
          type="button"
          aria-label="Previous project"
          onClick={onPrev}
          disabled={!canScrollPrev}
          className="interactive w-12 h-12 rounded-full bg-white/55 backdrop-blur-xl border border-white/70 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/40 shadow-[0_10px_28px_-12px_rgba(15,45,90,0.3)] transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-600 disabled:hover:border-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
      </Magnetic>
      <Magnetic strength={0.4}>
        <button
          type="button"
          aria-label="Next project"
          onClick={onNext}
          disabled={!canScrollNext}
          className="interactive w-12 h-12 rounded-full bg-white/55 backdrop-blur-xl border border-white/70 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary/40 shadow-[0_10px_28px_-12px_rgba(15,45,90,0.3)] transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-600 disabled:hover:border-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </Magnetic>
    </div>
  );
}
