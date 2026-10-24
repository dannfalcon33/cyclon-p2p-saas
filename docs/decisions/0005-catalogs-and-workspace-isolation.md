# 5. Catálogos Globales, Configuración Privada por Comerciante y Aislamiento Multinquilino

- **Estado:** Aceptada
- **Fecha:** 2026-10-22
- **Fase del Proyecto:** Fase 4 — Catálogos y configuración de workspace

---

## Contexto

El modelo operativo de Cyclon P2P requiere una separación rigurosa entre catálogos globales inmutables del protocolo P2P y configuraciones bancarias/financieras privadas pertenecientes a cada comerciante. 
En particular:
1. Ningún país tiene un conjunto universal u oficial de bancos o pasarelas que deba imponerse de forma rígida a todos los usuarios.
2. Cada comerciante debe poder crear, editar, activar y desactivar sus propios bancos y métodos de pago (ej. cuentas en Banesco, Pago Móvil, Zinli Wallet, Bancolombia, etc.).
3. Los datos privados de bancos y métodos de pago de un comerciante jamás deben ser visibles ni alterables por otro comerciante en la plataforma.
4. Si un comerciante desactiva un banco o método de pago personal, el historial previo de operaciones P2P no debe romperse ni perder la trazabilidad de nombres originales.
5. Al seleccionar un país en los formularios operativos (ej. `/app/operaciones/nueva`), los selectores de bancos y métodos de pago deben filtrarse dinámicamente según la asignación realizada por el propio usuario.

---

## Decisiones Técnicas

1. **Separación de Catálogos Globales vs. Privados:**
   - **Globales (`countries`, `fiat_currencies`, `assets`, `exchanges`):**
     - Sembrados de forma inmutable: 7 países iniciales (`VE`, `CO`, `BR`, `AR`, `EC`, `PE`, `CL`), 7 monedas fiat ISO 4217 (`VES`, `COP`, `BRL`, `ARS`, `USD`, `PEN`, `CLP`), 6 criptoactivos (`USDT`, `USDC`, `BTC`, `ETH`, `SOL`, `BNB`) y 4 exchanges (`binance`, `bybit`, `bitget`, `custom`).
   - **Privados (`banks`, `payment_methods`, `commission_profiles`, `workspace_settings`):**
     - Cada registro incluye obligatoriamente `workspace_id` referenciando `workspaces.id` con índice compuesto.
     - Todas las consultas del servicio `catalogs-service.ts` filtran explícitamente por `workspaceId`.

2. **Aislamiento Multinquilino en Server Actions (`catalogs.ts`):**
   - El `workspaceId` no se recibe desde el cliente ni desde parámetros de formulario. Se deriva directamente de la sesión verificada en servidor mediante `getAuthenticatedUser()`.
   - Si no existe sesión válida autenticada, se rechaza la mutación o se utiliza de forma controlada el workspace demo para navegación no autenticada.

3. **Filtrado Dinámico por País y Tipo de Método:**
   - En el formulario de operaciones (`/app/operaciones/nueva`):
     - Seleccionar un país filtra los bancos activos con `b.countryCode === country && b.isActive`.
     - Filtra los métodos de pago con `(m.countryCode === null || m.countryCode === country) && m.isActive`.
     - Si el método tiene `requiresBank === false` (ej. Zinli Wallet o wallets directas), el selector de banco se desactiva y oculta con la indicación *"No requiere cuenta bancaria"*.
     - Se carga automáticamente la moneda fiat oficial del país y se busca la regla activa de comisión en `commission_profiles` para prellenar la tarifa del comerciante.

4. **Desactivación Lógica (Soft Delete) para Integridad Referencial:**
   - Al "eliminar" un banco o método de pago, la función `deleteWorkspaceBank` / `deleteWorkspacePaymentMethod` ejecuta un `UPDATE SET isActive = false`.
   - Se evita `DELETE FROM`, asegurando que `p2p_operations` con claves foráneas `bank_id` y `payment_method_id` mantengan su integridad referencial y sus snapshots inmutables (`bankNameSnapshot`, `paymentMethodNameSnapshot`).

5. **Ajustes de Espacio de Trabajo (`workspace_settings`):**
   - Cada comerciante puede personalizar su país primario, su zona horaria IANA (ej. `America/Caracas`, `America/Bogota`), sus monedas fiat habilitadas (`enabledFiatCurrencies`), y sus datos comerciales/fiscales opcionales para exportación.

---

## Verificación

- Se implementó la suite automatizada de pruebas `tests/phase4-catalogs-test.ts` (`npm run test:phase4`) que verifica en vivo contra Neon PostgreSQL:
  1. Presencia de los 7 países, 7 monedas fiat, 6 criptoactivos y 4 exchanges globales.
  2. Aislamiento absoluto entre dos comerciantes concurrentes (Trader Alpha vs Trader Beta).
  3. Filtrado dinámico estricto por país (VE vs CO).
  4. Preservación del registro físico ante desactivación lógica (soft delete).
  5. Perfiles de comisión por país diferenciados por lado (`buy` vs `sell`).
  6. Persistencia independiente de ajustes de workspace.
- La suite superó el 100% de las pruebas con código de salida `0`.
- `npm run build` compila con éxito todas las rutas en Next.js Turbopack.
