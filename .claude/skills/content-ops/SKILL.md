# content-ops — humanaid 콘텐츠 운영 스킬

## 트리거
- "콘텐츠 추가해줘"
- "아티클 수정해줘"
- "노트 추가해줘"
- "문구 바꿔줘"
- "브랜드 보이스 검토해줘"

## 실행 패턴
**Expert Pool**: content 에이전트가 요청 유형에 따라 HTML 또는 문구 수정 담당.

---

## Phase 1: 콘텐츠 유형 분류

| 요청 | 대상 파일 | 패턴 |
|------|-----------|------|
| 매거진 아티클 | index.html `.article-row` | 아티클 카드 추가 |
| 주간 TOP 리포트 | index.html `.top-card` | 카드 추가/교체 |
| Field Note | field-notes.html `.note` | 노트 추가 |
| Builder 소개 | builder-hub.html `.builder-card` | 카드 추가 |
| 이벤트 | builder-hub.html `.event-row` | 이벤트 행 추가 |
| 채용 공고 | builder-hub.html `.job-card` | 카드 추가 |
| UX 문구 | 해당 HTML 파일 | 인라인 수정 |

## Phase 2: 콘텐츠 작성 규칙

### 아티클 카드 템플릿
```html
<article class="article-row" data-cat="[카테고리]">
  <div class="ar-rank"><span class="badge-new">NEW</span>[번호]</div>
  <div class="ar-body">
    <div class="ar-meta-top">
      <span class="cat">[카테고리]</span>
      <span class="min">[X]분</span>
      <span class="pop">인기</span> <!-- 인기 아티클만 -->
    </div>
    <h3>[제목]</h3>
    <p>[2-3문장 설명. 현장감 있고 밀도 있게.]</p>
    <div class="author-line">
      <div class="av [색상클래스]">[이니셜]</div>
      <span class="nm">[이름] · [역할]</span>
      <span class="scrap">+ 스크랩</span>
    </div>
  </div>
  <div class="ar-thumb pat-[1-7]">
    <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice">
      <rect width="240" height="150" fill="url(#grain)"/>
      <!-- SVG 비주얼 패턴 -->
    </svg>
  </div>
</article>
```

### Field Note 템플릿
```html
<article class="note [urgent|med|kid|water|food]">
  <div class="note-time">
    <div class="t">[HH:MM]</div>
    <div class="tz">KST</div>
  </div>
  <div class="note-card">
    <div class="note-meta">
      <div class="note-author">
        <div class="av [색상]">[이니셜]</div>
        <span class="nm">[이름]</span>
        <span class="role">[역할]</span>
      </div>
      <span class="note-tag [urgent|med|kid|water|food]">[유형]</span>
      <span class="note-loc">[도시/장소]</span>
    </div>
    <div class="note-body">
      <p>[날것의 현장 메모. 정제하지 말 것. 강조는 &lt;strong&gt; 사용.]</p>
    </div>
    <div class="note-actions">
      <a>+ 스크랩</a>
      <a>↗ 공유</a>
      <a>♡ [초기카운트]</a>
    </div>
  </div>
</article>
```

## Phase 3: 브랜드 보이스 검수

콘텐츠 추가 후 content 에이전트가 확인:
- [ ] 동어반복 없이 밀도 있는 서술
- [ ] 카테고리 태그가 기존 목록 내 용어인지
- [ ] 숫자·단위 표기 일관성 (%, K, M 등)
- [ ] 필진 이름·역할이 에이전트 정의와 일치

## Phase 4: QA

qa 에이전트에 위임:
- [ ] 새 아티클의 `.scrap` 버튼 동작
- [ ] 새 노트의 필터 포함 여부
- [ ] 레이아웃 깨짐 없음
