import { db } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { provisionWorkspaceForUser } from "../src/lib/services/workspace-service";
import {
  createOperation,
  getOperations,
  getOperationById,
  updateOperation,
  cancelOperation,
  getOperationsSummary,
  calculateUnitRate,
} from "../src/lib/services/operations-service";
import {
  createWorkspaceBank,
  createWorkspacePaymentMethod,
  upsertCommissionProfile,
} from "../src/lib/services/catalogs-service";
import { auth } from "../src/lib/auth/server";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function runPhase5Tests() {
  console.log("=================================================");
  console.log("🧪 INICIANDO BATERÍA DE PRUEBAS — FASE 5 (OPERACIONES P2P)");
  console.log("=================================================\n");

  // -------------------------------------------------------------------------
  // Setup: Dos Comerciantes Independientes para pruebas de aislamiento
  // -------------------------------------------------------------------------
  const timestamp = Date.now();
  const user1Email = `trader_op_alpha_${timestamp}@cyclonp2p.test`;
  const user2Email = `trader_op_beta_${timestamp}@cyclonp2p.test`;

  console.log("-> Configurando Comerciante Alpha y Comerciante Beta...");
  const signup1 = await auth.api.signUpEmail({
    body: { email: user1Email, password: "Password123!", name: "Trader Op Alpha" },
  });
  const signup2 = await auth.api.signUpEmail({
    body: { email: user2Email, password: "Password123!", name: "Trader Op Beta" },
  });

  const { workspace: wsAlpha } = await provisionWorkspaceForUser(signup1!.user.id, "Trader Op Alpha");
  const { workspace: wsBeta } = await provisionWorkspaceForUser(signup2!.user.id, "Trader Op Beta");

  console.log(`   - Workspace Alpha: ${wsAlpha.id}`);
  console.log(`   - Workspace Beta:  ${wsBeta.id}\n`);

  // Crear banco, método y regla de comisión para Alpha
  const bankAlpha = await createWorkspaceBank(wsAlpha.id, {
    countryCode: "VE",
    name: "Banesco Alpha Bank",
  });
  const methodAlpha = await createWorkspacePaymentMethod(wsAlpha.id, {
    countryCode: "VE",
    name: "Pago Móvil Alpha Pay",
    requiresBank: true,
  });
  await upsertCommissionProfile(wsAlpha.id, {
    countryCode: "VE",
    fiatCurrency: "VES",
    operationSide: "buy",
    percentage: "0.0100", // 1.00%
    fixedFee: "5.00",
  });

  // -------------------------------------------------------------------------
  // Test 1: Cálculo Preciso de Tasa Unitaria en Servidor
  // -------------------------------------------------------------------------
  console.log("1️⃣ Probando Función de Tasa Unitaria Decimal...");
  const rate1 = calculateUnitRate("19325.00", "500.00");
  if (parseFloat(rate1) !== 38.65) {
    throw new Error(`Tasa calculada incorrecta: esperada 38.65, obtenida ${rate1}`);
  }
  const rate2 = calculateUnitRate("4860000.00", "1200.00");
  if (parseFloat(rate2) !== 4050.0) {
    throw new Error(`Tasa calculada incorrecta: esperada 4050.0, obtenida ${rate2}`);
  }
  console.log("   ✅ Tasa unitaria derivada matemáticamente con precisión controlada.\n");

  // -------------------------------------------------------------------------
  // Test 2: Validación de Entradas Inválidas (Rechazo Server-Side)
  // -------------------------------------------------------------------------
  console.log("2️⃣ Probando Rechazo de Entradas Inválidas en el Servidor...");
  let rejectedZeroCrypto = false;
  try {
    await createOperation(wsAlpha.id, {
      countryCode: "VE",
      exchangeCode: "binance",
      operationSide: "buy",
      assetSymbol: "USDT",
      assetAmount: 0, // Cero debe ser rechazado
      fiatCurrency: "VES",
      fiatAmount: 1000,
    });
  } catch (err: any) {
    rejectedZeroCrypto = true;
    console.log(`   ✅ Correctamente rechazada cantidad cripto <= 0: "${err.message}"`);
  }
  if (!rejectedZeroCrypto) throw new Error("FALLO DE VALIDACIÓN: Se permitió guardar cantidad cripto igual a 0");

  let rejectedNegativeFiat = false;
  try {
    await createOperation(wsAlpha.id, {
      countryCode: "VE",
      exchangeCode: "binance",
      operationSide: "buy",
      assetSymbol: "USDT",
      assetAmount: 100,
      fiatCurrency: "VES",
      fiatAmount: -50, // Negativo debe ser rechazado
    });
  } catch (err: any) {
    rejectedNegativeFiat = true;
    console.log(`   ✅ Correctamente rechazado importe fiat <= 0: "${err.message}"`);
  }
  if (!rejectedNegativeFiat) throw new Error("FALLO DE VALIDACIÓN: Se permitió guardar importe fiat negativo");

  // Validación de Capital: Bloqueo de venta si el capital en USDT está en 0
  let rejectedZeroCryptoSell = false;
  try {
    await createOperation(wsAlpha.id, {
      countryCode: "VE",
      exchangeCode: "binance",
      operationSide: "sell",
      assetSymbol: "USDT",
      assetAmount: 100, // No tiene USDT todavía
      fiatCurrency: "VES",
      fiatAmount: 3900,
    });
  } catch (err: any) {
    rejectedZeroCryptoSell = true;
    console.log(`   ✅ Correctamente bloqueada venta sin activos (USDT = 0): "${err.message}"`);
  }
  if (!rejectedZeroCryptoSell) {
    throw new Error("FALLO DE VALIDACIÓN: Se permitió registrar venta con capital USDT en 0");
  }

  // Validación de Capital: Bloqueo de compra si el importe fiat excede el saldo fiat disponible
  let rejectedExcessFiatBuy = false;
  try {
    await createOperation(wsAlpha.id, {
      countryCode: "VE",
      exchangeCode: "binance",
      operationSide: "buy",
      assetSymbol: "USDT",
      assetAmount: 2000000,
      fiatCurrency: "VES",
      fiatAmount: 50000000, // 50,000,000 VES excede saldo fiat disponible
    });
  } catch (err: any) {
    rejectedExcessFiatBuy = true;
    console.log(`   ✅ Correctamente bloqueada compra que excede saldo fiat: "${err.message}"`);
  }
  if (!rejectedExcessFiatBuy) {
    throw new Error("FALLO DE VALIDACIÓN: Se permitió registrar compra que excede saldo fiat");
  }

  console.log("   ✅ Validación server-side estricta: entradas inválidas y operaciones sin saldo no llegan a Neon.\n");

  // -------------------------------------------------------------------------
  // Test 3: Creación de Operación Válida con Instantáneas Inmutables
  // -------------------------------------------------------------------------
  console.log("3️⃣ Probando Creación de Operación Válida y Preservación de Snapshots...");
  const opAlpha = await createOperation(wsAlpha.id, {
    countryCode: "VE",
    exchangeCode: "binance",
    operationSide: "buy",
    assetSymbol: "USDT",
    assetAmount: "500.00000000",
    fiatCurrency: "VES",
    fiatAmount: "19325.00",
    merchantFee: "193.25",
    exchangeFee: "0.00",
    paymentCharge: "0.00",
    bankId: bankAlpha.id,
    paymentMethodId: methodAlpha.id,
    externalReference: "BIN-ORD-998877",
    counterpartyAlias: "SuperTrader_VE",
    notes: "Operación de prueba automatizada Fase 5",
  });

  if (!opAlpha || !opAlpha.id) throw new Error("No se pudo crear la operación en Neon");
  if (parseFloat(opAlpha.unitRate) !== 38.65) {
    throw new Error(`Tasa almacenada incorrecta: ${opAlpha.unitRate}`);
  }
  if (opAlpha.bankNameSnapshot !== "Banesco Alpha Bank") {
    throw new Error(`Snapshot de banco incorrecto: ${opAlpha.bankNameSnapshot}`);
  }
  if (opAlpha.paymentMethodNameSnapshot !== "Pago Móvil Alpha Pay") {
    throw new Error(`Snapshot de método de pago incorrecto: ${opAlpha.paymentMethodNameSnapshot}`);
  }

  const snapshot = opAlpha.commissionRuleSnapshot as any;
  if (!snapshot || !snapshot.ruleId || snapshot.percentage !== "0.0100") {
    throw new Error("Instantánea inmutable de comisión no fue registrada correctamente");
  }

  console.log(`   - Operación creada con ID: ${opAlpha.id}`);
  console.log(`   - Tasa derivada: ${opAlpha.unitRate} VES/USDT`);
  console.log(`   - Snapshot Banco: ${opAlpha.bankNameSnapshot}`);
  console.log(`   - Snapshot Método: ${opAlpha.paymentMethodNameSnapshot}`);
  console.log(`   - Snapshot Regla: ${snapshot.percentage} (${snapshot.operationSide})`);
  console.log("   ✅ Operación persistida con éxito en Neon con integridad inmutable.\n");

  // -------------------------------------------------------------------------
  // Test 4: Aislamiento Multinquilino Estricto (Alpha vs Beta)
  // -------------------------------------------------------------------------
  console.log("4️⃣ Probando Aislamiento Multinquilino entre Workspaces...");
  // Beta intenta consultar la operación de Alpha por ID
  const betaQueryOp = await getOperationById(wsBeta.id, opAlpha.id);
  if (betaQueryOp !== null) {
    throw new Error("FALLO CRÍTICO DE SEGURIDAD: Workspace Beta pudo leer la operación de Workspace Alpha");
  }

  // Beta intenta cancelar la operación de Alpha
  let betaCancelBlocked = false;
  try {
    await cancelOperation(wsBeta.id, opAlpha.id, "Ataque no autorizado");
  } catch (err: any) {
    betaCancelBlocked = true;
  }
  if (!betaCancelBlocked) {
    throw new Error("FALLO CRÍTICO DE SEGURIDAD: Workspace Beta pudo cancelar la operación de Workspace Alpha");
  }

  // Comprobar que en el listado de Beta no aparece la operación de Alpha
  const betaOperationsList = await getOperations(wsBeta.id);
  if (betaOperationsList.items.some((op) => op.id === opAlpha.id)) {
    throw new Error("FALLO DE SEGURIDAD: Operación de Alpha filtrada en listado de Beta");
  }

  console.log("   ✅ Aislamiento multinquilino verificado al 100%: consultas y mutaciones bloqueadas entre workspaces.\n");

  // -------------------------------------------------------------------------
  // Test 5: Soft Cancellation (Cancelación sin destrucción física)
  // -------------------------------------------------------------------------
  console.log("5️⃣ Probando Cancelación (Soft-Cancel) con Auditoría en Notas...");
  const cancelledOp = await cancelOperation(wsAlpha.id, opAlpha.id, "Contraparte no respondió en Binance");

  if (cancelledOp.status !== "cancelled") {
    throw new Error(`Estado esperado 'cancelled', recibido '${cancelledOp.status}'`);
  }
  if (!cancelledOp.notes?.includes("[Cancelada: Contraparte no respondió en Binance]")) {
    throw new Error("La nota de auditoría de cancelación no fue añadida.");
  }

  // Verificar que el registro aún existe en Neon
  const verifiedInDb = await getOperationById(wsAlpha.id, opAlpha.id);
  if (!verifiedInDb) {
    throw new Error("El registro fue eliminado físicamente en lugar de ser cancelado.");
  }
  if (verifiedInDb.status !== "cancelled") {
    throw new Error("El estado en base de datos no es 'cancelled'");
  }

  console.log(`   ✅ Cancelación exitosa: status='cancelled', nota="${verifiedInDb.notes}".`);
  console.log("   ✅ Registro físico preservado para trazabilidad contable.\n");

  // -------------------------------------------------------------------------
  // Test 6: Creación de Múltiples Operaciones, Filtros y Paginación
  // -------------------------------------------------------------------------
  console.log("6️⃣ Probando Listado, Filtros Combinados y Paginación...");
  // Asignar inventario base de BTC a wsAlpha para permitir la venta en la prueba
  await db
    .update(schema.workspaceSettings)
    .set({ initialCryptoBalances: { USDT: "1000.00", BTC: "2.00000000" } })
    .where(eq(schema.workspaceSettings.workspaceId, wsAlpha.id));

  // Crear 2 operaciones más para Alpha (una completada y una pendiente)
  const op2 = await createOperation(wsAlpha.id, {
    countryCode: "CO",
    exchangeCode: "bybit",
    operationSide: "sell",
    assetSymbol: "BTC",
    assetAmount: "0.10000000",
    fiatCurrency: "COP",
    fiatAmount: "27000000.00",
    status: "completed",
    externalReference: "BYB-BTC-1234",
  });

  const op3 = await createOperation(wsAlpha.id, {
    countryCode: "VE",
    exchangeCode: "binance",
    operationSide: "buy",
    assetSymbol: "ETH",
    assetAmount: "1.00000000",
    fiatCurrency: "VES",
    fiatAmount: "95000.00",
    status: "pending",
    externalReference: "BIN-ETH-5678",
  });

  // Filtro por Estado: Solo completadas
  const completedList = await getOperations(wsAlpha.id, { status: "completed" });
  if (completedList.items.length !== 1 || completedList.items[0].id !== op2.id) {
    throw new Error("Filtro por status='completed' falló");
  }

  // Filtro por Estado: Solo pendientes
  const pendingList = await getOperations(wsAlpha.id, { status: "pending" });
  if (pendingList.items.length !== 1 || pendingList.items[0].id !== op3.id) {
    throw new Error("Filtro por status='pending' falló");
  }

  // Filtro por Estado: Solo canceladas
  const cancelledList = await getOperations(wsAlpha.id, { status: "cancelled" });
  if (cancelledList.items.length !== 1 || cancelledList.items[0].id !== opAlpha.id) {
    throw new Error("Filtro por status='cancelled' falló");
  }

  // Búsqueda por término: "BYB-BTC"
  const searchResult = await getOperations(wsAlpha.id, { search: "BYB-BTC" });
  if (searchResult.items.length !== 1 || searchResult.items[0].id !== op2.id) {
    throw new Error("Búsqueda por texto libre falló");
  }

  // Resumen de conteos (KPIs)
  const summary = await getOperationsSummary(wsAlpha.id);
  if (summary.completed !== 1 || summary.pending !== 1 || summary.cancelled !== 1 || summary.total !== 3) {
    throw new Error(`Resumen de operaciones erróneo: ${JSON.stringify(summary)}`);
  }

  console.log(`   - Total de operaciones en Alpha: ${summary.total}`);
  console.log(`   - Completadas: ${summary.completed}`);
  console.log(`   - Pendientes:  ${summary.pending}`);
  console.log(`   - Canceladas:  ${summary.cancelled}`);
  console.log("   ✅ Listado, filtros por estado, búsqueda de texto y conteos funcionando al 100%.\n");

  console.log("=================================================");
  console.log("🎉 TODAS LAS PRUEBAS DE LA FASE 5 HAN PASADO (100% OK)");
  console.log("=================================================");
}

runPhase5Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ ERROR EN PRUEBAS FASE 5:", err);
    process.exit(1);
  });
