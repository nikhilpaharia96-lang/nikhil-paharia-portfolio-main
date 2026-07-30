import { projects } from "@/constants/videoShowcase";
import { useProjectCarousel } from "@/hooks/useProjectCarousel";
import ProjectCard from "./ProjectCard";
import CarouselControls from "./CarouselControls";
import Pagination from "./Pagination";

export default function ProjectCarousel() {
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
  } = useProjectCarousel(projects.length);

  return (
    <div
      className="relative mt-8 sm:mt-10"
      role="region"
      aria-roledescription="carousel"
      aria-label="Project reel"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 sm:gap-6 pb-4 -ml-5 sm:-ml-6">
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
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Showing project {selectedIndex + 1} of {projects.length}: {projects[selectedIndex]?.title}
      </p>

      <div className="flex items-center justify-between mt-6">
        <Pagination count={projects.length} selectedIndex={selectedIndex} onSelect={scrollTo} />
        <CarouselControls onPrev={scrollPrev} onNext={scrollNext} canScrollPrev={canScrollPrev} canScrollNext={canScrollNext} />
      </div>
    </div>
  );
}
