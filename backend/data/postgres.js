const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the backend.");
}

const pool = new Pool({
  connectionString,
  ssl: process.env.PG_SSL_DISABLE === "true" ? false : { rejectUnauthorized: false },
});

async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
};