import { MisakiNav }         from "@/components/landing/MisakiNav";
import { Hero }              from "@/components/landing/Hero";
import { ProblemSection }    from "@/components/landing/ProblemSection";
import { WorkflowSection }   from "@/components/landing/WorkflowSection";
import { RouterSection }     from "@/components/landing/RouterSection";
import { ArchSection }       from "@/components/landing/ArchSection";
import { FeaturesSection }   from "@/components/landing/FeaturesSection";
import { StackSection }      from "@/components/landing/StackSection";
import { MarketSection }     from "@/components/landing/MarketSection";
import { RevenueSection }    from "@/components/landing/RevenueSection";
import { WhyMisakiSection }  from "@/components/landing/WhyMisakiSection";
import { RoadmapSection }    from "@/components/landing/RoadmapSection";
import { ScannerSection }    from "@/components/scanner/ScannerSection";
import { DemoSection }       from "@/components/landing/DemoSection";
import { CTASection }        from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <>
      {/* Fixed floating pill nav */}
      <MisakiNav />

      <main style={{ overflow: "hidden" }}>
        {/* 1 · Hook */}
        <Hero />

        {/* 2 · Establish the pain */}
        <ProblemSection />

        {/* 3 · Show the solution flow */}
        <WorkflowSection />

        {/* 4 · What it can do */}
        <FeaturesSection />

        {/* 5 · Try it live — peak engagement */}
        <div id="scanner" style={{ background: "#050505" }}>
          <ScannerSection />
        </div>

        {/* 6 · Watch the full demo */}
        <DemoSection />

        {/* 7–9 · Technical credibility */}
        <RouterSection />
        <ArchSection />
        <StackSection />

        {/* 10–13 · Business case */}
        <WhyMisakiSection />
        <MarketSection />
        <RevenueSection />
        <RoadmapSection />
        
        {/* 14 · Final CTA */}
        <CTASection />
      </main>
    </>
  );
}
