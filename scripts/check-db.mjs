import "dotenv/config";
import { Client } from "pg";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

console.log("USING_URL", url.replace(/:[^:@/]+@/, ":***@"));

const client = new Client({ connectionString: url });

try {
  await client.connect();
  const result = await client.query(
    "SELECT current_database() AS db, current_user AS \"user\"",
  );
  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  console.log("DB_OK", result.rows[0]);
  console.log(
    "TABLES",
    tables.rows.map((row) => row.table_name),
  );
} catch (error) {
  console.error("DB_ERROR");
  console.error(error);
  process.exit(1);
} finally {
  await client.end();
}
