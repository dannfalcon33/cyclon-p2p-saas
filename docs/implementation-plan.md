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
- [ ] **Fase 6: Dashboard analítico, métricas y agregaciones sin mezcla de fiat**
- [ ] **Fase 7: Motor de comisiones por país y exportaciones Excel (.xlsx)**
- [ ] **Fase 8: Planes comerciales, prueba gratuita de 7 días y checkout simulado**
- [ ] **Fase 9: Panel Master del propietario (`platform_owner`), promociones y auditoría**
- [ ] **Fase 10: Módulo de mercado y noticias Enterprise (CoinGecko / CryptoCompare)**
- [ ] **Fase 11: QA exhaustivo, seguridad, tests y pulido de experiencia**
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

### Fase 6: Dashboard y Métricas
- **Objetivo:** Tarjetas analíticas, gráficos de volumen por criptoactivo, tasas promedio y volumen fiat agrupado estrictamente por divisa (sin suma cruzada).
- **Puerta de salida:** Totales calculados en servidor coincidentes con datos de prueba.

### Fase 7: Comisiones por País y Exportaciones Excel
- **Objetivo:** Perfiles configurables por país y generador `.xlsx` multihop sanitizado contra formula injection.
- **Puerta de salida:** Cálculos de comisiones inmutables en historial y descarga de Excel probada.

### Fase 8: Planes y Checkout Demo
- **Objetivo:** Servicio centralizado de capacidades (`hasFeature`), expiración de trial con retención de datos y pasarela `DemoBillingProvider` con marca `simulated=true`.
- **Puerta de salida:** Matriz de permisos probada en servidor y checkout demo funcional.

### Fase 9: Panel Master del Propietario
- **Objetivo:** Consola `/master` protegida por `platform_owner`, métricas globales, gestión de clientes (suspensión con motivo), promociones demo y registro de auditoría.
- **Puerta de salida:** Acceso denegado a comerciantes normales y trazabilidad administrativa probada.

### Fase 10: Mercado y Noticias Enterprise
- **Objetivo:** Gráficos de BTC, ETH, SOL y BNB, noticias seleccionadas y fallback limpio en caso de API no disponible.
- **Puerta de salida:** Acceso exclusivo para Enterprise, sin datos falsos inventados.

### Fase 11: QA y Pruebas
- **Objetivo:** Suite completa de pruebas unitarias (Vitest) y pruebas de aislamiento multinquilino.
- **Puerta de salida:** Cero fallos críticos de seguridad o aislamiento.

### Fase 12: Despliegue y Cierre
- **Objetivo:** Publicación en Vercel, enlace con Neon, bootstrap del propietario en producción y checklist final.
- **Puerta de salida:** Aplicación operativa en URL pública de demo.
