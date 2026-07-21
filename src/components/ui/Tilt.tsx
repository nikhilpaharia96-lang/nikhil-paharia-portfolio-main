import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";

interface TiltProps {
  children: React.ReactNode;
  className?: string;
  maxRotate?: number;
  glowColor?: string;
  glowOpacity?: number;
  glowSize?: number;
}

export default function Tilt({
  children,
  className = "",
  maxRotate = 8,
  glowColor = "#1d6feb",
  glowOpacity = 0.15,
  glowSize = 400,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize mouse positions to range [0, 1]
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  // Fine-tuned spring dynamics for luxury motion feel
  const springConfig = { stiffness: 180, damping: 18, mass: 0.5 };
  const rotateX = useSpring(useTransform(my, [0, 1], [maxRotate, -maxRotate]), springConfig);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-maxRotate, maxRotate]), springConfig);

  // Spotlight coordinates map to percentage coordinates inside the box
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const glowBg = useMotionTemplate`radial-gradient(${glowSize}px circle at ${glowX} ${glowY}, ${glowColor}30, transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Reset back to center
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative ${className} ${isHovered ? "will-change-transform" : ""}`}
    >
      {/* Real-time spotlight layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-15 transition-opacity duration-300 rounded-[inherit] overflow-hidden"
        style={{
          background: glowBg,
          opacity: isHovered ? glowOpacity : 0,
        }}
      />
      {/* Content wrapper with depth projection */}
      <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
