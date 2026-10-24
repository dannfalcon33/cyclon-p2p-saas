# ADR 0003: Aislamiento Multinquilino y Seguridad de Roles

**Fecha:** 2026-10-21  
**Estado:** Aceptado  
**Contexto:**
Cyclon P2P maneja bitácoras de operaciones financieras sensibles de comerciantes. Además, cuenta con un Panel Master global para el dueño del SaaS. Es vital prevenir filtraciones de datos entre comerciantes y accesos no autorizados a la consola Master.

## Decisión

1. **Aislamiento Multinquilino a Nivel de Servidor:**
   - La identidad del usuario y su `workspaceId` asociado se obtienen exclusivamente a partir de la sesión validada en el servidor (cookies firmadas/encriptadas).
   - Ninguna petición del cliente (GET query, POST body, encabezados) podrá suministrar o sobrescribir el `workspaceId`.
   - Todas las consultas de base de datos para entidades de comerciante (`p2p_operations`, `banks`, `payment_methods`, `commission_profiles`) deben incluir explícitamente `workspace_id = current_workspace.id`.
2. **Rol Global `platform_owner` (Panel Master):**
   - El rol se almacena en la tabla `users` pero **nunca** se expone como editable en la API de perfil de usuario ni en el formulario de registro.
   - El registro público asigna siempre el rol `merchant`.
   - La promoción al rol `platform_owner` se realiza exclusivamente mediante un script de consola/bootstrap seguro e idempotente (`scripts/bootstrap-platform-owner.ts`).
   - Las rutas `/master/*` y las acciones administrativas asociadas verifican rigurosamente `user.role === 'platform_owner'` en el servidor antes de cualquier lectura o mutación.
3. **Auditoría Append-Only:**
   - Toda acción sensible ejecutada desde el Panel Master (suspender cliente, reactivar, alterar plan de demo, crear promociones) genera una entrada inmutable en `platform_admin_audit_logs`.
   - La suspensión de un comerciante revoca sus sesiones y bloquea el acceso en el middleware y en las Server Actions, preservando intacto su historial de datos.
