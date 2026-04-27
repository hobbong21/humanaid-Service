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

app.post('/api/auth/register', async (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
    }
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
  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
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
    res.json({
      loggedIn: true,
      user: {
        id: req.session.userId,
        email: req.session.userEmail,
        nickname: req.session.userNickname
      }
    });
  } else {
    res.json({ loggedIn: false });
  }
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, '0.0.0.0', async () => {
  await initDB();
  console.log(`humanaid 서버 실행 중: http://0.0.0.0:${PORT}`);
});
