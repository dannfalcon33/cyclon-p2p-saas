import { auth } from "../src/lib/auth/server";
import { db } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { provisionWorkspaceForUser } from "../src/lib/services/workspace-service";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function seedDemoData() {
  console.log("=========================================================");
  console.log("⚡ Cyclon P2P — Siembra de Usuarios y Operaciones Demo");
  console.log("=========================================================\n");

  // 1. CUENTA DEMO COMERCIANTE
  const merchantEmail = "demo@cyclonp2p.com";
  const merchantPassword = "Password123!";
  const merchantName = "Carlos Demo (Comerciante P2P)";

  console.log("-> Configurando cuenta de Comerciante Demo...");
  let merchant = await db.query.users.findFirst({
    where: eq(schema.users.email, merchantEmail),
  });

  if (!merchant) {
    const signup = await auth.api.signUpEmail({
      body: {
        email: merchantEmail,
        password: merchantPassword,
        name: merchantName,
      },
    });
    merchant = await db.query.users.findFirst({
      where: eq(schema.users.id, signup!.user.id),
    });
  }

  // Asegurar email verificado y estado activo
  await db
    .update(schema.users)
    .set({ emailVerified: true, accountStatus: "active" })
    .where(eq(schema.users.id, merchant!.id));

  // Aprovisionar workspace y trial de 7 días
  const { workspace } = await provisionWorkspaceForUser(merchant!.id, merchant!.name);
  await db
    .update(schema.workspaceSettings)
    .set({
      initialCryptoBalances: { USDT: "2500.00", BTC: "1.00000000" },
      initialFiatBalances: { VES: "1500000.00", USD: "5000.00", COP: "10000000.00" },
    })
    .where(eq(schema.workspaceSettings.workspaceId, workspace.id));
  console.log(`   ✅ Comerciante listo: ${merchantEmail} | Workspace: ${workspace.name}`);

  // 2. BANCOS DEL COMERCIANTE
  console.log("-> Sembrando bancos del comerciante...");
  let [banesco] = await db
    .insert(schema.banks)
    .values({
      workspaceId: workspace.id,
      countryCode: "VE",
      name: "Banesco Banco Universal",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  if (!banesco) {
    banesco = (await db.query.banks.findFirst({
      where: eq(schema.banks.workspaceId, workspace.id),
    }))!;
  }

  let [mercantil] = await db
    .insert(schema.banks)
    .values({
      workspaceId: workspace.id,
      countryCode: "VE",
      name: "Banco Mercantil",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  if (!mercantil) mercantil = banesco;

  let [bancolombia] = await db
    .insert(schema.banks)
    .values({
      workspaceId: workspace.id,
      countryCode: "CO",
      name: "Bancolombia",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  if (!bancolombia) bancolombia = banesco;

  // 3. MÉTODOS DE PAGO DEL COMERCIANTE
  console.log("-> Sembrando métodos de pago...");
  let [pagoMovil] = await db
    .insert(schema.paymentMethods)
    .values({
      workspaceId: workspace.id,
      countryCode: "VE",
      name: "Pago Móvil Interbancario",
      requiresBank: true,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  if (!pagoMovil) {
    pagoMovil = (await db.query.paymentMethods.findFirst({
      where: eq(schema.paymentMethods.workspaceId, workspace.id),
    }))!;
  }

  let [transferencia] = await db
    .insert(schema.paymentMethods)
    .values({
      workspaceId: workspace.id,
      countryCode: "VE",
      name: "Transferencia Bancaria",
      requiresBank: true,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  if (!transferencia) transferencia = pagoMovil;

  let [zinli] = await db
    .insert(schema.paymentMethods)
    .values({
      workspaceId: workspace.id,
      countryCode: "VE",
      name: "Zinli Wallet",
      requiresBank: false,
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  if (!zinli) zinli = pagoMovil;

  // 4. PERFILES DE COMISIÓN POR PAÍS
  console.log("-> Sembrando perfiles de comisión...");
  await db
    .insert(schema.commissionProfiles)
    .values([
      {
        workspaceId: workspace.id,
        countryCode: "VE",
        fiatCurrency: "VES",
        operationSide: "buy",
        feeType: "percentage",
        percentage: "0.0100", // 1.00%
        fixedFee: "0.00",
        isActive: true,
      },
      {
        workspaceId: workspace.id,
        countryCode: "VE",
        fiatCurrency: "VES",
        operationSide: "sell",
        feeType: "percentage",
        percentage: "0.0120", // 1.20%
        fixedFee: "0.00",
        isActive: true,
      },
      {
        workspaceId: workspace.id,
        countryCode: "CO",
        fiatCurrency: "COP",
        operationSide: "all",
        feeType: "percentage",
        percentage: "0.0080", // 0.80%
        fixedFee: "0.00",
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 5. OPERACIONES P2P DE DEMOSTRACIÓN (Con cálculo de tasa e instantáneas)
  console.log("-> Sembrando operaciones P2P reales para el dashboard...");
  const operations = [
    {
      workspaceId: workspace.id,
      countryCode: "VE",
      exchangeCode: "binance",
      operationSide: "sell",
      assetSymbol: "USDT",
      assetAmount: "250.00000000",
      fiatCurrency: "VES",
      fiatAmount: "13850.00",
      unitRate: "55.40000000",
      merchantFee: "166.20",
      exchangeFee: "13.85",
      paymentCharge: "0.00",
      paymentMethodId: pagoMovil.id,
      bankId: banesco.id,
      paymentMethodNameSnapshot: "Pago Móvil Interbancario",
      bankNameSnapshot: "Banesco Banco Universal",
      status: "completed",
      externalReference: "BIN-ORD-8829103",
      counterpartyAlias: "CryptoKing_VE",
      notes: "Venta rápida de USDT vía Pago Móvil Banesco.",
      occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
    },
    {
      workspaceId: workspace.id,
      countryCode: "VE",
      exchangeCode: "bybit",
      operationSide: "buy",
      assetSymbol: "USDT",
      assetAmount: "500.00000000",
      fiatCurrency: "VES",
      fiatAmount: "27400.00",
      unitRate: "54.80000000",
      merchantFee: "274.00",
      exchangeFee: "0.00",
      paymentCharge: "0.00",
      paymentMethodId: transferencia.id,
      bankId: mercantil.id,
      paymentMethodNameSnapshot: "Transferencia Bancaria",
      bankNameSnapshot: "Banco Mercantil",
      status: "completed",
      externalReference: "BYB-7740192",
      counterpartyAlias: "CaracasExpressP2P",
      notes: "Compra de lote USDT por Mercantil.",
      occurredAt: new Date(Date.now() - 14 * 60 * 60 * 1000), // hace 14 horas
    },
    {
      workspaceId: workspace.id,
      countryCode: "CO",
      exchangeCode: "binance",
      operationSide: "sell",
      assetSymbol: "USDT",
      assetAmount: "1200.00000000",
      fiatCurrency: "COP",
      fiatAmount: "4980000.00",
      unitRate: "4150.00000000",
      merchantFee: "49800.00",
      exchangeFee: "2490.00",
      paymentCharge: "0.00",
      paymentMethodId: transferencia.id,
      bankId: bancolombia.id,
      paymentMethodNameSnapshot: "Transferencia Bancaria",
      bankNameSnapshot: "Bancolombia",
      status: "completed",
      externalReference: "BIN-COP-99014",
      counterpartyAlias: "BogotaTraderCO",
      notes: "Operación de venta en pesos colombianos.",
      occurredAt: new Date(Date.now() - 28 * 60 * 60 * 1000), // hace 1 día
    },
    {
      workspaceId: workspace.id,
      countryCode: "VE",
      exchangeCode: "bitget",
      operationSide: "buy",
      assetSymbol: "USDT",
      assetAmount: "150.00000000",
      fiatCurrency: "USD",
      fiatAmount: "150.00",
      unitRate: "1.00000000",
      merchantFee: "1.50",
      exchangeFee: "0.00",
      paymentCharge: "0.00",
      paymentMethodId: zinli.id,
      bankId: null,
      paymentMethodNameSnapshot: "Zinli Wallet",
      bankNameSnapshot: null,
      status: "pending",
      externalReference: "BIT-ZIN-1234",
      counterpartyAlias: "ZinliFastUser",
      notes: "Pendiente por liberación del vendedor.",
      occurredAt: new Date(Date.now() - 30 * 60 * 1000), // hace 30 min
    },
    {
      workspaceId: workspace.id,
      countryCode: "VE",
      exchangeCode: "binance",
      operationSide: "sell",
      assetSymbol: "BTC",
      assetAmount: "0.01500000",
      fiatCurrency: "USD",
      fiatAmount: "1027.50",
      unitRate: "68500.00000000",
      merchantFee: "10.28",
      exchangeFee: "1.00",
      paymentCharge: "0.00",
      paymentMethodId: transferencia.id,
      bankId: banesco.id,
      paymentMethodNameSnapshot: "Transferencia Internacional",
      bankNameSnapshot: "Banesco Banco Universal",
      status: "completed",
      externalReference: "BIN-BTC-55110",
      counterpartyAlias: "WhaleDesk_P2P",
      notes: "Venta de fracción BTC.",
      occurredAt: new Date(Date.now() - 50 * 60 * 60 * 1000), // hace 2 días
    },
  ];

  for (const op of operations) {
    await db.insert(schema.p2pOperations).values(op);
  }
  console.log(`   ✅ ${operations.length} operaciones P2P registradas con éxito.`);

  // 6. CUENTA DEMO PROPIETARIO MASTER (platform_owner)
  const masterEmail = "master@cyclonp2p.com";
  const masterPassword = "MasterPassword123!";
  const masterName = "Propietario Master Cyclon";

  console.log("-> Configurando cuenta de Propietario Master...");
  let master = await db.query.users.findFirst({
    where: eq(schema.users.email, masterEmail),
  });

  if (!master) {
    const signup = await auth.api.signUpEmail({
      body: {
        email: masterEmail,
        password: masterPassword,
        name: masterName,
      },
    });
    master = await db.query.users.findFirst({
      where: eq(schema.users.id, signup!.user.id),
    });
  }

  // Promover formalmente al rol platform_owner y verificar email
  await db
    .update(schema.users)
    .set({
      role: "platform_owner",
      emailVerified: true,
      accountStatus: "active",
    })
    .where(eq(schema.users.id, master!.id));

  // Auditoría
  await db.insert(schema.platformAdminAuditLogs).values({
    actorId: master!.id,
    action: "SEED_MASTER_BOOTSTRAP",
    targetType: "user",
    targetId: master!.id,
    reason: "Aprovisionamiento de cuenta de demostración Master",
  });
  console.log(`   ✅ Propietario Master listo: ${masterEmail} (Rol: platform_owner)`);

  console.log("\n=========================================================");
  console.log("🎉 SIEMBRA DE DEMO COMPLETADA EXITOSAMENTE");
  console.log("=========================================================");
  console.log("\nCredenciales para tus pruebas:");
  console.log("---------------------------------------------------------");
  console.log("1. Panel Comerciante (/app):");
  console.log(`   Correo:     ${merchantEmail}`);
  console.log(`   Contraseña: ${merchantPassword}`);
  console.log(`   Workspace:  ${workspace.name}`);
  console.log("---------------------------------------------------------");
  console.log("2. Consola Master SaaS (/master):");
  console.log(`   Correo:     ${masterEmail}`);
  console.log(`   Contraseña: ${masterPassword}`);
  console.log(`   Rol:        platform_owner`);
  console.log("---------------------------------------------------------\n");
}

seedDemoData().catch((err) => {
  console.error("Error sembrando demo:", err);
  process.exit(1);
});
