import { sanitizeExcelFormula, calculateCommissionFee } from "../src/lib/services/commission-engine";
import { PLAN_FEATURES } from "../src/lib/services/plan-service";
import * as fs from "fs";
import * as path from "path";

async function runPhase11QAAudit() {
  console.log("================================================================================");
  console.log("🛡️ BATERÍA DE AUDITORÍA Y QA EXHAUSTIVO — FASE 11 (SEGURIDAD Y CALIDAD)");
  console.log("================================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      if (detail) console.log(`     └─ ${detail}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (detail) console.error(`     └─ Detalle: ${detail}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Sanitización de Fórmulas Maliciosas en Excel / CSV (OWASP CSV Injection)
  // ---------------------------------------------------------------------------
  console.log("1️⃣ Verificando Protección contra Inyección de Fórmulas en Excel (Formula Injection)...");
  
  assert(
    sanitizeExcelFormula("=cmd|'/C calc'!A0") === "'=cmd|'/C calc'!A0",
    "Fórmula iniciada con '=' neutralizada con apóstrofe"
  );
  assert(
    sanitizeExcelFormula("+12345") === "'+12345",
    "Fórmula iniciada con '+' neutralizada"
  );
  assert(
    sanitizeExcelFormula("-5+5") === "'-5+5",
    "Fórmula iniciada con '-' neutralizada"
  );
  assert(
    sanitizeExcelFormula("@SUM(A1:A10)") === "'@SUM(A1:A10)",
    "Fórmula iniciada con '@' neutralizada"
  );
  assert(
    sanitizeExcelFormula("\t=cmd|'/C calc'!A0") === "'=cmd|'/C calc'!A0",
    "Fórmula precedida por tabulación neutralizada"
  );
  assert(
    sanitizeExcelFormula("Texto normal sin fórmula") === "Texto normal sin fórmula",
    "Texto benigno sin alterar"
  );
  assert(
    sanitizeExcelFormula(null) === "",
    "Manejo seguro de valores nulos o indefinidos"
  );

  // ---------------------------------------------------------------------------
  // 2. Motor Matemático de Comisiones por País (Precisión y Redondeo)
  // ---------------------------------------------------------------------------
  console.log("\n2️⃣ Verificando Motor de Cálculo Matemático de Comisiones...");

  // Porcentaje simple: 1000 USDT al 1.5% = 15.00
  const feePct = calculateCommissionFee(1000, 0.015, 0, "percentage");
  assert(feePct === 15.00, "Comisión porcentual pura calculada exactamente (1000 * 1.5% = 15.00)", `Resultado: ${feePct}`);

  // Tarifa fija pura: 5.50
  const feeFixed = calculateCommissionFee(1000, 0, 5.50, "fixed");
  assert(feeFixed === 5.50, "Comisión fija pura aplicada sin distorsión (5.50)", `Resultado: ${feeFixed}`);

  // Combinada: 1000 al 1% (10.00) + 2.50 fijo = 12.50
  const feeBoth = calculateCommissionFee(1000, 0.01, 2.50, "percentage_and_fixed");
  assert(feeBoth === 12.50, "Comisión mixta (porcentaje + fija) sumada correctamente (12.50)", `Resultado: ${feeBoth}`);

  // Manejo de importes cero o negativos
  const feeZero = calculateCommissionFee(0, 0.05, 10, "percentage_and_fixed");
  assert(feeZero === 0, "Importes de 0 o negativos devuelven comisión 0", `Resultado: ${feeZero}`);

  // ---------------------------------------------------------------------------
  // 3. Matriz de Capacidades y Seguridad de Planes Comerciales
  // ---------------------------------------------------------------------------
  console.log("\n3️⃣ Verificando Constantes del Sistema de Planes y Características...");
  assert(PLAN_FEATURES.DASHBOARD_ACCESS === "dashboard_access", "Feature DASHBOARD_ACCESS definida");
  assert(PLAN_FEATURES.P2P_OPERATIONS_UNLIMITED === "p2p_operations_unlimited", "Feature P2P_OPERATIONS_UNLIMITED definida");
  assert(PLAN_FEATURES.ENTERPRISE_MARKET_CHARTS === "enterprise_market_charts", "Feature ENTERPRISE_MARKET_CHARTS definida");
  assert(PLAN_FEATURES.ENTERPRISE_CRYPTO_NEWS === "enterprise_crypto_news", "Feature ENTERPRISE_CRYPTO_NEWS definida");
  assert(PLAN_FEATURES.EXCEL_EXPORT_MULTIHOP_FULL === "excel_export_multihop_full", "Feature EXCEL_EXPORT_MULTIHOP_FULL definida");

  // ---------------------------------------------------------------------------
  // 4. Auditoría Estática de Seguridad en el Esquema de Base de Datos
  // ---------------------------------------------------------------------------
  console.log("\n4️⃣ Verificando Aislamiento Multinquilino en Esquema Drizzle...");
  const schemaContent = fs.readFileSync(path.join(__dirname, "../src/lib/db/schema.ts"), "utf-8");

  // Tablas que manejan datos privados del comerciante deben tener workspaceId
  const privateTables = [
    "p2pOperations",
    "banks",
    "paymentMethods",
    "commissionProfiles",
    "subscriptions",
  ];

  for (const table of privateTables) {
    const tableRegex = new RegExp(`export const ${table} = pgTable[\\s\\S]*?\\);`, "m");
    const match = schemaContent.match(tableRegex);
    const hasWorkspaceId = match ? match[0].includes("workspaceId") || match[0].includes("workspace_id") : false;
    assert(hasWorkspaceId, `Tabla privada '${table}' incluye clave foránea 'workspace_id'`, `Multitenancy garantizado`);
  }

  // ---------------------------------------------------------------------------
  // 5. Verificación de Protección contra Inyección de Rol en Autenticación
  // ---------------------------------------------------------------------------
  console.log("\n5️⃣ Verificando Protección contra Inyección de Rol ('platform_owner')...");
  const authServerContent = fs.readFileSync(path.join(__dirname, "../src/lib/auth/server.ts"), "utf-8");
  const hasRoleInputFalse = authServerContent.includes("input: false") && authServerContent.includes("defaultValue: \"merchant\"");
  assert(
    hasRoleInputFalse,
    "Campo 'role' en Better Auth configurado con 'input: false' y defecto 'merchant'",
    "Previene que un atacante envíe { role: 'platform_owner' } en el registro público"
  );

  // ---------------------------------------------------------------------------
  // 6. Verificación de Rutas Protegidas en Proxy de Borde (Next.js 16)
  // ---------------------------------------------------------------------------
  console.log("\n6️⃣ Verificando Reglas de Control de Acceso en Edge Proxy (proxy.ts)...");
  const proxyContent = fs.readFileSync(path.join(__dirname, "../src/proxy.ts"), "utf-8");
  assert(proxyContent.includes("pathname.startsWith(\"/app\")"), "Proxy intercepta y protege rutas de comerciante (/app/*)");
  assert(proxyContent.includes("pathname.startsWith(\"/master\")"), "Proxy intercepta y protege rutas administrativas (/master/*)");
  assert(proxyContent.includes("better-auth.session_token"), "Proxy valida presencia de cookie de sesión autenticada");

  // ---------------------------------------------------------------------------
  // 7. Inspección de Secretos en el Repositorio y Plantilla .env.example
  // ---------------------------------------------------------------------------
  console.log("\n7️⃣ Inspección de Secretos y Configuración...");
  const envExampleExists = fs.existsSync(path.join(__dirname, "../.env.example"));
  assert(envExampleExists, "Archivo .env.example presente en la raíz del proyecto");

  const envExampleContent = fs.readFileSync(path.join(__dirname, "../.env.example"), "utf-8");
  assert(envExampleContent.includes("DATABASE_URL="), ".env.example documenta variable DATABASE_URL");
  assert(envExampleContent.includes("BETTER_AUTH_SECRET="), ".env.example documenta variable BETTER_AUTH_SECRET");
  assert(envExampleContent.includes("BILLING_MODE=demo"), ".env.example declara BILLING_MODE=demo");

  // Verificar que .gitignore ignora .env* pero excluye .env.example
  const gitignoreContent = fs.readFileSync(path.join(__dirname, "../.gitignore"), "utf-8");
  assert(gitignoreContent.includes(".env*"), ".gitignore bloquea archivos de credenciales (.env*)");
  assert(gitignoreContent.includes("!.env.example"), ".gitignore permite versionar la plantilla (.env.example)");

  console.log("\n================================================================================");
  console.log(`📊 INFORME FINAL DE AUDITORÍA QA: ${passed}/${total} PRUEBAS SUPERADAS CON ÉXITO.`);
  console.log("================================================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase11QAAudit().catch((err) => {
  console.error("Error fatal durante la auditoría QA:", err);
  process.exit(1);
});
