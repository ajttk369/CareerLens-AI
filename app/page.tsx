import { AnalysisHistory } from "@/components/analysis-history";
import { CareerReviewApp } from "@/components/career-review-app";
import { HeroSection } from "@/components/hero-section";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return <><SiteHeader /><main><HeroSection /><CareerReviewApp /><AnalysisHistory /></main><footer className="site-footer print-hidden"><div className="section-shell"><p>CareerLens AI · Portfolio Text Review</p><p>Next.js · TypeScript · OpenAI · Supabase</p></div></footer></>;
}
