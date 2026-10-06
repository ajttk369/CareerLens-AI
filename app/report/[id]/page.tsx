import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportContent } from "@/components/review-content";
import { SavedReportTools } from "@/components/saved-report-tools";
import { readReport } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "개인 리뷰 | CareerLens AI", robots: { index: false, follow: false } };
export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await readReport(id);
  if (!report) notFound();
  return <main className="report-page section-shell">
    <SavedReportTools id={report.id} shared={report.shared} completed={report.completed} priorities={report.result.priorities} />
    <p className="muted print-hidden">{new Date(report.createdAt).toLocaleString("ko-KR")} 저장 · 이 브라우저의 개인 기록</p>
    <ReportContent input={report.input} result={report.result} completed={report.completed} />
  </main>;
}
