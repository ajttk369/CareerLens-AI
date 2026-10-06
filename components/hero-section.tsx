import { ShieldCheck, Sparkles } from "lucide-react";
export function HeroSection() {
  return (
    <section className="page-intro print-hidden" id="top">
      <div className="section-shell">
        <div className="intro-copy">
          <p className="intro-eyebrow"><Sparkles size={15} /> PORTFOLIO REVIEW</p>
          <h1>CareerLens <span>AI</span></h1>
          <p className="intro-description">채용자의 시선으로, 포트폴리오의 강점을 더 선명하게.</p>
        </div>
        <span className="intro-status"><ShieldCheck size={16} /> 기본 비공개</span>
      </div>
    </section>
  );
}
