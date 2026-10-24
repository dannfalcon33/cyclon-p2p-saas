import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Catálogos Globales Inmutables / Sembrados
 */
export async function getGlobalCatalogs() {
  const [countries, fiatCurrencies, cryptoAssets, exchanges] = await Promise.all([
    db.query.countries.findMany({ where: eq(schema.countries.isActive, true) }),
    db.query.fiatCurrencies.findMany({ where: eq(schema.fiatCurrencies.isActive, true) }),
    db.query.assets.findMany({ where: eq(schema.assets.isActive, true) }),
    db.query.exchanges.findMany({ where: eq(schema.exchanges.isActive, true) }),
  ]);

  return {
    countries,
    fiatCurrencies,
    cryptoAssets,
    exchanges,
  };
}

/**
 * Consulta la configuración privada completa de un Workspace
 */
export async function getWorkspaceConfiguration(workspaceId: string) {
  const [settings, banks, paymentMethods, commissionProfiles] = await Promise.all([
    db.query.workspaceSettings.findFirst({
      where: eq(schema.workspaceSettings.workspaceId, workspaceId),
    }),
    db.query.banks.findMany({
      where: eq(schema.banks.workspaceId, workspaceId),
    }),
    db.query.paymentMethods.findMany({
      where: eq(schema.paymentMethods.workspaceId, workspaceId),
    }),
    db.query.commissionProfiles.findMany({
      where: eq(schema.commissionProfiles.workspaceId, workspaceId),
    }),
  ]);

  return {
    settings,
    banks,
    paymentMethods,
    commissionProfiles,
  };
}

/**
 * Gestión de Bancos por Workspace
 */
export async function createWorkspaceBank(
  workspaceId: string,
  data: { countryCode: string; name: string }
) {
  const [bank] = await db
    .insert(schema.banks)
    .values({
      workspaceId,
      countryCode: data.countryCode,
      name: data.name.trim(),
      isActive: true,
    })
    .returning();
  return bank;
}

export async function updateWorkspaceBank(
  workspaceId: string,
  data: { id: string; name?: string; isActive?: boolean; countryCode?: string }
) {
  const [bank] = await db
    .update(schema.banks)
    .set({
      ...(data.name && { name: data.name.trim() }),
      ...(data.countryCode && { countryCode: data.countryCode }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    })
    .where(and(eq(schema.banks.id, data.id), eq(schema.banks.workspaceId, workspaceId)))
    .returning();
  return bank;
}

export async function deleteWorkspaceBank(workspaceId: string, id: string) {
  // Desactivación lógica para no romper historial de operaciones pasadas
  const [bank] = await db
    .update(schema.banks)
    .set({ isActive: false })
    .where(and(eq(schema.banks.id, id), eq(schema.banks.workspaceId, workspaceId)))
    .returning();
  return bank;
}

/**
 * Gestión de Métodos de Pago por Workspace
 */
export async function createWorkspacePaymentMethod(
  workspaceId: string,
  data: { countryCode?: string; name: string; requiresBank?: boolean }
) {
  const [method] = await db
    .insert(schema.paymentMethods)
    .values({
      workspaceId,
      countryCode: data.countryCode || null,
      name: data.name.trim(),
      requiresBank: data.requiresBank ?? false,
      isActive: true,
    })
    .returning();
  return method;
}

export async function updateWorkspacePaymentMethod(
  workspaceId: string,
  data: { id: string; name?: string; requiresBank?: boolean; isActive?: boolean; countryCode?: string }
) {
  const [method] = await db
    .update(schema.paymentMethods)
    .set({
      ...(data.name && { name: data.name.trim() }),
      ...(data.countryCode !== undefined && { countryCode: data.countryCode || null }),
      ...(data.requiresBank !== undefined && { requiresBank: data.requiresBank }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    })
    .where(and(eq(schema.paymentMethods.id, data.id), eq(schema.paymentMethods.workspaceId, workspaceId)))
    .returning();
  return method;
}

export async function deleteWorkspacePaymentMethod(workspaceId: string, id: string) {
  // Desactivación lógica para proteger trazabilidad
  const [method] = await db
    .update(schema.paymentMethods)
    .set({ isActive: false })
    .where(and(eq(schema.paymentMethods.id, id), eq(schema.paymentMethods.workspaceId, workspaceId)))
    .returning();
  return method;
}

/**
 * Gestión de Perfiles de Comisión por País y Operación
 */
export async function upsertCommissionProfile(
  workspaceId: string,
  data: {
    countryCode: string;
    fiatCurrency: string;
    operationSide?: "buy" | "sell" | "all";
    percentage: string;
    fixedFee?: string;
    feeType?: "percentage" | "fixed" | "percentage_and_fixed";
  }
) {
  const side = data.operationSide || "all";

  // Buscar perfil previo para este workspace, país y lado
  const existing = await db.query.commissionProfiles.findFirst({
    where: and(
      eq(schema.commissionProfiles.workspaceId, workspaceId),
      eq(schema.commissionProfiles.countryCode, data.countryCode),
      eq(schema.commissionProfiles.operationSide, side)
    ),
  });

  if (existing) {
    const [updated] = await db
      .update(schema.commissionProfiles)
      .set({
        fiatCurrency: data.fiatCurrency,
        percentage: data.percentage,
        fixedFee: data.fixedFee || "0.00",
        feeType: data.feeType || "percentage",
        updatedAt: new Date(),
      })
      .where(eq(schema.commissionProfiles.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(schema.commissionProfiles)
    .values({
      workspaceId,
      countryCode: data.countryCode,
      fiatCurrency: data.fiatCurrency,
      operationSide: side,
      percentage: data.percentage,
      fixedFee: data.fixedFee || "0.00",
      feeType: data.feeType || "percentage",
    })
    .returning();
  return created;
}

/**
 * Ajustes Generales del Workspace (País principal, divisas, zona horaria)
 */
export async function updateWorkspaceSettings(
  workspaceId: string,
  data: {
    primaryCountry?: string;
    timezone?: string;
    enabledFiatCurrencies?: string[];
    businessName?: string;
    taxId?: string;
  }
) {
  const [settings] = await db
    .update(schema.workspaceSettings)
    .set({
      ...(data.primaryCountry && { primaryCountry: data.primaryCountry }),
      ...(data.timezone && { timezone: data.timezone }),
      ...(data.enabledFiatCurrencies && { enabledFiatCurrencies: data.enabledFiatCurrencies }),
      ...(data.businessName !== undefined && { businessName: data.businessName }),
      ...(data.taxId !== undefined && { taxId: data.taxId }),
      updatedAt: new Date(),
    })
    .where(eq(schema.workspaceSettings.workspaceId, workspaceId))
    .returning();
  return settings;
}
