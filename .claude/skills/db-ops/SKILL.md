# db-ops — humanaid DB 운영 스킬

## 트리거
- "DB 스키마 추가해줘"
- "테이블 만들어줘"
- "쿼리 최적화해줘"
- "마이그레이션"
- "데이터 확인해줘"

## 실행 패턴
**단일 에이전트 (backend)**: DB 작업은 backend 에이전트가 단독 처리.

---

## Phase 1: 현황 파악

`server.js`의 `initDB()` 함수에서 현재 테이블 목록 확인:
- users, session, newsletter_subscribers, scraps, likes, applications, event_registrations, note_submissions

## Phase 2: 스키마 변경

### 신규 테이블 추가
`initDB()` 내부에 `CREATE TABLE IF NOT EXISTS` 블록 추가.
멱등성 보장 (`IF NOT EXISTS`).

### 컬럼 추가 (ALTER TABLE)
```javascript
// initDB() 에 추가 — 이미 있으면 무시되도록
await pool.query(`
  ALTER TABLE table_name ADD COLUMN IF NOT EXISTS
  new_column VARCHAR(255) DEFAULT NULL
`).catch(() => {}); // PostgreSQL 구버전 호환
```

### 인덱스 추가
```javascript
await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name)
`);
```

## Phase 3: 마이그레이션 안전 수칙

1. **컬럼 삭제 금지** — 대신 nullable로 변경 후 코드에서 무시
2. **NOT NULL 컬럼 추가 시** — DEFAULT 값 반드시 지정
3. **외래키 추가 시** — 기존 데이터 정합성 먼저 확인
4. **initDB() 는 서버 시작마다 실행** — 멱등적으로 설계

## Phase 4: 유용한 관리 쿼리

```sql
-- 뉴스레터 구독자 현황
SELECT COUNT(*) AS total, 
       SUM(CASE WHEN marketing_agreed THEN 1 ELSE 0 END) AS marketing
FROM newsletter_subscribers;

-- 최근 신청자 목록
SELECT name, email, field, created_at FROM applications 
ORDER BY created_at DESC LIMIT 20;

-- 스크랩 많은 아티클
SELECT item_key, item_title, COUNT(*) AS scrap_count 
FROM scraps GROUP BY item_key, item_title 
ORDER BY scrap_count DESC LIMIT 10;

-- 이벤트별 신청자 수
SELECT event_name, COUNT(*) AS count 
FROM event_registrations GROUP BY event_name;

-- 일별 회원가입 추이
SELECT DATE(created_at) AS date, COUNT(*) AS signups 
FROM users GROUP BY DATE(created_at) ORDER BY date DESC;
```

## Phase 5: 백업 및 복구

Replit PostgreSQL은 자동 백업 지원.
수동 덤프:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```
