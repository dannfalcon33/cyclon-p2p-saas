# 10. Consola Master, Suspensión con Motivo Obligatorio y Bitácora de Auditoría Inmutable

- **Estado:** Aceptada
- **Fecha:** 2026-10-24
- **Fase del Proyecto:** Fase 9 — Panel Master del propietario (`platform_owner`), promociones y auditoría

---

## Contexto

El propietario de la plataforma Cyclon P2P (`platform_owner`) requiere una consola administrativa centralizada en `/master` con facultades de control y gobernanza sobre los comerciantes registrados, sin comprometer el aislamiento multinquilino ni la ética financiera de un MVP de portafolio.

Requisitos específicos:
1. **Control de Acceso Basado en Rol (RBAC):** La ruta `/master` y sus Server Actions deben restringirse estrictamente a usuarios con `role === "platform_owner"`. Comerciantes normales que intenten acceder por URL o invocar mutaciones administrativas son redirigidos a `/app` o bloqueados en servidor.
2. **Separación Contable Estricta (RF-08.3):**
   - **Ingresos Reales = $0.00 USD:** El MVP no dispone de pasarela bancaria real conectada ni procesa pagos reales.
   - **Facturación Demo / MRR Estimado:** Las cifras mostradas en la consola Master derivan de eventos simulados (`billing_events` con `is_simulated = true`) o cálculos de capacidad según precios de catálogo, etiquetadas explícitamente como "DEMO / ESTIMADO".
3. **Suspensión y Reactivación con Motivo Obligatorio (RF-08.4):** Suspender o reactivar a un comerciante requiere un motivo administrativo obligatorio (mínimo 5 caracteres). Al suspender, el comerciante pierde de inmediato acceso a `/app`.
4. **Gobernanza de Promociones (RF-08.5):** CRUD de cupones con porcentaje o monto fijo, límites de uso y activación/pausa inmediata.
5. **Bitácora de Auditoría Inmutable Append-Only (RF-08.6):** Toda acción administrativa sensible (`SUSPEND_CLIENT`, `REACTIVATE_CLIENT`, `CREATE_PROMOTION`, `ACTIVATE_PROMOTION`, `DEACTIVATE_PROMOTION`) se inserta en `platform_admin_audit_logs` con sello de tiempo UTC, ID del administrador, ID de entidad afectada y diff del cambio. No existen endpoints de edición o borrado de auditoría.

---

## Decisiones Técnicas

1. **Servicio de Dominio Master (`master-service.ts`):**
   - `getMasterDashboardMetrics()`: Agrega en tiempo real conteos de comerciantes por estado (`active`, `suspended`, `pending`), trials activos, desglose de suscripciones por plan (`free_trial`, `business`, `enterprise`), fija ingresos reales en `$0.00 USD`, calcula el MRR demo estimado y lista clientes y logs recientes.
   - `getMasterClients(filters)`: Directorio con búsqueda y filtrado por texto, estado y plan.
   - `suspendMerchant(adminUserId, targetUserId, reason)`: Impide suspender a otros propietarios de la plataforma. Actualiza `users.accountStatus = 'suspended'` y `users.statusReason = reason`. Registra el evento en `platform_admin_audit_logs`.
   - `reactivateMerchant(adminUserId, targetUserId, reason)`: Actualiza `users.accountStatus = 'active'`, limpia `statusReason` y registra el evento en `platform_admin_audit_logs`.
   - `createMasterPromotion(adminUserId, input)` y `toggleMasterPromotionStatus(adminUserId, promoId)`: Gestión de cupones con auditoría automática.
   - `getMasterAuditLogs(limit)`: Consulta append-only ordenada cronológicamente en orden descendente.

2. **Capa de Server Actions (`master.ts`):**
   - Protegida con `requirePlatformOwner()`. Si un usuario regular intenta llamar a las acciones desde el cliente, se arroja excepción inmediata.
   - Revalida selectivamente las rutas administrativas tras cada mutación.

3. **Interfaz de la Consola Master:**
   - [`/master`](file:///c:/Users/Yashua/Documents/Repositorio/cyclon-p2p/src/app/master/page.tsx): Tarjetas KPI con disclaimer contable superior, barras de distribución de planes, y accesos rápidos.
   - [`/master/clientes`](file:///c:/Users/Yashua/Documents/Repositorio/cyclon-p2p/src/app/master/clientes/page.tsx): Directorio interactivo con filtros, búsqueda y modal de suspensión/reactivación con campo de texto obligatorio.
   - [`/master/promociones`](file:///c:/Users/Yashua/Documents/Repositorio/cyclon-p2p/src/app/master/promociones/page.tsx): Panel de cupones con switch de pausa/activación y modal para crear cupones.
   - [`/master/auditoria`](file:///c:/Users/Yashua/Documents/Repositorio/cyclon-p2p/src/app/master/auditoria/page.tsx): Registro de auditoría con detalles en formato diff JSON.

---

## Verificación

- **Suite Automatizada de Pruebas (`tests/phase9-master-panel-test.ts`):**
  1. Verificación de cálculo de métricas y fijación estricta de ingresos reales en `$0.00 USD`.
  2. Búsqueda y filtrado del directorio de clientes con coincidencias parciales y de estado.
  3. Suspensión con motivo: rechazo ante motivo vacío, rechazo ante intento de suspender a un admin, confirmación de estado `suspended` y creación de log `SUSPEND_CLIENT`.
  4. Reactivación con motivo: restauración de estado `active`, limpieza de `statusReason` y creación de log `REACTIVATE_CLIENT`.
  5. Gestión de cupones: creación de cupón con límite de usos, toggle a pausado y reactivación.
  6. Inmutabilidad de auditoría: verificación de persistencia append-only de todos los eventos administrativos con timestamp UTC.
  - Resultado: **100% de las pruebas pasadas con código de salida `0`**.
- **Compilación de Producción:**
  - `npm run build` ejecutado exitosamente con 21/21 rutas compiladas y 0 errores de TypeScript.
