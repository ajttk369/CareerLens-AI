import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerLens AI | 포트폴리오 설명 리뷰",
  description:
    "지원 직무와 채용 공고에 맞춰 포트폴리오 설명의 근거, 개선 작업, 면접 준비를 정리하는 도구",
  openGraph: {
    title: "CareerLens AI",
    description: "프로젝트 경험의 근거와 설명을 다듬는 포트폴리오 리뷰",
    locale: "ko_KR",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
