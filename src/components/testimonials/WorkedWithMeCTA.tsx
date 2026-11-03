import { ArrowRight, MessageSquareHeart } from "lucide-react";

type WorkedWithMeCTAProps = {
  onOpen: () => void;
  /** "floating" = desktop card over the carousel; "inline" = compact card beside the heading on phones/tablets. */
  variant: "floating" | "inline";
};

export default function WorkedWithMeCTA({ onOpen, variant }: WorkedWithMeCTAProps) {
  const isFloating = variant === "floating";

  return (
    <div className={isFloating ? "hidden lg:block w-full" : "lg:hidden w-full"}>
      <button
        type="button"
        onClick={onOpen}
        aria-label="Worked with me? Share your experience"
        className="group w-full text-left flex items-start gap-[clamp(0.3rem,1.6vw,0.9rem)] lg:gap-3.5
                   rounded-[clamp(1.1rem,5.5vw,2rem)] lg:rounded-[1.75rem]
                   p-[clamp(0.5rem,2.4vw,1.25rem)] lg:p-5
                   bg-gradient-to-br from-white/95 to-white/70 backdrop-blur-xl border border-white
                   shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_22px_44px_-18px_rgba(37,99,235,0.35)]
                   transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_52px_-16px_rgba(37,99,235,0.45)]
                   motion-reduce:transition-none motion-reduce:hover:translate-y-0
                   focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <span className="shrink-0 rounded-full bg-[#cfe3fd] flex items-center justify-center w-[clamp(1.5rem,7vw,3.5rem)] h-[clamp(1.5rem,7vw,3.5rem)] lg:w-14 lg:h-14">
          <MessageSquareHeart className="w-[48%] h-[48%] text-[#1a6bff]" strokeWidth={2} aria-hidden="true" />
        </span>

        <span className="min-w-0 flex-1 flex flex-col gap-[clamp(0.3rem,1.8vw,0.9rem)] lg:gap-3">
          <span className="font-sans font-extrabold tracking-tight leading-[1.15] text-[#0b1530] text-[clamp(0.62rem,2.8vw,1.2rem)] lg:text-lg">
            Worked with me?
          </span>
          <span className="flex items-end justify-between gap-2 font-sans font-bold leading-[1.15] text-[#1a6bff] text-[clamp(0.58rem,2.55vw,1.15rem)] lg:text-lg">
            <span>
              Share your{" "}
              <span className="whitespace-nowrap">
                experience
                <ArrowRight className="sm:hidden inline-block w-2.5 h-2.5 ml-px align-[-1px]" strokeWidth={2.75} aria-hidden="true" />
              </span>
            </span>
            <ArrowRight
              className="hidden sm:block shrink-0 w-5 h-5 mb-0.5 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </span>
        </span>
      </button>
    </div>
  );
}
