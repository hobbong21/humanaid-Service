# humanaid — 하네스 포인터 등록

## 프로젝트 개요
한국어 디지털 기술 매거진. Node.js + Express + PostgreSQL + 정적 HTML3페이지.

## 하네스 트리거 규칙

| 키워드 | 라우팅 대상 |
|--------|-------------|
| "기능 추가", "feature", "새 API" | feature-dev 스킬 → backend/frontend 에이전트 |
| "콘텐츠", "기사", "아티클 수정" | content-ops 스킬 → content 에이전트 |
| "DB", "데이터베이스", "스키마" | db-ops 스킬 → backend 에이전트 |
| "테스트", "QA", "검증" | qa 스킬 → qa 에이전트 |
| "전체 검토", "하네스 감사" | orchestrator → 전체 팀 |

## 에이전트 팀
- `.claude/agents/orchestrator.md` — 감독자(Supervisor) 오케스트레이터
- `.claude/agents/frontend.md` — 프론트엔드 전문 에이전트
- `.claude/agents/backend.md` — 백엔드/DB 전문 에이전트
- `.claude/agents/content.md` — 콘텐츠/UX문구 전문 에이전트
- `.claude/agents/qa.md` — QA·검증 전문 에이전트

## 스킬
- `.claude/skills/feature-dev/` — 기능 개발 워크플로우
- `.claude/skills/content-ops/` — 콘텐츠 운영
- `.claude/skills/db-ops/` — DB 스키마·쿼리 관리
- `.claude/skills/qa/` — 검증 및 테스트

## 변경 이력

| 날짜 | 변경 내용 | 대상 | 사유 |
|------|-----------|------|------|
| 2026-04-28 | 하네스 초기 구성 (Supervisor 패턴) | 전체 | humanaid 프로젝트 자율 업데이트 체계 구축 |
| 2026-04-28 | 다크모드 토글 구현 — interactions.js + localStorage | frontend | 오케스트레이터 큐 #3 자율 실행 |
| 2026-04-28 | 마이페이지 구현 — mypage.html + auth.js 마이페이지 링크 | frontend | 오케스트레이터 큐 #2 자율 실행 |
| 2026-04-28 | 검색 기능 구현 — /api/search + 헤더 검색 UI (드롭다운) | frontend+backend | 오케스트레이터 큐 #1 자율 실행 |
| 2026-04-28 | 관리자 대시보드 — admin.html + /api/admin/* (5개 엔드포인트) | backend+frontend | 오케스트레이터 큐 #4 자율 실행 |
