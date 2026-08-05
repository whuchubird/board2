const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'board-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.content, p.created_at, u.username AS author
       FROM Board2 p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );

    res.render('index', { posts: result.rows });
  } catch (err) {
    next(err);
  }
});

app.use('/', authRoutes);
app.use('/', postRoutes);

app.use((req, res) => {
  res.status(404).render('error', { message: '페이지를 찾을 수 없습니다.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { message: err.message || '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`Board app listening on http://localhost:${PORT}`);
});
