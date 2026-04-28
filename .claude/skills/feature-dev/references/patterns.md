# humanaid 구현 패턴 레퍼런스

## 패턴 1: 로그인 필요 기능 (프론트엔드)

```javascript
async function protectedAction() {
  const res = await fetch('/api/protected', { method: 'POST', ... });
  const data = await res.json();
  if (res.status === 401 && data.needLogin) {
    toast('로그인 후 이용할 수 있습니다.', 'error');
    if (window.haOpenLogin) window.haOpenLogin();
    return;
  }
  // 성공 처리
}
```

## 패턴 2: 토글 상태 (스크랩, 좋아요)

```javascript
// 서버 응답에 toggled 상태 포함
// { success: true, active: true/false }
if (data.active) {
  btn.textContent = '✓ 활성';
  btn.classList.add('active');
  toast('적용되었습니다.', 'success');
} else {
  btn.textContent = '+ 비활성';
  btn.classList.remove('active');
  toast('해제되었습니다.');
}
```

## 패턴 3: 모달 폼 제출

```javascript
const overlay = openModal('haModalId', `
  <h3>제목</h3>
  <div class="ha-gm-err" id="errEl"></div>
  <label>필드</label><input type="text" id="fieldId" />
  <button class="ha-gm-btn" id="submitBtn">제출하기 →</button>
`);
overlay.querySelector('#submitBtn').addEventListener('click', async function() {
  const val = overlay.querySelector('#fieldId').value.trim();
  if (!val) { /* 에러 표시 */ return; }
  this.disabled = true; this.textContent = '처리 중...';
  const res = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field: val })
  });
  // 성공 시 모달 내용 교체
  overlay.querySelector('.ha-gm-content').innerHTML = `<div class="ha-gm-success">완료 ✓</div>`;
});
```

## 패턴 4: 새 DB 테이블

```javascript
// initDB() 내부에 추가
await pool.query(`
  CREATE TABLE IF NOT EXISTS new_table (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )
`);
```

## 패턴 5: 검색 API

```javascript
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ results: [] });
  // 정적 데이터 검색 (DB에 아티클 없으므로 인메모리 배열 또는 미래 DB 전환)
  const articles = [ /* 아티클 데이터 */ ];
  const results = articles.filter(a =>
    a.title.includes(q) || a.category.includes(q) || a.author.includes(q)
  );
  res.json({ results });
});
```

## 패턴 6: 무한 스크롤

```javascript
function initInfiniteScroll() {
  const list = document.querySelector('.article-list');
  if (!list) return;
  let page = 1;
  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting) {
      page++;
      const res = await fetch(`/api/articles?page=${page}`);
      const data = await res.json();
      // 새 아티클 HTML을 list에 append
    }
  });
  const sentinel = document.createElement('div');
  list.appendChild(sentinel);
  observer.observe(sentinel);
}
```
