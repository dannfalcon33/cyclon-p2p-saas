import { db } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";
import { provisionWorkspaceForUser } from "../src/lib/services/workspace-service";
import { createOperation } from "../src/lib/services/operations-service";
import { getMerchantDashboardMetrics } from "../src/lib/services/metrics-service";
import { auth } from "../src/lib/auth/server";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function runPhase6Tests() {
  console.log("=================================================");
  console.log("🧪 INICIANDO BATERÍA DE PRUEBAS — FASE 6 (DASHBOARD & MÉTRICAS)");
  console.log("=================================================\n");

  const timestamp = Date.now();
  const user1Email = `trader_metrics_alpha_${timestamp}@cyclonp2p.test`;
  const user2Email = `trader_metrics_beta_${timestamp}@cyclonp2p.test`;

  console.log("-> Configurando Comerciante Alpha y Comerciante Beta...");
  const signup1 = await auth.api.signUpEmail({
    body: { email: user1Email, password: "Password123!", name: "Trader Metrics Alpha" },
  });
  const signup2 = await auth.api.signUpEmail({
    body: { email: user2Email, password: "Password123!", name: "Trader Metrics Beta" },
  });

  const { workspace: wsAlpha } = await provisionWorkspaceForUser(signup1!.user.id, "Trader Metrics Alpha");
  const { workspace: wsBeta } = await provisionWorkspaceForUser(signup2!.user.id, "Trader Metrics Beta");

  console.log(`   - Workspace Alpha: ${wsAlpha.id}`);
  console.log(`   - Workspace Beta:  ${wsBeta.id}\n`);

  // Crear operaciones controladas en Workspace Alpha
  console.log("-> Sembrando operaciones de prueba en Alpha...");
  const now = new Date();
  const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);

  // Op 1: Compra USDT en VES (Reciente)
  // 100 USDT a 38.00 = 3,800.00 VES
  await db.insert(schema.p2pOperations).values({
    workspaceId: wsAlpha.id,
    countryCode: "VE",
    exchangeCode: "binance",
    operationSide: "buy",
    assetSymbol: "USDT",
    assetAmount: "100.00000000",
    fiatCurrency: "VES",
    fiatAmount: "3800.00",
    unitRate: "38.00000000",
    merchantFee: "38.00",
    exchangeFee: "5.00",
    paymentCharge: "2.00",
    paymentMethodNameSnapshot: "Pago Móvil",
    bankNameSnapshot: "Banesco",
    status: "completed",
    occurredAt: now,
  });

  // Op 2: Compra USDT en VES (Reciente)
  // 200 USDT a 39.50 = 7,900.00 VES
  await db.insert(schema.p2pOperations).values({
    workspaceId: wsAlpha.id,
    countryCode: "VE",
    exchangeCode: "binance",
    operationSide: "buy",
    assetSymbol: "USDT",
    assetAmount: "200.00000000",
    fiatCurrency: "VES",
    fiatAmount: "7900.00",
    unitRate: "39.50000000",
    merchantFee: "79.00",
    exchangeFee: "10.00",
    paymentCharge: "3.00",
    paymentMethodNameSnapshot: "Pago Móvil",
    bankNameSnapshot: "Banesco",
    status: "completed",
    occurredAt: now,
  });

  // Op 3: Venta USDT en VES (Reciente)
  // 150 USDT a 41.00 = 6,150.00 VES
  await db.insert(schema.p2pOperations).values({
    workspaceId: wsAlpha.id,
    countryCode: "VE",
    exchangeCode: "bybit",
    operationSide: "sell",
    assetSymbol: "USDT",
    assetAmount: "150.00000000",
    fiatCurrency: "VES",
    fiatAmount: "6150.00",
    unitRate: "41.00000000",
    merchantFee: "61.50",
    exchangeFee: "8.00",
    paymentCharge: "2.00",
    paymentMethodNameSnapshot: "Transferencia Bancaria",
    bankNameSnapshot: "Mercantil",
    status: "completed",
    occurredAt: now,
  });

  // Op 4: Compra BTC en USD (Reciente - diferente moneda fiat)
  // 0.05 BTC a 68,000.00 = 3,400.00 USD
  await db.insert(schema.p2pOperations).values({
    workspaceId: wsAlpha.id,
    countryCode: "VE",
    exchangeCode: "binance",
    operationSide: "buy",
    assetSymbol: "BTC",
    assetAmount: "0.05000000",
    fiatCurrency: "USD",
    fiatAmount: "3400.00",
    unitRate: "68000.00000000",
    merchantFee: "34.00",
    exchangeFee: "2.00",
    paymentCharge: "0.00",
    paymentMethodNameSnapshot: "Zinli Wallet",
    bankNameSnapshot: null,
    status: "completed",
    occurredAt: now,
  });

  // Op 5: Operación Cancelada en VES
  // 50 USDT a 39.00 = 1,950.00 VES
  await db.insert(schema.p2pOperations).values({
    workspaceId: wsAlpha.id,
    countryCode: "VE",
    exchangeCode: "binance",
    operationSide: "buy",
    assetSymbol: "USDT",
    assetAmount: "50.00000000",
    fiatCurrency: "VES",
    fiatAmount: "1950.00",
    unitRate: "39.00000000",
    merchantFee: "19.50",
    status: "cancelled",
    notes: "Cancelada por contraparte.",
    occurredAt: now,
  });

  // Op 6: Operación Pendiente en VES
  // 20 USDT a 39.00 = 780.00 VES
  await db.insert(schema.p2pOperations).values({
    workspaceId: wsAlpha.id,
    countryCode: "VE",
    exchangeCode: "bitget",
    operationSide: "buy",
    assetSymbol: "USDT",
    assetAmount: "20.00000000",
    fiatCurrency: "VES",
    fiatAmount: "780.00",
    unitRate: "39.00000000",
    merchantFee: "7.80",
    status: "pending",
    occurredAt: now,
  });

  // Op 7: Operación Histórica hace 40 días en VES
  // 80 USDT a 38.00 = 3,040.00 VES
  await db.insert(schema.p2pOperations).values({
    workspaceId: wsAlpha.id,
    countryCode: "VE",
    exchangeCode: "binance",
    operationSide: "buy",
    assetSymbol: "USDT",
    assetAmount: "80.00000000",
    fiatCurrency: "VES",
    fiatAmount: "3040.00",
    unitRate: "38.00000000",
    merchantFee: "30.40",
    status: "completed",
    occurredAt: fortyDaysAgo,
  });

  console.log("   ✅ 7 operaciones sembradas con éxito en Alpha.\n");

  // -------------------------------------------------------------------------
  // TEST 1: Conteo de Estados y Exclusión de Canceladas en Volúmenes
  // -------------------------------------------------------------------------
  console.log("1️⃣ Probando KPIs y Exclusión de Canceladas/Pendientes de Volúmenes...");
  const metrics30d = await getMerchantDashboardMetrics(wsAlpha.id, { period: "30d" });

  if (metrics30d.kpis.totalOperations !== 6) {
    throw new Error(`Expected 6 operations in 30d, got ${metrics30d.kpis.totalOperations}`);
  }
  if (metrics30d.kpis.completedOperations !== 4) {
    throw new Error(`Expected 4 completed operations in 30d, got ${metrics30d.kpis.completedOperations}`);
  }
  if (metrics30d.kpis.pendingOperations !== 1) {
    throw new Error(`Expected 1 pending operation in 30d, got ${metrics30d.kpis.pendingOperations}`);
  }
  if (metrics30d.kpis.cancelledOperations !== 1) {
    throw new Error(`Expected 1 cancelled operation in 30d, got ${metrics30d.kpis.cancelledOperations}`);
  }
  console.log("   ✅ Conteos por estado correctos: 4 completadas, 1 pendiente, 1 cancelada (en 30d).");

  // -------------------------------------------------------------------------
  // TEST 2: Aislamiento Estricto de Monedas Fiat (Sin mezcla de divisas)
  // -------------------------------------------------------------------------
  console.log("2️⃣ Probando Aislamiento Estricto de Monedas Fiat...");
  const vesMetric = metrics30d.fiatMetrics["VES"];
  const usdMetric = metrics30d.fiatMetrics["USD"];

  if (!vesMetric || !usdMetric) {
    throw new Error("Métricas de VES o USD no encontradas.");
  }

  // En 30d, en VES completadas tenemos Op 1 (3,800) + Op 2 (7,900) + Op 3 (6,150) = 17,850.00 VES
  if (vesMetric.totalFiat !== "17850.00") {
    throw new Error(`Expected 17850.00 VES, got ${vesMetric.totalFiat}`);
  }
  if (vesMetric.buyFiat !== "11700.00") {
    throw new Error(`Expected 11700.00 buy VES, got ${vesMetric.buyFiat}`);
  }
  if (vesMetric.sellFiat !== "6150.00") {
    throw new Error(`Expected 6150.00 sell VES, got ${vesMetric.sellFiat}`);
  }

  // En USD completadas tenemos Op 4 = 3,400.00 USD
  if (usdMetric.totalFiat !== "3400.00") {
    throw new Error(`Expected 3400.00 USD, got ${usdMetric.totalFiat}`);
  }

  // Las operaciones canceladas (1,950 VES) y pendientes (780 VES) NO forman parte del volumen total
  console.log(`   - Volumen total en VES: ${vesMetric.totalFiat} VES (Compras: ${vesMetric.buyFiat}, Ventas: ${vesMetric.sellFiat})`);
  console.log(`   - Volumen total en USD: ${usdMetric.totalFiat} USD`);
  console.log("   ✅ Divisas aisladas al 100%: no existe suma cruzada entre VES y USD.");

  // -------------------------------------------------------------------------
  // TEST 3: Cálculo de Tasas Promedio Ponderadas
  // -------------------------------------------------------------------------
  console.log("3️⃣ Probando Tasas Promedio Ponderadas por Volumen (SUM(fiat) / SUM(cripto))...");
  const usdtRates = vesMetric.ratesByAsset["USDT"];
  if (!usdtRates) {
    throw new Error("Tasas para par USDT/VES no encontradas.");
  }

  // Compras: (3800 + 7900) / (100 + 200) = 11700 / 300 = 39.0000
  if (usdtRates.buyAvgRate !== "39.0000") {
    throw new Error(`Expected buyAvgRate '39.0000', got '${usdtRates.buyAvgRate}'`);
  }

  // Ventas: 6150 / 150 = 41.0000
  if (usdtRates.sellAvgRate !== "41.0000") {
    throw new Error(`Expected sellAvgRate '41.0000', got '${usdtRates.sellAvgRate}'`);
  }

  // Spread bruto: 41.0000 - 39.0000 = +2.0000
  if (usdtRates.grossSpread !== "2.0000") {
    throw new Error(`Expected grossSpread '2.0000', got '${usdtRates.grossSpread}'`);
  }

  // Tasa global ponderada: (11700 + 6150) / (300 + 150) = 17850 / 450 = 39.6667
  if (usdtRates.overallAvgRate !== "39.6667") {
    throw new Error(`Expected overallAvgRate '39.6667', got '${usdtRates.overallAvgRate}'`);
  }

  console.log(`   - Tasa Compra Ponderada USDT/VES: ${usdtRates.buyAvgRate} VES`);
  console.log(`   - Tasa Venta Ponderada USDT/VES:  ${usdtRates.sellAvgRate} VES`);
  console.log(`   - Spread Bruto Calculado:         +${usdtRates.grossSpread} VES`);
  console.log(`   - Tasa Global Ponderada:          ${usdtRates.overallAvgRate} VES`);
  console.log("   ✅ Tasas derivadas con precisión matemática exacta.");

  // -------------------------------------------------------------------------
  // TEST 4: Desglose de las 3 Categorías de Comisiones
  // -------------------------------------------------------------------------
  console.log("4️⃣ Probando Desglose de Comisiones (Comerciante vs Exchange vs Proveedor)...");
  // En VES 30d:
  // merchantFee: 38.00 + 79.00 + 61.50 = 178.50 VES
  // exchangeFee: 5.00 + 10.00 + 8.00 = 23.00 VES
  // paymentCharge: 2.00 + 3.00 + 2.00 = 7.00 VES
  // totalFees: 178.50 + 23.00 + 7.00 = 208.50 VES
  if (vesMetric.merchantFee !== "178.50") {
    throw new Error(`Expected merchantFee '178.50', got '${vesMetric.merchantFee}'`);
  }
  if (vesMetric.exchangeFee !== "23.00") {
    throw new Error(`Expected exchangeFee '23.00', got '${vesMetric.exchangeFee}'`);
  }
  if (vesMetric.paymentCharge !== "7.00") {
    throw new Error(`Expected paymentCharge '7.00', got '${vesMetric.paymentCharge}'`);
  }
  if (vesMetric.totalFees !== "208.50") {
    throw new Error(`Expected totalFees '208.50', got '${vesMetric.totalFees}'`);
  }
  console.log(`   - Comisión Comerciante: ${vesMetric.merchantFee} VES`);
  console.log(`   - Tarifa de Exchanges:  ${vesMetric.exchangeFee} VES`);
  console.log(`   - Cargos de Proveedor:  ${vesMetric.paymentCharge} VES`);
  console.log(`   - Total Comisiones:     ${vesMetric.totalFees} VES`);
  console.log("   ✅ Las tres comisiones se computan con estricta separación.");

  // -------------------------------------------------------------------------
  // TEST 5: Filtro por Período Temporal
  // -------------------------------------------------------------------------
  console.log("5️⃣ Probando Filtros por Período (30d vs Histórico)...");
  const metricsAll = await getMerchantDashboardMetrics(wsAlpha.id, { period: "all" });
  if (metricsAll.kpis.totalOperations !== 7) {
    throw new Error(`Expected 7 total operations in 'all', got ${metricsAll.kpis.totalOperations}`);
  }
  // En 'all', la Op 7 de hace 40 días se suma: 17,850 + 3,040 = 20,890.00 VES
  const vesAll = metricsAll.fiatMetrics["VES"];
  if (vesAll.totalFiat !== "20890.00") {
    throw new Error(`Expected 20890.00 VES in 'all', got ${vesAll.totalFiat}`);
  }
  console.log(`   - Total 30 días:  ${vesMetric.totalFiat} VES (4 operaciones)`);
  console.log(`   - Total Histórico: ${vesAll.totalFiat} VES (5 operaciones)`);
  console.log("   ✅ Filtros de fecha respetados con total fidelidad temporal.");

  // -------------------------------------------------------------------------
  // TEST 6: Aislamiento Multinquilino en Métricas
  // -------------------------------------------------------------------------
  console.log("6️⃣ Probando Aislamiento Multinquilino en Métricas...");
  const metricsBeta = await getMerchantDashboardMetrics(wsBeta.id, { period: "all" });

  if (metricsBeta.kpis.totalOperations !== 0) {
    throw new Error(`Expected 0 operations in Workspace Beta, got ${metricsBeta.kpis.totalOperations}`);
  }
  if (metricsBeta.cryptoVolumes.length !== 0) {
    throw new Error(`Expected 0 crypto volumes in Workspace Beta, got ${metricsBeta.cryptoVolumes.length}`);
  }
  if (metricsBeta.hasOperations !== false) {
    throw new Error("Expected hasOperations to be false for empty Workspace Beta");
  }
  console.log("   ✅ Aislamiento multinquilino verificado al 100%: Workspace Beta tiene 0 datos de Alpha.");

  console.log("\n=================================================");
  console.log("🎉 TODAS LAS PRUEBAS DE LA FASE 6 HAN PASADO (100% OK)");
  console.log("=================================================\n");
}

runPhase6Tests().catch((err) => {
  console.error("\n❌ ERROR EN PRUEBAS DE FASE 6:", err);
  process.exit(1);
});
