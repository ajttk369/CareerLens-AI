import { AnalysisHistory } from "@/components/analysis-history";
import { CareerReviewApp } from "@/components/career-review-app";
import { HeroSection } from "@/components/hero-section";
import { ProjectStackSection } from "@/components/project-stack-section";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ProjectStackSection />
        <CareerReviewApp />
        <AnalysisHistory />
      </main>
      <footer className="print-hidden border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-3 px-5 py-8 text-xs font-semibold text-slate-500 sm:flex-row sm:px-8">
          <p className="text-slate-700">CareerLens AI · Portfolio Review</p>
          <p>Next.js · OpenAI · Supabase · Vercel</p>
        </div>
      </footer>
    </>
  );
}
