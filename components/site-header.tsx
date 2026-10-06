import { BrandMark } from "@/components/brand-mark";
export function SiteHeader() {
  return <header className="site-header print-hidden"><div className="header-inner section-shell"><a className="brand" href="#top"><BrandMark /><span>CareerLens AI<small>Portfolio Review</small></span></a><nav className="header-nav" aria-label="주요 메뉴"><a href="#history">내 기록</a><a className="header-start" href="#analyze">분석 시작</a></nav></div></header>;
}
