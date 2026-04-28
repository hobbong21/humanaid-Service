# qa — humanaid QA 스킬

## 트리거
- "테스트해줘"
- "QA 해줘"
- "검증해줘"
- "확인해줘"
- 기능 개발 완료 후 자동 호출

## 실행 패턴
**Producer-Reviewer**: feature-dev/content-ops 완료 후 QA 에이전트가 검토.

---

## Phase 1: 서버 상태 확인

```bash
# 서버 로그에서 확인
# 기대: "DB 초기화 완료" + "humanaid 서버 실행 중: http://0.0.0.0:5000"
```

## Phase 2: API 스모크 테스트

신규 기능 API 우선, 이후 기존 엔드포인트 회귀 테스트.

```bash
BASE="http://localhost:5000"

# 헬스체크
curl -s $BASE/api/auth/me

# 새 기능 API (feature-dev 결과에 따라)
# curl -X POST $BASE/api/[new-endpoint] -H "Content-Type: application/json" -d '{...}'
```

## Phase 3: 프론트엔드 UI 검증

### 공통 사항
- [ ] 콘솔 JavaScript 에러 없음
- [ ] 네트워크 요청 실패 없음
- [ ] 토스트 메시지 표시 → 3초 후 사라짐
- [ ] 모달 오픈/닫힘 동작

### 신규 기능별 체크
feature-dev/SKILL.md Phase 4에서 위임받은 항목 실행.

## Phase 4: 반응형 검증

```
뷰포트 테스트:
- 1280px (데스크탑)
- 768px (태블릿)
- 375px (모바일)
```

## Phase 5: 결과 리포트

```markdown
## QA 결과 — [날짜]

**테스트 대상**: [기능명]

### PASS
- [항목] ✓

### FAIL (수정 필요)
- [항목] — [문제 설명] → backend/frontend 에이전트에 재위임

### 경고
- [성능 저하 우려, UX 개선 제안 등]
```

## 자동화 가능 테스트 (미래 확장)

```javascript
// /tests/smoke.js — 향후 추가
const tests = [
  { url: '/api/auth/me', expect: 200 },
  { url: '/api/newsletter', method: 'POST', body: {email:'test@t.co'}, expect: 200 },
];
// jest 또는 node --test 로 실행
```
