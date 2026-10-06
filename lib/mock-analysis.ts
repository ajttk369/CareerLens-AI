import type { AnalysisInput, AnalysisResult } from "@/types";

export const demoInput: AnalysisInput = {
  role: "프론트엔드", portfolioUrl: "https://example.com/portfolio", experienceLevel: "신입",
  introduction: "사용자의 작업 흐름을 이해하고 웹 화면과 API를 연결하는 프론트엔드 개발을 공부하고 있습니다. 개인 프로젝트를 통해 로딩, 오류, 빈 결과 상태를 구분하고 반응형 화면을 구현했습니다.",
  projects: [{
    id: "sample-project", name: "TaskBoard (가상 샘플)", url: "", contribution: "개인 프로젝트 / 화면과 API 연동",
    description: "할 일을 등록하고 상태별로 확인하는 TaskBoard를 만들었습니다. Next.js와 TypeScript로 목록 화면과 API 연동을 구현했습니다. 서버 응답을 기다리는 동안 로딩 표시를 제공하고 요청 실패 시 다시 시도할 수 있도록 구성했습니다. 모바일에서는 목록을 한 열로 배치했습니다.",
  }],
  inputText: "사용자의 작업 흐름을 이해하고 웹 화면과 API를 연결하는 프론트엔드 개발을 공부하고 있습니다. 개인 프로젝트를 통해 로딩, 오류, 빈 결과 상태를 구분하고 반응형 화면을 구현했습니다.\n\nTaskBoard (가상 샘플)\n담당 역할: 개인 프로젝트 / 화면과 API 연동\n할 일을 등록하고 상태별로 확인하는 TaskBoard를 만들었습니다. Next.js와 TypeScript로 목록 화면과 API 연동을 구현했습니다. 서버 응답을 기다리는 동안 로딩 표시를 제공하고 요청 실패 시 다시 시도할 수 있도록 구성했습니다. 모바일에서는 목록을 한 열로 배치했습니다.",
  techStack: "Next.js, TypeScript, React", jobDescription: "",
};

export const mockAnalysisResult: AnalysisResult = {
  scores: { firstImpression: 72, technicalSkill: 70, communication: 62, designQuality: 68, roleFit: 74 },
  scoreEvidence: {
    firstImpression: { quote: "할 일을 등록하고 상태별로 확인하는 TaskBoard를 만들었습니다.", reason: "서비스 목적은 분명합니다. 해결하려던 사용자 문제를 한 문장 더하면 맥락이 좋아집니다." },
    technicalSkill: { quote: "Next.js와 TypeScript로 목록 화면과 API 연동을 구현했습니다.", reason: "사용 기술과 적용 범위가 연결됩니다. 실제 응답 처리 과정은 추가 설명이 필요합니다." },
    communication: { quote: "개인 프로젝트 / 화면과 API 연동", reason: "담당 범위는 확인되지만 판단 이유와 결과가 구체적으로 설명되지 않았습니다." },
    designQuality: { quote: "서버 응답을 기다리는 동안 로딩 표시를 제공하고 요청 실패 시 다시 시도할 수 있도록 구성했습니다.", reason: "구현 과정을 읽을 수 있습니다. 문제, 역할, 해결, 결과 순서로 나누면 전달이 더 선명해집니다." },
    roleFit: { quote: "모바일에서는 목록을 한 열로 배치했습니다.", reason: "반응형 화면 경험이 프론트엔드 직무와 연결됩니다. 채용 공고가 없으므로 일반적인 직무 기준만 적용했습니다." },
  },
  overallComment: "화면과 API를 연결하고 요청 상태를 처리한 경험이 드러납니다. 구현 기능을 나열하기 전에 해결하려던 문제와 본인의 판단 이유를 먼저 설명하세요.",
  strengths: ["Next.js와 TypeScript를 어떤 화면에 적용했는지 설명했습니다.", "로딩과 요청 실패를 구분해 사용자 흐름을 고려했습니다.", "개인 프로젝트의 담당 범위와 모바일 배치가 드러납니다."],
  weaknesses: ["사용자가 어떤 불편을 겪었는지 설명이 부족합니다.", "기술을 선택한 이유와 구현 과정의 판단 근거가 없습니다.", "구현 결과를 확인한 방법이나 실제 관찰 내용이 없습니다."],
  missingInformation: ["이 도구를 만들기 전 어떤 불편이 있었나요?", "Next.js와 TypeScript를 선택한 실제 이유는 무엇인가요?", "로딩과 오류 처리가 의도대로 동작하는지 어떻게 확인했나요?"],
  priorities: [
    { title: "해결하려던 문제를 먼저 설명", evidence: "할 일을 등록하고 상태별로 확인하는 TaskBoard를 만들었습니다.", reason: "목적 앞에 사용자의 불편을 제시하면 프로젝트 필요성이 드러납니다.", action: "첫 문장에 실제 불편을 추가하세요. 예: '[실제 불편 확인 필요]를 해결하기 위해 할 일 등록과 상태 조회 기능을 구현했습니다.'" },
    { title: "담당 범위를 구체적으로 정리", evidence: "개인 프로젝트 / 화면과 API 연동", reason: "작업한 화면과 데이터 흐름을 구분하면 기여 범위가 명확해집니다.", action: "실제로 구현한 화면과 API 연결 범위를 항목으로 정리하세요. 직접 작업하지 않은 기능은 포함하지 마세요." },
    { title: "기술 선택 이유 추가", evidence: "Next.js와 TypeScript로 목록 화면과 API 연동을 구현했습니다.", reason: "기술명보다 선택 기준이 문제 해결 과정을 보여줍니다.", action: "대안으로 고려한 기술과 최종 선택 이유를 실제 경험을 기준으로 한 문장 작성하세요." },
    { title: "상태 처리 방법 설명", evidence: "요청 실패 시 다시 시도할 수 있도록 구성했습니다.", reason: "상태별 동작을 설명하면 구현 경험이 구체적으로 전달됩니다.", action: "실패 표시와 재시도 시 화면이 어떻게 바뀌는지 실제 구현 기준으로 설명하세요." },
    { title: "결과를 확인한 근거 추가", evidence: "", reason: "현재 입력에는 구현 결과를 확인한 방법이 없습니다.", action: "실제 관찰이나 확인 방법을 추가하세요. 측정하지 않은 속도 개선 수치나 사용자 수는 쓰지 마세요." },
  ],
  improvedDescription: "TaskBoard (가상 샘플)\n할 일을 등록하고 상태별로 확인할 수 있는 개인 프로젝트를 제작했습니다. [해결하려던 사용자 불편 확인 필요]\nNext.js와 TypeScript로 목록 화면과 API 연동을 직접 구현했습니다. 요청 중에는 로딩을 표시하고 실패 시 재시도할 수 있도록 구성했으며, 모바일 목록은 한 열로 배치했습니다.\n[기술 선택 이유와 구현 결과 확인 방법을 추가하세요.]",
  interviewQuestions: ["이 프로젝트로 해결하려던 문제는 무엇인가요?", "Next.js와 TypeScript를 선택한 이유는 무엇인가요?", "API 요청 실패 후 재시도 흐름을 어떻게 구현했나요?", "모바일에서 한 열 배치를 선택한 이유는 무엇인가요?", "프로젝트 결과와 개선할 점을 어떻게 확인했나요?"],
  interviewIntents: ["문제 정의와 사용자 이해", "기술 선택 기준", "오류 처리와 상태 관리", "반응형 설계의 판단 근거", "검토 과정과 다음 개선 방향"],
  interviewAnswers: ["할 일 등록과 상태 조회를 제공하는 개인 프로젝트를 만들었습니다. 실제로 해결하려던 불편은 [확인 필요]입니다.", "Next.js와 TypeScript를 사용해 목록 화면과 API를 연결했습니다. 대안과 선택 기준은 [확인 필요]입니다.", "요청 실패 시 재시도할 수 있도록 구성했습니다. 재시도 시 상태 변경과 중복 요청 처리는 [확인 필요]입니다.", "모바일 목록을 한 열로 배치했습니다. 화면 크기와 정보량을 고려한 구체적인 기준은 [확인 필요]입니다.", "현재 설명에는 결과 확인 방법이 없습니다. 실제 확인 과정과 다음 개선 사항을 [확인 필요]로 정리하겠습니다."],
};

export function isMockAnalysisEnabled() {
  return process.env.MOCK_ANALYSIS === "true" || process.env.NEXT_PUBLIC_MOCK_ANALYSIS === "true";
}
export function getMockAnalysisResult(): AnalysisResult {
  return JSON.parse(JSON.stringify(mockAnalysisResult)) as AnalysisResult;
}
