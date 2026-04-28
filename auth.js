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
