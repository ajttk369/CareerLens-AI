import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportContent } from "@/components/review-content";
import { readReport } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "공유 리뷰 | CareerLens AI", robots: { index: false, follow: false } };
export default async function SharedReport({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await readReport(token, true);
  if (!report) notFound();
  return <main className="report-page section-shell">
    <div className="saved-actions print-hidden"><a className="button secondary compact" href="/">CareerLens AI</a><span className="status-tag attention">읽기 전용 공유 리포트</span></div>
    <ReportContent input={report.input} result={report.result} completed={report.completed} includeOriginal={false} />
  </main>;
}
