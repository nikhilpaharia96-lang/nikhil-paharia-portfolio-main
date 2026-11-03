/**
 * Static wrapper. The source design wrapped controls in a pointer-following
 * "magnetic" element; this keeps the identical inline-block box with no motion.
 */
export default function Magnetic({
  children,
}: {
  children: React.ReactElement;
  range?: number;
  strength?: number;
  scaleHover?: number;
  scaleTap?: number;
}) {
  return <div className="inline-block">{children}</div>;
}
