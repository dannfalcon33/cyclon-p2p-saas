import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function checkNeonConnection() {
  console.log("================================================================================");
  console.log("🔍 DIAGNÓSTICO DE CONEXIÓN CON NEON POSTGRESQL — CYCLON P2P");
  console.log("================================================================================\n");

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log("❌ ESTADO: NO HAY CONEXIÓN CON NEON");
    console.log("--------------------------------------------------------------------------------");
    console.log("Motivo: La variable de entorno 'DATABASE_URL' no está configurada.");
    console.log("No se encontró ningún archivo .env.local con credenciales válidas en la raíz del proyecto.\n");
    console.log("📋 Pasos para conectar tu base de datos Neon:");
    console.log("  1. Inicia sesión en https://console.neon.tech");
    console.log("  2. Crea o selecciona tu proyecto (por ejemplo: 'cyclon-p2p')");
    console.log("  3. Copia la cadena de conexión (Connection String - Pooled o Direct):");
    console.log("     postgresql://<usuario>:<password>@<ep-endpoint>.neon.tech/<dbname>?sslmode=require");
    console.log("  4. Crea el archivo .env.local en la raíz de cyclon-p2p-saas y define:");
    console.log("     DATABASE_URL=tu_cadena_de_conexion_aqui");
    console.log("  5. Ejecuta las migraciones y datos semilla iniciales:");
    console.log("     npm run db:push");
    console.log("     npm run db:seed");
    console.log("     npm run auth:bootstrap-owner");
    console.log("================================================================================\n");
    process.exit(1);
  }

  // Si existe DATABASE_URL, intentar conectar
  try {
    const urlObj = new URL(databaseUrl.replace(/^postgresql:\/\//, "http://"));
    console.log(`🔌 Intentando conectar al host de Neon: ${urlObj.hostname}...`);
    
    const sql = neon(databaseUrl);
    const start = Date.now();
    const result = await sql`SELECT 1 as connected, current_database() as db_name, version() as pg_version;`;
    const elapsed = Date.now() - start;

    console.log("✅ ESTADO: CONEXIÓN EXITOSA CON NEON POSTGRESQL");
    console.log("--------------------------------------------------------------------------------");
    console.log(`  * Host: ${urlObj.hostname}`);
    console.log(`  * Base de datos: ${result[0].db_name}`);
    console.log(`  * Latencia de consulta: ${elapsed} ms`);
    console.log(`  * Versión del motor: ${result[0].pg_version.split(" on ")[0]}`);
    console.log("================================================================================\n");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ ERROR AL CONECTAR CON NEON:");
    console.error(`  ${error.message || error}`);
    console.log("================================================================================\n");
    process.exit(1);
  }
}

checkNeonConnection();
