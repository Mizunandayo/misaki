import Link from "next/link";

export default function ShareNotFound() {
  return (
    <main
      className="
        min-h-screen bg-[#050505] text-white font-[Poppins]
        flex flex-col items-center justify-center px-6
      "
    >
      <div className="max-w-xl w-full flex flex-col items-center text-center gap-6">
        <span className="text-[11px] uppercase tracking-widest text-white/80">
          Share link unavailable
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          This Misaki report is no longer accessible
        </h1>
        <p className="text-base leading-relaxed text-white">
          The signed URL has expired, been revoked, or was modified after it
          was created. Share links are valid for 24 hours from the moment they
          are minted.
        </p>
        <Link
          href="/#public-scanner"
          className="
            inline-flex items-center gap-2 cursor-pointer
            h-11 px-6 rounded-md mt-2
            border border-white/15 bg-white text-[#050505]
            font-semibold tracking-tight text-base
            hover:bg-white/95 hover:border-white/30
            transition-colors duration-200
          "
        >
          Generate a fresh report
          <ChevronIcon className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
