"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthenticatedWorkspace } from "@/lib/auth/session";
import {
  getWorkspaceSubscriptionDetails,
  getCommercialPlans,
  validatePromotionCoupon,
  simulatePlanCheckout,
} from "@/lib/services/plan-service";

/**
 * 1. Obtiene los detalles de la suscripción actual y los planes disponibles
 */
export async function fetchWorkspaceSubscriptionAction() {
  const { workspace } = await getAuthenticatedWorkspace();
  const subscription = await getWorkspaceSubscriptionDetails(workspace.id);
  const commercialPlans = await getCommercialPlans();

  return {
    subscription,
    availablePlans: commercialPlans.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      features: (p.features as string[]) || [],
      trialDays: p.trialDays,
      demoPriceUsd: p.demoPriceUsd,
    })),
  };
}

/**
 * 2. Valida un código de cupón de descuento promocional
 */
const validateCouponSchema = z.object({
  couponCode: z.string().min(1, "Ingresa un código de cupón"),
  planCode: z.enum(["business", "enterprise"]),
});

export async function validatePromotionCouponAction(input: {
  couponCode: string;
  planCode: "business" | "enterprise";
}) {
  const parsed = validateCouponSchema.parse(input);
  return validatePromotionCoupon(parsed.couponCode, parsed.planCode);
}

/**
 * 3. Ejecuta el checkout simulado de un plan comercial
 */
const checkoutSchema = z.object({
  planCode: z.enum(["business", "enterprise"]),
  outcome: z.enum(["approved", "pending", "failed"]),
  couponCode: z.string().optional(),
});

export async function simulatePlanCheckoutAction(input: {
  planCode: "business" | "enterprise";
  outcome: "approved" | "pending" | "failed";
  couponCode?: string;
}) {
  const { user, workspace } = await getAuthenticatedWorkspace();
  const parsed = checkoutSchema.parse(input);

  const result = await simulatePlanCheckout(workspace.id, user.id, {
    planCode: parsed.planCode,
    outcome: parsed.outcome,
    couponCode: parsed.couponCode,
  });

  // Revalidar rutas para reflejar las nuevas capacidades
  revalidatePath("/app");
  revalidatePath("/app/plan");
  revalidatePath("/app/operaciones");
  revalidatePath("/app/operaciones/nueva");
  revalidatePath("/app/mercado");

  return result;
}
