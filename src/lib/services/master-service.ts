import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";

export interface MasterDashboardMetrics {
  totalMerchants: number;
  activeMerchants: number;
  suspendedMerchants: number;
  pendingMerchants: number;
  activeTrials: number;
  subscriptionsByPlan: {
    freeTrial: number;
    business: number;
    enterprise: number;
  };
  realRevenueUsd: string;
  simulatedMrrUsd: string;
  simulatedTotalBilledUsd: string;
  recentClients: {
    id: string;
    name: string;
    email: string;
    workspaceName: string;
    planName: string;
    planCode: string;
    status: string;
    registeredAt: Date;
    operationsCount: number;
  }[];
  recentAuditLogs: {
    id: string;
    actorEmail: string;
    action: string;
    targetType: string;
    targetId: string;
    reason: string;
    createdAt: Date;
  }[];
}

export interface MasterClientItem {
  id: string;
  name: string;
  email: string;
  country: string;
  workspaceName: string;
  planCode: string;
  planName: string;
  status: string;
  statusReason?: string | null;
  registeredAt: Date;
  trialEndsAt?: Date | null;
  operationsCount: number;
}

export interface CreatePromotionInput {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number | string;
  applicablePlans?: string[];
  maxUses?: number;
  validUntil?: Date | string | null;
}

/**
 * 1. Métricas Globales para el Panel Master
 */
export async function getMasterDashboardMetrics(): Promise<MasterDashboardMetrics> {
  // A. Conteo de Comerciantes y Estados
  const merchants = await db.query.users.findMany({
    where: eq(schema.users.role, "merchant"),
    with: {
      workspace: {
        with: {
          subscriptions: {
            with: {
              plan: true,
            },
            orderBy: [desc(schema.subscriptions.startedAt)],
          },
          p2pOperations: true,
        },
      },
    },
    orderBy: [desc(schema.users.createdAt)],
  });

  const totalMerchants = merchants.length;
  let activeMerchants = 0;
  let suspendedMerchants = 0;
  let pendingMerchants = 0;

  for (const m of merchants) {
    if (m.accountStatus === "active") activeMerchants++;
    else if (m.accountStatus === "suspended") suspendedMerchants++;
    else pendingMerchants++;
  }

  // B. Suscripciones y Trials
  let activeTrials = 0;
  let freeTrialCount = 0;
  let businessCount = 0;
  let enterpriseCount = 0;

  for (const m of merchants) {
    const sub = m.workspace?.subscriptions?.[0];
    const planCode = sub?.plan?.code;
    const subStatus = sub?.status;

    if (subStatus === "trialing") {
      activeTrials++;
      freeTrialCount++;
    } else if (planCode === "business" && subStatus === "active") {
      businessCount++;
    } else if (planCode === "enterprise" && subStatus === "active") {
      enterpriseCount++;
    } else if (planCode === "free_trial") {
      freeTrialCount++;
    }
  }

  // C. Ingresos Reales vs Facturación Simulada
  // Regla contable: Ingresos reales = 0.00 en MVP de portafolio
  const realRevenueUsd = "0.00";

  // MRR Estimado Demo: ($29 * business) + ($79 * enterprise)
  const simulatedMrr = businessCount * 29.0 + enterpriseCount * 79.0;
  const simulatedMrrUsd = simulatedMrr.toFixed(2);

  // Total Facturado Simulado (billing_events con outcome 'approved')
  const approvedEvents = await db.query.billingEvents.findMany({
    where: eq(schema.billingEvents.outcome, "approved"),
  });

  const totalBilled = approvedEvents.reduce(
    (acc, ev) => acc + parseFloat(ev.amountDisplayed || "0"),
    0
  );
  const simulatedTotalBilledUsd = totalBilled.toFixed(2);

  // D. Clientes Recientes (Top 5)
  const recentClients = merchants.slice(0, 5).map((m) => {
    const sub = m.workspace?.subscriptions?.[0];
    return {
      id: m.id,
      name: m.name,
      email: m.email,
      workspaceName: m.workspace?.name || "Sin Workspace",
      planName: sub?.plan?.name || "Free Trial",
      planCode: sub?.plan?.code || "free_trial",
      status: m.accountStatus,
      registeredAt: new Date(m.createdAt),
      operationsCount: m.workspace?.p2pOperations?.length || 0,
    };
  });

  // E. Registros de Auditoría Recientes (Top 5)
  const recentLogs = await db.query.platformAdminAuditLogs.findMany({
    orderBy: [desc(schema.platformAdminAuditLogs.createdAt)],
    limit: 5,
    with: {
      actor: true,
    },
  });

  const recentAuditLogs = recentLogs.map((log) => ({
    id: log.id,
    actorEmail: log.actor?.email || "admin@cyclonp2p.com",
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    reason: log.reason,
    createdAt: new Date(log.createdAt),
  }));

  return {
    totalMerchants,
    activeMerchants,
    suspendedMerchants,
    pendingMerchants,
    activeTrials,
    subscriptionsByPlan: {
      freeTrial: freeTrialCount,
      business: businessCount,
      enterprise: enterpriseCount,
    },
    realRevenueUsd,
    simulatedMrrUsd,
    simulatedTotalBilledUsd,
    recentClients,
    recentAuditLogs,
  };
}

/**
 * 2. Listado Paginado / Filtrado de Clientes para la Consola Master
 */
export async function getMasterClients(filters: {
  search?: string;
  status?: string;
  plan?: string;
}): Promise<MasterClientItem[]> {
  const merchants = await db.query.users.findMany({
    where: eq(schema.users.role, "merchant"),
    with: {
      workspace: {
        with: {
          settings: true,
          subscriptions: {
            with: {
              plan: true,
            },
            orderBy: [desc(schema.subscriptions.startedAt)],
          },
          p2pOperations: true,
        },
      },
    },
    orderBy: [desc(schema.users.createdAt)],
  });

  const search = filters.search?.trim().toLowerCase() || "";
  const statusFilter = filters.status || "ALL";
  const planFilter = filters.plan || "ALL";

  const result: MasterClientItem[] = [];

  for (const m of merchants) {
    const ws = m.workspace;
    const sub = ws?.subscriptions?.[0];
    const planCode = sub?.plan?.code || "free_trial";
    const planName = sub?.plan?.name || "Free Trial (7 Días)";
    const country = ws?.settings?.primaryCountry || "VE";

    // Filtro de búsqueda
    if (
      search &&
      !m.name.toLowerCase().includes(search) &&
      !m.email.toLowerCase().includes(search) &&
      !m.id.toLowerCase().includes(search)
    ) {
      continue;
    }

    // Filtro de estado
    if (statusFilter !== "ALL" && m.accountStatus !== statusFilter) {
      continue;
    }

    // Filtro de plan
    if (planFilter !== "ALL" && planCode !== planFilter) {
      continue;
    }

    result.push({
      id: m.id,
      name: m.name,
      email: m.email,
      country,
      workspaceName: ws?.name || "Workspace",
      planCode,
      planName,
      status: m.accountStatus,
      statusReason: m.statusReason,
      registeredAt: new Date(m.createdAt),
      trialEndsAt: sub?.endsAt ? new Date(sub.endsAt) : null,
      operationsCount: ws?.p2pOperations?.length || 0,
    });
  }

  return result;
}

/**
 * 3. Suspensión Administrativa de Cliente con Motivo Obligatorio y Auditoría
 */
export async function suspendMerchant(
  adminUserId: string,
  targetUserId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const cleanReason = reason.trim();
  if (!cleanReason || cleanReason.length < 5) {
    throw new Error("El motivo de suspensión es obligatorio y debe tener al menos 5 caracteres.");
  }

  const target = await db.query.users.findFirst({
    where: eq(schema.users.id, targetUserId),
  });

  if (!target) {
    throw new Error("El comerciante no existe.");
  }

  if (target.role === "platform_owner") {
    throw new Error("No es posible suspender a un usuario con rol de propietario de la plataforma.");
  }

  const now = new Date();

  // 1. Actualizar usuario a estado 'suspended'
  await db
    .update(schema.users)
    .set({
      accountStatus: "suspended",
      statusReason: cleanReason,
      updatedAt: now,
    })
    .where(eq(schema.users.id, targetUserId));

  // 2. Insertar registro append-only en la bitácora de auditoría
  await db.insert(schema.platformAdminAuditLogs).values({
    actorId: adminUserId,
    action: "SUSPEND_CLIENT",
    targetType: "user",
    targetId: targetUserId,
    reason: cleanReason,
    diffPayload: {
      previousStatus: target.accountStatus,
      newStatus: "suspended",
      userEmail: target.email,
    },
    createdAt: now,
  });

  return {
    success: true,
    message: `El comerciante ${target.name} (${target.email}) ha sido suspendido. Acceso bloqueado.`,
  };
}

/**
 * 4. Reactivación Administrativa de Cliente con Motivo Obligatorio y Auditoría
 */
export async function reactivateMerchant(
  adminUserId: string,
  targetUserId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const cleanReason = reason.trim();
  if (!cleanReason || cleanReason.length < 5) {
    throw new Error("El motivo de reactivación es obligatorio y debe tener al menos 5 caracteres.");
  }

  const target = await db.query.users.findFirst({
    where: eq(schema.users.id, targetUserId),
  });

  if (!target) {
    throw new Error("El comerciante no existe.");
  }

  const now = new Date();

  // 1. Actualizar usuario a estado 'active'
  await db
    .update(schema.users)
    .set({
      accountStatus: "active",
      statusReason: null,
      updatedAt: now,
    })
    .where(eq(schema.users.id, targetUserId));

  // 2. Insertar registro append-only en auditoría
  await db.insert(schema.platformAdminAuditLogs).values({
    actorId: adminUserId,
    action: "REACTIVATE_CLIENT",
    targetType: "user",
    targetId: targetUserId,
    reason: cleanReason,
    diffPayload: {
      previousStatus: target.accountStatus,
      newStatus: "active",
      userEmail: target.email,
    },
    createdAt: now,
  });

  return {
    success: true,
    message: `El comerciante ${target.name} (${target.email}) ha sido reactivado exitosamente.`,
  };
}

/**
 * 5. Listado de Promociones y Cupones
 */
export async function getMasterPromotions() {
  return db.query.promotions.findMany({
    orderBy: [desc(schema.promotions.createdAt)],
  });
}

/**
 * 6. Creación de Nueva Promoción / Cupón con Auditoría
 */
export async function createMasterPromotion(
  adminUserId: string,
  input: CreatePromotionInput
) {
  const cleanCode = input.code.trim().toUpperCase();
  if (!cleanCode || cleanCode.length < 3) {
    throw new Error("El código del cupón debe tener al menos 3 caracteres.");
  }

  const existing = await db.query.promotions.findFirst({
    where: eq(schema.promotions.code, cleanCode),
  });

  if (existing) {
    throw new Error(`El código promocional '${cleanCode}' ya existe.`);
  }

  const valNum =
    typeof input.discountValue === "number"
      ? input.discountValue
      : parseFloat(input.discountValue);

  if (isNaN(valNum) || valNum <= 0) {
    throw new Error("El valor del descuento debe ser mayor a cero.");
  }

  if (input.discountType === "percentage" && valNum > 100) {
    throw new Error("El porcentaje de descuento no puede ser superior al 100%.");
  }

  const now = new Date();
  const validUntilDate = input.validUntil ? new Date(input.validUntil) : null;

  const [newPromo] = await db
    .insert(schema.promotions)
    .values({
      code: cleanCode,
      description: input.description.trim() || `Cupón promocional ${cleanCode}`,
      discountType: input.discountType,
      discountValue: valNum.toFixed(2),
      applicablePlans: input.applicablePlans || ["business", "enterprise"],
      maxUses: input.maxUses || null,
      timesUsed: 0,
      validFrom: now,
      validUntil: validUntilDate,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Auditoría
  await db.insert(schema.platformAdminAuditLogs).values({
    actorId: adminUserId,
    action: "CREATE_PROMOTION",
    targetType: "promotion",
    targetId: newPromo.id,
    reason: `Creación del cupón '${cleanCode}' con descuento de ${valNum}${
      input.discountType === "percentage" ? "%" : " USD"
    }.`,
    diffPayload: {
      code: cleanCode,
      discountType: input.discountType,
      discountValue: valNum,
    },
    createdAt: now,
  });

  return newPromo;
}

/**
 * 7. Alternar Estado (Activar/Desactivar) de Cupón Promocional con Auditoría
 */
export async function toggleMasterPromotionStatus(
  adminUserId: string,
  promoId: string
) {
  const promo = await db.query.promotions.findFirst({
    where: eq(schema.promotions.id, promoId),
  });

  if (!promo) {
    throw new Error("La promoción no existe.");
  }

  const newStatus = !promo.isActive;
  const now = new Date();

  await db
    .update(schema.promotions)
    .set({
      isActive: newStatus,
      updatedAt: now,
    })
    .where(eq(schema.promotions.id, promoId));

  // Auditoría
  await db.insert(schema.platformAdminAuditLogs).values({
    actorId: adminUserId,
    action: newStatus ? "ACTIVATE_PROMOTION" : "DEACTIVATE_PROMOTION",
    targetType: "promotion",
    targetId: promoId,
    reason: `Cambio de estado administrativo del cupón '${promo.code}' a ${
      newStatus ? "Activo" : "Pausado"
    }.`,
    diffPayload: {
      code: promo.code,
      previousStatus: promo.isActive,
      newStatus,
    },
    createdAt: now,
  });

  return { success: true, isActive: newStatus, code: promo.code };
}

/**
 * 8. Bitácora de Auditoría Administrativa Inmutable
 */
export async function getMasterAuditLogs(limit = 100) {
  const logs = await db.query.platformAdminAuditLogs.findMany({
    orderBy: [desc(schema.platformAdminAuditLogs.createdAt)],
    limit,
    with: {
      actor: true,
    },
  });

  return logs.map((l) => ({
    id: l.id,
    actorEmail: l.actor?.email || "admin@cyclonp2p.com",
    actorName: l.actor?.name || "Administrador",
    action: l.action,
    targetType: l.targetType,
    targetId: l.targetId,
    reason: l.reason,
    diffPayload: l.diffPayload,
    createdAt: new Date(l.createdAt),
  }));
}
