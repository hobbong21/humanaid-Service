# humanaid

한국어 디지털 매거진 — AI, 반도체, 로보틱스 등 기술 분야를 다룹니다.

## 기술 스택

- **Frontend**: 정적 HTML5 + CSS3 (프레임워크 없음)
- **Backend**: Node.js + Express.js
- **Database**: Replit PostgreSQL (내장)
- **Authentication**: express-session + bcrypt (세션 기반 로그인)
- **Fonts**: Google Fonts (Noto Sans KR, Noto Serif KR, IBM Plex Mono)

## 프로젝트 구조

- `index.html` — 매거진 메인 홈
- `builder-hub.html` — 빌더 허브 섹션
- `field-notes.html` — 필드 노트 섹션
- `mypage.html` — 마이페이지 (스크랩 목록, 활동 내역, 계정 설정)
- `server.js` — Express 백엔드 (API + 정적 파일 서빙)
- `auth.js` — 프론트엔드 인증 모달 및 세션 관리
- `interactions.js` — 전체 페이지 UI 인터랙션 (필터, 폼, 모달, 토스트, 다크모드 등)

## 하네스 시스템 (Harness)

Claude Code 에이전트 팀으로 자율 업데이트를 관리합니다.

- `CLAUDE.md` — 하네스 포인터 등록
- `.claude/agents/orchestrator.md` — Supervisor 오케스트레이터 (업데이트 큐)
- `.claude/agents/frontend.md` — 프론트엔드 전문 에이전트
- `.claude/agents/backend.md` — 백엔드/DB 전문 에이전트
- `.claude/agents/content.md` — 콘텐츠/UX 전문 에이전트
- `.claude/agents/qa.md` — QA 에이전트
- `.claude/skills/` — feature-dev, content-ops, db-ops, qa 스킬

## API 엔드포인트

### 인증
- `POST /api/auth/register` — 회원가입
- `POST /api/auth/login` — 로그인
- `POST /api/auth/logout` — 로그아웃
- `GET /api/auth/me` — 현재 세션 확인

### 기능
- `POST /api/newsletter` — 뉴스레터 구독
- `POST /api/scrap` — 스크랩 토글 (로그인 필요)
- `GET /api/scraps` — 내 스크랩 목록 (로그인 필요)
- `POST /api/like` — 노트 좋아요 토글 (로그인 필요)
- `POST /api/apply` — 빌더 멤버십 신청
- `POST /api/event-register` — 이벤트 신청
- `POST /api/note-submit` — 필드 노트 송고

## 데이터베이스 스키마

- `users` — id, email, password_hash, nickname, created_at
- `session` — connect-pg-simple 세션 저장소
- `newsletter_subscribers` — id, email, marketing_agreed, builder_agreed, created_at
- `scraps` — id, user_id, item_type, item_key, item_title, created_at
- `likes` — id, user_id, item_key, created_at
- `applications` — id, name, email, field, project, created_at
- `event_registrations` — id, event_name, name, email, created_at
- `note_submissions` — id, author_name, location, content, created_at

## 주요 UI 기능

### 공통 (모든 페이지)
- 다크모드 토글 (헤더 ☾/☀ 버튼) — localStorage 상태 유지

### mypage.html
- 로그인 필요 유도 화면
- 스크랩 목록 (타입별 배지, 삭제 기능)
- 활동 내역 탭
- 계정 설정 탭 (이메일, 닉네임, 멤버십)
- 로그인 후 헤더에 "마이페이지" 링크 표시 (auth.js)

### index.html
- 카테고리 필터 탭 (최신/인기/AI/반도체/로보틱스 등) — 아티클 필터링
- 뉴스레터 구독 폼 — DB 저장, 성공 메시지
- 아티클 스크랩 버튼 — 로그인 필요, 토글 상태
- 캐러셀 네비게이션 (←/→) — 슬라이드 이동

### builder-hub.html
- 멤버십 신청 폼 — DB 저장, 성공 메시지
- 이벤트 신청 버튼 — 모달 팝업 + DB 저장
- 채용 카드 클릭 — 상세 모달 표시
- 프로그램 지원 링크 — 신청 폼 섹션으로 스크롤

### field-notes.html
- 지역·유형 필터 필 — 노트 표시/숨김
- 노트 스크랩 — 로그인 필요, 토글
- 노트 공유 버튼 — Web Share API / 링크 복사
- 노트 좋아요 (♡) — 로그인 필요, 카운터 업데이트
- 보이스메모 재생 — 재생/일시정지 + 파형 애니메이션
- 빌더 메모 송고 폼 — DB 저장, 성공 토스트

## 실행

```
node server.js
```

서버가 포트 5000에서 정적 파일 서빙과 API를 동시에 처리합니다.

## 배포

autoscale 배포: `node server.js`
