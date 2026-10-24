# 8. Motor de Comisiones por País, Sanitización Formula Injection y Exportación Excel Multilibro

- **Estado:** Aceptada
- **Fecha:** 2026-10-24
- **Fase del Proyecto:** Fase 7 — Motor de comisiones por país y exportaciones Excel (.xlsx)

---

## Contexto

El comerciante P2P opera en múltiples jurisdicciones de Latinoamérica (Venezuela, Colombia, Brasil, Argentina, Ecuador, Perú y Chile) donde las estructuras de comisiones varían según el exchange, el lado de la orden (`buy` / `sell`), el método de pago y los acuerdos propios del negocio.
Asimismo, para auditoría interna, preparación de declaraciones o entrega a contadores, se requiere exportar los registros históricos a libros de cálculo `.xlsx`.

Para garantizar seguridad, precisión contable y robustez técnica según la especificación de ingeniería Antigravity:
1. **No inventar tasas oficiales:** Los países son perfiles de configuración y no fuentes de una tasa universal. El comerciante define sus reglas y puede sobrescribirlas con motivo opcional.
2. **Instantáneas Inmutables:** Modificar una regla de comisión en el futuro jamás debe alterar operaciones históricas ya registradas.
3. **Celdas Numéricas Nativas en Excel:** Las cantidades de criptomonedas, importes fiat, tasas y comisiones deben exportarse como números reales de Excel (`numFmt`), no como cadenas de texto con símbolos de moneda agregados. El código de moneda ISO 4217 debe mantenerse en columna independiente.
4. **Protección contra Formula Injection (CSV / Excel Injection):** Cualquier texto ingresado por el usuario (referencias, alias de contraparte, notas) que empiece por `=`, `+`, `-`, `@`, `\t` o `\r` debe neutralizarse anteponiendo un apóstrofe (`'`) para evitar ejecución de comandos o DDE al abrir el archivo en Excel.
5. **Aislamiento Multinquilino Estricto:** La exportación debe limitarse exclusivamente a los registros del workspace autenticado en sesión.
6. **Disclaimer Legal:** Los reportes son bitácoras operativas; no calculan automáticamente impuestos ni certifican cumplimiento tributario oficial.

---

## Decisiones Técnicas

1. **Motor de Selección Determinista de Comisiones (`commission-engine.ts`):**
   - Implementa `resolveCommissionRule(workspaceId, params)` con la siguiente jerarquía determinista de resolución:
     1. País + Moneda + Lado + Exchange + Método de Pago
     2. País + Moneda + Lado + Exchange
     3. País + Moneda + Lado
     4. País + Moneda + 'all'
     5. País + 'all'
     6. Sin regla activa ("Pendiente de configurar", tasa neutra 0.00).
   - Implementa `calculateCommissionFee(fiatAmount, percentage, fixedFee, feeType)` con redondeo a 2 decimales para divisas fiat.
   - Genera una instantánea JSON inmutable (`CommissionRuleSnapshot`) con la regla aplicada, porcentaje, tarifa fija, versión y marca de tiempo (`appliedAt`).
   - Si el comerciante introduce un monto manual diferente, se marca `isOverride: true` sin perder la referencia a la regla calculada.

2. **Sanitización contra Inyección de Fórmulas:**
   - La función `sanitizeExcelFormula(input)` verifica si la cadena inicia con caracteres de fórmula (`=`, `+`, `-`, `@`, `\t`, `\r`) y le antepone un apóstrofe (`'`), obligando a Excel a tratar la celda como texto plano seguro.

3. **Generador Multilibro en Excel (`excel-export-service.ts` con `exceljs`):**
   - Construye libros nativos `.xlsx` con 4 hojas claramente estructuradas:
     * **`Operaciones`:** Lista completa filtrada de transacciones con ID, fecha UTC, país, exchange, lado, cripto (8 decimales), fiat (2 decimales), tasa, 3 comisiones desglosadas, método, banco, estado y notas sanitizadas.
     * **`Resumen por Moneda`:** Agregación exclusiva por divisa fiat (compras, ventas, volumen y comisiones), sin mezcla entre monedas diferentes.
     * **`Comisiones`:** Desglose analítico de comisiones del comerciante, tarifas de exchanges y cargos de medios de pago.
     * **`Parámetros del Reporte`:** Metadatos de la generación, filtros aplicados y disclaimer legal explícito.

4. **Descarga Directa por API Route Handler (`/api/export/excel`):**
   - Endpoint protegido por sesión con `getAuthenticatedWorkspace()`.
   - Streaming de Buffer binario en memoria con headers `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` y `Content-Disposition: attachment`.

5. **Experiencia de Usuario en la Interfaz:**
   - En [`/app/operaciones`](file:///c:/Users/Yashua/Documents/Repositorio/cyclon-p2p/src/app/app/operaciones): Botón y modal interactivo para descargar el libro Excel filtrado por período, país, moneda, estado, lado o exchange.
   - En [`/app/configuracion`](file:///c:/Users/Yashua/Documents/Repositorio/cyclon-p2p/src/app/app/configuracion): Pestaña de comisiones que lista los 7 países prioritarios (`VE`, `CO`, `BR`, `AR`, `EC`, `PE`, `CL`) con estado de configuración y editor de reglas.

---

## Verificación

- **Suite Automatizada de Pruebas (`tests/phase7-commissions-excel-test.ts`):**
  1. Sanitización de inyección de fórmulas (`=SUM`, `+123`, `-cmd`, `@SUM`) neutralizadas al 100%.
  2. Resolución determinista comprobada (regla específica de Binance vs general de Bybit vs país sin configurar).
  3. Carga e inspección de las 4 hojas del libro `.xlsx` (`Operaciones`, `Resumen por Moneda`, `Comisiones`, `Parámetros del Reporte`).
  4. Tipado de celdas numéricas verificado: `fiatAmount` y `assetAmount` comprobados como `number` y código de moneda en columna separada.
  5. Celdas con fórmulas maliciosas verificadas como neutralizadas dentro del archivo generado.
  6. Aislamiento multinquilino: Workspace Beta genera un reporte con 0 filas de datos de Alpha.
  - Resultado: **100% de las pruebas pasadas con código de salida `0`**.
- **Compilación de Producción:**
  - `npm run build` ejecutado exitosamente con 21/21 rutas (incluyendo `ƒ /api/export/excel`), 0 errores de TypeScript y Proxy de Next.js 16 activo.
