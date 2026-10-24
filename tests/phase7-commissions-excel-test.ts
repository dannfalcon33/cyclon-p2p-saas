import ExcelJS from "exceljs";
import { db } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";
import { provisionWorkspaceForUser } from "../src/lib/services/workspace-service";
import {
  resolveCommissionRule,
  sanitizeExcelFormula,
  calculateCommissionFee,
} from "../src/lib/services/commission-engine";
import { generateOperationsExcel } from "../src/lib/services/excel-export-service";
import { auth } from "../src/lib/auth/server";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function runPhase7Tests() {
  console.log("=================================================");
  console.log("🧪 INICIANDO BATERÍA DE PRUEBAS — FASE 7 (COMISIONES Y EXCEL)");
  console.log("=================================================\n");

  // -------------------------------------------------------------------------
  // TEST 1: Sanitización contra Inyección de Fórmulas en Excel / CSV
  // -------------------------------------------------------------------------
  console.log("1️⃣ Probando Sanitización contra Formula Injection (CSV / Excel Injection)...");
  const dangerous1 = "=SUM(A1:A10)";
  const dangerous2 = "+12345";
  const dangerous3 = "-2+3*cmd|' /C calc'!A0";
  const dangerous4 = "@SUM(1,2)";
  const safeText = "Operación normal en Binance P2P";

  if (sanitizeExcelFormula(dangerous1) !== "'=SUM(A1:A10)") {
    throw new Error(`Formula injection check failed for '${dangerous1}'`);
  }
  if (sanitizeExcelFormula(dangerous2) !== "'+12345") {
    throw new Error(`Formula injection check failed for '${dangerous2}'`);
  }
  if (sanitizeExcelFormula(dangerous3) !== "'-2+3*cmd|' /C calc'!A0") {
    throw new Error(`Formula injection check failed for '${dangerous3}'`);
  }
  if (sanitizeExcelFormula(dangerous4) !== "'@SUM(1,2)") {
    throw new Error(`Formula injection check failed for '${dangerous4}'`);
  }
  if (sanitizeExcelFormula(safeText) !== safeText) {
    throw new Error(`Safe text was corrupted by sanitizer: '${safeText}'`);
  }
  console.log("   ✅ Strings peligrosos (=, +, -, @) neutralizados exitosamente con prefijo apóstrofe (').");

  // -------------------------------------------------------------------------
  // Setup: Comerciante Alpha y Comerciante Beta
  // -------------------------------------------------------------------------
  const timestamp = Date.now();
  const user1Email = `trader_phase7_alpha_${timestamp}@cyclonp2p.test`;
  const user2Email = `trader_phase7_beta_${timestamp}@cyclonp2p.test`;

  console.log("\n-> Configurando Comerciante Alpha y Comerciante Beta...");
  const signup1 = await auth.api.signUpEmail({
    body: { email: user1Email, password: "Password123!", name: "Trader Phase7 Alpha" },
  });
  const signup2 = await auth.api.signUpEmail({
    body: { email: user2Email, password: "Password123!", name: "Trader Phase7 Beta" },
  });

  const { workspace: wsAlpha } = await provisionWorkspaceForUser(signup1!.user.id, "Trader Phase7 Alpha");
  const { workspace: wsBeta } = await provisionWorkspaceForUser(signup2!.user.id, "Trader Phase7 Beta");

  console.log(`   - Workspace Alpha: ${wsAlpha.id}`);
  console.log(`   - Workspace Beta:  ${wsBeta.id}\n`);

  // -------------------------------------------------------------------------
  // TEST 2: Resolución Determinista de Reglas de Comisiones
  // -------------------------------------------------------------------------
  console.log("2️⃣ Probando Motor de Resolución Determinista de Comisiones...");

  // Regla General: Venezuela - Compra - Cualquier Exchange - 1.00% (0.0100)
  const [generalRule] = await db
    .insert(schema.commissionProfiles)
    .values({
      workspaceId: wsAlpha.id,
      countryCode: "VE",
      fiatCurrency: "VES",
      operationSide: "buy",
      exchangeCode: null,
      feeType: "percentage",
      percentage: "0.0100", // 1.00%
      fixedFee: "0.00",
      priority: 1,
      isActive: true,
    })
    .returning();

  // Regla Específica: Venezuela - Compra - Binance - 0.75% (0.0075) + 5.00 VES fijo, Prioridad 10
  const [specificBinanceRule] = await db
    .insert(schema.commissionProfiles)
    .values({
      workspaceId: wsAlpha.id,
      countryCode: "VE",
      fiatCurrency: "VES",
      operationSide: "buy",
      exchangeCode: "binance",
      feeType: "percentage_and_fixed",
      percentage: "0.0075", // 0.75%
      fixedFee: "5.00",
      priority: 10,
      isActive: true,
    })
    .returning();

  // Caso A: Operación en Binance -> Debe resolver la regla específica
  const resBinance = await resolveCommissionRule(wsAlpha.id, {
    countryCode: "VE",
    fiatCurrency: "VES",
    operationSide: "buy",
    exchangeCode: "binance",
    fiatAmount: 1000,
  });

  if (!resBinance.isConfigured || resBinance.ruleId !== specificBinanceRule.id) {
    throw new Error(`Expected specificBinanceRule ID, got ${resBinance.ruleId}`);
  }
  // Cálculo: (1000 * 0.0075) + 5.00 = 7.50 + 5.00 = 12.50 VES
  if (resBinance.calculatedFee !== "12.50") {
    throw new Error(`Expected fee 12.50, got ${resBinance.calculatedFee}`);
  }
  console.log(`   - Coincidencia específica Binance: ${resBinance.description} -> Calculado: ${resBinance.calculatedFee} VES`);

  // Caso B: Operación en Bybit -> Debe caer en la regla general (1.00%)
  const resBybit = await resolveCommissionRule(wsAlpha.id, {
    countryCode: "VE",
    fiatCurrency: "VES",
    operationSide: "buy",
    exchangeCode: "bybit",
    fiatAmount: 2000,
  });

  if (!resBybit.isConfigured || resBybit.ruleId !== generalRule.id) {
    throw new Error(`Expected generalRule ID, got ${resBybit.ruleId}`);
  }
  // Cálculo: 2000 * 0.0100 = 20.00 VES
  if (resBybit.calculatedFee !== "20.00") {
    throw new Error(`Expected fee 20.00, got ${resBybit.calculatedFee}`);
  }
  console.log(`   - Coincidencia general Bybit:      ${resBybit.description} -> Calculado: ${resBybit.calculatedFee} VES`);

  // Caso C: País sin configurar (Colombia) -> Retorna tasa neutra 0.00
  const resUnconfigured = await resolveCommissionRule(wsAlpha.id, {
    countryCode: "CO",
    fiatCurrency: "COP",
    operationSide: "buy",
    fiatAmount: 50000,
  });

  if (resUnconfigured.isConfigured !== false || resUnconfigured.calculatedFee !== "0.00") {
    throw new Error("Expected unconfigured rule to return isConfigured=false and fee 0.00");
  }
  console.log(`   - País sin configurar (CO):         ${resUnconfigured.description}`);
  console.log("   ✅ Jerarquía de selección y cálculo determinista funcionando al 100%.");

  // -------------------------------------------------------------------------
  // TEST 3: Generación de Reporte Excel Multilibro (.xlsx)
  // -------------------------------------------------------------------------
  console.log("\n3️⃣ Probando Generador Multilibro en Excel (.xlsx)...");

  // Sembrar operaciones en Alpha con notas maliciosas para probar sanitización en celda
  await db.insert(schema.p2pOperations).values([
    {
      workspaceId: wsAlpha.id,
      countryCode: "VE",
      exchangeCode: "binance",
      operationSide: "buy",
      assetSymbol: "USDT",
      assetAmount: "100.00000000",
      fiatCurrency: "VES",
      fiatAmount: "3865.00",
      unitRate: "38.65000000",
      merchantFee: "28.99",
      exchangeFee: "5.00",
      paymentCharge: "2.00",
      paymentMethodNameSnapshot: "Pago Móvil",
      bankNameSnapshot: "Banesco",
      status: "completed",
      externalReference: "=cmd|' /C calc'!A0", // Inyección maliciosa
      counterpartyAlias: "@TraderPro99",       // Inyección con @
      notes: "+12345 Orden con bonificación",  // Inyección con +
      occurredAt: new Date(),
    },
    {
      workspaceId: wsAlpha.id,
      countryCode: "CO",
      exchangeCode: "bybit",
      operationSide: "sell",
      assetSymbol: "USDT",
      assetAmount: "500.00000000",
      fiatCurrency: "COP",
      fiatAmount: "2050000.00",
      unitRate: "4100.00000000",
      merchantFee: "16400.00",
      exchangeFee: "1000.00",
      paymentCharge: "500.00",
      paymentMethodNameSnapshot: "Bancolombia Transferencia",
      bankNameSnapshot: "Bancolombia",
      status: "completed",
      externalReference: "BYB-COP-8899",
      counterpartyAlias: "BogotaDesk",
      notes: "Venta de inventario USDT en Colombia",
      occurredAt: new Date(),
    },
    {
      workspaceId: wsAlpha.id,
      countryCode: "VE",
      exchangeCode: "binance",
      operationSide: "buy",
      assetSymbol: "USDT",
      assetAmount: "50.00000000",
      fiatCurrency: "VES",
      fiatAmount: "1932.50",
      unitRate: "38.65000000",
      merchantFee: "14.49",
      exchangeFee: "0.00",
      paymentCharge: "0.00",
      status: "cancelled",
      notes: "Cancelada por expiración de tiempo.",
      occurredAt: new Date(),
    },
  ]);

  const excelBuffer = await generateOperationsExcel(wsAlpha.id, { period: "all" });

  if (!excelBuffer || excelBuffer.length === 0) {
    throw new Error("Excel buffer was not generated or empty.");
  }
  console.log(`   - Archivo Excel generado: ${excelBuffer.length} bytes.`);

  // Cargar el Excel generado con ExcelJS para validar su estructura interna
  const loadedWorkbook = new ExcelJS.Workbook();
  await loadedWorkbook.xlsx.load(excelBuffer as any);

  const sheetNames = loadedWorkbook.worksheets.map((ws) => ws.name);
  console.log(`   - Hojas encontradas en el libro: [${sheetNames.join(", ")}]`);

  if (!sheetNames.includes("Operaciones")) throw new Error("Missing 'Operaciones' worksheet");
  if (!sheetNames.includes("Resumen por Moneda")) throw new Error("Missing 'Resumen por Moneda' worksheet");
  if (!sheetNames.includes("Comisiones")) throw new Error("Missing 'Comisiones' worksheet");
  if (!sheetNames.includes("Parámetros del Reporte")) throw new Error("Missing 'Parámetros del Reporte' worksheet");

  console.log("   ✅ Las 4 hojas requeridas están presentes en el libro Excel.");

  // -------------------------------------------------------------------------
  // TEST 4: Validación de Celdas Numéricas (Nativas, No Strings)
  // -------------------------------------------------------------------------
  console.log("\n4️⃣ Probando Formato de Celdas Numéricas Nativas...");
  const wsOps = loadedWorkbook.getWorksheet("Operaciones")!;

  // La fila 1 es el encabezado, la fila 2 es la primera operación
  const row2 = wsOps.getRow(2);
  const fiatAmountValue = row2.getCell(9).value; // Columna 'fiatAmount'
  const fiatCurrencyValue = row2.getCell(8).value; // Columna 'fiatCurrency'
  const assetAmountValue = row2.getCell(7).value; // Columna 'assetAmount'

  if (typeof fiatAmountValue !== "number") {
    throw new Error(`Expected numeric type for fiatAmount, got '${typeof fiatAmountValue}' (${fiatAmountValue})`);
  }
  if (typeof assetAmountValue !== "number") {
    throw new Error(`Expected numeric type for assetAmount, got '${typeof assetAmountValue}' (${assetAmountValue})`);
  }
  if (fiatCurrencyValue !== "VES" && fiatCurrencyValue !== "COP") {
    throw new Error(`Expected currency code string in separate column, got '${fiatCurrencyValue}'`);
  }

  console.log(`   - Celda 'Importe Fiat': valor=${fiatAmountValue} (tipo: ${typeof fiatAmountValue})`);
  console.log(`   - Celda 'Cantidad Cripto': valor=${assetAmountValue} (tipo: ${typeof assetAmountValue})`);
  console.log(`   - Celda 'Moneda Fiat': valor='${fiatCurrencyValue}' (en columna independiente)`);
  console.log("   ✅ Las cantidades son celdas numéricas reales formateables, sin mezclas de texto.");

  // -------------------------------------------------------------------------
  // TEST 5: Verificación de Sanitización de Fórmulas dentro del Excel
  // -------------------------------------------------------------------------
  console.log("\n5️⃣ Probando Neutralización de Inyección de Fórmulas en el Archivo...");
  let foundSanitizedRef = false;
  let foundSanitizedAlias = false;
  let foundSanitizedNote = false;

  wsOps.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const refVal = String(row.getCell(17).value || "");
    const aliasVal = String(row.getCell(18).value || "");
    const noteVal = String(row.getCell(19).value || "");

    if (refVal.startsWith("'=")) foundSanitizedRef = true;
    if (aliasVal.startsWith("'@")) foundSanitizedAlias = true;
    if (noteVal.startsWith("'+")) foundSanitizedNote = true;
  });

  if (!foundSanitizedRef || !foundSanitizedAlias || !foundSanitizedNote) {
    throw new Error("One or more malicious strings were not properly prefixed with apostrophe in Excel rows.");
  }
  console.log("   ✅ Fórmulas maliciosas neutralizadas en las celdas: ('=, '@, '+).");

  // -------------------------------------------------------------------------
  // TEST 6: Aislamiento Multinquilino en la Exportación
  // -------------------------------------------------------------------------
  console.log("\n6️⃣ Probando Aislamiento Multinquilino en Exportación Excel...");
  const betaExcelBuffer = await generateOperationsExcel(wsBeta.id, { period: "all" });
  const betaWorkbook = new ExcelJS.Workbook();
  await betaWorkbook.xlsx.load(betaExcelBuffer as any);

  const betaWsOps = betaWorkbook.getWorksheet("Operaciones")!;
  // Solo debe contener el encabezado (rowCount = 1)
  if (betaWsOps.rowCount > 1) {
    throw new Error(`Data leakage: Workspace Beta Excel contains ${betaWsOps.rowCount - 1} rows from Alpha!`);
  }
  console.log(`   - Filas de datos en el reporte de Workspace Beta: 0 (solo encabezado).`);
  console.log("   ✅ Aislamiento multinquilino verificado al 100%: ningún dato de Alpha se filtró a Beta.");

  console.log("\n=================================================");
  console.log("🎉 TODAS LAS PRUEBAS DE LA FASE 7 HAN PASADO (100% OK)");
  console.log("=================================================\n");
}

runPhase7Tests().catch((err) => {
  console.error("\n❌ ERROR EN PRUEBAS DE FASE 7:", err);
  process.exit(1);
});
