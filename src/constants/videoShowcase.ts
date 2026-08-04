import { Camera, Palette, Headphones, Sparkles } from "lucide-react";
import vid1 from "@/assets/images/video-1.png";
import vid2 from "@/assets/images/video-2.png";
import vid3 from "@/assets/images/video-3.png";
import teaHero from "@/assets/images/tea-sunset-portrait.webp";
import teaWide from "@/assets/images/tea-sunset-person-wide.webp";
import type { FeaturedVideo, Project, ShowcaseFeature } from "@/types/video";

// To make a video actually playable, paste a normal YouTube or Instagram
// share link into `videoUrl` — e.g.
//   videoUrl: "https://youtu.be/dQw4w9WgXcQ"
//   videoUrl: "https://www.instagram.com/reel/CxAbCdEfGh/"
// Leave it out (or undefined) to keep the current hover-preview-only behaviour.
export const featuredVideo: FeaturedVideo = {
  title: "Whispers of the Highlands",
  category: "Documentary Film",
  duration: "4:12",
  image: vid1,
  videoUrl: "https://youtu.be/-pc8cTYXnYs?si=hLxZ6exxzasbL1UH", // e.g. "https://youtu.be/dQw4w9WgXcQ"
};

export const projects: Project[] = [
  { id: 1, title: "Golden Hour Escape", category: "Travel Film", duration: "2:34", image: vid2, videoUrl: "https://youtu.be/tKdIRLkFs2E?si=akz7-HbQuhqJQUm0" },
  { id: 2, title: "Whispers of the Highlands", category: "Documentary", duration: "4:12", image: vid1, videoUrl: "https://youtube.com/shorts/iGaGXO3tmW8?si=Rk60aPOjmkCgJBip" },
  { id: 3, title: "Launch Reel — Aurum", category: "Commercial", duration: "1:15", image: vid3, videoUrl: undefined },
  { id: 4, title: "Anaya & Rohan", category: "Wedding Film", duration: "3:48", image: teaHero, videoUrl: "https://www.instagram.com/reel/DbdGUJjuSoH/?igsh=MzRpcWpwem1tdzhn" },
  { id: 5, title: "Valley From Above", category: "Drone Film", duration: "2:02", image: teaWide, videoUrl: undefined },
];

export const showcaseFeatures: ShowcaseFeature[] = [
  { icon: Camera, title: "4K Cinematic Production", desc: "Every frame shot and mastered in crisp 4K resolution." },
  { icon: Palette, title: "Professional Color Grading", desc: "Rich, filmic tones tailored to each story's mood." },
  { icon: Headphones, title: "Sound Design", desc: "Immersive audio mixing that pulls viewers in." },
  { icon: Sparkles, title: "Story Driven Editing", desc: "Pacing and rhythm built around genuine emotion." },
];
