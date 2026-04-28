(function () {
  // ---- 모달 CSS 주입 ----
  const style = document.createElement('style');
  style.textContent = `
    .ha-modal-overlay {
      display: none; position: fixed; inset: 0; z-index: 9000;
      background: rgba(0,0,0,.45); align-items: center; justify-content: center;
    }
    .ha-modal-overlay.open { display: flex; }
    .ha-modal {
      background: #fff; border-radius: 8px; width: 100%; max-width: 420px;
      padding: 40px 36px 36px; position: relative; box-shadow: 0 8px 40px rgba(0,0,0,.18);
      font-family: 'Noto Sans KR', sans-serif;
    }
    .ha-modal h2 {
      font-family: 'Noto Serif KR', serif; font-size: 22px; font-weight: 700;
      margin: 0 0 6px; color: #111; letter-spacing: -0.03em;
    }
    .ha-modal .ha-sub { font-size: 13.5px; color: #777; margin: 0 0 28px; }
    .ha-modal label { display: block; font-size: 13px; font-weight: 500; color: #333; margin-bottom: 6px; }
    .ha-modal input {
      display: block; width: 100%; padding: 11px 14px; font-size: 14px;
      border: 1px solid #ddd; border-radius: 5px; margin-bottom: 16px;
      font-family: 'Noto Sans KR', sans-serif; outline: none; transition: border-color .15s;
    }
    .ha-modal input:focus { border-color: #B8412A; }
    .ha-modal .ha-btn {
      width: 100%; padding: 13px; font-size: 15px; font-weight: 600;
      background: #111; color: #fff; border: none; border-radius: 5px; cursor: pointer;
      font-family: 'Noto Sans KR', sans-serif; transition: background .15s;
    }
    .ha-modal .ha-btn:hover { background: #B8412A; }
    .ha-modal .ha-err {
      font-size: 13px; color: #B8412A; margin: -8px 0 14px; display: none;
    }
    .ha-modal .ha-switch {
      text-align: center; font-size: 13.5px; color: #666; margin-top: 20px;
    }
    .ha-modal .ha-switch a { color: #111; font-weight: 600; cursor: pointer; text-decoration: underline; }
    .ha-modal-close {
      position: absolute; top: 16px; right: 18px; background: none; border: none;
      font-size: 22px; color: #999; cursor: pointer; line-height: 1;
    }
    .ha-modal-close:hover { color: #111; }
    .ha-user-menu {
      display: flex; align-items: center; gap: 12px;
    }
    .ha-user-nick {
      font-size: 14px; font-weight: 500; color: #111;
    }
    .ha-logout-btn {
      font-size: 13px; color: #888; cursor: pointer; background: none; border: none;
      font-family: 'Noto Sans KR', sans-serif; padding: 0; text-decoration: underline;
    }
    .ha-logout-btn:hover { color: #B8412A; }
    .ha-mypage-btn {
      font-size: 13px; color: #888; font-weight: 500;
      border: 1px solid #ddd; border-radius: 999px; padding: 5px 12px;
      transition: all .15s;
    }
    .ha-mypage-btn:hover { color: #111; border-color: #999; }
    .ha-social-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0 14px; }
    .ha-social-divider::before,.ha-social-divider::after { content:''; flex:1; height:1px; background:#eee; }
    .ha-social-divider span { font-size: 12px; color: #aaa; white-space: nowrap; font-family: 'Noto Sans KR', sans-serif; }
    .ha-social-btn {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; padding: 11px 14px; margin-bottom: 10px;
      font-size: 14px; font-weight: 500; font-family: 'Noto Sans KR', sans-serif;
      border: 1px solid #ddd; border-radius: 5px; background: #fff;
      cursor: pointer; transition: border-color .15s, background .15s; color: #333;
    }
    .ha-social-btn:hover { border-color: #bbb; background: #f8f8f8; }
    .ha-social-btn svg { flex-shrink: 0; }
  `;
  document.head.appendChild(style);

  // ---- 모달 HTML 주입 ----
  const overlay = document.createElement('div');
  overlay.className = 'ha-modal-overlay';
  overlay.id = 'haAuthOverlay';
  overlay.innerHTML = `
    <div class="ha-modal" id="haModal">
      <button class="ha-modal-close" id="haModalClose">×</button>
      <div id="haLoginView">
        <h2>로그인</h2>
        <p class="ha-sub">humanaid에 오신 것을 환영합니다.</p>
        <div class="ha-err" id="haLoginErr"></div>
        <form id="haLoginForm" onsubmit="return false;">
          <label>이메일</label>
          <input type="email" id="haLoginEmail" placeholder="이메일 주소" autocomplete="email" />
          <label>비밀번호</label>
          <input type="password" id="haLoginPw" placeholder="비밀번호" autocomplete="current-password" />
          <button class="ha-btn" id="haLoginBtn" type="submit">로그인</button>
        </form>
        <div class="ha-social-divider"><span>또는 소셜 계정으로</span></div>
        <button class="ha-social-btn" id="haGoogleLoginBtn" type="button">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/></svg>
          Google로 계속하기
        </button>
        <button class="ha-social-btn" id="haGithubLoginBtn" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12Z"/></svg>
          GitHub로 계속하기
        </button>
        <p class="ha-switch">처음이신가요? <a id="haToSignup">회원가입</a></p>
      </div>
      <div id="haSignupView" style="display:none">
        <h2>회원가입</h2>
        <p class="ha-sub">지금 가입하고 매주 기술 인사이트를 받아보세요.</p>
        <div class="ha-err" id="haSignupErr"></div>
        <form id="haSignupForm" onsubmit="return false;">
          <label>이메일</label>
          <input type="email" id="haSignupEmail" placeholder="이메일 주소" autocomplete="email" />
          <label>닉네임 (선택)</label>
          <input type="text" id="haSignupNick" placeholder="사용할 닉네임" autocomplete="nickname" />
          <label>비밀번호 (6자 이상)</label>
          <input type="password" id="haSignupPw" placeholder="비밀번호" autocomplete="new-password" />
          <button class="ha-btn" id="haSignupBtn" type="submit">회원가입</button>
        </form>
        <div class="ha-social-divider"><span>또는 소셜 계정으로</span></div>
        <button class="ha-social-btn" id="haGoogleSignupBtn" type="button">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/></svg>
          Google로 계속하기
        </button>
        <button class="ha-social-btn" id="haGithubSignupBtn" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12Z"/></svg>
          GitHub로 계속하기
        </button>
        <p class="ha-switch">이미 계정이 있으신가요? <a id="haToLogin">로그인</a></p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ---- 유틸 함수 ----
  function showErr(el, msg) { el.textContent = msg; el.style.display = 'block'; }
  function hideErr(el) { el.style.display = 'none'; }

  function openLogin() {
    document.getElementById('haLoginView').style.display = '';
    document.getElementById('haSignupView').style.display = 'none';
    overlay.classList.add('open');
  }
  function openSignup() {
    document.getElementById('haLoginView').style.display = 'none';
    document.getElementById('haSignupView').style.display = '';
    overlay.classList.add('open');
  }
  function closeModal() { overlay.classList.remove('open'); }

  document.getElementById('haModalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.getElementById('haToSignup').addEventListener('click', openSignup);
  document.getElementById('haToLogin').addEventListener('click', openLogin);

  // ---- 로그인 ----
  document.getElementById('haLoginBtn').addEventListener('click', async function () {
    const email = document.getElementById('haLoginEmail').value.trim();
    const pw = document.getElementById('haLoginPw').value;
    const errEl = document.getElementById('haLoginErr');
    hideErr(errEl);
    if (!email || !pw) return showErr(errEl, '이메일과 비밀번호를 입력해주세요.');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw })
      });
      const data = await res.json();
      if (!res.ok) return showErr(errEl, data.error || '로그인 실패');
      closeModal();
      updateAuthUI(data.user);
    } catch { showErr(errEl, '네트워크 오류가 발생했습니다.'); }
  });

  // ---- 회원가입 ----
  document.getElementById('haSignupBtn').addEventListener('click', async function () {
    const email = document.getElementById('haSignupEmail').value.trim();
    const nick = document.getElementById('haSignupNick').value.trim();
    const pw = document.getElementById('haSignupPw').value;
    const errEl = document.getElementById('haSignupErr');
    hideErr(errEl);
    if (!email || !pw) return showErr(errEl, '이메일과 비밀번호를 입력해주세요.');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nickname: nick, password: pw })
      });
      const data = await res.json();
      if (!res.ok) return showErr(errEl, data.error || '회원가입 실패');
      closeModal();
      updateAuthUI(data.user);
    } catch { showErr(errEl, '네트워크 오류가 발생했습니다.'); }
  });

  // Enter 키 지원
  document.getElementById('haLoginPw').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('haLoginBtn').click();
  });
  document.getElementById('haSignupPw').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('haSignupBtn').click();
  });

  // ---- UI 업데이트 ----
  function updateAuthUI(user) {
    const loginLinks = document.querySelectorAll('.login');
    const signupLinks = document.querySelectorAll('.signup');
    const headerRight = document.querySelector('.header-right');

    loginLinks.forEach(el => el.style.display = 'none');
    signupLinks.forEach(el => el.style.display = 'none');

    const existing = document.getElementById('haUserMenu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.className = 'ha-user-menu';
    menu.id = 'haUserMenu';
    menu.innerHTML = `
      <a href="/mypage.html" class="ha-mypage-btn">마이페이지</a>
      <span class="ha-user-nick">${user.nickname || user.email}</span>
      <button class="ha-logout-btn" id="haLogoutBtn">로그아웃</button>
    `;
    if (headerRight) headerRight.appendChild(menu);

    document.getElementById('haLogoutBtn').addEventListener('click', async function () {
      await fetch('/api/auth/logout', { method: 'POST' });
      location.reload();
    });
  }

  // ---- 로그인 버튼에 이벤트 연결 ----
  function bindAuthButtons() {
    document.querySelectorAll('.login').forEach(el => {
      el.addEventListener('click', function (e) { e.preventDefault(); openLogin(); });
    });
    document.querySelectorAll('.signup').forEach(el => {
      el.addEventListener('click', function (e) { e.preventDefault(); openSignup(); });
    });
    document.querySelectorAll('a.btn').forEach(el => {
      if (el.textContent.includes('회원가입')) {
        el.addEventListener('click', function (e) { e.preventDefault(); openSignup(); });
      }
    });
  }

  // ---- 세션 확인 ----
  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.loggedIn) updateAuthUI(data.user);
      else bindAuthButtons();
    } catch {
      bindAuthButtons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkSession);
  } else {
    checkSession();
  }
})();
