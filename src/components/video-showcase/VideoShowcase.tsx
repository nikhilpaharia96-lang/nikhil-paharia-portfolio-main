import { useState } from "react";
import type { Project } from "@/types/video";
import { featuredVideo, projects } from "@/constants/videoShowcase";
import BackgroundGlow from "./BackgroundGlow";
import ShowcaseIntro from "./ShowcaseIntro";
import FeaturedVideoCard from "./FeaturedVideoCard";
import ProjectCarousel from "./ProjectCarousel";
import VideoLightbox from "./VideoLightbox";

export default function VideoShowcase() {
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  const handlePlayProject = (project: Project) => {
    if (project.videoUrl) setActiveVideo({ url: project.videoUrl, title: project.title });
  };

  return (
    <section
      id="videos"
      className="relative overflow-hidden section-wrap max-w-full pt-20 sm:pt-28 md:pt-36 lg:pt-40 pb-8 sm:pb-10"
      aria-label="Cinematic Reels — My Cinematic Work"
    >
      <BackgroundGlow />

      <div className="container-tight relative z-10 max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-5">
            <ShowcaseIntro
              onWatchShowreel={() =>
                featuredVideo.videoUrl && setActiveVideo({ url: featuredVideo.videoUrl, title: featuredVideo.title })
              }
            />
          </div>
          <div className="lg:col-span-7">
            <FeaturedVideoCard />
          </div>
        </div>

        <div className="mt-10 sm:mt-12">
          <ProjectCarousel items={projects} onPlay={handlePlayProject} paused={!!activeVideo} />
        </div>
      </div>

      <VideoLightbox
        url={activeVideo?.url ?? null}
        title={activeVideo?.title}
        onClose={() => setActiveVideo(null)}
      />
    </section>
  );
}
