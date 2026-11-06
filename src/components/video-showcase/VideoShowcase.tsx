import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/types/video";
import { featuredVideo, reelProjects } from "@/constants/videoShowcase";
import BackgroundGlow from "./BackgroundGlow";
import ShowcaseIntro from "./ShowcaseIntro";
import FeaturedVideoCard from "./FeaturedVideoCard";
import ProjectCarousel from "./ProjectCarousel";
import VideoLightbox from "./VideoLightbox";
import { ease } from "@/animations/videoShowcase.motion";

export default function VideoShowcase() {
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
  const reduce = !!useReducedMotion();

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

        <motion.div
          className="mt-10 sm:mt-12"
          variants={{ hidden: {}, show: {} }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-80px" }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: reduce ? 0 : 40 },
              show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.01 : 0.9, ease } },
            }}
          >
            <ProjectCarousel items={reelProjects} onPlay={handlePlayProject} paused={!!activeVideo} />
          </motion.div>
        </motion.div>
      </div>

      <VideoLightbox
        url={activeVideo?.url ?? null}
        title={activeVideo?.title}
        onClose={() => setActiveVideo(null)}
      />
    </section>
  );
}
