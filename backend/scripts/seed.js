const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const { query, pool } = require("../data/postgres");

const demoUsers = [
  {
    name: "Alice Company",
    email: "company@demo.com",
    password: "Password123",
    role: "company",
  },
  {
    name: "Evan Employee",
    email: "employee@demo.com",
    password: "Password123",
    role: "employee",
  },
  {
    name: "Paula Personnel",
    email: "personnel@demo.com",
    password: "Password123",
    role: "personnel",
  },
];

async function run() {
  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await query(
      `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email)
      DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
      `,
      [user.name, user.email, passwordHash, user.role]
    );
  }

  console.log("Seed completed.");
}

run()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error.message);
    await pool.end();
    process.exit(1);
  });