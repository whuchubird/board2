require("dotenv").config();
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";
const connectionString = process.env.DATABASE_URL;

if (isProduction && !connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required in production.",
  );
}

const pool = new Pool({
  connectionString:
    connectionString || "postgres://postgres:postgres@localhost:5432/board",
  max: Number.parseInt(process.env.DB_POOL_MAX || "10", 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

module.exports = { pool };
