import { db } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  getWorkspaceSubscriptionDetails,
  hasFeature,
  canWorkspaceCreateOperations,
  validatePromotionCoupon,
  simulatePlanCheckout,
  PLAN_FEATURES,
} from "../src/lib/services/plan-service";
import { createOperation, getOperations } from "../src/lib/services/operations-service";
import { generateOperationsExcel } from "../src/lib/services/excel-export-service";

async function runPhase8Tests() {
  console.log("=================================================");
  console.log("🧪 INICIANDO BATERÍA DE PRUEBAS — FASE 8 (PLANES Y CHECKOUT SIMULADO)");
  console.log("=================================================\n");

  const testSuffix = Math.random().toString(36).substring(2, 8);
  const userAlphaId = `test-user-p8-alpha-${testSuffix}`;
  const userBetaId = `test-user-p8-beta-${testSuffix}`;

  try {
    // 0. Crear Usuarios y Workspaces de Prueba
    console.log("-> Configurando Comerciante Alpha y Comerciante Beta...");

    const [userAlpha] = await db
      .insert(schema.users)
      .values({
        id: userAlphaId,
        name: `Alpha Trader P8 ${testSuffix}`,
        email: `alpha-p8-${testSuffix}@cyclonp2p.test`,
        emailVerified: true,
        role: "merchant",
      })
      .returning();

    const [wsAlpha] = await db
      .insert(schema.workspaces)
      .values({
        ownerId: userAlpha.id,
        name: `Workspace Alpha P8 ${testSuffix}`,
      })
      .returning();

    const [userBeta] = await db
      .insert(schema.users)
      .values({
        id: userBetaId,
        name: `Beta Trader P8 ${testSuffix}`,
        email: `beta-p8-${testSuffix}@cyclonp2p.test`,
        emailVerified: true,
        role: "merchant",
      })
      .returning();

    const [wsBeta] = await db
      .insert(schema.workspaces)
      .values({
        ownerId: userBeta.id,
        name: `Workspace Beta P8 ${testSuffix}`,
      })
      .returning();

    // Buscar planes de la semilla
    const freeTrialPlan = await db.query.plans.findFirst({
      where: eq(schema.plans.code, "free_trial"),
    });
    const businessPlan = await db.query.plans.findFirst({
      where: eq(schema.plans.code, "business"),
    });
    const enterprisePlan = await db.query.plans.findFirst({
      where: eq(schema.plans.code, "enterprise"),
    });

    if (!freeTrialPlan || !businessPlan || !enterprisePlan) {
      throw new Error("Los planes base (free_trial, business, enterprise) no están sembrados en Neon.");
    }

    // Asegurar cupón de prueba CYCLON50
    await db
      .insert(schema.promotions)
      .values({
        code: "CYCLON50",
        description: "50% descuento de demostración",
        discountType: "percentage",
        discountValue: "50.00",
        applicablePlans: ["business", "enterprise"],
        isActive: true,
      })
      .onConflictDoUpdate({
        target: schema.promotions.code,
        set: { isActive: true, discountValue: "50.00" },
      });

    // Crear suscripción inicial para Alpha (Free Trial activo)
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [subAlpha] = await db
      .insert(schema.subscriptions)
      .values({
        workspaceId: wsAlpha.id,
        planId: freeTrialPlan.id,
        status: "trialing",
        startedAt: now,
        endsAt: sevenDaysLater,
        provider: "demo",
        isSimulated: true,
      })
      .returning();

    console.log("   - Workspace Alpha ID:", wsAlpha.id);
    console.log("   - Workspace Beta ID: ", wsBeta.id);
    console.log("   - Suscripción inicial Alpha:", subAlpha.id, `(status: ${subAlpha.status})`);

    // -------------------------------------------------------------
    // PRUEBA 1: Consulta de Suscripción y Matriz de Capacidades
    // -------------------------------------------------------------
    console.log("\n1️⃣ Probando Consulta de Suscripción y Matriz de Capacidades...");
    const detailsAlpha = await getWorkspaceSubscriptionDetails(wsAlpha.id);

    if (detailsAlpha.planCode !== "free_trial") {
      throw new Error(`Se esperaba plan 'free_trial', se obtuvo '${detailsAlpha.planCode}'`);
    }
    if (detailsAlpha.isExpired !== false) {
      throw new Error("El plan inicial no debería estar expirado.");
    }
    if (detailsAlpha.remainingDays < 6 || detailsAlpha.remainingDays > 7) {
      throw new Error(`Días restantes inesperados: ${detailsAlpha.remainingDays}`);
    }

    // Verificar capacidades Free Trial
    const hasDashboard = await hasFeature(wsAlpha.id, PLAN_FEATURES.DASHBOARD_ACCESS);
    const hasEnterpriseCharts = await hasFeature(wsAlpha.id, PLAN_FEATURES.ENTERPRISE_MARKET_CHARTS);
    const canCreate = await hasFeature(wsAlpha.id, PLAN_FEATURES.CAN_CREATE_OPERATIONS);

    if (!hasDashboard) throw new Error("Free Trial debe tener acceso al dashboard");
    if (hasEnterpriseCharts) throw new Error("Free Trial NO debe tener acceso a cotizaciones Enterprise");
    if (!canCreate) throw new Error("Free Trial activo debe tener permiso para registrar operaciones");

    console.log("   ✅ Suscripción Free Trial verificada: 7 días, activo, dashboard OK, Enterprise restringido.");

    // -------------------------------------------------------------
    // PRUEBA 2: Registro de Operación permitida en Free Trial Activo
    // -------------------------------------------------------------
    console.log("\n2️⃣ Probando Registro de Operación en Trial Vigente...");
    const op = await createOperation(wsAlpha.id, {
      countryCode: "VE",
      exchangeCode: "binance",
      operationSide: "buy",
      assetSymbol: "USDT",
      assetAmount: 100,
      fiatCurrency: "VES",
      fiatAmount: 3850,
      merchantFee: "0.00",
      exchangeFee: "0.00",
      paymentCharge: "0.00",
    });

    if (!op || !op.id) throw new Error("Error al registrar operación en trial vigente");
    console.log("   ✅ Operación P2P registrada con éxito en trial activo (ID:", op.id, ")");

    // -------------------------------------------------------------
    // PRUEBA 3: Expiración de Prueba y Política de Retención de Datos
    // -------------------------------------------------------------
    console.log("\n3️⃣ Probando Expiración de Prueba Gratuita y Retención de Datos...");
    // Forzamos la fecha de expiración al pasado (ayer)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await db
      .update(schema.subscriptions)
      .set({ endsAt: yesterday, status: "trialing" })
      .where(eq(schema.subscriptions.id, subAlpha.id));

    // Evaluamos estado dinámico
    const detailsExpired = await getWorkspaceSubscriptionDetails(wsAlpha.id);
    if (!detailsExpired.isExpired) {
      throw new Error("El sistema no detectó la expiración del período de prueba.");
    }
    if (detailsExpired.status !== "expired") {
      throw new Error(`Se esperaba status 'expired', se obtuvo '${detailsExpired.status}'`);
    }

    // Comprobar bloqueo de creación de operaciones
    const permission = await canWorkspaceCreateOperations(wsAlpha.id);
    if (permission.allowed !== false) {
      throw new Error("El workspace expirado no debe tener permiso de crear operaciones.");
    }

    let operationBlocked = false;
    try {
      await createOperation(wsAlpha.id, {
        countryCode: "VE",
        exchangeCode: "binance",
        operationSide: "buy",
        assetSymbol: "USDT",
        assetAmount: 50,
        fiatCurrency: "VES",
        fiatAmount: 1925,
      });
    } catch (err: any) {
      operationBlocked = true;
      if (!err.message.includes("período de prueba gratuita ha finalizado")) {
        throw new Error(`Mensaje de error inesperado: ${err.message}`);
      }
    }

    if (!operationBlocked) {
      throw new Error("El servidor debió bloquear la creación de la operación para un usuario expirado.");
    }

    // Política de Retención: Consultas y exportación Excel DEBEN seguir funcionando al 100%
    const historicalOps = await getOperations(wsAlpha.id, {});
    if (historicalOps.pagination.total !== 1) {
      throw new Error(`Se esperaba retener 1 operación histórica, se encontraron ${historicalOps.pagination.total}`);
    }

    const excelBuffer = await generateOperationsExcel(wsAlpha.id, {});
    if (!excelBuffer || excelBuffer.length === 0) {
      throw new Error("La exportación Excel debió funcionar para el usuario con prueba expirada.");
    }

    console.log("   ✅ Expiración comprobada: mutaciones bloqueadas pero historial y Excel 100% disponibles.");

    // -------------------------------------------------------------
    // PRUEBA 4: Validación de Cupones Promocionales (CYCLON50)
    // -------------------------------------------------------------
    console.log("\n4️⃣ Probando Validación de Cupones Promocionales...");
    const validPromo = await validatePromotionCoupon("CYCLON50", "business");
    if (!validPromo.valid) {
      throw new Error(`El cupón CYCLON50 debió ser válido: ${validPromo.message}`);
    }
    if (validPromo.discountAmount !== 14.5 || validPromo.finalPrice !== 14.5) {
      throw new Error(`Cálculo de descuento erróneo: descuento=${validPromo.discountAmount}, final=${validPromo.finalPrice}`);
    }

    const invalidPromo = await validatePromotionCoupon("CUPON_FALSO_XYZ", "business");
    if (invalidPromo.valid !== false) {
      throw new Error("Un cupón inexistente debió ser rechazado.");
    }

    console.log("   ✅ Validación de cupones exitosa: CYCLON50 aplica 50% ($14.50 USD), inválido rechazado.");

    // -------------------------------------------------------------
    // PRUEBA 5: Simulación de Checkout (DemoBillingProvider)
    // -------------------------------------------------------------
    console.log("\n5️⃣ Probando Pasarela de Simulación (DemoBillingProvider)...");

    // A) Simulación Fallida (outcome = 'failed')
    const failedCheckout = await simulatePlanCheckout(wsAlpha.id, userAlpha.id, {
      planCode: "business",
      outcome: "failed",
    });
    if (failedCheckout.success !== false || failedCheckout.outcome !== "failed") {
      throw new Error("Checkout simulado con outcome 'failed' debió retornar success = false");
    }

    // Verificar que se registró el evento en billing_events con is_simulated = true
    const failedEvent = await db.query.billingEvents.findFirst({
      where: and(
        eq(schema.billingEvents.workspaceId, wsAlpha.id),
        eq(schema.billingEvents.outcome, "failed")
      ),
    });
    if (!failedEvent || !failedEvent.isSimulated) {
      throw new Error("No se persistió el evento de facturación simulado 'failed'.");
    }

    // B) Simulación Aprobada (outcome = 'approved') con Cupón
    const approvedCheckout = await simulatePlanCheckout(wsAlpha.id, userAlpha.id, {
      planCode: "business",
      outcome: "approved",
      couponCode: "CYCLON50",
    });

    if (!approvedCheckout.success || approvedCheckout.outcome !== "approved") {
      throw new Error(`Checkout simulado aprobado falló: ${approvedCheckout.message}`);
    }
    if (approvedCheckout.amountDisplayed !== "14.50") {
      throw new Error(`Monto displayed erróneo: ${approvedCheckout.amountDisplayed}`);
    }

    // Verificar actualización de suscripción
    const updatedDetails = await getWorkspaceSubscriptionDetails(wsAlpha.id);
    if (updatedDetails.planCode !== "business" || updatedDetails.status !== "active") {
      throw new Error(`Suscripción no actualizada: plan=${updatedDetails.planCode}, status=${updatedDetails.status}`);
    }
    if (updatedDetails.isExpired !== false) {
      throw new Error("La suscripción reactivada no debe estar expirada.");
    }

    // Verificar que ahora PUEDE crear operaciones
    const canCreateAgain = await canWorkspaceCreateOperations(wsAlpha.id);
    if (!canCreateAgain.allowed) {
      throw new Error("El workspace con plan Business activo debió recuperar permiso de creación.");
    }

    // C) Upgrade a Enterprise
    const enterpriseCheckout = await simulatePlanCheckout(wsAlpha.id, userAlpha.id, {
      planCode: "enterprise",
      outcome: "approved",
    });
    if (!enterpriseCheckout.success) {
      throw new Error("Error al simular upgrade a Enterprise");
    }

    const hasEnterpriseNow = await hasFeature(wsAlpha.id, PLAN_FEATURES.ENTERPRISE_MARKET_CHARTS);
    if (!hasEnterpriseNow) {
      throw new Error("El workspace con Enterprise debe tener habilitado enterprise_market_charts");
    }

    console.log("   ✅ Facturación simulada exitosa: 'failed' auditado, 'approved' reactiva plan y upgrade a Enterprise.");

    // -------------------------------------------------------------
    // PRUEBA 6: Aislamiento Multinquilino en Planes y Suscripciones
    // -------------------------------------------------------------
    console.log("\n6️⃣ Probando Aislamiento Multinquilino en Suscripciones...");
    const detailsBeta = await getWorkspaceSubscriptionDetails(wsBeta.id);

    // Beta no debe verse afectado por el upgrade de Alpha a Enterprise
    if (detailsBeta.planCode === "enterprise") {
      throw new Error("El Workspace Beta heredó erróneamente el plan Enterprise de Alpha.");
    }

    const betaHasEnterprise = await hasFeature(wsBeta.id, PLAN_FEATURES.ENTERPRISE_MARKET_CHARTS);
    if (betaHasEnterprise) {
      throw new Error("El Workspace Beta NO debe tener acceso a las funciones Enterprise de Alpha.");
    }

    console.log("   ✅ Aislamiento multinquilino verificado al 100%: planes de Alpha y Beta completamente independientes.");

    console.log("\n=================================================");
    console.log("🎉 TODAS LAS PRUEBAS DE LA FASE 8 HAN PASADO (100% OK)");
    console.log("=================================================");
  } catch (error) {
    console.error("\n❌ ERROR EN LA BATERÍA DE PRUEBAS DE LA FASE 8:", error);
    process.exit(1);
  } finally {
    // Limpieza de datos de prueba
    try {
      await db.delete(schema.users).where(eq(schema.users.id, userAlphaId));
      await db.delete(schema.users).where(eq(schema.users.id, userBetaId));
    } catch (_) {}
  }
}

runPhase8Tests();
