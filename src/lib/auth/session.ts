import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { provisionWorkspaceForUser } from "@/lib/services/workspace-service";

export async function getServerSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({
    headers: reqHeaders,
  });
}

/**
 * Obtiene el usuario autenticado actual y valida el estado de su cuenta.
 * Si la cuenta está suspendida o inactiva, bloquea el acceso.
 */
export async function getAuthenticatedUser() {
  const sessionData = await getServerSession();

  if (!sessionData?.user) {
    return null;
  }

  // Consultar el registro fresco en base de datos para verificar suspensión inmediata
  const freshUser = await db.query.users.findFirst({
    where: eq(schema.users.id, sessionData.user.id),
  });

  if (!freshUser) {
    return null;
  }

  if (freshUser.accountStatus === "suspended" || freshUser.accountStatus === "deactivated") {
    throw new Error(
      `Acceso denegado: Tu cuenta se encuentra ${freshUser.accountStatus}. Motivo: ${
        freshUser.statusReason || "Revisión de seguridad por el administrador."
      }`
    );
  }

  return freshUser;
}

/**
 * Obtiene el espacio de trabajo vinculado al usuario autenticado.
 * Garantiza multi-tenancy estricto: ninguna acción del cliente puede enviar un workspaceId ajeno.
 */
export async function getAuthenticatedWorkspace() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar workspace del propietario
  let ws = await db.query.workspaces.findFirst({
    where: eq(schema.workspaces.ownerId, user.id),
    with: {
      settings: true,
      subscriptions: {
        with: {
          plan: true,
        },
      },
    },
  });

  // Aprovisionamiento de respaldo si por alguna razón no existiera
  if (!ws) {
    const provision = await provisionWorkspaceForUser(user.id, user.name);
    ws = await db.query.workspaces.findFirst({
      where: eq(schema.workspaces.id, provision.workspace.id),
      with: {
        settings: true,
        subscriptions: {
          with: {
            plan: true,
          },
        },
      },
    });
  }

  return {
    user,
    workspace: ws!,
    settings: ws!.settings!,
    subscription: ws!.subscriptions?.[0],
  };
}

/**
 * Validador estricto para el Panel Master.
 * Exclusivo para cuentas con rol 'platform_owner'.
 */
export async function requirePlatformOwner() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "platform_owner") {
    // Si es un comerciante regular intentando acceder al master, redirigir a su app
    redirect("/app");
  }

  return user;
}
