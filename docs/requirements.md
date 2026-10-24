# Requisitos del Sistema — Cyclon P2P

**Tipo de producto:** mini-SaaS / MVP de portafolio  
**Propósito:** Bitácora y dashboard analítico para comerciantes P2P (Binance, Bybit, Bitget) con gestión de operaciones, comisiones por país, exportaciones contables en Excel, catálogo de métodos de pago/bancos privados y Panel Master para el propietario.  
**Modo de facturación:** Demo/Simulada (`BILLING_MODE=demo`). No procesa dinero real.

---

## 1. Requisitos Funcionales (RF)

### RF-01: Autenticación y Cuentas
- **RF-01.1:** Registro de usuario con nombre, correo electrónico y contraseña.
- **RF-01.2:** Verificación de correo electrónico (soporte en consola para desarrollo y Resend/SMTP en producción).
- **RF-01.3:** Inicio de sesión y cierre de sesión seguro mediante sesiones server-side (Better Auth / cookies HTTP-only).
- **RF-01.4:** Recuperación de contraseña mediante enlace de token de un solo uso con caducidad.
- **RF-01.5:** Aprovisionamiento automático e idempotente de Workspace privado y prueba gratuita (Free Trial) de 7 días al completar el registro.
- **RF-01.6:** Estados de cuenta independientes del plan: `active`, `suspended`, `deactivated`, `pending_verification`.
- **RF-01.7:** Bootstrap seguro para promover una cuenta al rol global `platform_owner` (Master). Nunca autoasignable desde el registro público.

### RF-02: Gestión de Espacios de Trabajo (Workspaces)
- **RF-02.1:** Cada comerciante opera en un espacio de trabajo estrictamente aislado.
- **RF-02.2:** Configuración general: país principal (VE, CO, BR, AR, EC, PE, CL), zona horaria, monedas fiat habilitadas (VES, COP, BRL, ARS, USD, PEN, CLP) y datos fiscales opcionales para reportes.
- **RF-02.3:** Catálogo privado de Bancos propios vinculados al workspace (crear, editar, activar, desactivar).
- **RF-02.4:** Catálogo privado de Métodos de Pago propios vinculados al workspace (crear, editar, activar, desactivar, asociar banco opcional).

### RF-03: Bitácora de Operaciones P2P
- **RF-03.1:** Registro manual de operaciones de compra y venta de criptoactivos (`USDT`, `USDC`, `BTC`, `ETH`, `SOL`, `BNB`).
- **RF-03.2:** Selección de exchange (`Binance`, `Bybit`, `Bitget` o personalizado).
- **RF-03.3:** Campos monetarios con alta precisión (`NUMERIC`/`DECIMAL`): cantidad cripto, importe fiat, tasa calculada (`fiat_amount / asset_amount`).
- **RF-03.4:** Desglose transparente de 3 conceptos de cargos:
  1. Comisión del comerciante (calculada por regla o editable manualmente).
  2. Tarifa del exchange (expresada en la moneda fiat de la operación).
  3. Cargo del método de pago/banco (expresada en moneda fiat).
- **RF-03.5:** Estados de operación: `completada`, `pendiente`, `cancelada`.
- **RF-03.6:** Snapshot histórico inmutable: la operación almacena la regla y tarifas aplicadas en el momento de creación; cambios posteriores en reglas no alteran operaciones pasadas.
- **RF-03.7:** Listado paginado con búsqueda por referencia/alias y filtros por rango de fecha, país, exchange, activo, moneda fiat, estado y tipo (compra/venta).

### RF-04: Motor de Comisiones por País
- **RF-04.1:** Perfiles iniciales para 7 países: Venezuela (`VE`), Colombia (`CO`), Brasil (`BR`), Argentina (`AR`), Ecuador (`EC`), Perú (`PE`), Chile (`CL`).
- **RF-04.2:** Estado inicial de comisión: "Pendiente de configurar" con tasa neutral técnica cero (no se asumen comisiones oficiales universales).
- **RF-04.3:** Reglas configurables: porcentaje sobre importe fiat, importe fijo, o porcentaje + fijo.
- **RF-04.4:** Prioridad determinista de coincidencia: (País + Moneda + Tipo + Exchange + Método) -> (País + Moneda + Tipo) -> (País + Moneda).

### RF-05: Dashboard y Analítica de Negocio
- **RF-05.1:** Tarjetas de resumen operacional: operaciones completadas vs pendientes vs canceladas.
- **RF-05.2:** Volumen por activo cripto (comprado y vendido).
- **RF-05.3:** Volumen fiat estrictamente agrupado por moneda (`VES`, `COP`, `BRL`, `ARS`, `USD`, `PEN`, `CLP`). **Prohibida la suma directa entre monedas distintas**.
- **RF-05.4:** Desglose de comisiones recaudadas por moneda y tipo de comisión.
- **RF-05.5:** Tasa promedio ponderada por activo y dirección.
- **RF-05.6:** Distribución por exchange y método de pago.

### RF-06: Exportaciones a Excel (.xlsx)
- **RF-06.1:** Generación en servidor de libros Excel multihop (`Operaciones`, `Resumen por moneda`, `Comisiones`, `Parámetros del reporte`).
- **RF-06.2:** Formato de celdas estrictamente numérico (sin cadenas `$ 1,000` con símbolos mezclados) y código de moneda en columna separada.
- **RF-06.3:** Sanitización estricta contra Formula Injection (`=`, `+`, `-`, `@`).
- **RF-06.4:** Descarga autorizada exclusiva para registros del workspace activo.

### RF-07: Suscripciones y Checkout Demo
- **RF-07.1:** Planes definidos:
  - `Free Trial`: 7 días de acceso a funciones Business.
  - `Business`: Dashboard completo, operaciones ilimitadas, reglas de comisiones, exportación Excel.
  - `Enterprise`: Todo Business + Gráficos de mercado BTC/ETH/SOL/BNB + Noticias especializadas.
- **RF-07.2:** Checkout simulado para portafolio (`simulated=true`): no solicita datos reales de tarjeta ni procesa cobros reales. Opciones de simulación: Aprobado, Pendiente, Fallido.
- **RF-07.3:** Al expirar el periodo de prueba, se conserva el historial y la capacidad de exportación; se restringe la creación y edición hasta activar plan demo.

### RF-08: Panel Master del Propietario (`platform_owner`)
- **RF-08.1:** Acceso exclusivo en `/master` protegido por verificación de rol en el servidor.
- **RF-08.2:** Métricas globales: total de clientes, activos, suspendidos, trials, suscripciones por plan.
- **RF-08.3:** Separación estricta de métricas: Ingresos reales = 0 (MVP de portafolio sin pasarela). Métricas de checkout marcadas como "DEMO / ESTIMADO".
- **RF-08.4:** Gestión de clientes: búsqueda, filtros, inspección de ficha, suspensión lógica y reactivación con motivo administrativo obligatorio.
- **RF-08.5:** Gestión de promociones: cupones de descuento simulado (porcentaje o fijo), límites de uso, vigencia y planes elegibles.
- **RF-08.6:** Bitácora de auditoría inmutable (`platform_admin_audit_logs`) para registrar cambios administrativos.

### RF-09: Módulo de Mercado Enterprise
- **RF-09.1:** Adaptadores desacoplados de precios cripto y noticias de mercado.
- **RF-09.2:** Caché server-side para respetar límites de cuota de APIs.
- **RF-09.3:** Manejo honesto de caídas o falta de credenciales: mostrar estados vacíos o advertencias; prohibido inventar datos falsos en producción.

---

## 2. Requisitos No Funcionales (RNF)

- **RNF-01 (Seguridad):** Aislamiento multinquilino en cada query SQL a través de `workspaceId` derivado de la sesión del servidor. Protección CSRF, XSS, rate limiting en autenticación y cabeceras de seguridad.
- **RNF-02 (Rendimiento):** Server Components en Next.js App Router para carga veloz. Índices compuestos en PostgreSQL (`workspace_id`, `occurred_at`, `status`).
- **RNF-03 (Estética Visual):** Estilo visual cyberpunk minimalista, fondo negro grafito `#0a0b0e`, acentos verde neón `#00FF66` / `#00E575`, contraste AA/AAA WCAG, microanimaciones y tipografía moderna (Inter / JetBrains Mono).
- **RNF-04 (Integridad Numérica):** Cálculos financieros ejecutados con precisión decimal fija o bibliotecas de manejo decimal seguro (evitando fallos de coma flotante IEEE 754 de JS).
- **RNF-05 (Mantenibilidad y Calidad):** Arquitectura limpia por capas (UI -> Server Actions -> Domain Services -> Drizzle Repositories). Suite de pruebas unitarias y de integración con Vitest.
