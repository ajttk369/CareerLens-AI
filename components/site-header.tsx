import { BrandMark } from "@/components/brand-mark";
export function SiteHeader() {
  return <header className="site-header print-hidden"><div className="header-inner section-shell"><a className="brand" href="#top"><BrandMark />CareerLens AI</a><nav className="header-nav" aria-label="주요 메뉴"><a href="#analyze">리뷰</a><a href="#history">내 기록</a></nav></div></header>;
}
