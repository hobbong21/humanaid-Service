const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      nickname VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS session (
      sid VARCHAR NOT NULL COLLATE "default",
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL
    )
  `);
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'session' AND indexname = 'session_pkey') THEN
        ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
      END IF;
    END $$;
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      marketing_agreed BOOLEAN DEFAULT FALSE,
      builder_agreed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scraps (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_type VARCHAR(50) NOT NULL,
      item_key VARCHAR(255) NOT NULL,
      item_title TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, item_type, item_key)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_key VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, item_key)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      field VARCHAR(255),
      project TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id SERIAL PRIMARY KEY,
      event_name VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS note_submissions (
      id SERIAL PRIMARY KEY,
      author_name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('DB 초기화 완료');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new pgSession({ pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET || 'humanaid-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure: false }
}));

/* ─── AUTH ─── */

app.post('/api/auth/register', async (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password) return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
  if (password.length < 6) return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname',
      [email, passwordHash, nickname || email.split('@')[0]]
    );
    const user = result.rows[0];
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userNickname = user.nickname;
    res.json({ success: true, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (err) {
    console.error('회원가입 오류:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userNickname = user.nickname || user.email.split('@')[0];
    res.json({ success: true, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (err) {
    console.error('로그인 오류:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: '로그아웃 실패' });
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, user: { id: req.session.userId, email: req.session.userEmail, nickname: req.session.userNickname } });
  } else {
    res.json({ loggedIn: false });
  }
});

/* ─── NEWSLETTER ─── */

app.post('/api/newsletter', async (req, res) => {
  const { email, marketing, builder } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: '올바른 이메일을 입력해주세요.' });
  try {
    await pool.query(
      `INSERT INTO newsletter_subscribers (email, marketing_agreed, builder_agreed)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET marketing_agreed = $2, builder_agreed = $3`,
      [email, !!marketing, !!builder]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('뉴스레터 오류:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

/* ─── SCRAP ─── */

app.post('/api/scrap', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: '로그인이 필요합니다.', needLogin: true });
  const { itemType, itemKey, itemTitle } = req.body;
  try {
    const existing = await pool.query(
      'SELECT id FROM scraps WHERE user_id=$1 AND item_type=$2 AND item_key=$3',
      [req.session.userId, itemType, itemKey]
    );
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM scraps WHERE id=$1', [existing.rows[0].id]);
      return res.json({ success: true, scraped: false });
    }
    await pool.query(
      'INSERT INTO scraps (user_id, item_type, item_key, item_title) VALUES ($1,$2,$3,$4)',
      [req.session.userId, itemType, itemKey, itemTitle]
    );
    res.json({ success: true, scraped: true });
  } catch (err) {
    console.error('스크랩 오류:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.get('/api/scraps', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: '로그인이 필요합니다.' });
  try {
    const result = await pool.query('SELECT * FROM scraps WHERE user_id=$1 ORDER BY created_at DESC', [req.session.userId]);
    res.json({ scraps: result.rows });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

/* ─── LIKE ─── */

app.post('/api/like', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: '로그인이 필요합니다.', needLogin: true });
  const { itemKey } = req.body;
  try {
    const existing = await pool.query('SELECT id FROM likes WHERE user_id=$1 AND item_key=$2', [req.session.userId, itemKey]);
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM likes WHERE id=$1', [existing.rows[0].id]);
      return res.json({ success: true, liked: false });
    }
    await pool.query('INSERT INTO likes (user_id, item_key) VALUES ($1,$2)', [req.session.userId, itemKey]);
    res.json({ success: true, liked: true });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

/* ─── APPLICATION ─── */

app.post('/api/apply', async (req, res) => {
  const { name, email, field, project } = req.body;
  if (!name || !email) return res.status(400).json({ error: '이름과 이메일을 입력해주세요.' });
  try {
    await pool.query(
      'INSERT INTO applications (name, email, field, project) VALUES ($1,$2,$3,$4)',
      [name, email, field, project]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('신청 오류:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

/* ─── EVENT REGISTRATION ─── */

app.post('/api/event-register', async (req, res) => {
  const { eventName, name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: '이름과 이메일을 입력해주세요.' });
  try {
    await pool.query(
      'INSERT INTO event_registrations (event_name, name, email) VALUES ($1,$2,$3)',
      [eventName, name, email]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

/* ─── NOTE SUBMIT ─── */

app.post('/api/note-submit', async (req, res) => {
  const { authorName, location, content } = req.body;
  if (!authorName || !content) return res.status(400).json({ error: '이름과 내용을 입력해주세요.' });
  try {
    await pool.query(
      'INSERT INTO note_submissions (author_name, location, content) VALUES ($1,$2,$3)',
      [authorName, location, content]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

/* ─── ADMIN ─── */

const ADMIN_KEY = process.env.ADMIN_KEY || 'humanaid-admin-2026';

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: '관리자 권한이 없습니다.' });
  next();
}

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const [users, subscribers, scraps, applications, events, notes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM newsletter_subscribers'),
      pool.query('SELECT COUNT(*) FROM scraps'),
      pool.query('SELECT COUNT(*) FROM applications'),
      pool.query('SELECT COUNT(*) FROM event_registrations'),
      pool.query('SELECT COUNT(*) FROM note_submissions'),
    ]);
    res.json({
      users: parseInt(users.rows[0].count),
      subscribers: parseInt(subscribers.rows[0].count),
      scraps: parseInt(scraps.rows[0].count),
      applications: parseInt(applications.rows[0].count),
      events: parseInt(events.rows[0].count),
      notes: parseInt(notes.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

app.get('/api/admin/subscribers', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, marketing_agreed, builder_agreed, created_at FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 100');
    res.json({ subscribers: result.rows });
  } catch (err) { res.status(500).json({ error: '서버 오류' }); }
});

app.get('/api/admin/applications', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, field, project, created_at FROM applications ORDER BY created_at DESC LIMIT 100');
    res.json({ applications: result.rows });
  } catch (err) { res.status(500).json({ error: '서버 오류' }); }
});

app.get('/api/admin/events', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, event_name, name, email, created_at FROM event_registrations ORDER BY created_at DESC LIMIT 100');
    res.json({ events: result.rows });
  } catch (err) { res.status(500).json({ error: '서버 오류' }); }
});

app.get('/api/admin/notes', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, author_name, location, content, created_at FROM note_submissions ORDER BY created_at DESC LIMIT 100');
    res.json({ notes: result.rows });
  } catch (err) { res.status(500).json({ error: '서버 오류' }); }
});

/* ─── SEARCH ─── */

const ARTICLES = [
  { key: 'ar-1', type: 'article', title: 'AI 모델 추론 비용 분석: GPU 시간이 사라지는 30%', category: 'AI 인프라', author: '심윤경', summary: '국내 5개 AI 스타트업의 GPU 사용량 데이터 4개월치를 분석했다. 추론 요청부터 응답까지의 평균 거리는 1.6초.', min: 7, page: 'index.html' },
  { key: 'ar-2', type: 'article', title: '휴머노이드 로봇의 두 번째 겨울, 시민 로봇 1년 보고서', category: '로보틱스', author: '박하늘', summary: '피규어AI와 옵티머스가 가정에 들어온 지 1년. 보스턴에서 4년째 활동 중인 연구자가 정리한 일반 가정 베타 테스트의 1년.', min: 12, page: 'index.html' },
  { key: 'ar-3', type: 'article', title: '실리콘밸리에서 만난 한국인 AI 엔지니어 12인의 기록', category: 'AI', author: '정도훈', summary: '팰로앨토 OpenAI 본사 인근에서 한 달, 시니어 리서처·MLOps·인프라 엔지니어 12인의 일과를 따라갔다.', min: 9, page: 'index.html' },
  { key: 'ar-4', type: 'article', title: 'AI 모델 평가 지표 다시 짚기: MMLU, HumanEval, MMMU의 의미', category: 'AI 평가', author: '민가람', summary: '주요 LLM 벤치마크가 매달 발표되는 새 모델 발표문의 의미를 다시 짚어본다.', min: 10, page: 'index.html' },
  { key: 'ar-5', type: 'article', title: 'ChatGPT 출시 3년, AI는 우리 일상을 어떻게 바꿨나', category: '트렌드', author: '유리아', summary: '일상 활용도 92%, 그러나 깊이 있는 활용은 17%. 도쿄·서울·교토를 다녀온 실사용 보고.', min: 8, page: 'index.html' },
  { key: 'ar-6', type: 'article', title: '테슬라 옵티머스 v3 출시, 한국 제조업의 대응 매뉴얼', category: '로보틱스', author: '이주연', summary: '자동차·전자·식품 3개 업종의 72시간 대응 매뉴얼을 처음부터 끝까지 풀어본다.', min: 6, page: 'index.html' },
  { key: 'top-1', type: 'article', title: 'AI 코딩 어시스턴트의 진짜 생산성, 한국 개발자 1,200명에게 물었다', category: 'AI', author: 'humanaid 데스크', summary: '한국 개발자 1,200명 대상 생산성 조사 리포트.', min: 9, page: 'index.html' },
  { key: 'top-2', type: 'article', title: '디지털 휴먼이라는 이름, 죽음 이후의 정체성을 추적한 6개월', category: '디지털 휴먼', author: 'humanaid 데스크', summary: '죽음 이후의 정체성을 디지털로 보존하는 6개월간의 추적 보고.', min: 11, page: 'index.html' },
  { key: 'top-3', type: 'article', title: '한국 반도체 산업의 다음 10년, HBM 이후 무엇이 달라져야 하나', category: '반도체', author: '심윤경', summary: 'HBM 이후 한국 반도체 산업의 방향성을 짚는다.', min: 7, page: 'index.html' },
  { key: 'top-4', type: 'article', title: 'AI로 본 글로벌 GPU 공급망의 보틀넥 지도', category: '데이터', author: 'humanaid 데스크', summary: 'AI 반도체 공급망의 보틀넥을 데이터로 시각화한 분석.', min: 6, page: 'index.html' },
  { key: 'col-1', type: 'collection', title: 'AI 엔지니어 필독서 14권', category: '컬렉션', author: '정도훈', summary: 'AI 엔지니어가 반드시 읽어야 할 14권의 책 큐레이션.', min: null, page: 'index.html' },
  { key: 'col-2', type: 'collection', title: '빅테크 인사이드 르포 모아보기', category: '컬렉션', author: '민가람', summary: '구글·메타·애플·MS 내부를 들여다본 르포 시리즈.', min: null, page: 'index.html' },
  { key: 'col-3', type: 'collection', title: '2026 상반기 LLM 핵심 이슈', category: '컬렉션', author: '심윤경', summary: '2026년 상반기를 이끈 대형 언어 모델 주요 이슈 정리.', min: null, page: 'index.html' },
  { key: 'note-1', type: 'note', title: '젠슨 황, 로보틱스 올인 선언', category: '로보틱스', author: '박하늘', summary: 'NVIDIA GTC 현장. 젠슨 황이 2026년 올해 로보틱스 올인을 선언했다.', min: null, page: 'field-notes.html' },
  { key: 'note-2', type: 'note', title: '앤트로픽 내부 문건 유출', category: 'AI', author: '정도훈', summary: '앤트로픽 내부 안전 평가 문건 일부 유출. Claude 4 모델 자율성 평가 기준 포함.', min: null, page: 'field-notes.html' },
  { key: 'note-3', type: 'note', title: 'SK하이닉스 HBM4 샘플 출하', category: '반도체', author: '심윤경', summary: 'SK하이닉스 HBM4 정식 샘플 출하 시작.', min: null, page: 'field-notes.html' },
  { key: 'bh-1', type: 'builder', title: '스타트업 창업자를 위한 AI 법률 세미나', category: '이벤트', author: 'humanaid 데스크', summary: 'AI 스타트업 창업자를 위한 법률 실무 세미나.', min: null, page: 'builder-hub.html' },
  { key: 'bh-2', type: 'builder', title: 'humanaid 빌더 멤버십', category: '멤버십', author: 'humanaid 데스크', summary: 'humanaid 빌더 커뮤니티 멤버십 가입 안내.', min: null, page: 'builder-hub.html' },
];

const TYPE_KR = { article: '아티클', collection: '컬렉션', note: '노트', builder: '빌더' };

app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 1) return res.json({ results: [] });
  const lower = q.toLowerCase();
  const results = ARTICLES.filter(a =>
    a.title.toLowerCase().includes(lower) ||
    (a.category && a.category.toLowerCase().includes(lower)) ||
    (a.author && a.author.toLowerCase().includes(lower)) ||
    (a.summary && a.summary.toLowerCase().includes(lower))
  ).slice(0, 7).map(a => ({
    key: a.key,
    type: a.type,
    typeKr: TYPE_KR[a.type] || a.type,
    title: a.title,
    category: a.category,
    author: a.author,
    min: a.min,
    page: a.page
  }));
  res.json({ results });
});

/* ─── RSS 피드 ─── */
app.get('/rss.xml', (req, res) => {
  const host = req.protocol + '://' + req.get('host');
  const now = new Date().toUTCString();
  const items = ARTICLES.filter(a => a.type === 'article').map(a => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${host}/${a.page || 'index.html'}</link>
      <guid isPermaLink="false">${host}/article/${a.key}</guid>
      <description><![CDATA[${a.summary || ''}]]></description>
      <category>${a.category || ''}</category>
      <author>${a.author || 'humanaid'}</author>
      ${a.min ? `<itunes:duration>${a.min}분</itunes:duration>` : ''}
    </item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>humanaid — AI·반도체·로보틱스 매거진</title>
    <link>${host}</link>
    <description>사람과 AI, 디지털을 잇는 기술 매거진 humanaid의 최신 아티클 피드.</description>
    <language>ko</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${host}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${host}/favicon.ico</url>
      <title>humanaid</title>
      <link>${host}</link>
    </image>${items}
  </channel>
</rss>`;
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.send(xml);
});

/* ─── STATIC FILES ─── */
app.use(express.static(path.join(__dirname)));

app.listen(PORT, '0.0.0.0', async () => {
  await initDB();
  console.log(`humanaid 서버 실행 중: http://0.0.0.0:${PORT}`);
});
