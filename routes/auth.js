const express = require('express');
const bcrypt = require('bcrypt');
const { getUserByUsername, createUser } = require('../models/userModel');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', async (req, res, next) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
      return res.render('register', { error: '모든 필드를 입력하세요.' });
    }

    if (password !== confirmPassword) {
      return res.render('register', { error: '비밀번호가 일치하지 않습니다.' });
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.render('register', { error: '이미 존재하는 사용자입니다.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(username, passwordHash);
    req.session.user = { id: user.id, username: user.username };
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);

    if (!user) {
      return res.render('login', { error: '사용자를 찾을 수 없습니다.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render('login', { error: '비밀번호가 올바르지 않습니다.' });
    }

    req.session.user = { id: user.id, username: user.username };
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
