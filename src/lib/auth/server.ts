import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { emailService } from "@/lib/email";
import { provisionWorkspaceForUser } from "@/lib/services/workspace-service";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "cyclon-p2p-default-secret-32-chars-long-minimum!",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "merchant",
        input: false, // Protege contra inyección de 'platform_owner' desde formularios públicos
      },
      accountStatus: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
      statusReason: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Permite uso inmediato en demo, con verificación disponible
    sendResetPassword: async (data: { user: any; url: string; token: string }) => {
      await emailService.sendPasswordResetEmail({
        to: data.user.email,
        name: data.user.name,
        url: data.url,
        token: data.token,
      });
    },
    sendVerificationEmail: async (data: { user: any; url: string; token: string }) => {
      await emailService.sendVerificationEmail({
        to: data.user.email,
        name: data.user.name,
        url: data.url,
        token: data.token,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Aprovisionamiento automático e idempotente del Workspace comercial y trial
          try {
            await provisionWorkspaceForUser(user.id, user.name);
          } catch (err) {
            console.error("Error aprovisionando workspace tras creación de usuario:", err);
          }
        },
      },
    },
  },
});
