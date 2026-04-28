(function () {
  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     TOAST 알림
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  const toastStyle = document.createElement('style');
  toastStyle.textContent = `
    #ha-toast {
      position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(80px);
      background: #111; color: #fff; padding: 12px 22px; border-radius: 6px;
      font-family: 'Noto Sans KR', sans-serif; font-size: 14px; font-weight: 500;
      z-index: 99999; transition: transform .3s ease, opacity .3s ease; opacity: 0;
      box-shadow: 0 8px 24px rgba(0,0,0,.25); white-space: nowrap;
    }
    #ha-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
    #ha-toast.success { background: #1F3A2E; }
    #ha-toast.error { background: #B8412A; }

    /* ── 모달 공통 ── */
    .ha-generic-overlay {
      display: none; position: fixed; inset: 0; z-index: 8000;
      background: rgba(0,0,0,.45); align-items: center; justify-content: center;
    }
    .ha-generic-overlay.open { display: flex; }
    .ha-generic-modal {
      background: #fff; border-radius: 8px; width: 100%; max-width: 440px;
      padding: 36px 32px; position: relative; box-shadow: 0 8px 40px rgba(0,0,0,.18);
      font-family: 'Noto Sans KR', sans-serif; max-height: 90vh; overflow-y: auto;
    }
    .ha-generic-modal h3 {
      font-family: 'Noto Serif KR', serif; font-size: 20px; font-weight: 700;
      margin: 0 0 20px; color: #111; letter-spacing: -0.03em;
    }
    .ha-generic-modal label { display: block; font-size: 12px; font-weight: 500; color: #555; margin-bottom: 5px; }
    .ha-generic-modal input, .ha-generic-modal select, .ha-generic-modal textarea {
      display: block; width: 100%; padding: 10px 13px; font-size: 14px;
      border: 1px solid #ddd; border-radius: 5px; margin-bottom: 14px;
      font-family: 'Noto Sans KR', sans-serif; outline: none; transition: border-color .15s;
      background: #fff; color: #111;
    }
    .ha-generic-modal input:focus, .ha-generic-modal select:focus, .ha-generic-modal textarea:focus { border-color: #B8412A; }
    .ha-generic-modal textarea { min-height: 80px; resize: vertical; }
    .ha-generic-modal .ha-gm-btn {
      width: 100%; padding: 13px; font-size: 15px; font-weight: 600;
      background: #111; color: #fff; border: none; border-radius: 5px; cursor: pointer;
      font-family: 'Noto Sans KR', sans-serif; transition: background .15s;
    }
    .ha-generic-modal .ha-gm-btn:hover { background: #B8412A; }
    .ha-generic-modal .ha-gm-close {
      position: absolute; top: 14px; right: 18px; background: none; border: none;
      font-size: 22px; color: #999; cursor: pointer; line-height: 1;
    }
    .ha-generic-modal .ha-gm-close:hover { color: #111; }
    .ha-generic-modal .ha-gm-err { font-size: 13px; color: #B8412A; margin-bottom: 12px; display: none; }
    .ha-generic-modal .ha-gm-success {
      text-align: center; padding: 24px 0 8px;
      font-family: 'Noto Serif KR', serif; font-size: 18px; font-weight: 700;
      color: #1F3A2E; line-height: 1.6;
    }

    /* ── 스크랩 활성화 ── */
    .scrap.active, .note-actions a.scrap-active { color: #B8412A !important; font-weight: 700 !important; }

    /* ── 좋아요 활성화 ── */
    .note-actions a.liked { color: #B8412A !important; }

    /* ── 보이스메모 재생 중 ── */
    .voice-memo.playing .play::after { content: "⏸"; }
    .voice-memo.playing .wave span { animation: waveAnim 0.6s ease-in-out infinite alternate; }
    @keyframes waveAnim { from { opacity: .3; } to { opacity: 1; } }
    .voice-memo.playing .wave span:nth-child(odd) { animation-delay: .1s; }
    .voice-memo.playing .wave span:nth-child(3n) { animation-delay: .2s; }

    /* ── 카테고리 필터 ── */
    .article-row.hidden, .top-card.hidden { display: none !important; }
  `;
  document.head.appendChild(toastStyle);

  let toastTimer;
  function toast(msg, type = '') {
    let el = document.getElementById('ha-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ha-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = type ? `show ${type}` : 'show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = el.className.replace('show', '').trim(); }, 3000);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     범용 모달 생성
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function createModal(id) {
    const existing = document.getElementById(id);
    if (existing) return existing;
    const overlay = document.createElement('div');
    overlay.className = 'ha-generic-overlay';
    overlay.id = id;
    overlay.innerHTML = `<div class="ha-generic-modal"><button class="ha-gm-close">×</button><div class="ha-gm-content"></div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.ha-gm-close').addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
    return overlay;
  }

  function openModal(id, htmlContent) {
    const overlay = createModal(id);
    overlay.querySelector('.ha-gm-content').innerHTML = htmlContent;
    overlay.classList.add('open');
    return overlay;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     index.html: 카테고리 필터
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initCategoryFilter() {
    const catLinks = document.querySelectorAll('.cats a');
    if (!catLinks.length) return;

    catLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        catLinks.forEach(l => l.classList.remove('on'));
        this.classList.add('on');
        const selected = this.textContent.trim();
        const rows = document.querySelectorAll('.article-row');
        const cards = document.querySelectorAll('.top-card');

        rows.forEach(row => {
          if (selected === '최신') {
            row.classList.remove('hidden');
          } else {
            const cat = row.querySelector('.cat');
            const text = cat ? cat.textContent.trim() : '';
            const match = text.includes(selected) || selected.includes(text.split(' ')[0]);
            row.classList.toggle('hidden', !match);
          }
        });

        cards.forEach(card => {
          if (selected === '최신') {
            card.classList.remove('hidden');
          } else {
            const cat = card.querySelector('.cat');
            const text = cat ? cat.textContent.trim() : '';
            const match = text.includes(selected) || selected.includes(text.split(' ')[0]);
            card.classList.toggle('hidden', !match);
          }
        });
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     index.html: 뉴스레터 구독 폼
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initNewsletter() {
    const form = document.querySelector('.nl-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const emailInput = form.querySelector('input[type=email]');
      const checks = form.querySelectorAll('input[type=checkbox]');
      const btn = form.querySelector('button');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) return toast('이메일을 입력해주세요.', 'error');
      const privacy = checks[0] && checks[0].checked;
      if (!privacy) return toast('개인정보 수집·이용에 동의해주세요.', 'error');
      btn.disabled = true;
      btn.textContent = '처리 중...';
      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, marketing: checks[1] && checks[1].checked, builder: checks[2] && checks[2].checked })
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || '오류가 발생했습니다.', 'error'); btn.disabled = false; btn.textContent = '무료로 구독하기 →'; return; }
        form.innerHTML = `<div class="ha-gm-success" style="color:#C98A2B;font-family:'Noto Serif KR',serif;font-size:18px;font-weight:700;text-align:center;padding:32px 0;">구독 완료 ✓<br><span style="font-size:14px;color:rgba(255,255,255,.7);font-family:'Noto Sans KR',sans-serif;font-weight:300;display:block;margin-top:10px;">매주 금요일 아침에 찾아뵐게요.</span></div>`;
      } catch { toast('네트워크 오류가 발생했습니다.', 'error'); btn.disabled = false; btn.textContent = '무료로 구독하기 →'; }
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     index.html: 스크랩 버튼
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initScrapButtons() {
    document.querySelectorAll('.scrap').forEach((el, idx) => {
      el.addEventListener('click', async function (e) {
        e.preventDefault();
        const row = this.closest('.article-row, .note-card, article');
        const title = row ? (row.querySelector('h3, h4, .note-body p')?.textContent?.trim()?.slice(0, 80) || '') : '';
        const key = `article_${idx}`;
        try {
          const res = await fetch('/api/scrap', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemType: 'article', itemKey: key, itemTitle: title })
          });
          const data = await res.json();
          if (res.status === 401 && data.needLogin) {
            toast('로그인 후 스크랩할 수 있습니다.', 'error');
            if (window.haOpenLogin) window.haOpenLogin();
            return;
          }
          if (data.scraped) { this.textContent = '✓ 스크랩됨'; this.classList.add('active'); toast('스크랩되었습니다.', 'success'); }
          else { this.textContent = '+ 스크랩'; this.classList.remove('active'); toast('스크랩이 해제되었습니다.'); }
        } catch { toast('오류가 발생했습니다.', 'error'); }
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     index.html: 캐러셀 네비게이션
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initCarousel() {
    const grid = document.querySelector('.carousel-grid');
    if (!grid) return;
    const btns = document.querySelectorAll('.car-nav button');
    if (!btns.length) return;
    const cardWidth = 220;
    let offset = 0;
    const maxOffset = () => Math.max(0, grid.scrollWidth - grid.parentElement.clientWidth);
    btns[0].addEventListener('click', () => { offset = Math.max(0, offset - cardWidth * 2); grid.style.transform = `translateX(-${offset}px)`; grid.style.transition = 'transform .3s ease'; });
    btns[1].addEventListener('click', () => { offset = Math.min(maxOffset(), offset + cardWidth * 2); grid.style.transform = `translateX(-${offset}px)`; grid.style.transition = 'transform .3s ease'; });
    grid.style.display = 'flex';
    grid.style.gap = '18px';
    grid.style.overflow = 'visible';
    grid.style.width = 'max-content';
    if (grid.parentElement) { grid.parentElement.style.overflow = 'hidden'; }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     builder-hub.html: 멤버십 신청 폼
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initApplyForm() {
    const form = document.querySelector('.apply-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const inputs = form.querySelectorAll('input, select, textarea');
      const name = inputs[0]?.value.trim();
      const email = inputs[1]?.value.trim();
      const field = inputs[2]?.value;
      const project = inputs[3]?.value.trim();
      const btn = form.querySelector('button');
      if (!name || !email) return toast('이름과 이메일을 입력해주세요.', 'error');
      btn.disabled = true; btn.textContent = '처리 중...';
      try {
        const res = await fetch('/api/apply', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, field, project })
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || '오류가 발생했습니다.', 'error'); btn.disabled = false; btn.textContent = '신청서 보내기 →'; return; }
        form.innerHTML = `<div style="text-align:center;padding:40px 20px;">
          <div style="font-family:'Noto Serif KR',serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:14px;">신청이 완료되었습니다 ✓</div>
          <p style="color:rgba(255,255,255,.7);font-size:14px;line-height:1.75;">영업일 기준 5일 이내에 검토 후<br>슬랙 초대장을 보내드립니다.</p>
        </div>`;
      } catch { toast('네트워크 오류가 발생했습니다.', 'error'); btn.disabled = false; btn.textContent = '신청서 보내기 →'; }
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     builder-hub.html: 이벤트 신청 버튼
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initEventButtons() {
    document.querySelectorAll('.event-cta').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const row = this.closest('.event-row');
        const eventName = row ? row.querySelector('h4')?.textContent?.trim() : '이벤트';
        const overlay = openModal('haEventModal', `
          <h3>이벤트 신청</h3>
          <p style="font-size:13.5px;color:#555;margin:-10px 0 18px;line-height:1.65;">${eventName}</p>
          <div class="ha-gm-err" id="evErr"></div>
          <label>이름</label><input type="text" id="evName" placeholder="홍길동" />
          <label>이메일</label><input type="email" id="evEmail" placeholder="your@email.com" />
          <button class="ha-gm-btn" id="evSubmit">신청하기 →</button>
        `);
        const evName = overlay.querySelector('#evName');
        const evEmail = overlay.querySelector('#evEmail');
        const evErr = overlay.querySelector('#evErr');
        overlay.querySelector('#evSubmit').addEventListener('click', async function () {
          evErr.style.display = 'none';
          const n = evName.value.trim(); const em = evEmail.value.trim();
          if (!n || !em) { evErr.textContent = '이름과 이메일을 입력해주세요.'; evErr.style.display = 'block'; return; }
          this.disabled = true; this.textContent = '처리 중...';
          try {
            const res = await fetch('/api/event-register', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ eventName, name: n, email: em })
            });
            const data = await res.json();
            if (!res.ok) { evErr.textContent = data.error || '오류가 발생했습니다.'; evErr.style.display = 'block'; this.disabled = false; this.textContent = '신청하기 →'; return; }
            overlay.querySelector('.ha-gm-content').innerHTML = `<div class="ha-gm-success">신청 완료 ✓<br><span style="font-size:14px;color:#555;font-family:'Noto Sans KR',sans-serif;font-weight:400;display:block;margin-top:10px;">이벤트 전날 안내 메일을 보내드립니다.</span></div>`;
          } catch { evErr.textContent = '네트워크 오류가 발생했습니다.'; evErr.style.display = 'block'; this.disabled = false; this.textContent = '신청하기 →'; }
        });
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     builder-hub.html: 채용 카드 클릭
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initJobCards() {
    document.querySelectorAll('.job-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () {
        const company = this.querySelector('.job-co')?.childNodes[0]?.textContent?.trim() || '';
        const role = this.querySelector('h4')?.textContent?.trim() || '';
        const salary = this.querySelector('.salary')?.textContent?.trim() || '';
        const tags = Array.from(this.querySelectorAll('.job-tags span')).map(s => s.textContent.trim()).join(', ');
        openModal('haJobModal', `
          <h3>${role}</h3>
          <p style="font-size:14px;color:#555;margin:-10px 0 18px;">${company}</p>
          <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px;">
            ${Array.from(this.querySelectorAll('.job-tags span')).map(s => `<span style="background:#F5F5F4;padding:4px 10px;border-radius:4px;font-size:12px;color:#555;">${s.textContent}</span>`).join('')}
          </div>
          <div style="font-size:15px;font-weight:700;color:#B8412A;margin-bottom:20px;">${salary}</div>
          <p style="font-size:13.5px;color:#555;line-height:1.75;margin-bottom:20px;">멤버십 가입 후 상세 연봉 범위 및 담당자 1:1 연락처를 확인할 수 있습니다.</p>
          <button class="ha-gm-btn" onclick="document.getElementById('haJobModal').classList.remove('open'); document.querySelector('#apply') && document.querySelector('#apply').scrollIntoView({behavior:'smooth'});">멤버십 신청하기 →</button>
        `);
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     builder-hub.html: 프로그램 apply 링크
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initProgramApplyLinks() {
    document.querySelectorAll('.prog-card .apply').forEach(link => {
      link.style.cursor = 'pointer';
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const applySection = document.getElementById('apply');
        if (applySection) applySection.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     field-notes.html: 지역/유형 필터 필
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initFieldFilter() {
    const regionPills = document.querySelectorAll('.pill.region');
    const typePills = document.querySelectorAll('.pill:not(.region)');
    if (!regionPills.length && !typePills.length) return;

    const notes = document.querySelectorAll('.note');
    let activeRegion = '전체';
    let activeType = '전체';

    const typeTagMap = {
      '긴급': 'urgent',
      '모델': '모델',
      '하드웨어': '하드웨어',
      '오픈소스': '오픈소스'
    };

    function applyFilter() {
      notes.forEach(note => {
        const loc = note.querySelector('.note-loc')?.textContent?.trim() || '';
        const tag = note.querySelector('.note-tag')?.textContent?.trim() || '';
        const regionOk = activeRegion === '전체' || loc.includes(activeRegion);
        const typeOk = activeType === '전체' || tag.includes(activeType) || note.classList.contains(typeTagMap[activeType] || '');
        note.style.display = (regionOk && typeOk) ? '' : 'none';
      });
    }

    regionPills.forEach(pill => {
      pill.style.cursor = 'pointer';
      pill.addEventListener('click', function () {
        regionPills.forEach(p => p.classList.remove('on'));
        this.classList.add('on');
        activeRegion = this.textContent.trim();
        applyFilter();
      });
    });

    typePills.forEach(pill => {
      pill.style.cursor = 'pointer';
      pill.addEventListener('click', function () {
        typePills.forEach(p => p.classList.remove('on'));
        this.classList.add('on');
        activeType = this.textContent.trim();
        applyFilter();
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     field-notes.html: 노트 액션 (스크랩·공유·좋아요)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initNoteActions() {
    document.querySelectorAll('.note-actions a').forEach((action, idx) => {
      const text = action.textContent.trim();

      if (text.includes('스크랩')) {
        action.style.cursor = 'pointer';
        action.addEventListener('click', async function (e) {
          e.preventDefault();
          const note = this.closest('.note');
          const title = note?.querySelector('.note-body p')?.textContent?.trim()?.slice(0, 80) || '';
          const key = `note_${idx}`;
          try {
            const res = await fetch('/api/scrap', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemType: 'note', itemKey: key, itemTitle: title })
            });
            const data = await res.json();
            if (res.status === 401 && data.needLogin) {
              toast('로그인 후 스크랩할 수 있습니다.', 'error');
              if (window.haOpenLogin) window.haOpenLogin();
              return;
            }
            if (data.scraped) { this.textContent = '✓ 스크랩됨'; this.classList.add('scrap-active'); toast('스크랩되었습니다.', 'success'); }
            else { this.textContent = '+ 스크랩'; this.classList.remove('scrap-active'); toast('스크랩이 해제되었습니다.'); }
          } catch { toast('오류가 발생했습니다.', 'error'); }
        });
      } else if (text.includes('공유')) {
        action.style.cursor = 'pointer';
        action.addEventListener('click', function (e) {
          e.preventDefault();
          const url = window.location.href;
          if (navigator.share) {
            navigator.share({ title: 'humanaid Field Notes', url }).catch(() => {});
          } else if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => toast('링크가 복사되었습니다.', 'success'));
          } else {
            toast('링크: ' + url);
          }
        });
      } else if (text.match(/♡\s*\d+/)) {
        action.style.cursor = 'pointer';
        const origText = action.textContent.trim();
        const countMatch = origText.match(/\d+/);
        let count = countMatch ? parseInt(countMatch[0]) : 0;
        const key = `note_like_${idx}`;
        action.addEventListener('click', async function (e) {
          e.preventDefault();
          try {
            const res = await fetch('/api/like', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemKey: key })
            });
            const data = await res.json();
            if (res.status === 401 && data.needLogin) {
              toast('로그인 후 좋아요를 누를 수 있습니다.', 'error');
              if (window.haOpenLogin) window.haOpenLogin();
              return;
            }
            if (data.liked) { count++; this.classList.add('liked'); toast('좋아요 ♡'); }
            else { count = Math.max(0, count - 1); this.classList.remove('liked'); }
            this.textContent = `♡ ${count}`;
          } catch { toast('오류가 발생했습니다.', 'error'); }
        });
      }
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     field-notes.html: 보이스메모 재생
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initVoiceMemo() {
    document.querySelectorAll('.voice-memo').forEach(memo => {
      const playBtn = memo.querySelector('.play');
      if (!playBtn) return;
      let playing = false;
      let timer = null;
      const durEl = memo.querySelector('.dur');
      const totalMatch = durEl?.textContent?.match(/(\d+):(\d+)/);
      const totalSec = totalMatch ? parseInt(totalMatch[1]) * 60 + parseInt(totalMatch[2]) : 42;
      let elapsed = 0;

      playBtn.addEventListener('click', function () {
        playing = !playing;
        memo.classList.toggle('playing', playing);
        if (playing) {
          timer = setInterval(() => {
            elapsed++;
            if (elapsed >= totalSec) { clearInterval(timer); playing = false; elapsed = 0; memo.classList.remove('playing'); if (durEl) durEl.textContent = `0:${String(totalSec).padStart(2,'0')}`; return; }
            const m = Math.floor(elapsed / 60); const s = elapsed % 60;
            if (durEl) durEl.textContent = `${m}:${String(s).padStart(2,'0')}`;
          }, 1000);
        } else {
          clearInterval(timer);
        }
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     field-notes.html: 노트 제출 폼
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initNoteSubmitForm() {
    const form = document.querySelector('.submit-card');
    if (!form) return;
    const btn = form.querySelector('button');
    if (!btn) return;
    btn.addEventListener('click', async function (e) {
      e.preventDefault();
      const locationInput = form.querySelector('input[type=text]');
      const textarea = form.querySelector('textarea');
      const location = locationInput ? locationInput.value.trim() : '';
      const content = textarea ? textarea.value.trim() : '';
      if (!content) return toast('메모 내용을 입력해주세요.', 'error');
      const authorName = '익명';
      this.disabled = true; this.textContent = '처리 중...';
      try {
        const res = await fetch('/api/note-submit', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorName, location, content })
        });
        const data = await res.json();
        if (!res.ok) { toast(data.error || '오류가 발생했습니다.', 'error'); this.disabled = false; this.textContent = '송고하기 →'; return; }
        toast('메모가 전송되었습니다. 검토 후 게시됩니다.', 'success');
        if (locationInput) locationInput.value = '';
        if (textarea) textarea.value = '';
        this.disabled = false; this.textContent = '송고하기 →';
      } catch { toast('네트워크 오류가 발생했습니다.', 'error'); this.disabled = false; this.textContent = '송고하기 →'; }
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     공통: 페이지 내 앵커 스크롤
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' || href === '#apply' || href === '#programs') {
        if (href === '#' ) return;
        const target = document.querySelector(href);
        if (target) {
          link.addEventListener('click', function (e) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
          });
        }
      }
    });
    const applyBtns = document.querySelectorAll('a.apply-btn[href="#apply"]');
    applyBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const el = document.getElementById('apply');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    });
    const progBtns = document.querySelectorAll('a.secondary-btn[href="#programs"]');
    progBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const el = document.getElementById('programs');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     초기화
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  function init() {
    initCategoryFilter();
    initNewsletter();
    initScrapButtons();
    initCarousel();
    initApplyForm();
    initEventButtons();
    initJobCards();
    initProgramApplyLinks();
    initFieldFilter();
    initNoteActions();
    initVoiceMemo();
    initNoteSubmitForm();
    initAnchorLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
