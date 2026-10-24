# 9. Matriz Centralizada de Capacidades de Plan, Política de Retención y Facturación Simulada

- **Estado:** Aceptada
- **Fecha:** 2026-10-24
- **Fase del Proyecto:** Fase 8 — Planes comerciales, prueba gratuita de 7 días y checkout simulado

---

## Contexto

Cyclon P2P es un mini-SaaS / MVP de portafolio diseñado para comerciantes P2P. Requiere un modelo comercial con tres tiers:
1. **`free_trial`**: 7 días de acceso completo a funciones Business sin requerir tarjeta de crédito.
2. **`business`**: Bitácora de operaciones ilimitadas, comisiones por país y exportaciones Excel multilibro ($29.00 USD/mes).
3. **`enterprise`**: Todo Business más módulo de cotizaciones en tiempo real BTC/ETH/SOL/BNB y feed de noticias ($79.00 USD/mes).

Asimismo, el producto impone tres restricciones clave de negocio y seguridad:
1. **Modo de Facturación Simulado (`BILLING_MODE=demo`):** Por seguridad jurídica y ética en un MVP de portafolio, nunca se solicitan números reales de tarjeta ni se procesa dinero real. Las pruebas de pasarela simulan estados (`approved`, `pending`, `failed`) con identificadores auditables y marca explícita `is_simulated = true`.
2. **Política Inmutable de Retención de Datos:** La expiración de una prueba jamás borra ni purga datos u operaciones históricas. El comerciante conserva acceso de lectura y la capacidad de exportar sus libros de cálculo a Excel en cualquier momento.
3. **Control Centralizado en Servidor:** Las capacidades deben evaluarse en el servidor (`hasFeature`, `canWorkspaceCreateOperations`) impidiendo mutaciones en cuentas expiradas mientras se preservan consultas.

---

## Decisiones Técnicas

1. **Servicio Centralizado de Capacidades (`plan-service.ts`):**
   - Implementa `getWorkspaceSubscriptionDetails(workspaceId)` que evalúa en tiempo real si la fecha de vencimiento (`endsAt`) ha caducado. Si el plan estaba en `trialing` y `now > endsAt`, actualiza automáticamente el estado en base de datos a `expired`.
   - Implementa `hasFeature(workspaceId, featureCode)` como verificador determinista de permisos.
   - En estado `expired`, el comerciante mantiene:
     * `dashboard_access`
     * `excel_export_basic` / `excel_export_multihop_full`
     * Consulta y filtrado de su historial de operaciones.
   - En estado `expired`, se revoca `can_create_operations`.

2. **Protección en Mutación de Operaciones (`operations-service.ts`):**
   - La función `createOperation(workspaceId, input)` invoca `canWorkspaceCreateOperations(workspaceId)` antes de persistir cualquier registro. Si la suscripción expiró, lanza un error server-side claro y descriptivo invitando a activar un plan.

3. **Adaptador de Facturación Simulada (`DemoBillingProvider`):**
   - La función `simulatePlanCheckout(workspaceId, userId, { planCode, outcome, couponCode })`:
     * Genera una referencia auditable (`DEMO-CHK-XXXXXX`).
     * Registra el evento en `billing_events` con `amount_displayed`, moneda `USD`, resultado y marca inmutable `is_simulated = true`.
     * Si `outcome === "approved"`:
       - Si se utilizó cupón, valida vigencia, límites y registra la redención en `promotion_redemptions`.
       - Actualiza la suscripción del workspace a estado `active` con 30 días de vigencia.
     * Si `outcome === "pending"` o `"failed"`:
       - Registra el evento para auditoría sin mutar la suscripción activa anterior.

4. **Motor de Cupones Promocionales:**
   - La función `validatePromotionCoupon(code, planCode)` valida códigos en base de datos (`promotions`), aplicando descuentos porcentuales o fijos (e.g. `CYCLON50` con 50% de descuento).

5. **Experiencia de Usuario en la Interfaz:**
   - **`/app/plan`:** Panel de suscripción con cuenta regresiva de días, tarjeta de plan actual, alerta de vencimiento (si aplica), recordatorio de la política de retención de datos y modal interactivo de checkout con selector de resultado (`approved`, `pending`, `failed`) y canje de cupones.
   - **`/app/mercado`:** Paywall elegante para planes Free Trial o Business que bloquea el módulo Enterprise y ofrece enlace directo a `/app/plan`.
   - **`/app/operaciones/nueva`:** Banner superior y deshabilitación del botón de envío si la suscripción está expirada.
   - **`AppSidebar`:** Widget dinámico que muestra el plan activo real, días restantes y badge `EXPIRADO` cuando corresponda.

---

## Verificación

- **Suite Automatizada (`tests/phase8-plans-billing-test.ts`):**
  1. Suscripción inicial Free Trial de 7 días verificada con status `trialing`.
  2. Matriz de capacidades comprobada (Free Trial vs Business vs Enterprise).
  3. Expiración de trial forzada: `canWorkspaceCreateOperations` retorna `false`, intento de `createOperation` es rechazado en servidor, mientras consultas históricas y exportación a Excel permanecen 100% operativas.
  4. Validación de cupones (`CYCLON50` con 50% de descuento demo, cupón inválido rechazado).
  5. Pasarela `DemoBillingProvider`: outcome `failed` auditado sin mutación; outcome `approved` reactiva suscripción a `active` por 30 días y habilita creación de operaciones; upgrade a `enterprise` activa capacidades de mercado.
  6. Aislamiento multinquilino: el upgrade de Alpha a Enterprise no afecta el plan de Beta.
  - Resultado: **100% de las pruebas pasadas con código de salida `0`**.
- **Compilación de Producción:**
  - `npm run build` ejecutado exitosamente con 21/21 rutas compiladas y 0 errores de TypeScript.
