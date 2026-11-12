import { Link } from "wouter";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 bg-[#f8fbff]">
      <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white/90 p-8 text-center shadow-[0_18px_40px_-18px_rgba(18,102,241,0.35)]">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-[#1266F1]">
          <Compass className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-[#1266F1]">Error 404</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0b1530]">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1266F1] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0b4fd1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to portfolio
        </Link>
      </div>
    </main>
  );
}
