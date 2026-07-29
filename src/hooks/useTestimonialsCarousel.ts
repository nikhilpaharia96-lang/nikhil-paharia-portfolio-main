import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "framer-motion";
import { loopedDistance } from "@/utils/carousel";

const AUTOPLAY_INTERVAL_MS = 5200;

export function useTestimonialsCarousel(slideCount: number) {
  const prefersReducedMotion = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: 28,
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  // Autoplay — pauses on hover, keyboard focus, reduced-motion preference,
  // and whenever the tab isn't visible, so it never fights a screen reader
  // or burns CPU on a backgrounded tab.
  useEffect(() => {
    if (!emblaApi || prefersReducedMotion) return;

    let id: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (id) clearInterval(id);
      id = null;
    };

    const start = () => {
      stop();
      if (isPaused || isFocused || document.hidden) return;
      id = setInterval(() => emblaApi.scrollNext(), AUTOPLAY_INTERVAL_MS);
    };

    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", start);
    };
  }, [emblaApi, isPaused, isFocused, prefersReducedMotion]);

  // Arrow-key navigation while the carousel region has focus.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  const getDistance = useCallback(
    (index: number) => loopedDistance(index, selectedIndex, slideCount),
    [selectedIndex, slideCount],
  );

  return {
    emblaRef,
    rootRef,
    selectedIndex,
    scrollPrev,
    scrollNext,
    scrollTo,
    getDistance,
    onKeyDown,
    onMouseEnter: () => setIsPaused(true),
    onMouseLeave: () => setIsPaused(false),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    prefersReducedMotion: !!prefersReducedMotion,
  };
}
