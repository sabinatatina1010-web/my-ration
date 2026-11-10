import { Client } from "pg";

const adminUrl =
  "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";

const client = new Client({ connectionString: adminUrl });

await client.connect();

const existing = await client.query(
  "SELECT 1 FROM pg_database WHERE datname = $1",
  ["my_ration"],
);

if (existing.rowCount === 0) {
  await client.query("CREATE DATABASE my_ration");
  console.log("CREATED my_ration");
} else {
  console.log("EXISTS my_ration");
}

await client.end();
