# 6. CRUD de Operaciones P2P, Derivación Decimal de Tasas e Instantáneas Inmutables

- **Estado:** Aceptada
- **Fecha:** 2026-10-22
- **Fase del Proyecto:** Fase 5 — CRUD de operaciones P2P y validación server-side

---

## Contexto

El núcleo funcional de Cyclon P2P es el registro manual y auditable de operaciones de compra y venta P2P realizadas en exchanges externos (Binance, Bybit, Bitget, etc.).
Para garantizar fidelidad contable y seguridad:
1. Las operaciones involucran monedas fiat y criptomonedas con distintas precisiones numéricas, requiriendo cálculos matemáticos sin errores de coma flotante binaria (`IEEE 754`).
2. Las tasas unitarias (`unit_rate = fiat_amount / asset_amount`) deben derivarse de forma consistente en el servidor.
3. Se deben preservar instantáneas inmutables (`commission_rule_snapshot`, `bank_name_snapshot`, `payment_method_name_snapshot`) para que cambios posteriores en los catálogos del comerciante nunca alteren ni corrompan el historial contable anterior.
4. Las operaciones canceladas no deben destruirse físicamente, sino marcarse como `cancelled` con una nota de auditoría.
5. Todo registro, consulta y mutación debe estar rígidamente aislado por el `workspaceId` derivado de la sesión en el servidor.

---

## Decisiones Técnicas

1. **Cálculo Preciso de Tasas (`operations-service.ts`):**
   - Se implementa `calculateUnitRate(fiatAmount, assetAmount)` que procesa valores decimales y fija la precisión a 8 decimales acorde al tipo `NUMERIC(18, 8)` de PostgreSQL.
   - Se rechazan en el servidor importes menores o iguales a cero (`assetAmount <= 0`, `fiatAmount <= 0`).

2. **Validación Server-Side Estricta con Zod (`operations.ts`):**
   - El esquema `createOperationSchema` valida tipos, rangos numéricos positivos y longitudes de texto antes de interactuar con la base de datos de Neon.
   - Se bloquea la persistencia de cargos o tarifas negativos.

3. **Instantáneas Inmutables (Snapshots):**
   - Al registrar una operación, el servidor consulta la regla activa de comisión en `commission_profiles` para ese país y lado de operación (`buy` / `sell` / `all`), guardando un JSON inmutable en `commission_rule_snapshot`.
   - Se copian los nombres vigentes del banco y método en `bank_name_snapshot` y `payment_method_name_snapshot`. Si el banco o método es posteriormente desactivado o modificado, la operación histórica conserva el nombre exacto con el que fue ejecutada.

4. **Cancelación Lógica Segura (Soft Cancel):**
   - La función `cancelOperation(workspaceId, id, reason)` actualiza el estado a `status = 'cancelled'`, anexa el motivo de cancelación al campo `notes` y actualiza `updated_at`.
   - No se utiliza `DELETE FROM`, cumpliendo con los estándares de auditoría y reportes fiscales.

5. **Listado Paginado y Filtros Combinados:**
   - La función `getOperations(workspaceId, filters)` implementa paginación (`limit` y `offset`) y filtros dinámicos por estado (`completed`, `pending`, `cancelled`), lado de operación (`buy`, `sell`), país (`countryCode`), criptoactivo (`assetSymbol`) y búsqueda de texto completo con `ilike` en referencias, notas y contraparte.
   - `getOperationsSummary(workspaceId)` calcula en paralelo los KPIs de operaciones completadas, pendientes y canceladas sin mezclar monedas fiat.

---

## Verificación

- La suite automatizada `tests/phase5-operations-test.ts` (`npm run test:phase5`) valida:
  1. Derivación matemática de la tasa unitaria decimal.
  2. Rechazo server-side de entradas inválidas (`assetAmount = 0`, `fiatAmount = -50`).
  3. Creación y persistencia exitosa de operación con snapshots inmutables en Neon DB.
  4. Aislamiento multinquilino: Workspace Beta no puede leer ni cancelar operaciones de Workspace Alpha.
  5. Cancelación lógica (`status = 'cancelled'`) con preservación física del registro.
  6. Filtros por estado, búsqueda de texto libre y conteos de resumen.
- 100% de las pruebas pasadas con código de salida `0`.
- Compilación `npm run build` sin errores en Next.js App Router.
