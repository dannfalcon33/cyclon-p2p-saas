import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL no está configurada.");
  process.exit(1);
}

async function resetDatabase() {
  console.log("=========================================================");
  console.log("⚠️ REINICIANDO BASE DE DATOS (DROP & RECREATE SCHEMA) ⚠️");
  console.log("=========================================================\n");

  const sql = neon(connectionString!);
  console.log("-> Ejecutando DROP SCHEMA public CASCADE...");
  await sql`DROP SCHEMA public CASCADE;`;
  console.log("-> Ejecutando CREATE SCHEMA public...");
  await sql`CREATE SCHEMA public;`;
  console.log("-> Restaurando permisos en SCHEMA public...");
  await sql`GRANT ALL ON SCHEMA public TO public;`;
  console.log("\n✅ Esquema public reiniciado completamente en limpio.\n");
}

resetDatabase().catch((err) => {
  console.error("❌ Error reiniciando DB:", err);
  process.exit(1);
});
