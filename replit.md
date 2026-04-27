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
- `server.js` — Express 백엔드 (API + 정적 파일 서빙)
- `auth.js` — 프론트엔드 인증 모달 및 세션 관리

## API 엔드포인트

- `POST /api/auth/register` — 회원가입
- `POST /api/auth/login` — 로그인
- `POST /api/auth/logout` — 로그아웃
- `GET /api/auth/me` — 현재 세션 확인

## 데이터베이스 스키마

- `users` — id, email, password_hash, nickname, created_at
- `session` — connect-pg-simple 세션 저장소

## 실행

```
node server.js
```

서버가 포트 5000에서 정적 파일 서빙과 API를 동시에 처리합니다.

## 배포

autoscale 배포: `node server.js`
