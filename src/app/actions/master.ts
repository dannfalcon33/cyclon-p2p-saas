"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePlatformOwner } from "@/lib/auth/session";
import {
  getMasterDashboardMetrics,
  getMasterClients,
  suspendMerchant,
  reactivateMerchant,
  getMasterPromotions,
  createMasterPromotion,
  toggleMasterPromotionStatus,
  getMasterAuditLogs,
  CreatePromotionInput,
} from "@/lib/services/master-service";

/**
 * 1. Métricas Globales del Dashboard Master
 */
export async function fetchMasterDashboardAction() {
  await requirePlatformOwner();
  return getMasterDashboardMetrics();
}

/**
 * 2. Listado de Clientes con Filtros
 */
const clientFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  plan: z.string().optional(),
});

export async function fetchMasterClientsAction(filters?: {
  search?: string;
  status?: string;
  plan?: string;
}) {
  await requirePlatformOwner();
  const parsed = clientFiltersSchema.parse(filters || {});
  return getMasterClients(parsed);
}

/**
 * 3. Suspender Comerciante
 */
const suspendSchema = z.object({
  userId: z.string().min(1, "ID de usuario inválido"),
  reason: z.string().min(5, "El motivo debe contener al menos 5 caracteres"),
});

export async function suspendMerchantAction(input: {
  userId: string;
  reason: string;
}) {
  const admin = await requirePlatformOwner();
  const parsed = suspendSchema.parse(input);

  const res = await suspendMerchant(admin.id, parsed.userId, parsed.reason);

  revalidatePath("/master");
  revalidatePath("/master/clientes");
  revalidatePath("/master/auditoria");

  return res;
}

/**
 * 4. Reactivar Comerciante
 */
const reactivateSchema = z.object({
  userId: z.string().min(1, "ID de usuario inválido"),
  reason: z.string().min(5, "El motivo debe contener al menos 5 caracteres"),
});

export async function reactivateMerchantAction(input: {
  userId: string;
  reason: string;
}) {
  const admin = await requirePlatformOwner();
  const parsed = reactivateSchema.parse(input);

  const res = await reactivateMerchant(admin.id, parsed.userId, parsed.reason);

  revalidatePath("/master");
  revalidatePath("/master/clientes");
  revalidatePath("/master/auditoria");

  return res;
}

/**
 * 5. Listado de Promociones
 */
export async function fetchMasterPromotionsAction() {
  await requirePlatformOwner();
  return getMasterPromotions();
}

/**
 * 6. Crear Promoción / Cupón
 */
const createPromoSchema = z.object({
  code: z.string().min(3, "El código debe tener al menos 3 caracteres"),
  description: z.string().min(1, "La descripción es requerida"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("El descuento debe ser mayor a 0"),
  applicablePlans: z.array(z.string()).optional(),
  maxUses: z.coerce.number().positive().optional().nullable(),
  validUntil: z.string().optional().nullable(),
});

export async function createMasterPromotionAction(input: CreatePromotionInput) {
  const admin = await requirePlatformOwner();
  const parsed = createPromoSchema.parse(input);

  const res = await createMasterPromotion(admin.id, {
    code: parsed.code,
    description: parsed.description,
    discountType: parsed.discountType,
    discountValue: parsed.discountValue,
    applicablePlans: parsed.applicablePlans || ["business", "enterprise"],
    maxUses: parsed.maxUses || undefined,
    validUntil: parsed.validUntil ? new Date(parsed.validUntil) : null,
  });

  revalidatePath("/master/promociones");
  revalidatePath("/master/auditoria");

  return res;
}

/**
 * 7. Alternar Estado Activo / Inactivo de Promoción
 */
export async function toggleMasterPromotionAction(promoId: string) {
  const admin = await requirePlatformOwner();
  const res = await toggleMasterPromotionStatus(admin.id, promoId);

  revalidatePath("/master/promociones");
  revalidatePath("/master/auditoria");

  return res;
}

/**
 * 8. Bitácora de Auditoría Administrativa
 */
export async function fetchMasterAuditLogsAction() {
  await requirePlatformOwner();
  return getMasterAuditLogs(100);
}
