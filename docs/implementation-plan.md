# Plan de Implementación por Fases — Cyclon P2P

Este plan organiza el desarrollo secuencial del MVP mini-SaaS Cyclon P2P de acuerdo con la guía de ingeniería Antigravity. Cada fase debe cumplir rigurosamente sus criterios de aceptación y puerta de salida antes de proseguir con la siguiente.

---

## Estado del Proyecto

- [x] **Fase 0: Auditoría del repositorio y cierre de decisiones**
- [x] **Fase 1: Base técnica y sistema visual (Next.js, Tailwind, Componentes Cyberpunk)**
- [x] **Fase 2: Base de datos, esquema Neon/PostgreSQL y semillas (Drizzle ORM)**
- [x] **Fase 3: Autenticación, correo y espacios de trabajo (Better Auth)**
- [x] **Fase 4: Catálogos globales y configuración privada por comerciante**
- [x] **Fase 5: CRUD de operaciones P2P y validación server-side**
- [x] **Fase 6: Dashboard analítico, métricas y agregaciones sin mezcla de fiat**
- [x] **Fase 7: Motor de comisiones por país y exportaciones Excel (.xlsx)**
- [x] **Fase 8: Planes comerciales, prueba gratuita de 7 días y checkout simulado**
- [x] **Fase 9: Panel Master del propietario (`platform_owner`), promociones y auditoría**
- [x] **Fase 10: Módulo de mercado y noticias Enterprise (Binance Spot & Klines, P2P Arbitrage, CriptoNoticias RSS)**
- [x] **Fase 11: QA exhaustivo, seguridad, tests y pulido de experiencia**
- [ ] **Fase 12: Despliegue en Vercel + Neon y entrega de documentación final**

---

## Detalle de Fases y Puertas de Salida

### Fase 0: Auditoría del repositorio y cierre de decisiones (Completada)
- **Objetivo:** Inspeccionar el entorno, verificar versiones de dependencias, registrar ADRs y validar la inexistencia de colisiones de código.
- **Entregables:** Documentos en `docs/` (`requirements.md`, `architecture.md`, `data-model.md`, `implementation-plan.md`, `decisions/ADR-0001`, `ADR-0002`, `ADR-0003`).
- **Puerta de salida:** Repositorio verificado, stack compatible seleccionado, supuestos explícitos registrados.

### Fase 1: Base técnica y sistema visual (Completada)
- **Objetivo:** Estructurar el proyecto Next.js App Router con TypeScript, Tailwind CSS, fuentes y biblioteca de componentes atómicos accesible con estética cyberpunk (negro grafito `#08090d`, verde neón `#00ff66`).
- **Entregables:** Suite completa de UI (`Button`, `Input`, `Select`, `Dialog`, `Card`, `Table`, `Badge`, `DemoNoticeBadge`, `Skeleton`, `Alert`, `ToastProvider` / `useToast`), Layouts públicos y privados, Landing page, Checkout demo con cupones, Dashboard de Comerciante y Panel Master.
- **Puerta de salida:** `npm run build` verificado exitosamente (18/18 rutas estáticas generadas sin errores), TypeScript verificado (`tsc --noEmit`), tokens de color y contraste cyberpunk aplicados.

### Fase 2: Persistencia, Esquema Drizzle y Neon (Completada)
- **Objetivo:** Conectar a Neon PostgreSQL, definir el esquema completo Drizzle, migraciones reproducibles y seeds idempotentes (países, divisas, activos, planes).
- **Puerta de salida:** Migraciones exitosas, seeds idempotentes ejecutados sin errores.

### Fase 3: Autenticación y Espacios de Trabajo (Completada)
- **Objetivo:** Configurar Better Auth, creación automática de workspace y trial de 7 días, adaptador de correo desacoplado y script de bootstrap para `platform_owner`.
- **Puerta de salida:** Flujo completo de registro, login, verificación y protección de sesión validado.

### Fase 4: Catálogos y Configuración de Workspace (Completada)
- **Objetivo:** Gestión de países (VE, CO, BR, AR, EC, PE, CL), monedas (VES, COP, BRL, ARS, USD, PEN, CLP) y CRUD privado de bancos y métodos de pago por workspace.
- **Entregables:** Servicio `catalogs-service.ts`, server actions `catalogs.ts`, vista `configuracion/page.tsx` con tabs para comisiones, bancos, métodos y ajustes, filtrado dinámico en `operaciones/nueva/page.tsx`, suite automatizada `tests/phase4-catalogs-test.ts`, ADR-0005.
- **Puerta de salida:** Aislamiento multinquilino verificado al 100% (un comerciante jamás ve ni muta bancos/métodos de otro), filtrado por país dinámico validado, soft-delete que preserva integridad histórica probado exitosamente.

### Fase 5: CRUD de Operaciones P2P (Completada)
- **Objetivo:** Formulario de registro con cálculo de tasa, campos numéricos decimales seguros, snapshot de reglas y listado con paginación y filtros.
- **Entregables:** Servicio `operations-service.ts`, Server Actions `operations.ts` con validación Zod, formulario conectado `/app/operaciones/nueva`, listado en vivo con paginación y filtros `/app/operaciones`, detalle y cancelación `/app/operaciones/[id]`, suite automatizada `tests/phase5-operations-test.ts`, ADR-0006.
- **Puerta de salida:** Operaciones completadas, pendientes y canceladas registradas y aisladas correctamente al 100% en Neon PostgreSQL; entradas inválidas rechazadas en servidor; snapshots inmutables preservados.

### Fase 6: Dashboard y Métricas (Completada)
- **Objetivo:** Tarjetas analíticas, gráficos de volumen por criptoactivo, tasas promedio y volumen fiat agrupado estrictamente por divisa (sin suma cruzada).
- **Entregables:** Servicio `metrics-service.ts`, Server Action `metrics.ts`, Dashboard interactivo en vivo `/app/page.tsx` con selectores de período y divisa fiat activa, protección de navegación en borde Next.js 16 (`proxy.ts`), layouts con validación de sesión de servidor y suite automatizada `tests/phase6-dashboard-test.ts`, ADR-0007.
- **Puerta de salida:** Totales calculados en servidor coincidentes al 100% con datos de prueba; monedas fiat estrictamente aisladas sin mezclas cruzadas; tasas promedio ponderadas exactas; acceso por URL directa sin sesión o con rol indebido bloqueado y redirigido.

### Fase 7: Comisiones por País y Exportaciones Excel (Completada)
- **Objetivo:** Perfiles configurables por país, cálculo de comisiones determinista con snapshots inmutables y generador de libros `.xlsx` multihop con celdas numéricas nativas y sanitización estricta contra inyección de fórmulas.
- **Entregables:** Servicio `commission-engine.ts`, servicio `excel-export-service.ts`, Route Handler protegido `/api/export/excel`, UI de exportación interactiva con filtros en `operaciones/page.tsx`, cálculo y snapshot de comisiones en `operations-service.ts`, test suite automatizada `tests/phase7-commissions-excel-test.ts`, ADR-0008.
- **Puerta de salida:** Cálculos de comisiones inmutables en historial probados; resolución jerárquica determinista verificada; 4 hojas Excel nativas (`Operaciones`, `Resumen por Moneda`, `Comisiones`, `Parámetros del Reporte`) con formato numérico y sin texto concatenado; sanitización contra inyección de fórmulas probada al 100%; aislamiento multinquilino verificado al 100%.

### Fase 8: Planes y Checkout Demo (Completada)
- **Objetivo:** Servicio centralizado de capacidades (`hasFeature`, `canWorkspaceCreateOperations`), expiración de prueba gratuita con política inmutable de retención de datos, motor de cupones de promoción y pasarela simulada `DemoBillingProvider` con marca explícita `is_simulated = true`.
- **Entregables:** Servicio `plan-service.ts`, Server Actions `plans.ts`, vista reactiva `/app/plan` con modal de simulación de checkout y selector de resultado (`approved`, `pending`, `failed`), paywall Enterprise en `/app/mercado`, bloqueo de creación de operaciones al expirar trial en `operations-service.ts` y `/app/operaciones/nueva`, widget dinámico en `AppSidebar.tsx`, suite automatizada `tests/phase8-plans-billing-test.ts`, ADR-0009.
- **Puerta de salida:** Matriz de permisos probada en servidor; retención de datos validada (lectura e informe Excel preservados tras expirar); mutaciones no autorizadas bloqueadas en servidor; pasarela demo con outcomes auditados y marca `is_simulated = true`; aislamiento multinquilino verificado al 100%.

### Fase 9: Panel Master del Propietario (Completada)
- **Objetivo:** Consola `/master` protegida con rol `platform_owner`, métricas globales de negocio con separación contable estricta ($0.00 ingresos reales vs MRR demo estimado), gestión de clientes con suspensión/reactivación por motivo obligatorio, CRUD de cupones y bitácora de auditoría inmutable append-only.
- **Entregables:** Servicio `master-service.ts`, Server Actions `master.ts`, vista `/master` conectada con KPIs y breakdown de planes, directorio interactivo `/master/clientes` con modal de suspensión/reactivación, consola de cupones `/master/promociones`, bitácora `/master/auditoria` conectada a `platform_admin_audit_logs`, suite automatizada `tests/phase9-master-panel-test.ts`, ADR-0010.
- **Puerta de salida:** Acceso a `/master` denegado y redirigido para comerciantes regulares; separación estricta de ingresos reales ($0.00) verificada; suspensión con bloqueo de acceso y motivo obligatorio validada; trazabilidad de auditoría append-only probada al 100%.

### Fase 10: Mercado y Noticias Enterprise (Completada)
- **Objetivo:** Gráficos técnicos de BTC, ETH, SOL y BNB con Klines reales de Binance, monitor de arbitraje P2P para LATAM y feed de noticias en español (CriptoNoticias RSS) mediante APIs 100% gratuitas sin API Keys.
- **Entregables:** Servicio `crypto-market-service.ts`, Server Actions `market-data.ts`, panel interactivo `/app/mercado` con cotizaciones Spot en tiempo real, gráfico técnico dinámico SVG interactivo (1D, 7D, 1M), tabla de arbitraje P2P para 6 países de Latinoamérica (VES, COP, ARS, BRL, PEN, CLP) y feed de noticias en vivo, test suite automatizada `tests/phase10-market-news-test.ts`, ADR-0011.
- **Puerta de salida:** Verificación de capacidades Enterprise en servidor probada; cotizaciones reales de Binance en vivo sin datos inventados; gráfico dinámico generado desde Klines; sindicación de noticias en español verificada; 17/17 pruebas superadas al 100%.

### Fase 11: QA, Seguridad y Pruebas Exhaustivas (Completada)
- **Objetivo:** Suite completa de auditoría estática y dinámica, validación de fórmulas Excel contra inyecciones OWASP, precisión matemática del motor de comisiones, aislamiento multinquilino estricto, protección contra inyección de roles en Better Auth y compilación de producción con Next.js 16 App Router.
- **Entregables:** Suite de auditoría `tests/phase11-qa-audit.ts` con 31/31 pruebas automatizadas superadas, script `npm run test:phase11`, compilación de producción `npm run build` verificada (21/21 rutas compiladas con cero errores TypeScript).
- **Puerta de salida:** Cero fallos críticos de seguridad o aislamiento de datos multinquilino; no hay secretos en el repositorio; .env.example creado y documentado; build de producción verificado al 100%.

### Fase 12: Despliegue y Cierre
- **Objetivo:** Publicación en Vercel, enlace con Neon, bootstrap del propietario en producción y checklist final.
- **Puerta de salida:** Aplicación operativa en URL pública de demo.
