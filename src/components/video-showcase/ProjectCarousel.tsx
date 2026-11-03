import { projects as allProjects } from "@/constants/videoShowcase";
import { useProjectCarousel } from "@/hooks/useProjectCarousel";
import type { Project } from "@/types/video";
import ProjectCard from "./ProjectCard";
import CarouselControls from "./CarouselControls";
import Pagination from "./Pagination";

type ProjectCarouselProps = {
  items?: Project[];
  onPlay?: (project: Project) => void;
  /** Pause autoplay (e.g. while the video lightbox is open). */
  paused?: boolean;
};

export default function ProjectCarousel({ items, onPlay, paused }: ProjectCarouselProps) {
  const projects = items ?? allProjects;
  const {
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
  } = useProjectCarousel(projects.length, { autoplayMs: 3000, paused });

  return (
    <div
      className="relative mt-8 sm:mt-10"
      role="region"
      aria-roledescription="carousel"
      aria-label="Project reel"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="overflow-hidden py-8 -my-2 [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]"
        ref={emblaRef}
      >
        <div className="flex gap-5 sm:gap-6 -ml-5 sm:-ml-6">
          {projects.map((project, index) => {
            const distance = getDistance(index);
            const isActive = distance === 0;
            return (
              <div
                key={project.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${projects.length}: ${project.title}`}
                className="pl-5 sm:pl-6"
              >
                <ProjectCard
                  project={project}
                  variant={isActive ? "active" : "side"}
                  distance={distance}
                  index={index}
                  onSelect={() => scrollTo(index)}
                  onPlay={onPlay}
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Showing project {selectedIndex + 1} of {projects.length}: {projects[selectedIndex]?.title}
      </p>

      <div className="flex items-center justify-between mt-2">
        <Pagination count={projects.length} selectedIndex={selectedIndex} onSelect={scrollTo} />
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="hidden md:block text-sm font-mono tabular-nums text-slate-600">
            {String(selectedIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
          <CarouselControls onPrev={scrollPrev} onNext={scrollNext} canScrollPrev={canScrollPrev} canScrollNext={canScrollNext} />
        </div>
      </div>
    </div>
  );
}
