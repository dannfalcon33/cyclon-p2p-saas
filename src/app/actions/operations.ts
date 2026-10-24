"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  createOperation,
  getOperations,
  getOperationById,
  updateOperation,
  cancelOperation,
  getOperationsSummary,
  CreateOperationInput,
  OperationFilters,
  UpdateOperationInput,
} from "@/lib/services/operations-service";

/**
 * Esquema Zod de Validación en el Servidor
 */
const createOperationSchema = z.object({
  countryCode: z.string().min(2).max(2),
  exchangeCode: z.string().min(1).max(50),
  operationSide: z.enum(["buy", "sell"]),
  assetSymbol: z.string().min(1).max(20),
  assetAmount: z.coerce.number().positive("La cantidad cripto debe ser mayor a cero"),
  fiatCurrency: z.string().min(3).max(3),
  fiatAmount: z.coerce.number().positive("El importe fiat debe ser mayor a cero"),
  merchantFee: z.coerce.number().min(0, "La comisión no puede ser negativa").default(0),
  exchangeFee: z.coerce.number().min(0, "La tarifa de exchange no puede ser negativa").default(0),
  paymentCharge: z.coerce.number().min(0, "El cargo del método no puede ser negativo").default(0),
  paymentMethodId: z.string().uuid().optional().nullable(),
  bankId: z.string().uuid().optional().nullable(),
  customMethodName: z.string().max(150).optional(),
  customBankName: z.string().max(150).optional(),
  occurredAt: z.union([z.string(), z.date()]).optional(),
  status: z.enum(["completed", "pending", "cancelled"]).default("completed"),
  externalReference: z.string().max(100).optional(),
  counterpartyAlias: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

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

  // Fallback seguro al workspace demo si se interactúa en modo demostración
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

/**
 * 1. Action para Registrar una Nueva Operación P2P
 */
export async function createOperationAction(data: CreateOperationInput) {
  const workspaceId = await resolveWorkspaceId();

  // Validación Server-Side estricta con Zod
  const validation = createOperationSchema.safeParse(data);
  if (!validation.success) {
    const errors = validation.error.issues.map((i) => i.message).join(", ");
    throw new Error(`Error de validación: ${errors}`);
  }

  const operation = await createOperation(workspaceId, {
    ...validation.data,
    assetAmount: validation.data.assetAmount.toString(),
    fiatAmount: validation.data.fiatAmount.toString(),
    merchantFee: validation.data.merchantFee.toString(),
    exchangeFee: validation.data.exchangeFee.toString(),
    paymentCharge: validation.data.paymentCharge.toString(),
  });

  revalidatePath("/app/operaciones");
  revalidatePath("/app");

  return { success: true, operation };
}

/**
 * 2. Action para Consultar Lista de Operaciones con Filtros y Paginación
 */
export async function fetchOperationsAction(filters: OperationFilters = {}) {
  const workspaceId = await resolveWorkspaceId();
  const [result, summary] = await Promise.all([
    getOperations(workspaceId, filters),
    getOperationsSummary(workspaceId),
  ]);

  return {
    items: result.items,
    pagination: result.pagination,
    summary,
  };
}

/**
 * 3. Action para Consultar Detalle de Operación
 */
export async function fetchOperationDetailAction(id: string) {
  const workspaceId = await resolveWorkspaceId();
  const operation = await getOperationById(workspaceId, id);

  if (!operation) {
    throw new Error("Operación no encontrada.");
  }

  return operation;
}

/**
 * 4. Action para Editar Operación
 */
export async function updateOperationAction(id: string, data: UpdateOperationInput) {
  const workspaceId = await resolveWorkspaceId();
  const updated = await updateOperation(workspaceId, id, data);

  if (!updated) {
    throw new Error("No se pudo actualizar la operación.");
  }

  revalidatePath("/app/operaciones");
  revalidatePath(`/app/operaciones/${id}`);
  revalidatePath("/app");

  return updated;
}

/**
 * 5. Action para Cancelar Operación
 */
export async function cancelOperationAction(id: string, reason?: string) {
  const workspaceId = await resolveWorkspaceId();
  const cancelled = await cancelOperation(workspaceId, id, reason);

  revalidatePath("/app/operaciones");
  revalidatePath(`/app/operaciones/${id}`);
  revalidatePath("/app");

  return cancelled;
}
