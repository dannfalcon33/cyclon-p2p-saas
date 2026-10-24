"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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
} from "@/lib/services/catalogs-service";

/**
 * Obtiene el ID del workspace autenticado de forma segura.
 * Si no hay sesión (modo visual demo sin login), recupera el workspace de demostración.
 */
async function resolveWorkspaceId(): Promise<string> {
  const user = await getAuthenticatedUser();
  if (user) {
    const ws = await db.query.workspaces.findFirst({
      where: eq(schema.workspaces.ownerId, user.id),
    });
    if (ws) return ws.id;
  }

  // Fallback seguro al workspace demo si se interactúa sin sesión
  const demoMerchant = await db.query.users.findFirst({
    where: eq(schema.users.email, "demo@cyclonp2p.com"),
  });
  if (demoMerchant) {
    const demoWs = await db.query.workspaces.findFirst({
      where: eq(schema.workspaces.ownerId, demoMerchant.id),
    });
    if (demoWs) return demoWs.id;
  }

  throw new Error("No se pudo resolver un espacio de trabajo válido.");
}

export async function fetchFullConfigurationAction() {
  const workspaceId = await resolveWorkspaceId();
  const [globalCatalogs, workspaceConfig] = await Promise.all([
    getGlobalCatalogs(),
    getWorkspaceConfiguration(workspaceId),
  ]);

  return {
    workspaceId,
    ...globalCatalogs,
    ...workspaceConfig,
  };
}

export async function addBankAction(data: { countryCode: string; name: string }) {
  const workspaceId = await resolveWorkspaceId();
  const bank = await createWorkspaceBank(workspaceId, data);
  revalidatePath("/app/configuracion");
  revalidatePath("/app/operaciones/nueva");
  return bank;
}

export async function updateBankAction(data: {
  id: string;
  name?: string;
  isActive?: boolean;
  countryCode?: string;
}) {
  const workspaceId = await resolveWorkspaceId();
  const bank = await updateWorkspaceBank(workspaceId, data);
  revalidatePath("/app/configuracion");
  revalidatePath("/app/operaciones/nueva");
  return bank;
}

export async function deleteBankAction(id: string) {
  const workspaceId = await resolveWorkspaceId();
  const bank = await deleteWorkspaceBank(workspaceId, id);
  revalidatePath("/app/configuracion");
  revalidatePath("/app/operaciones/nueva");
  return bank;
}

export async function addPaymentMethodAction(data: {
  countryCode?: string;
  name: string;
  requiresBank?: boolean;
}) {
  const workspaceId = await resolveWorkspaceId();
  const method = await createWorkspacePaymentMethod(workspaceId, data);
  revalidatePath("/app/configuracion");
  revalidatePath("/app/operaciones/nueva");
  return method;
}

export async function updatePaymentMethodAction(data: {
  id: string;
  name?: string;
  requiresBank?: boolean;
  isActive?: boolean;
  countryCode?: string;
}) {
  const workspaceId = await resolveWorkspaceId();
  const method = await updateWorkspacePaymentMethod(workspaceId, data);
  revalidatePath("/app/configuracion");
  revalidatePath("/app/operaciones/nueva");
  return method;
}

export async function deletePaymentMethodAction(id: string) {
  const workspaceId = await resolveWorkspaceId();
  const method = await deleteWorkspacePaymentMethod(workspaceId, id);
  revalidatePath("/app/configuracion");
  revalidatePath("/app/operaciones/nueva");
  return method;
}

export async function saveCommissionProfileAction(data: {
  countryCode: string;
  fiatCurrency: string;
  operationSide?: "buy" | "sell" | "all";
  percentage: string;
  fixedFee?: string;
}) {
  const workspaceId = await resolveWorkspaceId();
  const profile = await upsertCommissionProfile(workspaceId, data);
  revalidatePath("/app/configuracion");
  revalidatePath("/app/operaciones/nueva");
  return profile;
}

export async function saveWorkspaceSettingsAction(data: {
  primaryCountry?: string;
  timezone?: string;
  enabledFiatCurrencies?: string[];
  businessName?: string;
  taxId?: string;
}) {
  const workspaceId = await resolveWorkspaceId();
  const settings = await updateWorkspaceSettings(workspaceId, data);
  revalidatePath("/app/configuracion");
  revalidatePath("/app");
  return settings;
}
