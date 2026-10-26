import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface ProvisionResult {
  workspace: typeof schema.workspaces.$inferSelect;
  settings: typeof schema.workspaceSettings.$inferSelect;
  subscription?: typeof schema.subscriptions.$inferSelect;
  isExisting: boolean;
}

/**
 * Aprovisionamiento idempotente de Espacio de Trabajo, Ajustes y Prueba de 7 días.
 * Si el usuario ya cuenta con un workspace, no duplica registros ni planes.
 */
export async function provisionWorkspaceForUser(
  userId: string,
  userName: string
): Promise<ProvisionResult> {
  // 1. Verificar si ya existe un workspace para este usuario (Idempotencia)
  const existingWs = await db.query.workspaces.findFirst({
    where: eq(schema.workspaces.ownerId, userId),
    with: {
      settings: true,
      subscriptions: true,
    },
  });

  if (existingWs) {
    return {
      workspace: existingWs,
      settings: existingWs.settings!,
      subscription: existingWs.subscriptions?.[0],
      isExisting: true,
    };
  }

  // 2. Crear el nuevo Workspace
  const [newWs] = await db
    .insert(schema.workspaces)
    .values({
      ownerId: userId,
      name: `Espacio de ${userName?.trim() || "Comerciante"}`,
    })
    .returning();

  // 3. Crear los Ajustes por defecto del Workspace (País inicial VE, monedas VES y USD)
  const [settings] = await db
    .insert(schema.workspaceSettings)
    .values({
      workspaceId: newWs.id,
      primaryCountry: "VE",
      timezone: "America/Caracas",
      enabledFiatCurrencies: ["VES", "USD"],
      initialCryptoBalances: { USDT: "0.00" },
      initialFiatBalances: { VES: "1000000.00", USD: "2000.00" },
    })
    .returning();

  // 4. Buscar el Plan de Prueba Gratuita (Free Trial de 7 días)
  const trialPlan = await db.query.plans.findFirst({
    where: eq(schema.plans.code, "free_trial"),
  });

  let subscription: typeof schema.subscriptions.$inferSelect | undefined;

  if (trialPlan) {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días

    const [sub] = await db
      .insert(schema.subscriptions)
      .values({
        workspaceId: newWs.id,
        planId: trialPlan.id,
        status: "trialing",
        startedAt: now,
        endsAt: endsAt,
        provider: "demo",
        isSimulated: true,
      })
      .returning();

    subscription = sub;
  }

  return {
    workspace: newWs,
    settings,
    subscription,
    isExisting: false,
  };
}
