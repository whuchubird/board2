const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const path = require("path");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const { pool } = require("./db");
const { runMigrations } = require("./db/migrate");

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET;

if (isProduction && !sessionSecret) {
  throw new Error(
    "SESSION_SECRET environment variable is required in production.",
  );
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
if (isProduction) {
  app.set("trust proxy", 1);
}
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: new pgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: sessionSecret || "local-development-only-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: isProduction,
    },
  }),
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(503).json({ status: "error" });
  }
});

app.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.content, p.created_at, u.username AS author
       FROM Board2 p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`,
    );

    res.render("index", { posts: result.rows });
  } catch (err) {
    next(err);
  }
});

app.use("/", authRoutes);
app.use("/", postRoutes);

app.use((req, res) => {
  res.status(404).render("error", { message: "페이지를 찾을 수 없습니다." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .render("error", { message: err.message || "서버 오류가 발생했습니다." });
});

async function startServer() {
  await runMigrations();

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Board app listening on port ${PORT}`);
  });

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received. Shutting down gracefully.`);

    server.close(async () => {
      try {
        await pool.end();
        process.exit(0);
      } catch (err) {
        console.error("Error while closing the database pool:", err);
        process.exit(1);
      }
    });

    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Application startup failed:", err);
    pool.end().finally(() => process.exit(1));
  });
}

module.exports = { app, startServer };
