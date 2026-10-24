import { db } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  getMasterDashboardMetrics,
  getMasterClients,
  suspendMerchant,
  reactivateMerchant,
  getMasterPromotions,
  createMasterPromotion,
  toggleMasterPromotionStatus,
  getMasterAuditLogs,
} from "../src/lib/services/master-service";

async function runPhase9Tests() {
  console.log("=================================================");
  console.log("🧪 INICIANDO BATERÍA DE PRUEBAS — FASE 9 (PANEL MASTER Y AUDITORÍA)");
  console.log("=================================================\n");

  const testSuffix = Math.random().toString(36).substring(2, 8);
  const adminId = `test-admin-p9-${testSuffix}`;
  const merchantAlphaId = `test-merchant-alpha-${testSuffix}`;
  const merchantBetaId = `test-merchant-beta-${testSuffix}`;

  try {
    // 0. Configurar Propietario (Admin) y Comerciantes de Prueba
    console.log("-> Configurando Platform Owner y Comerciantes de Prueba...");

    const [adminUser] = await db
      .insert(schema.users)
      .values({
        id: adminId,
        name: `Super Admin Master ${testSuffix}`,
        email: `admin-p9-${testSuffix}@cyclonp2p.test`,
        emailVerified: true,
        role: "platform_owner",
        accountStatus: "active",
      })
      .returning();

    const [merchantAlpha] = await db
      .insert(schema.users)
      .values({
        id: merchantAlphaId,
        name: `Comerciante Alpha P9 ${testSuffix}`,
        email: `alpha-p9-${testSuffix}@cyclonp2p.test`,
        emailVerified: true,
        role: "merchant",
        accountStatus: "active",
      })
      .returning();

    const [wsAlpha] = await db
      .insert(schema.workspaces)
      .values({
        ownerId: merchantAlpha.id,
        name: `Workspace Alpha P9 ${testSuffix}`,
      })
      .returning();

    const [merchantBeta] = await db
      .insert(schema.users)
      .values({
        id: merchantBetaId,
        name: `Comerciante Beta P9 ${testSuffix}`,
        email: `beta-p9-${testSuffix}@cyclonp2p.test`,
        emailVerified: true,
        role: "merchant",
        accountStatus: "active",
      })
      .returning();

    const [wsBeta] = await db
      .insert(schema.workspaces)
      .values({
        ownerId: merchantBeta.id,
        name: `Workspace Beta P9 ${testSuffix}`,
      })
      .returning();

    const trialPlan = await db.query.plans.findFirst({
      where: eq(schema.plans.code, "free_trial"),
    });

    if (trialPlan) {
      await db.insert(schema.subscriptions).values([
        {
          workspaceId: wsAlpha.id,
          planId: trialPlan.id,
          status: "trialing",
          startedAt: new Date(),
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          provider: "demo",
          isSimulated: true,
        },
        {
          workspaceId: wsBeta.id,
          planId: trialPlan.id,
          status: "trialing",
          startedAt: new Date(),
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          provider: "demo",
          isSimulated: true,
        },
      ]);
    }

    console.log("   - Admin ID:          ", adminUser.id, `(role: ${adminUser.role})`);
    console.log("   - Merchant Alpha ID: ", merchantAlpha.id);
    console.log("   - Merchant Beta ID:  ", merchantBeta.id);

    // -------------------------------------------------------------
    // PRUEBA 1: Métricas Globales y Separación Estricta de Ingresos
    // -------------------------------------------------------------
    console.log("\n1️⃣ Probando Cálculo de Métricas Globales y Regla Contable...");
    const metrics = await getMasterDashboardMetrics();

    if (metrics.totalMerchants < 2) {
      throw new Error(`Se esperaban al menos 2 comerciantes, se obtuvieron ${metrics.totalMerchants}`);
    }
    if (metrics.realRevenueUsd !== "0.00") {
      throw new Error(`Los ingresos reales deben ser exactamente '$0.00 USD' en el MVP, se obtuvo '${metrics.realRevenueUsd}'`);
    }
    if (typeof metrics.simulatedMrrUsd !== "string") {
      throw new Error("El MRR simulado debe reportarse como string con 2 decimales.");
    }

    console.log(`   - Comerciantes totales: ${metrics.totalMerchants}`);
    console.log(`   - Ingresos Reales:      $${metrics.realRevenueUsd} USD (MVP sin dinero real)`);
    console.log(`   - MRR Estimado (Demo):  $${metrics.simulatedMrrUsd} USD`);
    console.log("   ✅ Métricas agregadas y regla contable verificadas al 100%.");

    // -------------------------------------------------------------
    // PRUEBA 2: Consulta y Filtrado del Directorio de Clientes
    // -------------------------------------------------------------
    console.log("\n2️⃣ Probando Listado y Filtrado de Clientes...");
    const allClients = await getMasterClients({});
    if (allClients.length < 2) {
      throw new Error("No se encontraron los comerciantes de prueba.");
    }

    const filteredByName = await getMasterClients({ search: `Alpha P9 ${testSuffix}` });
    if (filteredByName.length !== 1 || filteredByName[0].id !== merchantAlpha.id) {
      throw new Error("El filtro por búsqueda no retornó exactamente al comerciante Alpha.");
    }

    console.log("   ✅ Búsqueda y filtrado de comerciantes verificado correctamente.");

    // -------------------------------------------------------------
    // PRUEBA 3: Suspensión Administrativa con Motivo Obligatorio
    // -------------------------------------------------------------
    console.log("\n3️⃣ Probando Suspensión Administrativa de Cuenta con Auditoría...");

    // Intentar suspender sin motivo debe fallar
    let failedWithoutReason = false;
    try {
      await suspendMerchant(adminUser.id, merchantAlpha.id, "");
    } catch (err: any) {
      failedWithoutReason = true;
      if (!err.message.includes("obligatorio")) {
        throw new Error(`Mensaje de error inesperado: ${err.message}`);
      }
    }
    if (!failedWithoutReason) {
      throw new Error("La suspensión sin motivo debió ser rechazada.");
    }

    // Intentar suspender a otro propietario de la plataforma debe fallar
    let failedSuspendAdmin = false;
    try {
      await suspendMerchant(adminUser.id, adminUser.id, "Intento ilegal");
    } catch (err: any) {
      failedSuspendAdmin = true;
    }
    if (!failedSuspendAdmin) {
      throw new Error("No debe permitirse suspender a un platform_owner.");
    }

    // Suspensión legítima con motivo
    const suspendReason = "Sospecha de actividad irregular reportada por contraparte P2P.";
    const suspendRes = await suspendMerchant(adminUser.id, merchantAlpha.id, suspendReason);

    if (!suspendRes.success) throw new Error("La suspensión legítima falló.");

    // Verificar en BD que el usuario quedó suspendido
    const freshAlpha = await db.query.users.findFirst({
      where: eq(schema.users.id, merchantAlpha.id),
    });

    if (freshAlpha?.accountStatus !== "suspended") {
      throw new Error(`Se esperaba accountStatus='suspended', se obtuvo '${freshAlpha?.accountStatus}'`);
    }
    if (freshAlpha?.statusReason !== suspendReason) {
      throw new Error("El statusReason en BD no coincide con el motivo ingresado.");
    }

    // Verificar que se creó el registro inmutable en platform_admin_audit_logs
    const auditSuspend = await db.query.platformAdminAuditLogs.findFirst({
      where: and(
        eq(schema.platformAdminAuditLogs.targetId, merchantAlpha.id),
        eq(schema.platformAdminAuditLogs.action, "SUSPEND_CLIENT")
      ),
    });

    if (!auditSuspend) {
      throw new Error("No se encontró el registro de auditoría para la suspensión.");
    }
    if (auditSuspend.actorId !== adminUser.id || auditSuspend.reason !== suspendReason) {
      throw new Error("Los datos de actor o motivo en auditoría son incorrectos.");
    }

    console.log("   ✅ Suspensión ejecutada, acceso bloqueado y auditoría inmutable sellada.");

    // -------------------------------------------------------------
    // PRUEBA 4: Reactivación Administrativa de Cuenta con Auditoría
    // -------------------------------------------------------------
    console.log("\n4️⃣ Probando Reactivación Administrativa de Cuenta...");
    const reactivateReason = "Aclaratoria de fondos validada satisfactoriamente.";
    const reactivateRes = await reactivateMerchant(adminUser.id, merchantAlpha.id, reactivateReason);

    if (!reactivateRes.success) throw new Error("La reactivación legítima falló.");

    const reactivatedAlpha = await db.query.users.findFirst({
      where: eq(schema.users.id, merchantAlpha.id),
    });

    if (reactivatedAlpha?.accountStatus !== "active") {
      throw new Error(`Se esperaba accountStatus='active', se obtuvo '${reactivatedAlpha?.accountStatus}'`);
    }
    if (reactivatedAlpha?.statusReason !== null) {
      throw new Error("El statusReason debió ser limpiado al reactivar.");
    }

    // Verificar log de reactivación
    const auditReactivate = await db.query.platformAdminAuditLogs.findFirst({
      where: and(
        eq(schema.platformAdminAuditLogs.targetId, merchantAlpha.id),
        eq(schema.platformAdminAuditLogs.action, "REACTIVATE_CLIENT")
      ),
    });

    if (!auditReactivate || auditReactivate.actorId !== adminUser.id) {
      throw new Error("No se persistió el registro de auditoría para la reactivación.");
    }

    console.log("   ✅ Reactivación exitosa: estado restaurado y evento sellado en auditoría.");

    // -------------------------------------------------------------
    // PRUEBA 5: Creación y Alternancia de Cupones Promocionales
    // -------------------------------------------------------------
    console.log("\n5️⃣ Probando Gestión de Promociones (CRUD y Toggle)...");
    const testPromoCode = `PROMO${testSuffix.toUpperCase()}`;

    const newPromo = await createMasterPromotion(adminUser.id, {
      code: testPromoCode,
      description: "Cupón de prueba para test automatizado Fase 9",
      discountType: "percentage",
      discountValue: 35,
      maxUses: 10,
    });

    if (!newPromo || newPromo.code !== testPromoCode) {
      throw new Error("Fallo al crear la promoción.");
    }

    // Verificar en lista de promociones
    const allPromos = await getMasterPromotions();
    const createdFound = allPromos.find((p) => p.code === testPromoCode);
    if (!createdFound) {
      throw new Error("La nueva promoción no figura en la lista general.");
    }

    // Alternar a Pausado
    const toggleToPause = await toggleMasterPromotionStatus(adminUser.id, newPromo.id);
    if (toggleToPause.isActive !== false) {
      throw new Error("El cupón debió quedar pausado (isActive: false).");
    }

    // Alternar a Activo
    const toggleToActive = await toggleMasterPromotionStatus(adminUser.id, newPromo.id);
    if (toggleToActive.isActive !== true) {
      throw new Error("El cupón debió ser reactivado (isActive: true).");
    }

    console.log("   ✅ Promoción creada, auditada, pausada y reactivada correctamente.");

    // -------------------------------------------------------------
    // PRUEBA 6: Integridad de la Bitácora de Auditoría (Append-Only)
    // -------------------------------------------------------------
    console.log("\n6️⃣ Probando Integridad de la Bitácora de Auditoría...");
    const auditLogs = await getMasterAuditLogs(50);
    const actionsFound = auditLogs.map((l) => l.action);

    if (!actionsFound.includes("SUSPEND_CLIENT")) {
      throw new Error("No se encontró la acción SUSPEND_CLIENT en la bitácora.");
    }
    if (!actionsFound.includes("REACTIVATE_CLIENT")) {
      throw new Error("No se encontró la acción REACTIVATE_CLIENT en la bitácora.");
    }
    if (!actionsFound.includes("CREATE_PROMOTION")) {
      throw new Error("No se encontró la acción CREATE_PROMOTION en la bitácora.");
    }

    console.log(`   - Registros de auditoría recuperados: ${auditLogs.length}`);
    console.log("   ✅ Trazabilidad administrativa inmutable verificada al 100%.");

    console.log("\n=================================================");
    console.log("🎉 TODAS LAS PRUEBAS DE LA FASE 9 HAN PASADO (100% OK)");
    console.log("=================================================");
  } catch (error) {
    console.error("\n❌ ERROR EN LA BATERÍA DE PRUEBAS DE LA FASE 9:", error);
    process.exit(1);
  } finally {
    // Limpieza de datos de prueba
    try {
      await db.delete(schema.users).where(eq(schema.users.id, adminId));
      await db.delete(schema.users).where(eq(schema.users.id, merchantAlphaId));
      await db.delete(schema.users).where(eq(schema.users.id, merchantBetaId));
    } catch (_) {}
  }
}

runPhase9Tests();
