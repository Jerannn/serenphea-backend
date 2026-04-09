import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import pg from "pg";
import env from "./config/env.js";

const { Pool } = pg;

const __filePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filePath);

const isProduction = env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log("🚀 Running database migration...");

    const schemaPath = path.join(__dirname, "config", "schema.sql");
    const schemaFile = fs.readFileSync(schemaPath, "utf8");
    await client.query(schemaFile);

    console.log("✅ Database migration completed successfully!");
    console.log("Tables created:");
    schemaFile.split("\n").forEach((line) => {
      if (line.includes("CREATE TABLE IF NOT EXISTS")) {
        const table = line.slice(27).replace("(", "");
        console.log(`  -- ${table}`);
      }
    });
  } catch (error) {
    console.error("❌ Error running migration:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
