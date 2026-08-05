const express = require('express');
const {
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require('../models/postModel');

const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

router.get('/posts/new', requireLogin, (req, res) => {
  res.render('new', { error: null });
});

router.post('/posts/new', requireLogin, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.render('new', { error: '제목과 내용을 입력하세요.' });
    }

    await createPost(req.session.user.id, title, content);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

router.get('/posts/:id', async (req, res, next) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).render('error', { message: '게시물을 찾을 수 없습니다.' });
    }
    res.render('post', { post });
  } catch (err) {
    next(err);
  }
});

router.get('/posts/:id/edit', requireLogin, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).render('error', { message: '게시물을 찾을 수 없습니다.' });
    }
    if (post.user_id !== req.session.user.id) {
      return res.status(403).render('error', { message: '권한이 없습니다.' });
    }
    res.render('edit', { post, error: null });
  } catch (err) {
    next(err);
  }
});

router.post('/posts/:id/edit', requireLogin, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      const post = await getPostById(req.params.id);
      return res.render('edit', { post, error: '제목과 내용을 입력하세요.' });
    }

    await updatePost(req.params.id, req.session.user.id, title, content);
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

router.post('/posts/:id/delete', requireLogin, async (req, res, next) => {
  try {
    await deletePost(req.params.id, req.session.user.id);
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
