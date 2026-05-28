import { Hero } from "@/components/landing/Hero";
import { JurisdictionPulseMap } from "@/components/landing/JurisdictionPulseMap";
import { LiveBillsCounter } from "@/components/landing/LiveBillsCounter";
import { ThreatTickerPreview } from "@/components/landing/ThreatTickerPreview";
import { ScannerSection } from "@/components/scanner/ScannerSection";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <LiveBillsCounter />
      <ScannerSection />
      <JurisdictionPulseMap />
      <ThreatTickerPreview />
      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--color-ink-600)] mt-20">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-[var(--color-ember-500)]">見先</span>
          <span className="text-base font-semibold text-[var(--color-paper-50)]">
            Misaki
          </span>
          <span className="text-sm text-[var(--color-paper-200)]">
            · Web Data UNLOCKED Hackathon 2026
          </span>
        </div>
        <div className="text-sm text-[var(--color-paper-200)]">
          Powered by Bright Data · Gemini · Next.js 15 · LangGraph
        </div>
      </div>
    </footer>
  )
}
