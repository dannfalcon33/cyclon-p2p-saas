import { db } from "../src/lib/db";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function bootstrapPlatformOwner() {
  const targetEmail =
    process.argv[2] || process.env.PLATFORM_OWNER_EMAIL || "owner@cyclonp2p.com";

  console.log("=================================================");
  console.log("⚡ Cyclon P2P — Bootstrap del Rol platform_owner");
  console.log("=================================================");
  console.log(`Buscando cuenta registrada con correo: ${targetEmail}`);

  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, targetEmail),
  });

  if (!user) {
    console.error(`\n❌ ERROR: No se encontró ningún usuario con el correo: ${targetEmail}`);
    console.log("Instrucciones:");
    console.log("1. Regístrate primero en la aplicación web (/registro).");
    console.log("2. Vuelve a ejecutar este comando pasando tu correo registrado:");
    console.log(`   npx tsx scripts/bootstrap-platform-owner.ts ${targetEmail}\n`);
    process.exit(1);
  }

  if (user.role === "platform_owner") {
    console.log(`\nℹ️ El usuario '${user.email}' ya cuenta con el rol 'platform_owner'.`);
    process.exit(0);
  }

  // 1. Promover al rol platform_owner y marcar email como verificado
  const [updatedUser] = await db
    .update(schema.users)
    .set({
      role: "platform_owner",
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id))
    .returning();

  // 2. Registrar en la bitácora de auditoría administrativa
  await db.insert(schema.platformAdminAuditLogs).values({
    actorId: updatedUser.id,
    action: "PROMOTION_TO_PLATFORM_OWNER",
    targetType: "user",
    targetId: updatedUser.id,
    reason: "Bootstrap de seguridad en consola para propietario del SaaS",
    diffPayload: {
      previousRole: user.role,
      newRole: "platform_owner",
      timestamp: new Date().toISOString(),
    },
  });

  console.log("\n✅ ¡PROMOCIÓN EXITOSA!");
  console.log(`Usuario: ${updatedUser.name} (${updatedUser.email})`);
  console.log(`Nuevo Rol: ${updatedUser.role}`);
  console.log("Evento registrado en la tabla de auditoría: 'platform_admin_audit_logs'.");
  console.log("Ahora puedes acceder a la consola administrativa global en '/master'.\n");
}

bootstrapPlatformOwner().catch((err) => {
  console.error("Error inesperado en bootstrap:", err);
  process.exit(1);
});
