# feature-dev — humanaid 기능 개발 스킬

## 트리거
- "새 기능 추가해줘"
- "기능 개발해줘"
- "페이지 만들어줘"
- "API 추가해줘"

## 실행 패턴
**Pipeline**: 요구사항 분석 → 백엔드 API → DB 스키마 → 프론트엔드 UI → 인터랙션 → QA

---

## Phase 1: 요구사항 분석

1. 기능 명세 확인 (오케스트레이터 큐 또는 사용자 입력)
2. 영향 범위 파악:
   - 어느 HTML 페이지에 UI가 추가되는가?
   - 새 DB 테이블이 필요한가?
   - 인증이 필요한 기능인가?
3. 의존성 확인: 기존 API/UI와 충돌 없는지

## Phase 2: 백엔드 (backend 에이전트 위임)

**server.js 수정 순서**:
1. `initDB()` 에 새 테이블 추가 (필요시)
2. 새 API 엔드포인트 추가
3. 에러 핸들링 표준 패턴 준수:
   ```javascript
   try {
     // DB 쿼리
     res.json({ success: true, data: result.rows });
   } catch (err) {
     console.error('기능명 오류:', err);
     res.status(500).json({ error: '서버 오류가 발생했습니다.' });
   }
   ```
4. 인증 미들웨어 패턴:
   ```javascript
   if (!req.session.userId) return res.status(401).json({ error: '로그인이 필요합니다.', needLogin: true });
   ```

## Phase 3: 프론트엔드 (frontend 에이전트 위임)

**HTML 추가 패턴** (새 페이지):
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>페이지명 — humanaid</title>
  <!-- 기존 index.html의 <style> 블록 재사용 또는 링크 -->
</head>
<body>
  <!-- 기존 헤더 구조 복사 -->
  <header>...</header>
  <!-- 콘텐츠 -->
  <script src="/auth.js"></script>
  <script src="/interactions.js"></script>
</body>
</html>
```

**interactions.js 추가 패턴**:
```javascript
function initNewFeature() {
  const el = document.querySelector('.new-feature');
  if (!el) return; // 다른 페이지에서는 조용히 무시
  // 로직
}
// init() 함수 하단에 initNewFeature(); 추가
```

## Phase 4: QA (qa 에이전트 위임)

qa 스킬의 체크리스트 실행. 특히:
- 새 API curl 테스트
- UI 인터랙션 수동 확인
- 콘솔 에러 없음 확인

## Phase 5: 문서화

완료 후:
1. `replit.md` → API 엔드포인트 테이블 업데이트
2. `CLAUDE.md` → 변경 이력 행 추가
3. 오케스트레이터 큐에서 항목 `[x]` 체크

---

## 참조
- `references/patterns.md` — 자주 쓰는 구현 패턴
