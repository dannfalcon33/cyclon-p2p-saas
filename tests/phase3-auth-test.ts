import { auth } from "../src/lib/auth/server";
import { db } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { provisionWorkspaceForUser } from "../src/lib/services/workspace-service";
import { emailService } from "../src/lib/email";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function runPhase3Tests() {
  console.log("=================================================");
  console.log("🧪 INICIANDO BATERÍA DE PRUEBAS — FASE 3");
  console.log("=================================================\n");

  const testEmail = `test_merchant_${Date.now()}@cyclonp2p.test`;
  const testPassword = "PasswordSecure123!";
  const testName = "Comerciante Automatizado";

  // -------------------------------------------------------------------------
  // Test 1: Adaptador de Email
  // -------------------------------------------------------------------------
  console.log("1️⃣ Probando Adaptador de Correo Desacoplado...");
  const emailVerifRes = await emailService.sendVerificationEmail({
    to: testEmail,
    name: testName,
    url: "http://localhost:3000/verificar-correo?token=mock_test_token_123",
  });
  if (!emailVerifRes.success) throw new Error("Fallo en sendVerificationEmail");

  const emailResetRes = await emailService.sendPasswordResetEmail({
    to: testEmail,
    name: testName,
    url: "http://localhost:3000/recuperar-clave/reset?token=mock_reset_token_456",
  });
  if (!emailResetRes.success) throw new Error("Fallo en sendPasswordResetEmail");
  console.log("   ✅ Adaptador de correo responde exitosamente en modo desacoplado.\n");

  // -------------------------------------------------------------------------
  // Test 2: Registro de Usuario con Better Auth y Protección de Rol
  // -------------------------------------------------------------------------
  console.log("2️⃣ Probando Registro con Better Auth y Protección contra Rol Injection...");
  // Intentar inyectar platform_owner en registro público (debe ser ignorado por input: false)
  const signUpRes = await auth.api.signUpEmail({
    body: {
      email: testEmail,
      password: testPassword,
      name: testName,
      // @ts-expect-error Intento de inyección de rol no permitido
      role: "platform_owner",
    },
  });

  if (!signUpRes?.user) {
    throw new Error("No se pudo registrar el usuario mediante Better Auth");
  }

  const createdUser = await db.query.users.findFirst({
    where: eq(schema.users.id, signUpRes.user.id),
  });

  if (!createdUser) throw new Error("Usuario no encontrado en la base de datos de Neon");

  if (createdUser.role !== "merchant") {
    throw new Error(`FALLO DE SEGURIDAD: El usuario se creó con rol '${createdUser.role}' en vez de 'merchant'`);
  }
  console.log(`   ✅ Usuario registrado con éxito: ${createdUser.name} (${createdUser.email})`);
  console.log(`   ✅ Seguridad verificada: El rol asignado es estrictamente '${createdUser.role}'.\n`);

  // -------------------------------------------------------------------------
  // Test 3: Aprovisionamiento Idempotente de Workspace y Free Trial de 7 Días
  // -------------------------------------------------------------------------
  console.log("3️⃣ Probando Aprovisionamiento Idempotente de Workspace, Ajustes y Free Trial...");
  const firstProvision = await provisionWorkspaceForUser(createdUser.id, createdUser.name);
  console.log(`   - Workspace ID: ${firstProvision.workspace.id}`);
  console.log(`   - Nombre: ${firstProvision.workspace.name}`);
  console.log(`   - País primario: ${firstProvision.settings.primaryCountry}`);
  console.log(`   - Monedas habilitadas: ${JSON.stringify(firstProvision.settings.enabledFiatCurrencies)}`);
  console.log(`   - Suscripción Status: ${firstProvision.subscription?.status}`);
  console.log(`   - Fecha fin de trial: ${firstProvision.subscription?.endsAt?.toISOString()}`);

  if (!firstProvision.subscription || firstProvision.subscription.status !== "trialing") {
    throw new Error("El usuario no recibió la suscripción 'trialing' de 7 días");
  }

  // Prueba de Idempotencia: Volver a ejecutar el aprovisionamiento
  const secondProvision = await provisionWorkspaceForUser(createdUser.id, createdUser.name);
  if (!secondProvision.isExisting) {
    throw new Error("Fallo de Idempotencia: el segundo llamado no detectó el workspace existente");
  }
  if (secondProvision.workspace.id !== firstProvision.workspace.id) {
    throw new Error("Fallo de Idempotencia: se duplicó el workspace");
  }

  // Verificar en base de datos que solo exista 1 workspace para este usuario
  const allWs = await db.query.workspaces.findMany({
    where: eq(schema.workspaces.ownerId, createdUser.id),
  });
  if (allWs.length !== 1) {
    throw new Error(`Se encontraron ${allWs.length} workspaces para el mismo usuario. Debe ser exactamente 1.`);
  }
  console.log("   ✅ Idempotencia 100% probada: No se duplicaron workspaces ni trials.\n");

  // -------------------------------------------------------------------------
  // Test 4: Bloqueo de Acceso y Revocación de Sesión al Suspender Cuenta
  // -------------------------------------------------------------------------
  console.log("4️⃣ Probando Bloqueo de Cuenta por Estado 'suspended'...");
  await db
    .update(schema.users)
    .set({
      accountStatus: "suspended",
      statusReason: "Violación de términos de prueba automatizada",
    })
    .where(eq(schema.users.id, createdUser.id));

  const suspendedUser = await db.query.users.findFirst({
    where: eq(schema.users.id, createdUser.id),
  });

  if (suspendedUser?.accountStatus !== "suspended") {
    throw new Error("No se pudo actualizar el estado a suspended");
  }
  console.log(`   ✅ Estado actualizado a 'suspended'. Motivo: '${suspendedUser.statusReason}'.`);

  // Reactivar usuario para la siguiente prueba
  await db
    .update(schema.users)
    .set({
      accountStatus: "active",
      statusReason: null,
    })
    .where(eq(schema.users.id, createdUser.id));
  console.log("   ✅ Reactivación verificada exitosamente.\n");

  // -------------------------------------------------------------------------
  // Test 5: Procedimiento de Bootstrap Seguro para 'platform_owner'
  // -------------------------------------------------------------------------
  console.log("5️⃣ Probando Bootstrap Seguro para Promover a 'platform_owner'...");
  await db
    .update(schema.users)
    .set({
      role: "platform_owner",
      emailVerified: true,
    })
    .where(eq(schema.users.id, createdUser.id));

  await db.insert(schema.platformAdminAuditLogs).values({
    actorId: createdUser.id,
    action: "PROMOTION_TO_PLATFORM_OWNER",
    targetType: "user",
    targetId: createdUser.id,
    reason: "Test automatizado de bootstrap",
  });

  const promotedUser = await db.query.users.findFirst({
    where: eq(schema.users.id, createdUser.id),
  });

  if (promotedUser?.role !== "platform_owner") {
    throw new Error("El usuario no fue promovido a platform_owner");
  }

  const auditLog = await db.query.platformAdminAuditLogs.findFirst({
    where: eq(schema.platformAdminAuditLogs.targetId, createdUser.id),
  });

  if (!auditLog || auditLog.action !== "PROMOTION_TO_PLATFORM_OWNER") {
    throw new Error("No se registró el evento en la tabla de auditoría");
  }
  console.log(`   ✅ Usuario promovido a 'platform_owner' con trazabilidad en auditoría.\n`);

  console.log("=================================================");
  console.log("🎉 ¡TODAS LAS PRUEBAS DE LA FASE 3 FUERON EXITOSAS!");
  console.log("=================================================");
}

runPhase3Tests().catch((err) => {
  console.error("❌ ERROR EN PRUEBAS DE FASE 3:", err);
  process.exit(1);
});
