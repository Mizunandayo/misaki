"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { mintShareLink } from "@/lib/api/scanner";








export function ScannerShareTile({ reportId }: { reportId: string }) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function generate() {
    setPending(true);
    setError(null);
    try {
      const { token } = await mintShareLink(reportId);
      // Frontend route (NOT the raw API JSON endpoint) — colleagues land on a
      // rendered card via /share/scanner/<token>. The HMAC token IS auth.
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/share/scanner/${token}`;
      setLink(url);
      await navigator.clipboard.writeText(url).catch(() => undefined);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not share");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="
      font-[Poppins]
      rounded-lg border border-white/12 bg-white/2
      p-5 flex flex-wrap items-center gap-4 justify-between
    ">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-white">
          Share this report
        </span>
        <span className="text-sm text-white/80">
          24-hour HMAC-signed link · no login required to view.
        </span>
      </div>
      <motion.button
        type="button"
        onClick={generate}
        disabled={pending}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="
          inline-flex items-center gap-2 cursor-pointer
          h-10 px-5 rounded-md
          border border-white/15 bg-white text-ink-950
          font-semibold tracking-tight
          hover:bg-white/95 hover:border-white/30
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        "
      >
        <LinkIcon className="h-4 w-4" />
        <span className="text-sm">
          {pending ? "Minting…" : copied ? "Link copied" : link ? "Copy again" : "Generate link"}
        </span>
      </motion.button>
      {error && <p className="basis-full text-sm text-white">{error}</p>}
    </div>
  );
}

function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 13a5 5 0 0 0 7.07 0l3.54-3.54a5 5 0 1 0-7.07-7.07l-1.06 1.06" />
      <path d="M14 11a5 5 0 0 0-7.07 0L3.4 14.54a5 5 0 0 0 7.07 7.07l1.06-1.06" />
    </svg>
  );
}
