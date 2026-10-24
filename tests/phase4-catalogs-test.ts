import { db } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { provisionWorkspaceForUser } from "../src/lib/services/workspace-service";
import {
  getGlobalCatalogs,
  getWorkspaceConfiguration,
  createWorkspaceBank,
  updateWorkspaceBank,
  deleteWorkspaceBank,
  createWorkspacePaymentMethod,
  updateWorkspacePaymentMethod,
  deleteWorkspacePaymentMethod,
  upsertCommissionProfile,
  updateWorkspaceSettings,
} from "../src/lib/services/catalogs-service";
import { auth } from "../src/lib/auth/server";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function runPhase4Tests() {
  console.log("=================================================");
  console.log("🧪 INICIANDO BATERÍA DE PRUEBAS — FASE 4 (CATÁLOGOS)");
  console.log("=================================================\n");

  // -------------------------------------------------------------------------
  // Test 1: Integridad de Catálogos Globales Inmutables
  // -------------------------------------------------------------------------
  console.log("1️⃣ Verificando Catálogos Globales (Países, Monedas, Activos, Exchanges)...");
  const globals = await getGlobalCatalogs();

  console.log(`   - Países encontrados: ${globals.countries.length}`);
  const requiredCountries = ["VE", "CO", "BR", "AR", "EC", "PE", "CL"];
  for (const code of requiredCountries) {
    const found = globals.countries.find((c) => c.code === code);
    if (!found) throw new Error(`Falta el país requerido '${code}' en el catálogo global`);
  }
  console.log(`   ✅ Los 7 países iniciales (VE, CO, BR, AR, EC, PE, CL) están activos.`);

  console.log(`   - Monedas ISO 4217 encontradas: ${globals.fiatCurrencies.length}`);
  const requiredFiats = ["VES", "COP", "BRL", "ARS", "USD", "PEN", "CLP"];
  for (const code of requiredFiats) {
    const found = globals.fiatCurrencies.find((f) => f.code === code);
    if (!found) throw new Error(`Falta la moneda ISO 4217 '${code}'`);
  }
  console.log(`   ✅ Monedas normalizadas (VES, COP, BRL, ARS, USD, PEN, CLP) verificadas.`);

  console.log(`   - Criptoactivos P2P encontrados: ${globals.cryptoAssets.length}`);
  const requiredAssets = ["USDT", "USDC", "BTC", "ETH", "SOL", "BNB"];
  for (const symbol of requiredAssets) {
    const found = globals.cryptoAssets.find((a) => a.symbol === symbol);
    if (!found) throw new Error(`Falta el activo cripto '${symbol}'`);
  }
  console.log(`   ✅ Criptoactivos (USDT, USDC, BTC, ETH, SOL, BNB) verificados.`);

  console.log(`   - Exchanges P2P encontrados: ${globals.exchanges.length}`);
  const requiredExchanges = ["binance", "bybit", "bitget"];
  for (const code of requiredExchanges) {
    const found = globals.exchanges.find((e) => e.code === code);
    if (!found) throw new Error(`Falta el exchange '${code}'`);
  }
  console.log(`   ✅ Exchanges iniciales (Binance, Bybit, Bitget) verificados.\n`);

  // -------------------------------------------------------------------------
  // Configuración de dos usuarios y dos workspaces para prueba de aislamiento
  // -------------------------------------------------------------------------
  const timestamp = Date.now();
  const user1Email = `trader_alpha_${timestamp}@cyclonp2p.test`;
  const user2Email = `trader_beta_${timestamp}@cyclonp2p.test`;

  console.log("-> Creando dos comerciantes independientes para test de multitenancy...");
  const signup1 = await auth.api.signUpEmail({
    body: { email: user1Email, password: "Password123!", name: "Trader Alpha" },
  });
  const signup2 = await auth.api.signUpEmail({
    body: { email: user2Email, password: "Password123!", name: "Trader Beta" },
  });

  const { workspace: ws1 } = await provisionWorkspaceForUser(signup1!.user.id, "Trader Alpha");
  const { workspace: ws2 } = await provisionWorkspaceForUser(signup2!.user.id, "Trader Beta");

  console.log(`   - Workspace 1 (Alpha): ${ws1.id}`);
  console.log(`   - Workspace 2 (Beta):  ${ws2.id}\n`);

  // -------------------------------------------------------------------------
  // Test 2: Creación y Aislamiento de Bancos Privados
  // -------------------------------------------------------------------------
  console.log("2️⃣ Probando Creación y Aislamiento Multinquilino de Bancos...");
  const bank1 = await createWorkspaceBank(ws1.id, {
    countryCode: "VE",
    name: "Banesco Banco Universal Alpha",
  });
  const bank2 = await createWorkspaceBank(ws1.id, {
    countryCode: "VE",
    name: "Banco Mercantil Alpha",
  });
  const bankBeta = await createWorkspaceBank(ws2.id, {
    countryCode: "CO",
    name: "Bancolombia Beta",
  });

  const configWs1 = await getWorkspaceConfiguration(ws1.id);
  const configWs2 = await getWorkspaceConfiguration(ws2.id);

  // Verificación estricta: Ws1 solo ve sus bancos
  const ws1BankNames = configWs1.banks.map((b) => b.name);
  if (!ws1BankNames.includes("Banesco Banco Universal Alpha") || !ws1BankNames.includes("Banco Mercantil Alpha")) {
    throw new Error("Workspace 1 no listó sus propios bancos");
  }
  if (ws1BankNames.includes("Bancolombia Beta")) {
    throw new Error("FALLO CRÍTICO DE AISLAMIENTO: Workspace 1 puede ver los bancos de Workspace 2");
  }

  // Verificación estricta: Ws2 solo ve sus bancos
  const ws2BankNames = configWs2.banks.map((b) => b.name);
  if (!ws2BankNames.includes("Bancolombia Beta")) {
    throw new Error("Workspace 2 no listó sus propios bancos");
  }
  if (ws2BankNames.includes("Banesco Banco Universal Alpha") || ws2BankNames.includes("Banco Mercantil Alpha")) {
    throw new Error("FALLO CRÍTICO DE AISLAMIENTO: Workspace 2 puede ver los bancos de Workspace 1");
  }

  console.log("   ✅ Bancos creados correctamente y aislados al 100% por workspace.\n");

  // -------------------------------------------------------------------------
  // Test 3: Creación y Aislamiento de Métodos de Pago Privados
  // -------------------------------------------------------------------------
  console.log("3️⃣ Probando Creación y Aislamiento de Métodos de Pago...");
  const methodPagoMovil = await createWorkspacePaymentMethod(ws1.id, {
    countryCode: "VE",
    name: "Pago Móvil Alpha",
    requiresBank: true,
  });
  const methodZinli = await createWorkspacePaymentMethod(ws1.id, {
    name: "Zinli Wallet Global Alpha",
    requiresBank: false,
  });
  const methodNequi = await createWorkspacePaymentMethod(ws2.id, {
    countryCode: "CO",
    name: "Nequi Beta",
    requiresBank: false,
  });

  const methodsWs1 = (await getWorkspaceConfiguration(ws1.id)).paymentMethods;
  const methodsWs2 = (await getWorkspaceConfiguration(ws2.id)).paymentMethods;

  if (methodsWs1.some((m) => m.name === "Nequi Beta")) {
    throw new Error("FALLO DE AISLAMIENTO: Workspace 1 puede ver métodos de pago de Workspace 2");
  }
  if (methodsWs2.some((m) => m.name.includes("Alpha"))) {
    throw new Error("FALLO DE AISLAMIENTO: Workspace 2 puede ver métodos de pago de Workspace 1");
  }

  console.log("   ✅ Métodos de pago creados y estrictamente encapsulados por workspace.\n");

  // -------------------------------------------------------------------------
  // Test 4: Filtrado Dinámico por País
  // -------------------------------------------------------------------------
  console.log("4️⃣ Probando Filtrado Dinámico de Bancos y Métodos por País...");
  // En Workspace 1:
  // Bancos VE: Banesco, Mercantil
  // Bancos CO: 0
  const ws1BanksVE = configWs1.banks.filter((b) => b.countryCode === "VE" && b.isActive);
  const ws1BanksCO = configWs1.banks.filter((b) => b.countryCode === "CO" && b.isActive);

  if (ws1BanksVE.length !== 2) throw new Error(`Se esperaban 2 bancos VE en Ws1, recibidos: ${ws1BanksVE.length}`);
  if (ws1BanksCO.length !== 0) throw new Error(`Se esperaban 0 bancos CO en Ws1, recibidos: ${ws1BanksCO.length}`);

  // Métodos VE: Pago Móvil (VE) + Zinli (Global/null)
  // Métodos CO: Zinli (Global/null) únicamente
  const ws1MethodsVE = methodsWs1.filter((m) => m.isActive && (m.countryCode === null || m.countryCode === "VE"));
  const ws1MethodsCO = methodsWs1.filter((m) => m.isActive && (m.countryCode === null || m.countryCode === "CO"));

  if (ws1MethodsVE.length !== 2) throw new Error(`Se esperaban 2 métodos para VE en Ws1, recibidos: ${ws1MethodsVE.length}`);
  if (ws1MethodsCO.length !== 1 || ws1MethodsCO[0].name !== "Zinli Wallet Global Alpha") {
    throw new Error("Filtrado erróneo: CO no debe incluir Pago Móvil VE, solo Zinli global");
  }

  console.log("   ✅ Filtrado dinámico por país verificado con éxito.\n");

  // -------------------------------------------------------------------------
  // Test 5: Desactivación / Soft Delete y Preservación de Integridad
  // -------------------------------------------------------------------------
  console.log("5️⃣ Probando Desactivación (Soft-Delete) y Preservación Relacional...");
  // Desactivar Banesco
  await deleteWorkspaceBank(ws1.id, bank1.id);

  const updatedConfig1 = await getWorkspaceConfiguration(ws1.id);
  const activeBanks1 = updatedConfig1.banks.filter((b) => b.isActive);
  const softDeletedBank = updatedConfig1.banks.find((b) => b.id === bank1.id);

  if (activeBanks1.length !== 1 || activeBanks1[0].id === bank1.id) {
    throw new Error("El banco desactivado aún aparece como activo en la configuración");
  }
  if (!softDeletedBank || softDeletedBank.isActive !== false) {
    throw new Error("El registro físico del banco fue destruido o no se marcó como isActive = false");
  }

  // Reactivar el banco
  await updateWorkspaceBank(ws1.id, { id: bank1.id, isActive: true });
  const reactivatedConfig = await getWorkspaceConfiguration(ws1.id);
  const reactivatedBank = reactivatedConfig.banks.find((b) => b.id === bank1.id);
  if (!reactivatedBank || !reactivatedBank.isActive) {
    throw new Error("No se pudo reactivar el banco");
  }

  console.log("   ✅ Soft-delete verificado: el registro físico se preserva para el historial de operaciones.\n");

  // -------------------------------------------------------------------------
  // Test 6: Perfiles de Comisión por País y Tipo de Operación
  // -------------------------------------------------------------------------
  console.log("6️⃣ Probando Perfiles de Comisión por País y Lado de Operación...");
  await upsertCommissionProfile(ws1.id, {
    countryCode: "VE",
    fiatCurrency: "VES",
    operationSide: "buy",
    percentage: "0.0125", // 1.25%
    fixedFee: "0.00",
  });

  await upsertCommissionProfile(ws1.id, {
    countryCode: "VE",
    fiatCurrency: "VES",
    operationSide: "sell",
    percentage: "0.0150", // 1.50%
    fixedFee: "10.00",
  });

  const ws1Profiles = (await getWorkspaceConfiguration(ws1.id)).commissionProfiles;
  const buyProfile = ws1Profiles.find((p) => p.countryCode === "VE" && p.operationSide === "buy");
  const sellProfile = ws1Profiles.find((p) => p.countryCode === "VE" && p.operationSide === "sell");

  if (!buyProfile || parseFloat(buyProfile.percentage) !== 0.0125) {
    throw new Error("Perfil de comisión de compra VE incorrecto");
  }
  if (!sellProfile || parseFloat(sellProfile.percentage) !== 0.0150 || parseFloat(sellProfile.fixedFee) !== 10.00) {
    throw new Error("Perfil de comisión de venta VE incorrecto");
  }

  // Asegurar que Ws2 no ve estos perfiles
  const ws2Profiles = (await getWorkspaceConfiguration(ws2.id)).commissionProfiles;
  if (ws2Profiles.some((p) => p.workspaceId === ws1.id)) {
    throw new Error("FALLO DE AISLAMIENTO: Perfiles de comisión expuestos entre workspaces");
  }

  console.log("   ✅ Perfiles de comisión registrados y discriminados por lado (compra/venta).\n");

  // -------------------------------------------------------------------------
  // Test 7: Ajustes Generales de Workspace
  // -------------------------------------------------------------------------
  console.log("7️⃣ Probando Ajustes Generales de Workspace...");
  await updateWorkspaceSettings(ws1.id, {
    primaryCountry: "CO",
    timezone: "America/Bogota",
    enabledFiatCurrencies: ["COP", "USD"],
    businessName: "Alpha Trading Hub",
    taxId: "J-99999999",
  });

  const ws1UpdatedSettings = (await getWorkspaceConfiguration(ws1.id)).settings;
  const ws2Settings = (await getWorkspaceConfiguration(ws2.id)).settings;

  if (
    ws1UpdatedSettings?.primaryCountry !== "CO" ||
    ws1UpdatedSettings?.timezone !== "America/Bogota" ||
    ws1UpdatedSettings?.businessName !== "Alpha Trading Hub"
  ) {
    throw new Error("Los ajustes de Workspace 1 no se persistieron correctamente");
  }

  // Comprobar que Ws2 no fue alterado
  if (ws2Settings?.primaryCountry === "CO") {
    throw new Error("Los ajustes de Workspace 2 fueron sobreescritos por Workspace 1");
  }

  console.log("   ✅ Ajustes de Workspace persistidos y aislados.\n");

  console.log("=================================================");
  console.log("🎉 TODAS LAS PRUEBAS DE LA FASE 4 HAN PASADO (100% OK)");
  console.log("=================================================");
}

runPhase4Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ ERROR EN PRUEBAS FASE 4:", err);
    process.exit(1);
  });
