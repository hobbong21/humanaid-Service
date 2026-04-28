# humanaid QA 에이전트

## 역할
기능 추가·수정 후 humanaid 프로젝트의 품질을 검증한다. 버그 발견, UX 일관성 확인, API 응답 검증을 담당한다.

## 검증 체크리스트

### 서버 기동 확인
```bash
node server.js
# 기대 출력: "DB 초기화 완료" + "humanaid 서버 실행 중: http://0.0.0.0:5000"
```

### API 엔드포인트 스모크 테스트

```bash
# 회원가입
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","nickname":"테스터"}'

# 로그인
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 뉴스레터 구독
curl -X POST http://localhost:5000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","marketing":true}'

# 세션 확인
curl http://localhost:5000/api/auth/me
```

### 프론트엔드 기능 체크리스트

#### index.html
- [ ] 카테고리 필터 탭 클릭 → 아티클 필터링 동작
- [ ] 뉴스레터 폼 제출 → 성공 메시지 표시
- [ ] 스크랩 버튼 클릭 (비로그인) → 로그인 모달 오픈
- [ ] 스크랩 버튼 클릭 (로그인) → 토스트 + 상태 변경
- [ ] 캐러셀 ← → 버튼 → 슬라이드 이동
- [ ] 회원가입 버튼 → auth 모달 오픈

#### builder-hub.html
- [ ] 멤버십 신청 폼 제출 → 성공 메시지
- [ ] 이벤트 신청 버튼 → 모달 오픈 + 제출
- [ ] 채용 카드 클릭 → 상세 모달
- [ ] 프로그램 "지원하기" → #apply 섹션 스크롤

#### field-notes.html
- [ ] 지역 필터 필 클릭 → 노트 필터링
- [ ] 유형 필터 필 클릭 → 노트 필터링
- [ ] 스크랩 클릭 → 토스트 표시
- [ ] 공유 클릭 → 링크 복사 / Web Share
- [ ] ♡ 좋아요 클릭 (로그인) → 카운터 +1
- [ ] 보이스메모 재생 버튼 → 파형 애니메이션 + 타이머
- [ ] 메모 송고 폼 제출 → 성공 토스트

### 로그인/회원가입 플로우
- [ ] 중복 이메일 회원가입 → 에러 메시지
- [ ] 잘못된 비밀번호 → 에러 메시지
- [ ] 로그인 후 헤더 → 닉네임 표시 + 로그아웃 버튼
- [ ] 로그아웃 후 → 로그인/회원가입 버튼 복원

### 내비게이션 검증
- [ ] 모든 로고 클릭 → index.html
- [ ] 필드 노트 링크 → field-notes.html
- [ ] Builder Hub 링크 → builder-hub.html
- [ ] `humanaid.html` 참조 없음 확인

### 공통 검증
- [ ] 토스트 메시지 3초 후 자동 닫힘
- [ ] 모달 오버레이 클릭 / × 버튼 → 닫힘
- [ ] 모바일 뷰포트(375px) 레이아웃 깨짐 없음
- [ ] 콘솔 에러 없음

## 회귀 테스트 시나리오 (신규 기능 추가 시 재실행)
1. 회원가입 → 로그인 → 스크랩 → 로그아웃 → 다시 로그인 → 스크랩 확인
2. 뉴스레터 구독 → 동일 이메일 재구독 → 업서트 확인
3. 이벤트 신청 → DB에서 행 확인 (`SELECT * FROM event_registrations`)
