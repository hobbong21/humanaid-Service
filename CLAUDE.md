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
| 2026-04-28 | 무한 스크롤 — IntersectionObserver + 아티클 4개 추가 (7-10) | frontend | 오케스트레이터 큐 #5 자율 실행 |
| 2026-04-28 | 소셜 로그인 UI — Google/GitHub 버튼 플레이스홀더 (auth.js) | frontend | 오케스트레이터 큐 #6 자율 실행 |
| 2026-04-28 | 위치 자동완성 — field-notes.html 위치 입력 드롭다운 (26개 도시) | frontend | 오케스트레이터 큐 #7 자율 실행 |
| 2026-04-28 | 이벤트 캘린더 뷰 — builder-hub.html LIST/CAL 토글 + 3개월 그리드 | frontend | 오케스트레이터 큐 #8 자율 실행 |
| 2026-04-28 | 읽기 진행 바 — 전 페이지 상단 3px 스크롤 프로그레스 바 | frontend | 오케스트레이터 큐 #9 자율 실행 |
| 2026-04-28 | 맨 위로 버튼 — 스크롤 300px 후 우하단 플로팅 버튼 | frontend | 오케스트레이터 큐 #10 자율 실행 |
| 2026-04-28 | 아티클 공유 버튼 — 링크 복사 버튼 (클립보드 API) | frontend | 오케스트레이터 큐 #11 자율 실행 |
| 2026-04-28 | 숫자 카운트업 — builder-hub·field-notes 통계 IntersectionObserver 애니메이션 | frontend | 오케스트레이터 큐 #12 자율 실행 |
| 2026-04-28 | RSS 피드 — /rss.xml (RSS 2.0, 전체 아티클 + 카테고리·저자) | backend | 오케스트레이터 큐 #13 자율 실행 |
| 2026-04-28 | 모바일 햄버거 메뉴 — 820px 이하 슬라이드 패널 + 다크모드 지원 | frontend | 오케스트레이터 큐 #14 자율 실행 |
| 2026-04-28 | RSS 링크 자동 연결 — 헤더 '매거진 RSS' 링크 → /rss.xml | frontend | 오케스트레이터 큐 #15 자율 실행 |
| 2026-04-28 | SEO 메타 태그 — index/field-notes/builder-hub OG·Twitter·RSS link | frontend | 오케스트레이터 큐 #16 자율 실행 |
| 2026-04-28 | 네트워크 상태 감지 — 오프라인/온라인 토스트 알림 | frontend | 오케스트레이터 큐 #17 자율 실행 |
| 2026-04-28 | 접근성 스킵 링크 — Tab키로 '본문으로 바로 가기' 링크 | frontend | 오케스트레이터 큐 #18 자율 실행 |
| 2026-04-28 | 페이지 전환 fade — 링크 클릭 시 0.2s 페이드 아웃 전환 | frontend | 오케스트레이터 큐 #19 자율 실행 |
