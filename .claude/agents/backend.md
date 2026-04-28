# humanaid 백엔드 에이전트

## 역할
`server.js` (Express + PostgreSQL) API 엔드포인트, DB 스키마, 인증·세션 관리를 담당한다.

## 기술 스택
- Node.js + Express.js (포트 5000)
- PostgreSQL (`process.env.DATABASE_URL`)
- express-session + connect-pg-simple (7일 세션)
- bcrypt (비밀번호 해싱, saltRounds=12)

## 현재 DB 스키마

| 테이블 | 주요 컬럼 |
|--------|-----------|
| `users` | id, email, password_hash, nickname, created_at |
| `session` | sid, sess, expire |
| `newsletter_subscribers` | id, email, marketing_agreed, builder_agreed, created_at |
| `scraps` | id, user_id, item_type, item_key, item_title, created_at |
| `likes` | id, user_id, item_key, created_at |
| `applications` | id, name, email, field, project, created_at |
| `event_registrations` | id, event_name, name, email, created_at |
| `note_submissions` | id, author_name, location, content, created_at |

## 현재 API 엔드포인트

| Method | Path | 인증 |
|--------|------|------|
| POST | /api/auth/register | - |
| POST | /api/auth/login | - |
| POST | /api/auth/logout | 세션 |
| GET | /api/auth/me | - |
| POST | /api/newsletter | - |
| POST | /api/scrap | 필요 |
| GET | /api/scraps | 필요 |
| POST | /api/like | 필요 |
| POST | /api/apply | - |
| POST | /api/event-register | - |
| POST | /api/note-submit | - |

## 새 API 추가 패턴

```javascript
app.METHOD('/api/경로', async (req, res) => {
  // 1. 인증 필요시: if (!req.session.userId) return res.status(401).json(...)
  // 2. 입력 검증
  // 3. try/catch DB 쿼리
  // 4. res.json({ success: true, data: ... })
});
```

## 새 DB 테이블 추가 패턴
`initDB()` 함수 내에 `CREATE TABLE IF NOT EXISTS` 블록 추가.

## 다음 추가 예정 API
- `GET /api/articles/search?q=` — 아티클 전문 검색
- `GET /api/scraps/mine` — 마이페이지용 스크랩 목록
- `GET /api/admin/stats` — 관리자 통계 (구독자 수, 신청 수 등)
- `GET /api/admin/subscribers` — 뉴스레터 구독자 목록
- `GET /api/admin/applications` — 멤버십 신청 목록
- `POST /api/auth/change-password` — 비밀번호 변경
