const { pool } = require('../db');

async function getAllPosts() {
  const result = await pool.query(
    `SELECT p.id, p.title, p.content, p.created_at, u.username AS author
     FROM Board2 p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
}

async function getPostById(id) {
  const result = await pool.query(
    `SELECT p.id, p.title, p.content, p.created_at, u.username AS author, p.user_id
     FROM Board2 p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function createPost(userId, title, content) {
  const result = await pool.query(
    'INSERT INTO Board2 (user_id, title, content) VALUES ($1, $2, $3) RETURNING id',
    [userId, title, content]
  );
  return result.rows[0];
}

async function updatePost(id, userId, title, content) {
  await pool.query(
    'UPDATE Board2 SET title = $1, content = $2 WHERE id = $3 AND user_id = $4',
    [title, content, id, userId]
  );
}

async function deletePost(id, userId) {
  await pool.query('DELETE FROM Board2 WHERE id = $1 AND user_id = $2', [id, userId]);
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
