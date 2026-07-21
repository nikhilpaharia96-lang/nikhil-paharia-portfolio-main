export default function Marquee() {
  const content = "WEB DEVELOPER ✦ VIDEO EDITOR ✦ FREELANCER ✦ STORYTELLER ✦ DIGITAL CREATOR ✦ ASSAM, INDIA ✦ ";
  const fullContent = content + content; // Duplicate for seamless loop

  return (
    <div className="w-full py-6 md:py-8 bg-gradient-to-r from-blue-800 via-blue-700 to-sky-700 relative overflow-hidden flex flex-col gap-4 section-wrap max-w-full">
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] mix-blend-overlay pointer-events-none" />
      
      {/* Gradient fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-blue-800 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-sky-700 to-transparent z-10 pointer-events-none" />

      {/* Row 1: Left scrolling */}
      <div className="relative flex overflow-hidden">
        <div 
          className="inline-flex whitespace-nowrap text-white font-bold tracking-[0.2em] text-lg md:text-xl uppercase w-max"
          style={{ animation: 'marqueeScroll 30s linear infinite' }}
        >
          {fullContent}
        </div>
      </div>
      
      {/* Row 2: Right scrolling */}
      <div className="relative flex overflow-hidden">
        <div 
          className="inline-flex whitespace-nowrap text-white/70 font-bold tracking-[0.2em] text-lg md:text-xl uppercase w-max"
          style={{ animation: 'marqueeScrollReverse 35s linear infinite' }}
        >
          {fullContent}
        </div>
      </div>
    </div>
  );
}
