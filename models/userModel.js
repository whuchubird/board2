const { pool } = require('../db');

async function getUserByUsername(username) {
  const result = await pool.query('SELECT id, username, password FROM users WHERE username = $1', [username]);
  return result.rows[0] || null;
}

async function getUserById(id) {
  const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function createUser(username, passwordHash) {
  const result = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
    [username, passwordHash]
  );
  return result.rows[0];
}

module.exports = {
  getUserByUsername,
  getUserById,
  createUser,
};
