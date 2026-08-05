const { pool } = require("./index");

const MIGRATION_LOCK_ID = 20260805;

async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [MIGRATION_LOCK_ID]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS board2 (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query("COMMIT");
    console.log("Database migrations completed.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigrations()
    .catch((err) => {
      console.error("Database migration failed:", err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { runMigrations };
