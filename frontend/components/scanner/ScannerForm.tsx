"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  onSubmit: (name: string) => void;
  pending: boolean;
}






const SUGGESTIONS = ["Stripe", "Anthropic", "OpenAI", "Airbnb"];

export function ScannerForm({ onSubmit, pending }: Props) {
  const [value, setValue] = useState("");

  function submit(name: string) {
    const trimmed = name.trim();
    if (trimmed.length < 2 || pending) return;
    onSubmit(trimmed);
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(value); }}
      className="font-[Poppins] flex flex-col gap-4"
    >
      <label className="flex flex-col gap-2">
        <span className="text-base font-semibold text-white tracking-tight">
          Scan a public company
        </span>
        <span className="text-sm text-white/80">
          Live SEC EDGAR, press, and lobbying signals — under 25 seconds.
        </span>
        <div className="flex gap-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type a company name…"
            maxLength={80}
            spellCheck={false}
            autoComplete="off"
            className="
              flex-1 h-12 px-4
              rounded-md border border-white/15 bg-[#0a0a0a]
              text-base text-white placeholder-white/40
              outline-none transition-colors
              focus:border-white/40 focus:bg-[#0d0d0d]
            "
            aria-label="Company name"
          />
          <motion.button
            type="submit"
            disabled={pending || value.trim().length < 2}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="
              inline-flex items-center gap-2
              h-12 px-6 cursor-pointer
              rounded-md border border-white/15
              bg-white text-[#050505] font-semibold tracking-tight
              shadow-[0_8px_30px_rgba(255,255,255,0.08)]
              hover:bg-white/95 hover:border-white/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            <ScanIcon className="h-4 w-4" />
            <span className="text-base">
              {pending ? "Scanning…" : "Run Scan"}
            </span>
          </motion.button>
        </div>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-white/80">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => { setValue(s); submit(s); }}
            disabled={pending}
            className="
              cursor-pointer
              rounded-full border border-white/15 px-3 py-1
              text-sm text-white
              hover:border-white/40 hover:bg-white/[0.04]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-150
            "
          >
            {s}
          </button>
        ))}
      </div>
    </form>
  );
}

function ScanIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
