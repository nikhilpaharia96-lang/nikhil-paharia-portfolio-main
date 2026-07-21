import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticProps {
  children: React.ReactElement;
  range?: number;
  strength?: number;
  scaleHover?: number;
  scaleTap?: number;
}

export default function Magnetic({
  children,
  range = 75,
  strength = 0.35,
  scaleHover = 1.03,
  scaleTap = 0.97,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Soft elastic spring settings for luxury feel
  const springX = useSpring(x, { stiffness: 120, damping: 14, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 120, damping: 14, mass: 0.2 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);

    if (distance < range) {
      // Pull element towards mouse based on strength
      x.set(distanceX * strength);
      y.set(distanceY * strength);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: scaleHover }}
      whileTap={{ scale: scaleTap }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
