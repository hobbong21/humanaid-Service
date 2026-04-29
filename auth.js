(function () {
  const style = document.createElement('style');
  style.textContent = `
    .ha-modal-overlay {
      display: none; position: fixed; inset: 0; z-index: 9000;
      background: rgba(0,0,0,.45); align-items: center; justify-content: center;
    }
    .ha-modal-overlay.open { display: flex; }
    .ha-modal {
      background: #fff; border-radius: 14px; width: 100%; max-width: 420px;
      padding: 40px 36px 36px; position: relative;
      box-shadow: 0 12px 48px rgba(0,0,0,.16);
      font-family: 'Pretendard Variable', 'Pretendard', 'Noto Sans KR', sans-serif;
    }
    .ha-modal h2 {
      font-family: 'Noto Serif KR', serif; font-size: 22px; font-weight: 700;
      margin: 0 0 6px; color: #111; letter-spacing: -0.03em;
    }
    .ha-modal .ha-sub { font-size: 13.5px; color: #777; margin: 0 0 24px; line-height: 1.6; }
    .ha-modal label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; }
    .ha-modal input {
      display: block; width: 100%; padding: 12px 14px; font-size: 14px;
      border: 1.5px solid #E0E0E0; border-radius: 8px; margin-bottom: 14px;
      font-family: 'Pretendard Variable', 'Pretendard', 'Noto Sans KR', sans-serif;
      outline: none; transition: border-color .15s; color: #111;
    }
    .ha-modal input:focus { border-color: #B8412A; }
    .ha-modal .ha-btn {
      width: 100%; padding: 13px; font-size: 15px; font-weight: 700;
      background: #111; color: #fff; border: none; border-radius: 8px; cursor: pointer;
      font-family: 'Pretendard Variable', 'Pretendard', 'Noto Sans KR', sans-serif;
      transition: background .15s; margin-top: 4px;
    }
    .ha-modal .ha-btn:hover { background: #B8412A; }
    .ha-modal .ha-btn:disabled { background: #999; cursor: not-allowed; }
    .ha-modal .ha-err {
      font-size: 13px; color: #B8412A; margin: -4px 0 12px; display: none;
      background: #FFF0EC; border: 1px solid #F5C4B8; border-radius: 6px;
      padding: 8px 12px; line-height: 1.5;
    }
    .ha-modal .ha-ok {
      font-size: 13px; color: #2F855A; margin: -4px 0 12px; display: none;
      background: #F0FFF4; border: 1px solid #B2DFBC; border-radius: 6px;
      padding: 8px 12px; line-height: 1.5;
    }
    .ha-modal .ha-switch {
      text-align: center; font-size: 13.5px; color: #666; margin-top: 20px;
    }
    .ha-modal .ha-switch a { color: #111; font-weight: 600; cursor: pointer; text-decoration: underline; }
    .ha-modal-close {
      position: absolute; top: 14px; right: 16px; background: none; border: none;
      font-size: 24px; color: #bbb; cursor: pointer; line-height: 1; padding: 4px;
      transition: color .12s;
    }
    .ha-modal-close:hover { color: #111; }
    .ha-user-menu {
      display: flex; align-items: center; gap: 10px;
    }
    .ha-user-nick {
      font-size: 13.5px; font-weight: 600; color: #111;
      font-family: 'Pretendard Variable', 'Pretendard', sans-serif;
    }
    .ha-logout-btn {
      font-size: 13px; color: #888; cursor: pointer; background: none; border: none;
      font-family: 'Pretendard Variable', 'Pretendard', 'Noto Sans KR', sans-serif;
      padding: 0; text-decoration: underline; transition: color .12s;
    }
    .ha-logout-btn:hover { color: #B8412A; }
    .ha-mypage-btn {
      font-size: 13px; color: #555; font-weight: 500;
      border: 1.5px solid #E0E0E0; border-radius: 999px; padding: 5px 13px;
      transition: all .15s;
      font-family: 'Pretendard Variable', 'Pretendard', sans-serif;
    }
    .ha-mypage-btn:hover { color: #111; border-color: #999; }
    .ha-social-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0 12px; }
    .ha-social-divider::before,.ha-social-divider::after { content:''; flex:1; height:1px; background:#eee; }
    .ha-social-divider span { font-size: 12px; color: #aaa; white-space: nowrap; }
    .ha-social-btn {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; padding: 11px 14px; margin-bottom: 9px;
      font-size: 14px; font-weight: 500;
      font-family: 'Pretendard Variable', 'Pretendard', 'Noto Sans KR', sans-serif;
      border: 1.5px solid #E0E0E0; border-radius: 8px; background: #fff;
      cursor: pointer; transition: border-color .15s, background .15s; color: #333;
    }
    .ha-social-btn:hover { border-color: #bbb; background: #f8f8f8; }
    .ha-social-btn svg { flex-shrink: 0; }
    .ha-pw-toggle { position: relative; }
    .ha-pw-toggle input { padding-right: 40px; }
    .ha-pw-eye {
      position: absolute; right: 12px; top: 50%; transform: translateY(-60%);
      background: none; border: none; cursor: pointer; color: #aaa; font-size: 16px;
      padding: 0; line-height: 1;
    }
    .ha-pw-eye:hover { color: #555; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'ha-modal-overlay';
  overlay.id = 'haAuthOverlay';
  overlay.innerHTML = `
    <div class="ha-modal" id="haModal">
      <button class="ha-modal-close" id="haModalClose" aria-label="닫기">×</button>

      <!-- 로그인 뷰 -->
      <div id="haLoginView">
        <h2>로그인</h2>
        <p class="ha-sub">humanaid에 오신 것을 환영합니다.</p>
        <div class="ha-err" id="haLoginErr"></div>
        <form id="haLoginForm" autocomplete="on" onsubmit="return false;">
          <label for="haLoginEmail">이메일</label>
          <input type="email" id="haLoginEmail" name="email" placeholder="이메일 주소" autocomplete="email" />
          <label for="haLoginPwField">비밀번호</label>
          <div class="ha-pw-toggle">
            <input type="password" id="haLoginPwField" name="password" placeholder="비밀번호" autocomplete="current-password" />
            <button type="button" class="ha-pw-eye" data-target="haLoginPwField" tabindex="-1">👁</button>
          </div>
          <button class="ha-btn" id="haLoginSubmitBtn" type="submit">로그인</button>
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

      <!-- 회원가입 뷰 -->
      <div id="haSignupView" style="display:none">
        <h2>회원가입</h2>
        <p class="ha-sub">지금 가입하고 매주 기술 인사이트를 받아보세요.</p>
        <div class="ha-err" id="haSignupErr"></div>
        <div class="ha-ok" id="haSignupOk"></div>
        <form id="haSignupForm" autocomplete="on" onsubmit="return false;">
          <label for="haSignupEmail">이메일</label>
          <input type="email" id="haSignupEmail" name="email" placeholder="이메일 주소" autocomplete="email" />
          <label for="haSignupNick">닉네임 <span style="color:#aaa;font-weight:400;">(선택)</span></label>
          <input type="text" id="haSignupNick" name="nickname" placeholder="사용할 닉네임" autocomplete="nickname" />
          <label for="haSignupPwField">비밀번호 <span style="color:#aaa;font-weight:400;">(6자 이상)</span></label>
          <div class="ha-pw-toggle">
            <input type="password" id="haSignupPwField" name="password" placeholder="비밀번호" autocomplete="new-password" />
            <button type="button" class="ha-pw-eye" data-target="haSignupPwField" tabindex="-1">👁</button>
          </div>
          <button class="ha-btn" id="haSignupSubmitBtn" type="submit">회원가입</button>
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

  function showErr(el, msg) { el.textContent = msg; el.style.display = 'block'; }
  function hideErr(el) { el.style.display = 'none'; }
  function showOk(el, msg) { el.textContent = msg; el.style.display = 'block'; }

  function openLogin() {
    document.getElementById('haLoginView').style.display = '';
    document.getElementById('haSignupView').style.display = 'none';
    hideErr(document.getElementById('haLoginErr'));
    overlay.classList.add('open');
    setTimeout(function () {
      var em = document.getElementById('haLoginEmail');
      if (em) em.focus();
    }, 80);
  }
  function openSignup() {
    document.getElementById('haLoginView').style.display = 'none';
    document.getElementById('haSignupView').style.display = '';
    hideErr(document.getElementById('haSignupErr'));
    overlay.classList.add('open');
    setTimeout(function () {
      var em = document.getElementById('haSignupEmail');
      if (em) em.focus();
    }, 80);
  }
  function closeModal() { overlay.classList.remove('open'); }

  window.haOpenLogin = openLogin;
  window.haOpenSignup = openSignup;

  document.getElementById('haModalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.getElementById('haToSignup').addEventListener('click', openSignup);
  document.getElementById('haToLogin').addEventListener('click', openLogin);

  document.querySelectorAll('.ha-pw-eye').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(btn.dataset.target);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁' : '🙈';
    });
  });

  // ---- 로그인 ----
  async function doLogin() {
    var email = document.getElementById('haLoginEmail').value.trim();
    var pw = document.getElementById('haLoginPwField').value;
    var errEl = document.getElementById('haLoginErr');
    var btn = document.getElementById('haLoginSubmitBtn');
    hideErr(errEl);
    if (!email) return showErr(errEl, '이메일을 입력해주세요.');
    if (!pw) return showErr(errEl, '비밀번호를 입력해주세요.');
    btn.disabled = true;
    btn.textContent = '로그인 중…';
    try {
      var res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pw })
      });
      var data = await res.json();
      if (!res.ok) {
        btn.disabled = false;
        btn.textContent = '로그인';
        return showErr(errEl, data.error || '로그인에 실패했습니다.');
      }
      closeModal();
      updateAuthUI(data.user);
      window.dispatchEvent(new CustomEvent('ha-login', { detail: data.user }));
    } catch (e) {
      btn.disabled = false;
      btn.textContent = '로그인';
      showErr(errEl, '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // ---- 회원가입 ----
  async function doSignup() {
    var email = document.getElementById('haSignupEmail').value.trim();
    var nick = document.getElementById('haSignupNick').value.trim();
    var pw = document.getElementById('haSignupPwField').value;
    var errEl = document.getElementById('haSignupErr');
    var okEl = document.getElementById('haSignupOk');
    var btn = document.getElementById('haSignupSubmitBtn');
    hideErr(errEl);
    hideErr(okEl);
    if (!email) return showErr(errEl, '이메일을 입력해주세요.');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return showErr(errEl, '올바른 이메일 형식을 입력해주세요.');
    if (!pw) return showErr(errEl, '비밀번호를 입력해주세요.');
    if (pw.length < 6) return showErr(errEl, '비밀번호는 6자 이상이어야 합니다.');
    btn.disabled = true;
    btn.textContent = '가입 중…';
    try {
      var res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, nickname: nick, password: pw })
      });
      var data = await res.json();
      if (!res.ok) {
        btn.disabled = false;
        btn.textContent = '회원가입';
        return showErr(errEl, data.error || '회원가입에 실패했습니다.');
      }
      closeModal();
      updateAuthUI(data.user);
      window.dispatchEvent(new CustomEvent('ha-login', { detail: data.user }));
    } catch (e) {
      btn.disabled = false;
      btn.textContent = '회원가입';
      showErr(errEl, '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  document.getElementById('haLoginSubmitBtn').addEventListener('click', doLogin);
  document.getElementById('haSignupSubmitBtn').addEventListener('click', doSignup);

  document.getElementById('haLoginPwField').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('haSignupPwField').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doSignup();
  });
  document.getElementById('haLoginEmail').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('haLoginPwField').focus();
  });
  document.getElementById('haSignupEmail').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('haSignupNick').focus();
  });
  document.getElementById('haSignupNick').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('haSignupPwField').focus();
  });

  document.getElementById('haGoogleLoginBtn').addEventListener('click', function () {
    showErr(document.getElementById('haLoginErr'), 'Google 소셜 로그인은 준비 중입니다.');
  });
  document.getElementById('haGithubLoginBtn').addEventListener('click', function () {
    showErr(document.getElementById('haLoginErr'), 'GitHub 소셜 로그인은 준비 중입니다.');
  });
  document.getElementById('haGoogleSignupBtn').addEventListener('click', function () {
    showErr(document.getElementById('haSignupErr'), 'Google 소셜 가입은 준비 중입니다.');
  });
  document.getElementById('haGithubSignupBtn').addEventListener('click', function () {
    showErr(document.getElementById('haSignupErr'), 'GitHub 소셜 가입은 준비 중입니다.');
  });

  // ---- UI 업데이트 (모든 페이지 패턴 통합 처리) ----
  function updateAuthUI(user) {
    var nick = user.nickname || user.email;

    // 패턴 A: .login / .signup 클래스 링크 (index, field-notes, builder-hub, mypage 등)
    document.querySelectorAll('.login, .signup, .btn-login').forEach(function (el) {
      el.style.display = 'none';
    });

    // 패턴 B: #haUserArea / #haUserNick / #haLogoutBtn (community, write 등)
    var userArea = document.getElementById('haUserArea');
    var userNick = document.getElementById('haUserNick');
    var logoutBtn = document.getElementById('haLogoutBtn');

    if (userArea) {
      // 패턴 B: #haUserArea 존재하는 페이지 (community, write 등)
      userArea.style.display = 'flex';
      if (userNick) userNick.textContent = nick;
      if (logoutBtn && !logoutBtn._haLogoutBound) {
        logoutBtn._haLogoutBound = true;
        logoutBtn.addEventListener('click', function () {
          fetch('/api/auth/logout', { method: 'POST' }).then(function () { location.reload(); });
        });
      }
    } else {
      // 패턴 A: .header-right에 유저 메뉴 동적 추가 (index, field-notes, builder-hub 등)
      var headerRight = document.querySelector('.header-right');
      if (headerRight && !document.getElementById('haUserMenu')) {
        var menu = document.createElement('div');
        menu.className = 'ha-user-menu';
        menu.id = 'haUserMenu';
        menu.innerHTML =
          '<a href="/mypage.html" class="ha-mypage-btn">마이페이지</a>' +
          '<span class="ha-user-nick">' + escHtml(nick) + '</span>' +
          '<button class="ha-logout-btn" id="haLogoutMenuBtn">로그아웃</button>';
        headerRight.appendChild(menu);
        document.getElementById('haLogoutMenuBtn').addEventListener('click', function () {
          fetch('/api/auth/logout', { method: 'POST' }).then(function () { location.reload(); });
        });
      }
    }
  }

  function escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---- 로그인 버튼 이벤트 바인딩 ----
  function bindAuthButtons() {
    // .login 클래스 (기존 페이지)
    document.querySelectorAll('a.login, button.login').forEach(function (el) {
      if (!el._haBound) {
        el._haBound = true;
        el.addEventListener('click', function (e) { e.preventDefault(); openLogin(); });
      }
    });
    // .signup 클래스 (기존 페이지)
    document.querySelectorAll('a.signup, button.signup').forEach(function (el) {
      if (!el._haBound) {
        el._haBound = true;
        el.addEventListener('click', function (e) { e.preventDefault(); openSignup(); });
      }
    });
    // .btn-login 클래스 (community, write 등 신규 페이지)
    document.querySelectorAll('.btn-login').forEach(function (el) {
      if (!el._haBound) {
        el._haBound = true;
        el.addEventListener('click', function (e) { e.preventDefault(); openLogin(); });
      }
    });
    // 회원가입 CTA 버튼 (a.btn 텍스트 포함)
    document.querySelectorAll('a.btn, .signup-card .btn').forEach(function (el) {
      if (el.textContent && el.textContent.includes('회원가입') && !el._haBound) {
        el._haBound = true;
        el.addEventListener('click', function (e) { e.preventDefault(); openSignup(); });
      }
    });
    // 뉴스레터 등 "무료로 시작하기" 버튼
    document.querySelectorAll('a.btn').forEach(function (el) {
      if (el.textContent && (el.textContent.includes('시작하기') || el.textContent.includes('구독')) && !el._haBound) {
        el._haBound = true;
        el.addEventListener('click', function (e) { e.preventDefault(); openSignup(); });
      }
    });
  }

  // ---- 세션 확인 ----
  async function checkSession() {
    try {
      var res = await fetch('/api/auth/me');
      var data = await res.json();
      if (data.loggedIn) {
        updateAuthUI(data.user);
      } else {
        bindAuthButtons();
      }
    } catch (e) {
      bindAuthButtons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkSession);
  } else {
    checkSession();
  }
})();
