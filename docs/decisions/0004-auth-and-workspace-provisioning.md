# 4. Autenticación, Adaptador de Correo y Aprovisionamiento Idempotente de Espacios de Trabajo

- **Estado:** Aceptada
- **Fecha:** 2026-10-22
- **Fase del Proyecto:** Fase 3 — Autenticación, correo y espacios de trabajo

---

## Contexto

Cyclon P2P requiere un sistema de autenticación robusto basado en sesiones seguras para comerciantes y el propietario de la plataforma. Cada nuevo usuario debe contar de inmediato con su propio espacio de trabajo (workspace) aislado, ajustes iniciales y una suscripción activa de prueba de 7 días (Free Trial). Además, el sistema debe protegerse contra inyección de roles durante el registro público y contra ataques de enumeración de usuarios en los flujos de inicio de sesión y recuperación de contraseña.

---

## Decisiones Técnicas

1. **Biblioteca de Autenticación:**
   - Se implementa `better-auth` con el adaptador oficial `drizzleAdapter` conectado a la base de datos de Neon PostgreSQL (`@neondatabase/serverless`).
   - El esquema almacena usuarios en `users`, sesiones en `sessions`, cuentas y contraseñas hasheadas en `accounts`, y tokens en `verifications`.

2. **Aislamiento de Roles y Prevención de Inyección:**
   - El campo `role` en `users` tiene valor por defecto `'merchant'` y está configurado con `input: false` en Better Auth, impidiendo que peticiones maliciosas en el registro público se autoasignen el rol `'platform_owner'`.
   - La promoción al rol `'platform_owner'` es exclusiva del script seguro de consola `scripts/bootstrap-platform-owner.ts` y queda registrada en `platform_admin_audit_logs`.

3. **Aprovisionamiento Idempotente de Workspace (`workspace-service.ts`):**
   - Se ejecuta automáticamente tras la creación del usuario (hook de base de datos o llamada de servicio).
   - Verifica la existencia previa de un espacio antes de insertar para garantizar idempotencia estricta.
   - Crea el registro en `workspaces`, los ajustes en `workspace_settings` (país `VE`, monedas `VES` y `USD`), y la suscripción en `subscriptions` asociada al plan `free_trial` por 7 días.

4. **Adaptador de Correo Desacoplado (`emailService`):**
   - Permite operar en modo `console` para desarrollo y pruebas automatizadas locales sin requerir credenciales externas.
   - Soporta proveedores de producción (`resend` o `smtp`) mediante configuración de entorno (`EMAIL_PROVIDER`).
   - En la recuperación de contraseña (`/recuperar-clave`), responde siempre con el mismo mensaje genérico para mitigar ataques de enumeración de usuarios.

5. **Bloqueo Inmediato por Suspensión:**
   - La función `getAuthenticatedUser()` consulta en tiempo real el campo `accountStatus` en base de datos. Si una cuenta se suspende (`suspended` o `deactivated`), las sesiones activas son invalidadas inmediatamente y se reporta el motivo registrado (`statusReason`).

---

## Consecuencias y Verificación

- La suite automatizada `tests/phase3-auth-test.ts` verifica los 5 pilares:
  1. Envío desacoplado de correo de verificación y recuperación.
  2. Registro con hash de contraseña y asignación estricta de rol `merchant`.
  3. Aprovisionamiento de workspace y 7 días de Free Trial sin duplicados.
  4. Bloqueo inmediato al suspender una cuenta.
  5. Bootstrap seguro a `platform_owner` con auditoría.
- `npm run build` compila al 100% las 19 rutas de la aplicación de Next.js.
