import { useCallback, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/types/video";
import { featuredVideo, reelProjects } from "@/constants/videoShowcase";
import BackgroundGlow from "./BackgroundGlow";
import ShowcaseIntro from "./ShowcaseIntro";
import FeaturedVideoCard from "./FeaturedVideoCard";
import ProjectCarousel from "./ProjectCarousel";
import GradingCompare from "./GradingCompare";
import FeatureStrip from "./FeatureStrip";
import VideoLightbox, { type LightboxItem } from "./VideoLightbox";
import { ease } from "@/animations/videoShowcase.motion";

export default function VideoShowcase() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const reduce = !!useReducedMotion();

  // Playlist for the player: the featured showreel first, then every reel in the carousel.
  const playlist = useMemo<LightboxItem[]>(() => {
    const list: LightboxItem[] = [];
    if (featuredVideo.videoUrl) {
      list.push({
        key: "featured",
        url: featuredVideo.videoUrl,
        title: `${featuredVideo.title} — ${featuredVideo.subtitle}`,
        image: featuredVideo.image,
        category: featuredVideo.category,
      });
    }
    reelProjects.forEach((p) => {
      if (!p.videoUrl) return;
      list.push({
        key: `p-${p.id}`,
        url: p.videoUrl,
        title: p.title,
        image: p.image,
        category: p.category,
        location: p.location,
        client: p.client,
        description: p.description,
      });
    });
    return list;
  }, []);

  const handlePlayProject = (project: Project) => {
    const i = playlist.findIndex((it) => it.key === `p-${project.id}`);
    if (i >= 0) setActiveIdx(i);
  };
  const closePlayer = useCallback(() => setActiveIdx(null), []);

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
              onWatchShowreel={() => {
                const i = playlist.findIndex((it) => it.key === "featured");
                if (i >= 0) setActiveIdx(i);
              }}
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
            <ProjectCarousel items={reelProjects} onPlay={handlePlayProject} paused={activeIdx !== null} />
          </motion.div>
        </motion.div>

        <GradingCompare />
        <FeatureStrip />
      </div>

      <VideoLightbox items={playlist} index={activeIdx} onIndexChange={setActiveIdx} onClose={closePlayer} />
    </section>
  );
}
