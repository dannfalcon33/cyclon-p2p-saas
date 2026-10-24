import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export const PLAN_FEATURES = {
  DASHBOARD_ACCESS: "dashboard_access",
  P2P_OPERATIONS_UNLIMITED: "p2p_operations_unlimited",
  COUNTRY_COMMISSIONS_7_COUNTRIES: "country_commissions_7_countries",
  CUSTOM_BANKS_AND_METHODS: "custom_banks_and_methods",
  EXCEL_EXPORT_BASIC: "excel_export_basic",
  EXCEL_EXPORT_MULTIHOP_FULL: "excel_export_multihop_full",
  ENTERPRISE_MARKET_CHARTS: "enterprise_market_charts",
  ENTERPRISE_CRYPTO_NEWS: "enterprise_crypto_news",
  PRIORITY_SUPPORT: "priority_support",
  CAN_CREATE_OPERATIONS: "can_create_operations",
} as const;

export type PlanFeatureKey = (typeof PLAN_FEATURES)[keyof typeof PLAN_FEATURES];

export interface WorkspaceSubscriptionDetails {
  subscriptionId: string;
  planCode: string;
  planName: string;
  status: "trialing" | "active" | "expired" | "cancelled";
  isExpired: boolean;
  remainingDays: number;
  startedAt: Date;
  endsAt: Date | null;
  features: string[];
  isSimulated: boolean;
}

/**
 * Obtiene los detalles de suscripción activos para un workspace,
 * calculando dinámicamente si el trial ha expirado y actualizando el estado si procede.
 */
export async function getWorkspaceSubscriptionDetails(
  workspaceId: string
): Promise<WorkspaceSubscriptionDetails> {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.workspaceId, workspaceId),
    with: {
      plan: true,
    },
    orderBy: [desc(schema.subscriptions.startedAt)],
  });

  const now = new Date();

  // Si no cuenta con suscripción, buscar el plan free_trial por defecto
  if (!sub || !sub.plan) {
    const trialPlan = await db.query.plans.findFirst({
      where: eq(schema.plans.code, "free_trial"),
    });

    const defaultFeatures = (trialPlan?.features as string[]) || [
      PLAN_FEATURES.DASHBOARD_ACCESS,
      PLAN_FEATURES.P2P_OPERATIONS_UNLIMITED,
      PLAN_FEATURES.COUNTRY_COMMISSIONS_7_COUNTRIES,
      PLAN_FEATURES.CUSTOM_BANKS_AND_METHODS,
      PLAN_FEATURES.EXCEL_EXPORT_BASIC,
    ];

    return {
      subscriptionId: "",
      planCode: trialPlan?.code || "free_trial",
      planName: trialPlan?.name || "Free Trial (7 Días)",
      status: "trialing",
      isExpired: false,
      remainingDays: 7,
      startedAt: now,
      endsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      features: [...defaultFeatures, PLAN_FEATURES.CAN_CREATE_OPERATIONS],
      isSimulated: true,
    };
  }

  // Evaluar expiración
  let effectiveStatus = sub.status as "trialing" | "active" | "expired" | "cancelled";
  let isExpired = false;
  let remainingDays = 0;

  if (sub.endsAt) {
    const endsAtDate = new Date(sub.endsAt);
    const diffMs = endsAtDate.getTime() - now.getTime();
    remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    if (now > endsAtDate) {
      if (effectiveStatus === "trialing") {
        effectiveStatus = "expired";
        isExpired = true;

        // Actualizar el estado en base de datos si no estaba marcado como expired
        await db
          .update(schema.subscriptions)
          .set({ status: "expired", updatedAt: now })
          .where(eq(schema.subscriptions.id, sub.id));
      } else if (effectiveStatus === "active" && diffMs < 0) {
        // En planes activos de pago simulado, el período venció
        effectiveStatus = "expired";
        isExpired = true;
      }
    }
  }

  if (effectiveStatus === "expired" || effectiveStatus === "cancelled") {
    isExpired = true;
  }

  // Calcular capacidades efectivas (features)
  const baseFeatures = (sub.plan.features as string[]) || [];
  let effectiveFeatures: string[] = [];

  if (isExpired) {
    // Si expiró el plan, se conservan lecturas y exportaciones, pero se bloquea creación de operaciones
    effectiveFeatures = baseFeatures.filter(
      (f) =>
        f === PLAN_FEATURES.DASHBOARD_ACCESS ||
        f === PLAN_FEATURES.EXCEL_EXPORT_BASIC ||
        f === PLAN_FEATURES.EXCEL_EXPORT_MULTIHOP_FULL
    );
  } else {
    // Si está vigente, incluye todas las del plan más la capacidad de crear operaciones
    effectiveFeatures = [...baseFeatures, PLAN_FEATURES.CAN_CREATE_OPERATIONS];
  }

  return {
    subscriptionId: sub.id,
    planCode: sub.plan.code,
    planName: sub.plan.name,
    status: effectiveStatus,
    isExpired,
    remainingDays,
    startedAt: new Date(sub.startedAt),
    endsAt: sub.endsAt ? new Date(sub.endsAt) : null,
    features: effectiveFeatures,
    isSimulated: sub.isSimulated,
  };
}

/**
 * Comprueba si un workspace cuenta con una capacidad específica activa.
 */
export async function hasFeature(
  workspaceId: string,
  feature: string
): Promise<boolean> {
  const details = await getWorkspaceSubscriptionDetails(workspaceId);
  return details.features.includes(feature);
}

/**
 * Valida si el workspace tiene permiso para crear o mutar operaciones P2P.
 * Retorna un objeto descriptivo con la razón en caso de rechazo.
 */
export async function canWorkspaceCreateOperations(
  workspaceId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const details = await getWorkspaceSubscriptionDetails(workspaceId);

  if (details.isExpired) {
    return {
      allowed: false,
      reason:
        "Tu período de prueba gratuita ha finalizado. Conservas acceso de lectura y exportación a Excel de tus datos históricos, pero debes activar un plan Business o Enterprise para registrar nuevas operaciones.",
    };
  }

  if (details.status === "cancelled") {
    return {
      allowed: false,
      reason:
        "Tu suscripción se encuentra cancelada. Activa un plan para reanudar el registro de operaciones.",
    };
  }

  return { allowed: true };
}

/**
 * Obtiene el catálogo de planes comerciales activos.
 */
export async function getCommercialPlans() {
  return db.query.plans.findMany({
    where: eq(schema.plans.isActive, true),
    orderBy: [schema.plans.demoPriceUsd],
  });
}

/**
 * Valida un cupón de promoción para un plan determinado.
 */
export async function validatePromotionCoupon(
  couponCode: string,
  targetPlanCode: string
): Promise<{
  valid: boolean;
  message: string;
  promotion?: typeof schema.promotions.$inferSelect;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}> {
  const cleanCode = couponCode.trim().toUpperCase();

  const plan = await db.query.plans.findFirst({
    where: eq(schema.plans.code, targetPlanCode),
  });

  if (!plan) {
    return {
      valid: false,
      message: "El plan seleccionado no es válido.",
      originalPrice: 0,
      discountAmount: 0,
      finalPrice: 0,
    };
  }

  const originalPrice = parseFloat(plan.demoPriceUsd);

  if (!cleanCode) {
    return {
      valid: false,
      message: "Ingresa un código de cupón.",
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
    };
  }

  const promo = await db.query.promotions.findFirst({
    where: and(
      eq(schema.promotions.code, cleanCode),
      eq(schema.promotions.isActive, true)
    ),
  });

  if (!promo) {
    return {
      valid: false,
      message: `El cupón '${cleanCode}' no existe o ha sido desactivado.`,
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
    };
  }

  const now = new Date();

  // Validar vigencia
  if (promo.validFrom && now < new Date(promo.validFrom)) {
    return {
      valid: false,
      message: `El cupón '${cleanCode}' aún no está activo.`,
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
    };
  }

  if (promo.validUntil && now > new Date(promo.validUntil)) {
    return {
      valid: false,
      message: `El cupón '${cleanCode}' ha expirado.`,
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
    };
  }

  // Validar límite de usos
  if (promo.maxUses !== null && promo.timesUsed >= promo.maxUses) {
    return {
      valid: false,
      message: `El cupón '${cleanCode}' ha alcanzado el límite máximo de canjes.`,
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
    };
  }

  // Validar planes elegibles
  const applicablePlans = (promo.applicablePlans as string[]) || [];
  if (applicablePlans.length > 0 && !applicablePlans.includes(targetPlanCode)) {
    return {
      valid: false,
      message: `El cupón '${cleanCode}' no es aplicable para el plan ${plan.name}.`,
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
    };
  }

  // Calcular descuento
  const discountVal = parseFloat(promo.discountValue);
  let discountAmount = 0;

  if (promo.discountType === "percentage") {
    discountAmount = (originalPrice * discountVal) / 100;
  } else {
    // Tipo 'fixed'
    discountAmount = discountVal;
  }

  // Descuento no puede superar el precio original
  discountAmount = Math.min(originalPrice, Math.max(0, discountAmount));
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return {
    valid: true,
    message: `¡Cupón '${cleanCode}' aplicado exitosamente! Ahorras $${discountAmount.toFixed(2)} USD.`,
    promotion: promo,
    originalPrice,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    finalPrice: parseFloat(finalPrice.toFixed(2)),
  };
}

/**
 * Adaptador de Facturación Simulada (DemoBillingProvider).
 * No procesa dinero real. Registra el evento en billing_events con is_simulated = true
 * y actualiza la suscripción del workspace.
 */
export async function simulatePlanCheckout(
  workspaceId: string,
  userId: string,
  params: {
    planCode: string;
    outcome: "approved" | "pending" | "failed";
    couponCode?: string;
  }
): Promise<{
  success: boolean;
  outcome: "approved" | "pending" | "failed";
  demoReference: string;
  amountDisplayed: string;
  planName: string;
  message: string;
}> {
  const targetPlan = await db.query.plans.findFirst({
    where: eq(schema.plans.code, params.planCode),
  });

  if (!targetPlan) {
    throw new Error(`El plan comercial '${params.planCode}' no existe.`);
  }

  // Calcular precios y cupón
  let finalPrice = parseFloat(targetPlan.demoPriceUsd);
  let appliedPromo: typeof schema.promotions.$inferSelect | null = null;

  if (params.couponCode && params.couponCode.trim()) {
    const couponValidation = await validatePromotionCoupon(
      params.couponCode,
      params.planCode
    );
    if (couponValidation.valid && couponValidation.promotion) {
      appliedPromo = couponValidation.promotion;
      finalPrice = couponValidation.finalPrice;
    }
  }

  const now = new Date();
  const demoReference = `DEMO-CHK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // 1. Registrar evento de facturación simulado (auditoría financiera demo)
  const [billingEvent] = await db
    .insert(schema.billingEvents)
    .values({
      workspaceId,
      planId: targetPlan.id,
      promotionId: appliedPromo ? appliedPromo.id : null,
      amountDisplayed: finalPrice.toFixed(2),
      currency: "USD",
      outcome: params.outcome,
      demoReference,
      isSimulated: true,
      createdAt: now,
    })
    .returning();

  // 2. Gestionar resultado según outcome
  if (params.outcome === "approved") {
    // Si se usó cupón, registrar redención e incrementar usos
    if (appliedPromo) {
      await db.insert(schema.promotionRedemptions).values({
        promotionId: appliedPromo.id,
        userId,
        workspaceId,
        billingEventId: billingEvent.id,
        originalPrice: targetPlan.demoPriceUsd,
        discountedPrice: finalPrice.toFixed(2),
        isSimulated: true,
        createdAt: now,
      });

      await db
        .update(schema.promotions)
        .set({
          timesUsed: appliedPromo.timesUsed + 1,
          updatedAt: now,
        })
        .where(eq(schema.promotions.id, appliedPromo.id));
    }

    // Actualizar suscripción activa a 30 días posteriores
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const existingSub = await db.query.subscriptions.findFirst({
      where: eq(schema.subscriptions.workspaceId, workspaceId),
      orderBy: [desc(schema.subscriptions.startedAt)],
    });

    if (existingSub) {
      await db
        .update(schema.subscriptions)
        .set({
          planId: targetPlan.id,
          status: "active",
          startedAt: now,
          endsAt: thirtyDaysLater,
          provider: "demo",
          isSimulated: true,
          updatedAt: now,
        })
        .where(eq(schema.subscriptions.id, existingSub.id));
    } else {
      await db.insert(schema.subscriptions).values({
        workspaceId,
        planId: targetPlan.id,
        status: "active",
        startedAt: now,
        endsAt: thirtyDaysLater,
        provider: "demo",
        isSimulated: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      outcome: "approved",
      demoReference,
      amountDisplayed: finalPrice.toFixed(2),
      planName: targetPlan.name,
      message: `¡Plan ${targetPlan.name} activado con éxito! Se ha registrado el evento de facturación simulada '${demoReference}'.`,
    };
  }

  if (params.outcome === "pending") {
    return {
      success: false,
      outcome: "pending",
      demoReference,
      amountDisplayed: finalPrice.toFixed(2),
      planName: targetPlan.name,
      message: `El checkout simulado ha quedado en estado 'Pendiente' (${demoReference}). Tu plan actual se mantendrá hasta que el pago sea simulado como aprobado.`,
    };
  }

  // Outcome: 'failed'
  return {
    success: false,
    outcome: "failed",
    demoReference,
    amountDisplayed: finalPrice.toFixed(2),
    planName: targetPlan.name,
    message: `El checkout simulado ha sido rechazado (${demoReference}). No se aplicaron cargos ni cambios a tu suscripción.`,
  };
}
