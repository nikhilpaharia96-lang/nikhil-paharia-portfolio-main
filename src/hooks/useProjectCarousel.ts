import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { plainDistance } from "@/utils/carousel";

type CarouselOptions = {
  /** Auto-advance interval in ms. 0 disables autoplay. */
  autoplayMs?: number;
  /** External pause (e.g. while a video lightbox is open). */
  paused?: boolean;
};

export function useProjectCarousel(slideCount: number, { autoplayMs = 3000, paused = false }: CarouselOptions = {}) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      duration: 30, // smooth slide so autoplay feels fluid
      containScroll: "trimSnaps",
    },
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [inView, setInView] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
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

  // Pause autoplay while the user is dragging / touching the track.
  useEffect(() => {
    if (!emblaApi) return;
    const down = () => setDragging(true);
    const up = () => setDragging(false);
    emblaApi.on("pointerDown", down);
    emblaApi.on("pointerUp", up);
    return () => {
      emblaApi.off("pointerDown", down);
      emblaApi.off("pointerUp", up);
    };
  }, [emblaApi]);

  // Only auto-advance while the carousel is actually on screen.
  useEffect(() => {
    if (!emblaApi || typeof IntersectionObserver === "undefined") return;
    const node = emblaApi.rootNode();
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    io.observe(node);
    return () => io.disconnect();
  }, [emblaApi]);

  // Autoplay: move to the next slide every `autoplayMs`. Restarts after any
  // manual change (selectedIndex dep), and respects reduced-motion.
  useEffect(() => {
    if (!emblaApi || autoplayMs <= 0 || slideCount < 2) return;
    if (paused || hovered || dragging || !inView) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden) emblaApi.scrollNext();
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [emblaApi, autoplayMs, slideCount, paused, hovered, dragging, inView, selectedIndex]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

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
    (index: number) => plainDistance(index, selectedIndex),
    [selectedIndex],
  );

  return {
    emblaRef,
    selectedIndex,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
    getDistance,
    onKeyDown,
    setHovered,
    slideCount,
  };
}
