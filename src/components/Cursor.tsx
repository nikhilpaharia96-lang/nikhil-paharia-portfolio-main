import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Cursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  const [cursorType, setCursorType] = useState<
    "default" | "hover" | "click" | "video" | "project" | "input" | "image"
  >("default");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable custom cursor on touch screens to prevent jank
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);

    if (isTouchDevice) return;

    setIsVisible(true);

    const cursorDot = cursorDotRef.current;
    const cursorRing = cursorRingRef.current;
    const cursorGlow = cursorGlowRef.current;

    if (!cursorDot || !cursorRing || !cursorGlow) return;

    // Position setup
    gsap.set([cursorDot, cursorRing, cursorGlow], {
      xPercent: -50,
      yPercent: -50,
      x: -200,
      y: -200,
    });

    // High performance quickTo functions (runs directly on GPU via transform ticks)
    const xDotTo = gsap.quickTo(cursorDot, "x", { duration: 0.08, ease: "power3.out" });
    const yDotTo = gsap.quickTo(cursorDot, "y", { duration: 0.08, ease: "power3.out" });

    const xRingTo = gsap.quickTo(cursorRing, "x", { duration: 0.3, ease: "power3.out" });
    const yRingTo = gsap.quickTo(cursorRing, "y", { duration: 0.3, ease: "power3.out" });

    const xGlowTo = gsap.quickTo(cursorGlow, "x", { duration: 0.6, ease: "power2.out" });
    const yGlowTo = gsap.quickTo(cursorGlow, "y", { duration: 0.6, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      xDotTo(clientX);
      yDotTo(clientY);
      xRingTo(clientX);
      yRingTo(clientY);
      xGlowTo(clientX);
      yGlowTo(clientY);
    };

    const handleMouseDown = () => {
      setCursorType("click");
    };

    const handleMouseUp = () => {
      setCursorType("default");
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInput =
        target.tagName.toLowerCase() === "input" ||
        target.tagName.toLowerCase() === "textarea" ||
        target.closest("input") ||
        target.closest("textarea");

      const isVideo = target.closest("#videos") || target.classList.contains("video-item");
      const isProjectCard = target.closest("#projects article");
      const isImage = target.tagName.toLowerCase() === "img";
      const isInteractive =
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("interactive");

      if (isInput) {
        setCursorType("input");
      } else if (isVideo) {
        setCursorType("video");
      } else if (isProjectCard) {
        setCursorType("project");
      } else if (isImage) {
        setCursorType("image");
      } else if (isInteractive) {
        setCursorType("hover");
      } else {
        setCursorType("default");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  if (!isVisible) return null;

  const getStyles = () => {
    switch (cursorType) {
      case "click":
        return {
          dotScale: 0.6,
          ringScale: 0.8,
          ringBorder: "border-primary bg-primary/20",
          ringWidth: "w-8 h-8",
          ringContent: "",
        };
      case "hover":
        return {
          dotScale: 1.5,
          ringScale: 1.6,
          ringBorder: "border-primary bg-primary/10",
          ringWidth: "w-12 h-12",
          ringContent: "",
        };
      case "video":
        return {
          dotScale: 0,
          ringScale: 1,
          ringBorder: "border-primary bg-primary/20 backdrop-blur-[1px]",
          ringWidth: "w-16 h-16",
          ringContent: '<span class="text-[9px] font-mono font-bold text-primary tracking-widest uppercase">PLAY</span>',
        };
      case "project":
        return {
          dotScale: 0,
          ringScale: 1,
          ringBorder: "border-blue-600 bg-blue-50/30 backdrop-blur-[1px]",
          ringWidth: "w-16 h-16",
          ringContent: '<span class="text-[9px] font-mono font-bold text-blue-600 tracking-widest uppercase">VIEW</span>',
        };
      case "input":
        return {
          dotScale: 0,
          ringScale: 0.8,
          ringBorder: "border-primary/40 bg-transparent h-6 w-1",
          ringWidth: "w-1 h-6",
          ringContent: "",
        };
      case "image":
        return {
          dotScale: 1.2,
          ringScale: 1.5,
          ringBorder: "border-white bg-white/20",
          ringWidth: "w-12 h-12",
          ringContent: "",
        };
      case "default":
      default:
        return {
          dotScale: 1,
          ringScale: 1,
          ringBorder: "border-primary/50 bg-transparent",
          ringWidth: "w-10 h-10",
          ringContent: "",
        };
    }
  };

  const currentStyles = getStyles();

  return (
    <>
      {/* Inner Dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-primary rounded-full pointer-events-none z-[9999] mix-blend-difference transition-transform duration-200"
        style={{
          transform: `translate3d(0,0,0) scale(${currentStyles.dotScale})`,
          willChange: "transform",
        }}
      />
      {/* Outer Ring */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 rounded-full border pointer-events-none z-[9998] flex items-center justify-center transition-all duration-300 ${currentStyles.ringBorder} ${currentStyles.ringWidth}`}
        style={{
          transform: `translate3d(0,0,0) scale(${currentStyles.ringScale})`,
          willChange: "transform, width, height",
        }}
        dangerouslySetInnerHTML={currentStyles.ringContent ? { __html: currentStyles.ringContent } : undefined}
      />
      {/* Ambient mouse follow light glow (in backgrounds) */}
      <div
        ref={cursorGlowRef}
        className="fixed top-0 left-0 w-[450px] h-[450px] bg-primary/4 rounded-full blur-[100px] pointer-events-none z-[-1]"
        style={{ transform: "translate3d(0,0,0)", willChange: "transform" }}
      />
    </>
  );
}