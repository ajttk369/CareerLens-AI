"use client";
import { useState, type FormEvent } from "react";
import { ArrowRight, ChevronDown, Eye, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { EXPERIENCE_LEVELS, JOB_ROLES, type AnalysisInput, type PortfolioProject } from "@/types";
import { demoInput } from "@/lib/mock-analysis";
import { validateInput } from "@/lib/validation";

type Props = {
  value: AnalysisInput; onChange: (value: AnalysisInput) => void;
  onAnalyze: (value: AnalysisInput) => Promise<void>; onDemo: () => void;
  isLoading: boolean; collapsed: boolean; onExpand: () => void; onCancel: () => void;
};
export function AnalysisForm({ value, onChange, onAnalyze, onDemo, isLoading, collapsed, onExpand, onCancel }: Props) {
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(value.projects?.[0]?.id ?? "");
  const projects = value.projects ?? [];
  const length = [value.introduction ?? "", ...projects.map((project) => project.description)].join("\n").trim().length;
  function updateProject(id: string, key: keyof PortfolioProject, text: string) {
    onChange({ ...value, projects: projects.map((project) => project.id === id ? { ...project, [key]: text } : project) });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try { await onAnalyze(validateInput(value)); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "입력 내용을 확인해 주세요."); }
  }
  if (collapsed) return (
    <aside className="input-summary">
      <div className="section-heading"><h2>리뷰 입력</h2><span className="status-tag">{value.experienceLevel}</span></div>
      <dl>
        <div><dt>지원 직무</dt><dd>{value.role}</dd></div>
        <div><dt>대표 프로젝트</dt><dd>{projects.map((project) => project.name).filter(Boolean).join(", ") || "소개 설명"}</dd></div>
        <div><dt>기술 / 도구</dt><dd>{value.techStack}</dd></div>
        <div><dt>채용 공고</dt><dd>{value.jobDescription ? "입력됨" : "일반 직무 기준"}</dd></div>
      </dl>
      <button className="button secondary full-width" onClick={onExpand} disabled={isLoading}>입력 수정</button>
      <p className="privacy-note">기록은 이 브라우저에만 연결됩니다. 쿠키를 삭제하면 개인 기록 접근이 해제됩니다.</p>
    </aside>
  );
  return (
    <form className="analysis-form" onSubmit={submit}>
      <div className="section-heading"><h2>리뷰할 경험</h2><span className="muted">최대 5개 프로젝트</span></div>
      <fieldset disabled={isLoading} className="form-fields">
        <div className="form-row">
          <label htmlFor="job-role">지원 직무<select id="job-role" value={value.role} onChange={(event) => onChange({ ...value, role: event.target.value as AnalysisInput["role"] })}>{JOB_ROLES.map((role) => <option key={role}>{role}</option>)}</select></label>
          <label htmlFor="experience-level">경력 수준<select id="experience-level" value={value.experienceLevel ?? "신입"} onChange={(event) => onChange({ ...value, experienceLevel: event.target.value as AnalysisInput["experienceLevel"] })}>{EXPERIENCE_LEVELS.map((level) => <option key={level}>{level}</option>)}</select></label>
        </div>
        <label htmlFor="introduction">소개 / 포트폴리오 설명<textarea id="introduction" rows={4} maxLength={12000} value={value.introduction ?? ""} onChange={(event) => onChange({ ...value, introduction: event.target.value })} placeholder="지원 배경과 가장 강조하고 싶은 경험" /></label>
        <div className="project-section">
          <div className="section-heading"><h3>대표 프로젝트</h3><button className="icon-button" type="button" aria-label="프로젝트 추가" title="프로젝트 추가" disabled={projects.length >= 5} onClick={() => {
            const id = crypto.randomUUID();
            onChange({ ...value, projects: [...projects, { id, name: "", url: "", contribution: "", description: "" }] });
            setExpanded(id);
          }}><Plus size={18} /></button></div>
          {projects.map((project, index) => {
            const open = expanded === project.id;
            return <section className="project-input" key={project.id}>
              <div className="project-input-heading">
                <button className="project-toggle" type="button" aria-expanded={open} aria-controls={"project-" + project.id} onClick={() => setExpanded(open ? "" : project.id)}>
                  <span className="project-number">{String(index + 1).padStart(2, "0")}</span><span>{project.name || "프로젝트명 입력"}</span><ChevronDown size={16} className={open ? "rotated" : ""} />
                </button>
                <button className="icon-button danger" type="button" aria-label={"프로젝트 " + (index + 1) + " 삭제"} title="프로젝트 삭제" disabled={projects.length <= 1} onClick={() => { onChange({ ...value, projects: projects.filter((entry) => entry.id !== project.id) }); if (open) setExpanded(projects.find((entry) => entry.id !== project.id)?.id ?? ""); }}><Trash2 size={16} /></button>
              </div>
              {open && <div id={"project-" + project.id} className="project-fields">
                <label htmlFor={"name-" + project.id}>프로젝트명<input id={"name-" + project.id} maxLength={100} value={project.name} onChange={(event) => updateProject(project.id, "name", event.target.value)} placeholder="예: CareerLens AI" /></label>
                <label htmlFor={"role-" + project.id}>본인 역할<input id={"role-" + project.id} maxLength={500} value={project.contribution} onChange={(event) => updateProject(project.id, "contribution", event.target.value)} placeholder="개인 / 팀 프로젝트, 직접 담당한 범위" /></label>
                <label htmlFor={"description-" + project.id}>문제 · 해결 과정 · 결과<textarea id={"description-" + project.id} rows={5} maxLength={6000} value={project.description} onChange={(event) => updateProject(project.id, "description", event.target.value)} placeholder="어떤 문제를 왜, 어떻게 해결했는지 실제 경험을 입력하세요." /></label>
                <label htmlFor={"url-" + project.id}>프로젝트 URL <span className="optional">선택</span><input id={"url-" + project.id} type="url" maxLength={2048} value={project.url} onChange={(event) => updateProject(project.id, "url", event.target.value)} placeholder="https://" /></label>
              </div>}
            </section>;
          })}
        </div>
        <div className={"character-count" + (length > 12000 ? " invalid" : "")}><span>설명 합계 {length.toLocaleString()} / 12,000자</span><span>{length < 80 ? "최소 80자" : length > 12000 ? "분량을 줄여 주세요" : "입력 가능"}</span></div>
        <label htmlFor="tech-stack">주요 기술 / 도구<input id="tech-stack" maxLength={800} value={value.techStack} onChange={(event) => onChange({ ...value, techStack: event.target.value })} placeholder="직접 사용한 기술과 도구" required /></label>
        <details className="optional-input">
          <summary>채용 공고 · 포트폴리오 주소 <span className="optional">선택</span></summary>
          <div className="form-fields">
            <label htmlFor="portfolio-url">포트폴리오 URL<input id="portfolio-url" type="url" maxLength={2048} value={value.portfolioUrl} onChange={(event) => onChange({ ...value, portfolioUrl: event.target.value })} placeholder="https://" /></label>
            <p className="muted">주소는 참고 정보입니다. 웹페이지와 이미지를 자동으로 읽지 않습니다.</p>
            <label htmlFor="job-description">채용 공고의 요구 역량<textarea id="job-description" rows={4} maxLength={6000} value={value.jobDescription ?? ""} onChange={(event) => onChange({ ...value, jobDescription: event.target.value })} placeholder="주요 업무, 필수 역량, 우대 사항" /></label>
          </div>
        </details>
      </fieldset>
      {error && <p className="notice error" role="alert">{error}</p>}
      <div className="form-actions">
        <button className="button primary full-width" type="submit" disabled={isLoading || length > 12000}>{isLoading ? <><LoaderCircle size={17} className="spin" /> 분석 중</> : <>AI 리뷰 시작 <ArrowRight size={17} /></>}</button>
        {isLoading ? <button className="button secondary full-width" type="button" onClick={onCancel}><X size={16} /> 대기 취소</button> : <div className="form-row">
          <button className="button secondary" type="button" onClick={() => { onChange(JSON.parse(JSON.stringify(demoInput))); setExpanded(demoInput.projects?.[0]?.id ?? ""); setError(""); }}>샘플 입력</button>
          <button className="button secondary" type="button" onClick={onDemo}><Eye size={16} /> 데모 결과</button>
        </div>}
      </div>
      <p className="privacy-note">분석 내용은 OpenAI API로 전송됩니다. 연락처, 주민등록번호, 회사 기밀은 제외하세요. 기록 저장은 별도 선택입니다.</p>
    </form>
  );
}
