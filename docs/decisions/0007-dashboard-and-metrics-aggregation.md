# 7. Dashboard Analítico, Agregación sin Mezcla de Fiat y Protección de Rutas

- **Estado:** Aceptada
- **Fecha:** 2026-10-24
- **Fase del Proyecto:** Fase 6 — Dashboard analítico, métricas y agregaciones sin mezcla de fiat

---

## Contexto

El comerciante P2P necesita un centro de control operativo ([`/app`](file:///c:/Users/Yashua/Documents/Repositorio/cyclon-p2p/src/app/app/page.tsx)) que transforme los registros individuales de compras y ventas en resúmenes analíticos claros, confiables y auditables.
Adicionalmente, se detectó una vulnerabilidad crítica de navegación en la que peticiones directas por URL a rutas privadas ([`/app`](file:///c:/Users/Yashua/Documents/Repositorio/cyclon-p2p/src/app/app) y [`/master`](file:///c:/Users/Yashua/Documents/Repositorio/cyclon-p2p/src/app/master)) no forzaban la redirección al inicio de sesión ni validaban la exclusividad de roles en los layouts de Next.js.

Para cumplir con la especificación de ingeniería Antigravity:
1. **Regla de Oro Contable:** No unir importes de monedas fiat diferentes en un único total sin conversión explícita documentada. Si un comerciante opera en `VES`, `USD` o `COP`, cada volumen debe permanecer estrictamente discriminado.
2. **Exclusión de Canceladas:** Las operaciones canceladas y pendientes deben registrarse para propósitos de auditoría pero nunca sumarse a los volúmenes operativos de compra/venta.
3. **Tasas Ponderadas Reales:** Las tasas promedio deben calcularse por volumen ponderado: $\frac{\sum \text{fiat\_amount}}{\sum \text{asset\_amount}}$.
4. **Desglose de Comisiones:** Se deben mantener separadas la comisión propia del comerciante, la tarifa del exchange y los cargos del proveedor/método de pago.
5. **Protección en Profundidad (Defense in Depth):** Garantizar tanto en el borde (Next.js 16 `proxy.ts`) como en los Server Component Layouts (`AppLayout` y `MasterLayout`) que ningún usuario no autenticado o con rol indebido pueda visualizar datos privados.

---

## Decisiones Técnicas

1. **Protección de Rutas en Tres Capas (Defense in Depth):**
   - **Capa 1 (Edge Proxy `src/proxy.ts`):** Utilizando la convención oficial de Next.js 16 (`proxy.ts`), se interceptan las rutas `/app/:path*` y `/master/:path*`. Si la cookie de sesión (`better-auth.session_token`) no existe, se redirige inmediatamente a `/login` preservando `callbackUrl`. Además, usuarios ya autenticados que naveguen a `/login` o `/registro` son redirigidos a `/app`.
   - **Capa 2 (Server Component Layouts):**
     * En `src/app/app/layout.tsx`: Valida la sesión con `await getAuthenticatedWorkspace()`. Si la sesión o el workspace no existen, el servidor redirige a `/login`. Muestra datos dinámicos del workspace y usuario.
     * En `src/app/master/layout.tsx`: Valida con `await requirePlatformOwner()`. Si el usuario no tiene el rol `platform_owner` (por ejemplo, el comerciante demo), es redirigido a `/app` y se le bloquea el acceso.
   - **Capa 3 (Server Actions):** Validación criptográfica de sesión y pertenencia de workspace en cada mutación y consulta sensible.

2. **Servicio de Agregación Analítica (`metrics-service.ts`):**
   - Implementa `getMerchantDashboardMetrics(workspaceId, options)` con soporte para filtros de período (`today`, `7d`, `30d`, `month`, `all`) y divisa fiat seleccionada.
   - Totaliza volúmenes de criptoactivos (`USDT`, `USDC`, `BTC`, `ETH`, `SOL`, `BNB`) divididos por lado (`buy` / `sell`).
   - Totaliza volúmenes fiat en un mapa indexado por moneda ISO 4217 (`fiatMetrics[currency]`).
   - Calcula tasas promedio ponderadas de compra, venta, global y spread bruto estimado (`sellAvgRate - buyAvgRate`).
   - Separa las tres comisiones (`merchantFee`, `exchangeFee`, `paymentCharge`).
   - Calcula la participación porcentual por exchange (Binance, Bybit, Bitget) y ranking de métodos de pago.
   - Extrae las 5 operaciones más recientes y evalúa el flag `hasOperations` para estados vacíos.

3. **Interfaz Dinámica del Dashboard (`src/app/app/page.tsx`):**
   - Selector reactivo de períodos (Hoy, 7d, 30d, Mes, Histórico) y selector de divisas fiat disponibles.
   - 4 tarjetas KPI con indicadores de compras vs ventas y subconteos de pendientes y canceladas.
   - Banner explicativo de aislamiento de divisas.
   - Tarjeta de tasas promedio ponderadas con cálculo de margen spread.
   - Barras de progreso de distribución por Exchange y métodos de pago.
   - Estado vacío amigable cuando un espacio de trabajo aún no cuenta con transacciones.

---

## Verificación

- **Suite Automatizada de Fase 6 (`tests/phase6-dashboard-test.ts`):**
  1. Conteo exacto por estados: 4 completadas, 1 pendiente, 1 cancelada en 30 días.
  2. Aislamiento fiat: `17,850.00 VES` y `3,400.00 USD` calculados sin ninguna mezcla cruzada.
  3. Tasa promedio ponderada: Compra USDT/VES calculada exactamente en `39.0000`, Venta en `41.0000` y Spread en `+2.0000`.
  4. Desglose de comisiones: `merchantFee` (178.50), `exchangeFee` (23.00) y `paymentCharge` (7.00) computados independientemente.
  5. Filtros temporales: Discriminación exacta entre operaciones de 30 días y operaciones de hace 40 días.
  6. Aislamiento multinquilino: Workspace Beta registra 0 operaciones y no visualiza ningún dato de Workspace Alpha.
  - Resultado: **100% de las pruebas pasadas con código de salida `0`**.
- **Compilación de Producción:**
  - `npm run build` ejecutado exitosamente con 20/20 rutas optimizadas y `Proxy (Middleware)` activo en Next.js 16.
