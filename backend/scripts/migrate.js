const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const { query, pool } = require("../data/postgres");

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations() {
  const result = await query("SELECT filename FROM schema_migrations");
  return new Set(result.rows.map((row) => row.filename));
}

async function run() {
  const migrationsDir = path.join(__dirname, "..", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await query("BEGIN");
    try {
      await query(sql);
      await query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await query("COMMIT");
      console.log(`Applied migration: ${file}`);
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  }
}

run()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Migration failed:", error.message);
    await pool.end();
    process.exit(1);
  });