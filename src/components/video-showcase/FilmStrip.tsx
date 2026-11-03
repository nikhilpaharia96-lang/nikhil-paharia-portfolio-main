import { behindTheScenes } from "@/constants/videoShowcase";

const sprockets =
  "repeating-linear-gradient(90deg, rgba(255,255,255,0.85) 0 10px, transparent 10px 22px)";

export default function FilmStrip() {
  return (
    <div className="relative rounded-[22px] overflow-hidden bg-[#0b0f17] shadow-[0_30px_60px_-28px_rgba(8,20,45,0.7)]">
      <div aria-hidden="true" className="h-2.5 mx-3 mt-2 rounded-sm opacity-70" style={{ backgroundImage: sprockets, backgroundSize: "22px 100%" }} />

      <div className="flex items-stretch gap-2 px-3 py-2 sm:py-3 overflow-x-auto scrollbar-hide">
        <div className="shrink-0 w-44 sm:w-56 flex flex-col justify-center pr-2 text-white">
          <p className="font-sans font-extrabold uppercase text-lg sm:text-xl leading-[1.05] tracking-tight">
            Behind
            <br />
            <span className="text-primary">The Scenes</span>
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-white/70">
            The process, the moments and the stories behind the final cut.
          </p>
        </div>

        {behindTheScenes.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-24 sm:h-28 flex-1 min-w-[8.5rem] max-w-[14rem] rounded-md object-cover"
          />
        ))}

        <div className="shrink-0 w-32 sm:w-40 flex items-center justify-center text-white">
          <p className="font-script font-bold italic text-2xl sm:text-3xl leading-[1.05] -rotate-6 text-center">
            More
            <br />
            Than Just
            <br />
            Editing
          </p>
        </div>
      </div>

      <div aria-hidden="true" className="h-2.5 mx-3 mb-2 rounded-sm opacity-70" style={{ backgroundImage: sprockets, backgroundSize: "22px 100%" }} />
    </div>
  );
}
