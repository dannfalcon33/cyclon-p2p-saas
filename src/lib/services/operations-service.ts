import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc, sql, ilike, or, gte, lte } from "drizzle-orm";

export interface CreateOperationInput {
  countryCode: string;
  exchangeCode: string;
  operationSide: "buy" | "sell";
  assetSymbol: string;
  assetAmount: string | number;
  fiatCurrency: string;
  fiatAmount: string | number;
  merchantFee?: string | number;
  exchangeFee?: string | number;
  paymentCharge?: string | number;
  paymentMethodId?: string | null;
  bankId?: string | null;
  customMethodName?: string;
  customBankName?: string;
  occurredAt?: Date | string;
  status?: "completed" | "pending" | "cancelled";
  externalReference?: string;
  counterpartyAlias?: string;
  notes?: string;
}

export interface OperationFilters {
  status?: "completed" | "pending" | "cancelled" | "all";
  operationSide?: "buy" | "sell" | "all";
  assetSymbol?: string;
  fiatCurrency?: string;
  exchangeCode?: string;
  countryCode?: string;
  search?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  pageSize?: number;
}

export interface UpdateOperationInput {
  status?: "completed" | "pending" | "cancelled";
  merchantFee?: string | number;
  exchangeFee?: string | number;
  paymentCharge?: string | number;
  externalReference?: string;
  counterpartyAlias?: string;
  notes?: string;
}

/**
 * Derivación segura de tasa unitaria: fiat_amount / asset_amount
 */
export function calculateUnitRate(fiatAmount: string | number, assetAmount: string | number): string {
  const f = typeof fiatAmount === "number" ? fiatAmount : parseFloat(fiatAmount);
  const a = typeof assetAmount === "number" ? assetAmount : parseFloat(assetAmount);

  if (isNaN(f) || isNaN(a) || a <= 0) {
    throw new Error("Cantidades inválidas para el cálculo de tasa unitaria.");
  }

  // Precisión a 8 decimales acorde al esquema NUMERIC(18, 8)
  return (f / a).toFixed(8);
}

/**
 * 1. Crear Operación P2P con snapshot inmutable y tasa calculada en servidor
 */
export async function createOperation(workspaceId: string, input: CreateOperationInput) {
  const assetNum = typeof input.assetAmount === "number" ? input.assetAmount : parseFloat(input.assetAmount);
  const fiatNum = typeof input.fiatAmount === "number" ? input.fiatAmount : parseFloat(input.fiatAmount);

  if (isNaN(assetNum) || assetNum <= 0) {
    throw new Error("La cantidad del activo cripto debe ser mayor a cero.");
  }
  if (isNaN(fiatNum) || fiatNum <= 0) {
    throw new Error("El importe fiat total debe ser mayor a cero.");
  }

  // 1. Tasa Unitaria
  const unitRate = calculateUnitRate(fiatNum, assetNum);

  // 2. Snapshot de Banco (si aplica)
  let bankNameSnapshot: string | null = input.customBankName?.trim() || null;
  let validBankId: string | null = null;

  if (input.bankId) {
    const bankRecord = await db.query.banks.findFirst({
      where: and(eq(schema.banks.id, input.bankId), eq(schema.banks.workspaceId, workspaceId)),
    });
    if (bankRecord) {
      validBankId = bankRecord.id;
      bankNameSnapshot = bankRecord.name;
    }
  }

  // 3. Snapshot de Método de Pago
  let paymentMethodNameSnapshot: string | null = input.customMethodName?.trim() || null;
  let validPaymentMethodId: string | null = null;

  if (input.paymentMethodId) {
    const methodRecord = await db.query.paymentMethods.findFirst({
      where: and(eq(schema.paymentMethods.id, input.paymentMethodId), eq(schema.paymentMethods.workspaceId, workspaceId)),
    });
    if (methodRecord) {
      validPaymentMethodId = methodRecord.id;
      paymentMethodNameSnapshot = methodRecord.name;
    }
  }

  // 4. Snapshot inmutable de Regla de Comisión aplicada
  const profile = await db.query.commissionProfiles.findFirst({
    where: and(
      eq(schema.commissionProfiles.workspaceId, workspaceId),
      eq(schema.commissionProfiles.countryCode, input.countryCode),
      or(
        eq(schema.commissionProfiles.operationSide, input.operationSide),
        eq(schema.commissionProfiles.operationSide, "all")
      )
    ),
    orderBy: [desc(schema.commissionProfiles.priority)],
  });

  const commissionRuleSnapshot = profile
    ? {
        ruleId: profile.id,
        countryCode: profile.countryCode,
        operationSide: profile.operationSide,
        percentage: profile.percentage,
        fixedFee: profile.fixedFee,
        feeType: profile.feeType,
        appliedAt: new Date().toISOString(),
      }
    : {
        type: "manual_override",
        appliedAt: new Date().toISOString(),
      };

  const occurredAtDate = input.occurredAt
    ? typeof input.occurredAt === "string"
      ? new Date(input.occurredAt)
      : input.occurredAt
    : new Date();

  // 5. Inserción protegida por workspace
  const [created] = await db
    .insert(schema.p2pOperations)
    .values({
      workspaceId,
      countryCode: input.countryCode,
      exchangeCode: input.exchangeCode,
      operationSide: input.operationSide,
      assetSymbol: input.assetSymbol,
      assetAmount: assetNum.toFixed(8),
      fiatCurrency: input.fiatCurrency,
      fiatAmount: fiatNum.toFixed(2),
      unitRate,
      merchantFee: input.merchantFee ? Number(input.merchantFee).toFixed(2) : "0.00",
      exchangeFee: input.exchangeFee ? Number(input.exchangeFee).toFixed(2) : "0.00",
      paymentCharge: input.paymentCharge ? Number(input.paymentCharge).toFixed(2) : "0.00",
      commissionRuleSnapshot,
      paymentMethodId: validPaymentMethodId,
      bankId: validBankId,
      paymentMethodNameSnapshot,
      bankNameSnapshot,
      occurredAt: occurredAtDate,
      status: input.status || "completed",
      externalReference: input.externalReference?.trim() || null,
      counterpartyAlias: input.counterpartyAlias?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .returning();

  return created;
}

/**
 * 2. Listado Paginado con Filtros Avanzados y Búsqueda
 */
export async function getOperations(workspaceId: string, filters: OperationFilters = {}) {
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize || 15));
  const offset = (page - 1) * pageSize;

  const conditions = [eq(schema.p2pOperations.workspaceId, workspaceId)];

  if (filters.status && filters.status !== "all") {
    conditions.push(eq(schema.p2pOperations.status, filters.status));
  }

  if (filters.operationSide && filters.operationSide !== "all") {
    conditions.push(eq(schema.p2pOperations.operationSide, filters.operationSide));
  }

  if (filters.assetSymbol) {
    conditions.push(eq(schema.p2pOperations.assetSymbol, filters.assetSymbol));
  }

  if (filters.fiatCurrency) {
    conditions.push(eq(schema.p2pOperations.fiatCurrency, filters.fiatCurrency));
  }

  if (filters.exchangeCode) {
    conditions.push(eq(schema.p2pOperations.exchangeCode, filters.exchangeCode));
  }

  if (filters.countryCode) {
    conditions.push(eq(schema.p2pOperations.countryCode, filters.countryCode));
  }

  if (filters.startDate) {
    const start = typeof filters.startDate === "string" ? new Date(filters.startDate) : filters.startDate;
    conditions.push(gte(schema.p2pOperations.occurredAt, start));
  }

  if (filters.endDate) {
    const end = typeof filters.endDate === "string" ? new Date(filters.endDate) : filters.endDate;
    conditions.push(lte(schema.p2pOperations.occurredAt, end));
  }

  if (filters.search && filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(schema.p2pOperations.externalReference, term),
        ilike(schema.p2pOperations.counterpartyAlias, term),
        ilike(schema.p2pOperations.bankNameSnapshot, term),
        ilike(schema.p2pOperations.paymentMethodNameSnapshot, term),
        ilike(schema.p2pOperations.notes, term)
      )!
    );
  }

  const whereClause = and(...conditions);

  // Consulta paralela de datos y conteo total
  const [items, totalResult] = await Promise.all([
    db.query.p2pOperations.findMany({
      where: whereClause,
      orderBy: [desc(schema.p2pOperations.occurredAt)],
      limit: pageSize,
      offset,
      with: {
        bank: true,
        paymentMethod: true,
      },
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.p2pOperations)
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * 3. Detalle de Operación Individual con Verificación de Pertenencia
 */
export async function getOperationById(workspaceId: string, id: string) {
  const operation = await db.query.p2pOperations.findFirst({
    where: and(eq(schema.p2pOperations.id, id), eq(schema.p2pOperations.workspaceId, workspaceId)),
    with: {
      bank: true,
      paymentMethod: true,
      country: true,
      fiat: true,
      asset: true,
    },
  });

  return operation || null;
}

/**
 * 4. Edición de Operación P2P
 */
export async function updateOperation(
  workspaceId: string,
  id: string,
  data: UpdateOperationInput
) {
  const [updated] = await db
    .update(schema.p2pOperations)
    .set({
      ...(data.status && { status: data.status }),
      ...(data.merchantFee !== undefined && { merchantFee: Number(data.merchantFee).toFixed(2) }),
      ...(data.exchangeFee !== undefined && { exchangeFee: Number(data.exchangeFee).toFixed(2) }),
      ...(data.paymentCharge !== undefined && { paymentCharge: Number(data.paymentCharge).toFixed(2) }),
      ...(data.externalReference !== undefined && { externalReference: data.externalReference?.trim() || null }),
      ...(data.counterpartyAlias !== undefined && { counterpartyAlias: data.counterpartyAlias?.trim() || null }),
      ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
      updatedAt: new Date(),
    })
    .where(and(eq(schema.p2pOperations.id, id), eq(schema.p2pOperations.workspaceId, workspaceId)))
    .returning();

  return updated || null;
}

/**
 * 5. Cancelación Segura (Soft Cancel)
 */
export async function cancelOperation(workspaceId: string, id: string, reason?: string) {
  const existing = await getOperationById(workspaceId, id);
  if (!existing) {
    throw new Error("Operación no encontrada o no pertenece a tu espacio de trabajo.");
  }

  const cancelNotice = reason
    ? `[Cancelada: ${reason.trim()}]`
    : `[Cancelada manualmente el ${new Date().toLocaleDateString()}]`;

  const updatedNotes = existing.notes ? `${existing.notes} ${cancelNotice}` : cancelNotice;

  const [cancelled] = await db
    .update(schema.p2pOperations)
    .set({
      status: "cancelled",
      notes: updatedNotes,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.p2pOperations.id, id), eq(schema.p2pOperations.workspaceId, workspaceId)))
    .returning();

  return cancelled;
}

/**
 * 6. Resumen de conteos por estado (completadas, pendientes, canceladas)
 */
export async function getOperationsSummary(workspaceId: string) {
  const counts = await db
    .select({
      status: schema.p2pOperations.status,
      count: sql<number>`count(*)::int`,
    })
    .from(schema.p2pOperations)
    .where(eq(schema.p2pOperations.workspaceId, workspaceId))
    .groupBy(schema.p2pOperations.status);

  const summary = {
    completed: 0,
    pending: 0,
    cancelled: 0,
    total: 0,
  };

  for (const c of counts) {
    if (c.status === "completed") summary.completed = c.count;
    if (c.status === "pending") summary.pending = c.count;
    if (c.status === "cancelled") summary.cancelled = c.count;
    summary.total += c.count;
  }

  return summary;
}
