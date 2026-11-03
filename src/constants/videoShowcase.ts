import {
  Scissors,
  Palette,
  AudioLines,
  BookOpen,
  Clapperboard,
  Film,
  Tv,
  Heart,
} from "lucide-react";
import mistyValley from "@/assets/images/tea-garden-about.png";
import cliffSunset from "@/assets/images/tea-sunset-person-wide.webp";
import teaPortrait from "@/assets/images/tea-sunset-portrait.webp";
import teaGarden from "@/assets/images/tea-garden-hero.png";
import creatorPhoto from "@/assets/images/my-new-photo.jpg";
import vid1 from "@/assets/images/video-1.png";
import vid2 from "@/assets/images/video-2.png";
import vid3 from "@/assets/images/video-3.png";
import type {
  FeaturedVideo,
  Project,
  ShowcaseFeature,
  ShowcaseStat,
  VideoFilter,
} from "@/types/video";

// To make a video playable, paste a normal YouTube or Instagram share link into
// `videoUrl` — e.g. "https://youtu.be/dQw4w9WgXcQ" or an instagram.com/reel/... link.
// Leave it undefined and the card simply shows without opening a player.

export const filters: VideoFilter[] = [
  "All",
  "Travel Film",
  "Documentary",
  "Commercial",
  "Social Media",
  "Cinematic",
  "Others",
];

export const featuredVideo: FeaturedVideo = {
  title: "MEGHALAYA",
  subtitle: "Beyond Clouds",
  category: "Travel Film",
  duration: "4:12",
  image: mistyValley,
  videoUrl: "https://youtu.be/-pc8cTYXnYs?si=hLxZ6exxzasbL1UH",
};

export const projects: Project[] = [
  {
    id: 1,
    title: "Meghalaya — Beyond Clouds",
    category: "Travel Film",
    duration: "3:24",
    image: cliffSunset,
    description: "A cinematic travel film exploring the untouched beauty of Meghalaya.",
    location: "Meghalaya, India",
    videoUrl: "https://youtu.be/-pc8cTYXnYs?si=hLxZ6exxzasbL1UH",
  },
  {
    id: 2,
    title: "The Taste of Assam",
    category: "Documentary",
    duration: "4:58",
    image: teaPortrait,
    description: "Stories from the land of tea, culture and hard working people.",
    location: "Assam, India",
    videoUrl: "https://youtube.com/shorts/iGaGXO3tmW8?si=Rk60aPOjmkCgJBip",
  },
  {
    id: 3,
    title: "Gopal Krishna Tea",
    category: "Commercial",
    duration: "2:18",
    image: teaGarden,
    description: "A commercial film for authentic Assam tea brand.",
    location: "Assam, India",
  },
  {
    id: 4,
    title: "A Day in My Life",
    category: "Social Media",
    duration: "1:08",
    image: creatorPhoto,
    description: "A cinematic vlog edit for social media.",
    location: "Various Locations",
  },
  {
    id: 5,
    title: "Golden Hour Escape",
    category: "Cinematic",
    duration: "2:34",
    image: vid2,
    description: "Mist, mountains and golden light — a mood piece shot on the move.",
    location: "Western Ghats, India",
    videoUrl: "https://youtu.be/tKdIRLkFs2E?si=akz7-HbQuhqJQUm0",
  },
  {
    id: 6,
    title: "Anaya & Rohan",
    category: "Others",
    duration: "3:48",
    image: vid3,
    description: "A wedding highlight film told through small, honest moments.",
    location: "Arunachal Pradesh, India",
    videoUrl: "https://www.instagram.com/reel/DbdGUJjuSoH/?igsh=MzRpcWpwem1tdzhn",
  },
];

export const showcaseStats: ShowcaseStat[] = [
  { icon: Clapperboard, value: "50+", label: "Videos Edited" },
  { icon: Film, value: "10+", label: "Cinematic Films" },
  { icon: Tv, value: "4K", label: "Production Quality" },
  { icon: Heart, value: "100%", label: "Client Satisfaction" },
];

export const behindTheScenes: string[] = [vid1, cliffSunset, mistyValley, teaPortrait, teaGarden];

export const showcaseFeatures: ShowcaseFeature[] = [
  { icon: Scissors, title: "Creative Editing", desc: "Clean, engaging and cinematic cuts." },
  { icon: Palette, title: "Color Grading", desc: "Professional color correction." },
  { icon: AudioLines, title: "Sound Design", desc: "Immersive audio for better impact." },
  { icon: BookOpen, title: "Storytelling", desc: "Turning moments into emotions." },
];
