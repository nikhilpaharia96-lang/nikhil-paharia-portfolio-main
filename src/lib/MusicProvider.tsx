import * as React from "react";
import { useBackgroundMusic, type UseBackgroundMusicReturn } from "@/hooks/useBackgroundMusic";

const MusicContext = React.createContext<UseBackgroundMusicReturn | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const music = useBackgroundMusic();
  return <MusicContext.Provider value={music}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const ctx = React.useContext(MusicContext);
  if (!ctx) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return ctx;
}
