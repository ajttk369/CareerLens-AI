"use client";

import { FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  CheckCircle2,
  CircleAlert,
  Eye,
  LoaderCircle,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { JOB_ROLES, type AnalysisInput, type JobRole } from "@/types";

type AnalysisFormProps = {
  hasResult: boolean;
  isCollapsed: boolean;
  isLoading: boolean;
  onAnalyze: (input: AnalysisInput) => Promise<void>;
  onDemoResult: () => void;
  onToggleCollapsed: () => void;
  submittedInput: AnalysisInput | null;
};

type ProjectInput = {
  id: number;
  url: string;
  description: string;
};

type FormState = {
  role: JobRole;
  portfolioUrl: string;
  introText: string;
  techStack: string;
  projects: ProjectInput[];
};

const initialForm: FormState = {
  role: "프론트엔드",
  portfolioUrl: "",
  introText: "",
  techStack: "",
  projects: [{ id: 1, url: "", description: "" }],
};

const sampleForm: FormState = {
  role: "프론트엔드",
  portfolioUrl: "https://example.com/portfolio",
  introText:
    "사용자가 실제로 문제를 해결하는 흐름에 집중해 웹 서비스를 설계하고 구현해왔습니다. Next.js와 TypeScript를 기반으로 반응형 UI, API 연동, 상태 관리, 배포까지 경험했으며, 채용자가 빠르게 역할과 성과를 이해할 수 있도록 포트폴리오를 구성하고 싶습니다.",
  techStack: "Next.js, TypeScript, Tailwind CSS, React, Supabase, REST API",
  projects: [
    {
      id: 1,
      url: "https://example.com/project",
      description:
        "Riot API를 연동해 전적 검색과 승률 분석 기능을 구현했습니다. 검색 결과 로딩 상태, 에러 처리, 모바일 반응형 UI를 직접 설계했고 사용자가 핵심 지표를 빠르게 확인하도록 카드형 대시보드로 정리했습니다.",
    },
  ],
};

const isClientMockMode = process.env.NEXT_PUBLIC_MOCK_ANALYSIS === "true";

export function AnalysisForm({
  hasResult,
  isCollapsed,
  isLoading,
  onAnalyze,
  onDemoResult,
  onToggleCollapsed,
  submittedInput,
}: AnalysisFormProps) {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [expandedProjectId, setExpandedProjectId] = useState(
    initialForm.projects[0].id,
  );

  const descriptionLength = useMemo(
    () =>
      [
        form.introText,
        ...form.projects.map(
          (project) => `${project.url} ${project.description}`,
        ),
      ]
        .join(" ")
        .trim().length,
    [form],
  );

  const qualityChecks = useMemo(() => {
    const projectText = form.projects
      .map((project) => project.description)
      .join(" ")
      .trim();
    const techItems = form.techStack
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
    const hasValidUrl =
      form.portfolioUrl.trim().length > 0 &&
      /^https?:\/\//i.test(form.portfolioUrl.trim());

    return [
      {
        label: "소개/설명 120자 이상",
        passed: descriptionLength >= 120,
      },
      {
        label: "대표 프로젝트 설명 60자 이상",
        passed: projectText.length >= 60,
      },
      {
        label: "기술 스택 3개 이상",
        passed: techItems.length >= 3,
      },
      {
        label: "포트폴리오 URL 입력/형식 확인",
        passed: hasValidUrl,
      },
    ];
  }, [descriptionLength, form.portfolioUrl, form.projects, form.techStack]);

  function updateProject(
    id: number,
    field: keyof Omit<ProjectInput, "id">,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project,
      ),
    }));
  }

  function addProject() {
    setForm((current) => ({
      ...current,
      projects: [
        ...current.projects,
        { id: Date.now(), url: "", description: "" },
      ],
    }));
  }

  function removeProject(id: number) {
    if (form.projects.length === 1) return;

    const nextProject = form.projects.find((project) => project.id !== id);
    setForm((current) => ({
      ...current,
      projects: current.projects.filter((project) => project.id !== id),
    }));
    setExpandedProjectId((current) =>
      current === id ? nextProject?.id ?? 0 : current,
    );
  }

  function buildInputText() {
    const projectBlocks = form.projects
      .map((project, index) => {
        const lines = [
          `대표 프로젝트 ${index + 1}`,
          project.url.trim() ? `URL: ${project.url.trim()}` : "",
          project.description.trim()
            ? `설명: ${project.description.trim()}`
            : "",
        ].filter(Boolean);

        return lines.length > 1 ? lines.join("\n") : "";
      })
      .filter(Boolean);

    return [
      "자기소개서 또는 포트폴리오 설명",
      form.introText.trim(),
      projectBlocks.length ? "\n대표 프로젝트" : "",
      ...projectBlocks,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const inputText = buildInputText();

    if (inputText.length < 80) {
      setFormError("분석 정확도를 위해 설명을 80자 이상 입력해주세요.");
      return;
    }

    if (!form.techStack.trim()) {
      setFormError("주요 기술 스택을 입력해주세요.");
      return;
    }

    await onAnalyze({
      role: form.role,
      portfolioUrl: form.portfolioUrl.trim(),
      inputText,
      techStack: form.techStack.trim(),
    });
  }

  if (hasResult && isCollapsed) {
    return (
      <CollapsedInputPanel
        input={submittedInput}
        onDemoResult={onDemoResult}
        onToggleCollapsed={onToggleCollapsed}
      />
    );
  }

  return (
    <form
      className="input-panel-scroll max-h-none overflow-visible rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
      onSubmit={handleSubmit}
    >
      <div className="mb-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness className="size-5" />
            </div>
            <p className="text-[13px] font-extrabold tracking-[0.12em] text-blue-600">
              ANALYSIS INPUT
            </p>
          </div>
          {hasResult ? (
            <button
              className="inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              onClick={onToggleCollapsed}
              type="button"
            >
              입력 접기
            </button>
          ) : null}
        </div>
        <h2 className="mt-4 w-full whitespace-normal break-words text-[22px] font-black leading-7 tracking-[-0.025em] text-slate-950">
          분석할 정보를 입력하세요
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          채용자가 먼저 확인하는 역할, 성과, 기술 맥락 중심으로 정리합니다.
        </p>
      </div>

      {isClientMockMode ? (
        <p className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] font-bold leading-6 text-blue-700">
          데모 모드: 샘플 결과만 표시됩니다
        </p>
      ) : null}

      <InputQuality checks={qualityChecks} />

      <div className="grid gap-5">
        <fieldset>
          <legend className="mb-3.5 text-sm font-extrabold text-slate-800">
            지원 직무
          </legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2">
            {JOB_ROLES.map((role) => (
              <button
                className={`min-h-12 whitespace-nowrap rounded-2xl border px-3.5 text-[13px] font-bold leading-5 transition ${
                  form.role === role
                    ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/15"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-white hover:text-blue-700"
                }`}
                key={role}
                onClick={() =>
                  setForm((current) => ({ ...current, role: role as JobRole }))
                }
                type="button"
              >
                {role}
              </button>
            ))}
          </div>
        </fieldset>

        <Field label="포트폴리오 URL" optional>
          <input
            className="field-control"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                portfolioUrl: event.target.value,
              }))
            }
            placeholder="https://your-portfolio.com"
            type="url"
            value={form.portfolioUrl}
          />
        </Field>

        <Field
          label="자기소개서 또는 포트폴리오 설명"
          meta={`${descriptionLength.toLocaleString()} / 12,000`}
        >
          <textarea
            className="field-control min-h-32 resize-y p-4 leading-7"
            maxLength={12000}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                introText: event.target.value,
              }))
            }
            placeholder="지원 배경, 맡은 역할, 문제 해결 경험, 성과를 짧게 입력하세요."
            value={form.introText}
          />
          <HelpExample
            title="좋은 프로젝트 설명 예시 보기"
            text="Riot API를 활용해 League of Legends와 TFT 전적을 조회하는 웹서비스를 제작했습니다. Riot ID 검색, 최근 경기 카드 UI, 랭크 정보 표시, TFT 탭 분리, 반응형 화면을 구현했으며, API 키는 서버 환경변수로 관리했습니다."
          />
        </Field>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-[18px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                대표 프로젝트
              </h3>
              <p className="mt-1.5 text-[13px] leading-6 text-slate-500">
                첫 번째 프로젝트만 펼쳐두고 나머지는 접어서 관리합니다.
              </p>
            </div>
            <button
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              onClick={addProject}
              type="button"
            >
              <Plus className="size-3.5" />
              프로젝트 추가
            </button>
          </div>

          <div className="grid gap-3.5">
            {form.projects.map((project, index) => (
              <ProjectCard
                expanded={expandedProjectId === project.id}
                index={index}
                key={project.id}
                onRemove={removeProject}
                onToggle={() =>
                  setExpandedProjectId((current) =>
                    current === project.id ? 0 : project.id,
                  )
                }
                onUpdate={updateProject}
                project={project}
                removable={form.projects.length > 1}
              />
            ))}
          </div>
        </div>

        <Field label="주요 기술 스택">
          <input
            className="field-control"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                techStack: event.target.value,
              }))
            }
            placeholder="예: Next.js, TypeScript, Tailwind CSS, Supabase"
            type="text"
            value={form.techStack}
          />
          <HelpExample
            title="좋은 기술 스택 입력 예시 보기"
            text="Next.js, TypeScript, Tailwind CSS, Supabase, OpenAI API, Vercel"
          />
        </Field>
      </div>

      {formError ? (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3">
        <button
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-slate-950 px-6 text-sm font-extrabold text-white shadow-xl shadow-slate-950/15 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              AI가 분석 중입니다
            </>
          ) : (
            <>
              AI 분석 시작
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
            disabled={isLoading}
            onClick={() => {
              setForm(sampleForm);
              setExpandedProjectId(sampleForm.projects[0].id);
              setFormError("");
            }}
            type="button"
          >
            <Sparkles className="size-4" />
            샘플 불러오기
          </button>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-blue-200 bg-blue-50 px-4 text-sm font-extrabold text-blue-700 transition hover:border-blue-300 hover:bg-white"
            disabled={isLoading}
            onClick={onDemoResult}
            type="button"
          >
            <Eye className="size-4" />
            데모 결과 보기
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-[13px] leading-6 text-slate-500">
        API 키는 서버 라우트에서만 사용되며 클라이언트에 노출되지 않습니다.
      </p>
    </form>
  );
}

function Field({
  children,
  label,
  meta,
  optional = false,
}: {
  children: ReactNode;
  label: string;
  meta?: string;
  optional?: boolean;
}) {
  return (
    <label className="grid gap-2.5">
      <span className="flex items-center justify-between gap-3 text-sm font-extrabold leading-6 text-slate-800">
        <span>
          {label}
          {optional ? (
            <span className="ml-2 text-xs font-semibold text-slate-400">
              선택
            </span>
          ) : null}
        </span>
        {meta ? (
          <span className="shrink-0 text-xs font-semibold text-slate-400">
            {meta}
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

function HelpExample({ title, text }: { title: string; text: string }) {
  return (
    <details className="rounded-2xl border border-slate-200 bg-white">
      <summary className="cursor-pointer list-none px-4 py-3 text-xs font-extrabold text-blue-700 transition hover:bg-blue-50">
        {title}
      </summary>
      <p className="border-t border-slate-100 px-4 py-3 text-sm font-medium leading-6 text-slate-600">
        {text}
      </p>
    </details>
  );
}

function InputQuality({
  checks,
}: {
  checks: { label: string; passed: boolean }[];
}) {
  const passedCount = checks.filter((check) => check.passed).length;
  const readyTone =
    passedCount >= 3
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : "border-amber-100 bg-amber-50 text-amber-700";

  return (
    <section className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[13px] font-extrabold tracking-[0.1em] text-blue-600">
            INPUT QUALITY
          </p>
          <h3 className="mt-1 text-sm font-black text-slate-950">
            분석 준비도 점검
          </h3>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-extrabold ${readyTone}`}
        >
          {passedCount}/{checks.length} 완료
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {checks.map((check) => {
          const Icon = check.passed ? CheckCircle2 : CircleAlert;

          return (
            <div
              className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-[13px] font-bold text-slate-600"
              key={check.label}
            >
              <Icon
                className={`size-4 shrink-0 ${
                  check.passed ? "text-emerald-500" : "text-amber-500"
                }`}
              />
              <span className="break-words leading-5">{check.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CollapsedInputPanel({
  input,
  onDemoResult,
  onToggleCollapsed,
}: {
  input: AnalysisInput | null;
  onDemoResult: () => void;
  onToggleCollapsed: () => void;
}) {
  const projectCount = input?.inputText.match(/대표 프로젝트 \d+/g)?.length ?? 0;

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <BriefcaseBusiness className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-extrabold tracking-[0.14em] text-blue-600">
            INPUT SUMMARY
          </p>
          <h2 className="mt-1 text-lg font-black tracking-[-0.02em] text-slate-950">
            입력 정보 요약
          </h2>
        </div>
      </div>

      {isClientMockMode ? (
        <p className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-bold leading-5 text-blue-700">
          데모 모드: 샘플 결과만 표시됩니다
        </p>
      ) : null}

      <dl className="mt-5 grid gap-3 text-sm">
        <SummaryItem label="지원 직무" value={input?.role || "입력 없음"} />
        <SummaryItem
          label="포트폴리오"
          value={input?.portfolioUrl || "URL 입력 없음"}
        />
        <SummaryItem
          label="대표 프로젝트"
          value={`${Math.max(projectCount, 1)}개`}
        />
        <SummaryItem
          label="기술 스택"
          value={input?.techStack || "입력 없음"}
        />
      </dl>

      <div className="mt-5 grid gap-2">
        <button
          className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-2xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-blue-600"
          onClick={onToggleCollapsed}
          type="button"
        >
          입력 펼치기
        </button>
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-blue-200 bg-blue-50 px-5 text-sm font-extrabold text-blue-700 transition hover:bg-white"
          onClick={onDemoResult}
          type="button"
        >
          <Eye className="size-4" />
          데모 결과 보기
        </button>
      </div>
    </aside>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3.5">
      <dt className="text-xs font-extrabold text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold leading-6 text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function ProjectCard({
  expanded,
  index,
  onRemove,
  onToggle,
  onUpdate,
  project,
  removable,
}: {
  expanded: boolean;
  index: number;
  onRemove: (id: number) => void;
  onToggle: () => void;
  onUpdate: (
    id: number,
    field: keyof Omit<ProjectInput, "id">,
    value: string,
  ) => void;
  project: ProjectInput;
  removable: boolean;
}) {
  const summary =
    project.url.trim() ||
    project.description.trim().slice(0, 42) ||
    "URL과 설명을 입력하세요";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button
        className="flex min-h-16 w-full items-center justify-between gap-3 px-4 text-left transition hover:bg-slate-50"
        onClick={onToggle}
        type="button"
      >
        <div className="min-w-0">
          <p className="text-xs font-extrabold tracking-[0.08em] text-slate-500">
            PROJECT {index + 1}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-700">
            {summary}
          </p>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded ? (
        <div className="grid gap-3.5 border-t border-slate-100 p-4">
          <input
            className="field-control"
            onChange={(event) =>
              onUpdate(project.id, "url", event.target.value)
            }
            placeholder="대표 프로젝트 URL"
            type="url"
            value={project.url}
          />
          <textarea
            className="field-control min-h-28 resize-y p-4 leading-7"
            onChange={(event) =>
              onUpdate(project.id, "description", event.target.value)
            }
            placeholder="문제, 담당 역할, 사용 기술, 결과를 3~5문장으로 입력하세요."
            value={project.description}
          />
          {removable ? (
            <button
              className="inline-flex min-h-10 w-fit items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              onClick={() => onRemove(project.id)}
              type="button"
            >
              <Trash2 className="size-3.5" />
              프로젝트 삭제
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
