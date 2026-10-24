import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { sanitizeExcelFormula } from "./commission-engine";

export interface ExcelExportFilters {
  period?: "today" | "7d" | "30d" | "month" | "all";
  startDate?: string;
  endDate?: string;
  countryCode?: string;
  fiatCurrency?: string;
  operationSide?: "buy" | "sell" | "ALL";
  status?: "completed" | "pending" | "cancelled" | "ALL";
  assetSymbol?: string;
  exchangeCode?: string;
}

/**
 * Servicio de Generación de Reportes en Excel (.xlsx) para Cyclon P2P
 * Cumple con:
 * 1. Aislamiento estricto por workspaceId.
 * 2. Celdas numéricas nativas (no textos de dinero).
 * 3. Sanitización de cadenas contra inyección de fórmulas de Excel.
 * 4. Hojas múltiples: Operaciones, Resumen por Moneda, Comisiones y Parámetros.
 * 5. Leyenda visible de que no calcula impuestos automáticamente.
 */
export async function generateOperationsExcel(
  workspaceId: string,
  filters: ExcelExportFilters = {}
): Promise<Buffer> {
  // 1. Obtener información del workspace
  const workspace = await db.query.workspaces.findFirst({
    where: eq(schema.workspaces.id, workspaceId),
  });

  const workspaceName = workspace?.name || "Espacio P2P";

  // 2. Construir condiciones de consulta
  const conditions = [eq(schema.p2pOperations.workspaceId, workspaceId)];

  if (filters.countryCode && filters.countryCode !== "ALL") {
    conditions.push(eq(schema.p2pOperations.countryCode, filters.countryCode));
  }
  if (filters.fiatCurrency && filters.fiatCurrency !== "ALL") {
    conditions.push(eq(schema.p2pOperations.fiatCurrency, filters.fiatCurrency));
  }
  if (filters.operationSide && filters.operationSide !== "ALL") {
    conditions.push(eq(schema.p2pOperations.operationSide, filters.operationSide));
  }
  if (filters.status && filters.status !== "ALL") {
    conditions.push(eq(schema.p2pOperations.status, filters.status));
  }
  if (filters.assetSymbol && filters.assetSymbol !== "ALL") {
    conditions.push(eq(schema.p2pOperations.assetSymbol, filters.assetSymbol));
  }
  if (filters.exchangeCode && filters.exchangeCode !== "ALL") {
    conditions.push(eq(schema.p2pOperations.exchangeCode, filters.exchangeCode));
  }

  // Filtro de fecha
  if (filters.startDate) {
    conditions.push(gte(schema.p2pOperations.occurredAt, new Date(filters.startDate)));
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(schema.p2pOperations.occurredAt, end));
  } else if (filters.period) {
    const now = new Date();
    if (filters.period === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      conditions.push(gte(schema.p2pOperations.occurredAt, today));
    } else if (filters.period === "7d") {
      conditions.push(gte(schema.p2pOperations.occurredAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)));
    } else if (filters.period === "30d") {
      conditions.push(gte(schema.p2pOperations.occurredAt, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)));
    } else if (filters.period === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      conditions.push(gte(schema.p2pOperations.occurredAt, monthStart));
    }
  }

  // 3. Ejecutar consulta ordenada cronológicamente
  const operations = await db.query.p2pOperations.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.p2pOperations.occurredAt)],
  });

  // 4. Crear Libro de Trabajo Excel
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Cyclon P2P Platform";
  workbook.lastModifiedBy = "Cyclon P2P Report Engine";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Estilos Comunes
  const headerFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0D1117" }, // Dark charcoal
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  const borderThin: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFE1E4E8" } },
    left: { style: "thin", color: { argb: "FFE1E4E8" } },
    bottom: { style: "thin", color: { argb: "FFE1E4E8" } },
    right: { style: "thin", color: { argb: "FFE1E4E8" } },
  };

  /* =========================================================================
     HOJA 1: Operaciones
     ========================================================================= */
  const wsOps = workbook.addWorksheet("Operaciones", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  wsOps.columns = [
    { header: "ID Operación", key: "id", width: 36 },
    { header: "Fecha y Hora (UTC)", key: "occurredAt", width: 22 },
    { header: "País", key: "countryCode", width: 8 },
    { header: "Exchange", key: "exchangeCode", width: 14 },
    { header: "Tipo / Lado", key: "side", width: 14 },
    { header: "Activo Cripto", key: "assetSymbol", width: 14 },
    { header: "Cantidad Cripto", key: "assetAmount", width: 18, style: { numFmt: "#,##0.00000000" } },
    { header: "Moneda Fiat", key: "fiatCurrency", width: 14 },
    { header: "Importe Fiat", key: "fiatAmount", width: 18, style: { numFmt: "#,##0.00" } },
    { header: "Tasa Unitaria", key: "unitRate", width: 18, style: { numFmt: "#,##0.0000" } },
    { header: "Comisión Comerciante", key: "merchantFee", width: 22, style: { numFmt: "#,##0.00" } },
    { header: "Tarifa Exchange", key: "exchangeFee", width: 18, style: { numFmt: "#,##0.00" } },
    { header: "Cargo Método Pago", key: "paymentCharge", width: 20, style: { numFmt: "#,##0.00" } },
    { header: "Método de Pago", key: "paymentMethod", width: 26 },
    { header: "Banco", key: "bank", width: 26 },
    { header: "Estado", key: "status", width: 14 },
    { header: "Referencia Externa", key: "externalRef", width: 22 },
    { header: "Alias Contraparte", key: "counterparty", width: 22 },
    { header: "Notas Operativas", key: "notes", width: 32 },
  ];

  // Aplicar formato de encabezado a Hoja 1
  const headerRow1 = wsOps.getRow(1);
  headerRow1.height = 26;
  headerRow1.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Agregar filas de datos con valores numéricos puros y sanitización
  for (const op of operations) {
    const row = wsOps.addRow({
      id: op.id,
      occurredAt: op.occurredAt.toISOString().replace("T", " ").substring(0, 19),
      countryCode: op.countryCode,
      exchangeCode: op.exchangeCode.toUpperCase(),
      side: op.operationSide === "buy" ? "COMPRA" : "VENTA",
      assetSymbol: op.assetSymbol,
      assetAmount: parseFloat(op.assetAmount || "0"),
      fiatCurrency: op.fiatCurrency,
      fiatAmount: parseFloat(op.fiatAmount || "0"),
      unitRate: parseFloat(op.unitRate || "0"),
      merchantFee: parseFloat(op.merchantFee || "0"),
      exchangeFee: parseFloat(op.exchangeFee || "0"),
      paymentCharge: parseFloat(op.paymentCharge || "0"),
      paymentMethod: sanitizeExcelFormula(op.paymentMethodNameSnapshot || "—"),
      bank: sanitizeExcelFormula(op.bankNameSnapshot || "—"),
      status:
        op.status === "completed"
          ? "COMPLETADA"
          : op.status === "pending"
          ? "PENDIENTE"
          : "CANCELADA",
      externalRef: sanitizeExcelFormula(op.externalReference || ""),
      counterparty: sanitizeExcelFormula(op.counterpartyAlias || ""),
      notes: sanitizeExcelFormula(op.notes || ""),
    });

    row.eachCell((cell) => {
      cell.border = borderThin;
      cell.alignment = { vertical: "middle" };
    });
  }

  /* =========================================================================
     HOJA 2: Resumen por Moneda (Estrictamente Aislado)
     ========================================================================= */
  const wsSummary = workbook.addWorksheet("Resumen por Moneda", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  wsSummary.columns = [
    { header: "Moneda Fiat", key: "currency", width: 16 },
    { header: "Operaciones Completadas", key: "count", width: 24, style: { numFmt: "#,##0" } },
    { header: "Total Compras Fiat", key: "buyTotal", width: 22, style: { numFmt: "#,##0.00" } },
    { header: "Total Ventas Fiat", key: "sellTotal", width: 22, style: { numFmt: "#,##0.00" } },
    { header: "Volumen Total Operado", key: "volumeTotal", width: 24, style: { numFmt: "#,##0.00" } },
    { header: "Comisiones Comerciante", key: "merchantFeeTotal", width: 24, style: { numFmt: "#,##0.00" } },
    { header: "Tarifas de Exchanges", key: "exchangeFeeTotal", width: 22, style: { numFmt: "#,##0.00" } },
    { header: "Cargos Métodos Pago", key: "paymentChargesTotal", width: 22, style: { numFmt: "#,##0.00" } },
    { header: "Total Cargos Operativos", key: "allFeesTotal", width: 24, style: { numFmt: "#,##0.00" } },
  ];

  const headerRow2 = wsSummary.getRow(1);
  headerRow2.height = 26;
  headerRow2.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Agrupación de datos por divisa
  const fiatGroups: Record<
    string,
    {
      count: number;
      buyTotal: number;
      sellTotal: number;
      merchantFee: number;
      exchangeFee: number;
      paymentCharge: number;
    }
  > = {};

  for (const op of operations) {
    if (op.status !== "completed") continue; // Excluye canceladas y pendientes
    const f = op.fiatCurrency.toUpperCase();
    if (!fiatGroups[f]) {
      fiatGroups[f] = { count: 0, buyTotal: 0, sellTotal: 0, merchantFee: 0, exchangeFee: 0, paymentCharge: 0 };
    }
    fiatGroups[f].count += 1;
    const fiatAmt = parseFloat(op.fiatAmount || "0");
    if (op.operationSide === "buy") fiatGroups[f].buyTotal += fiatAmt;
    if (op.operationSide === "sell") fiatGroups[f].sellTotal += fiatAmt;

    fiatGroups[f].merchantFee += parseFloat(op.merchantFee || "0");
    fiatGroups[f].exchangeFee += parseFloat(op.exchangeFee || "0");
    fiatGroups[f].paymentCharge += parseFloat(op.paymentCharge || "0");
  }

  for (const f of Object.keys(fiatGroups)) {
    const g = fiatGroups[f];
    const vol = g.buyTotal + g.sellTotal;
    const allFees = g.merchantFee + g.exchangeFee + g.paymentCharge;

    const row = wsSummary.addRow({
      currency: f,
      count: g.count,
      buyTotal: g.buyTotal,
      sellTotal: g.sellTotal,
      volumeTotal: vol,
      merchantFeeTotal: g.merchantFee,
      exchangeFeeTotal: g.exchangeFee,
      paymentChargesTotal: g.paymentCharge,
      allFeesTotal: allFees,
    });

    row.eachCell((cell) => {
      cell.border = borderThin;
      cell.alignment = { vertical: "middle" };
    });
  }

  /* =========================================================================
     HOJA 3: Comisiones
     ========================================================================= */
  const wsFees = workbook.addWorksheet("Comisiones", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  wsFees.columns = [
    { header: "Moneda Fiat", key: "currency", width: 16 },
    { header: "Comisión Neta Comerciante", key: "merchantFee", width: 26, style: { numFmt: "#,##0.00" } },
    { header: "Tarifas de Exchanges", key: "exchangeFee", width: 22, style: { numFmt: "#,##0.00" } },
    { header: "Cargos de Métodos de Pago", key: "paymentCharge", width: 26, style: { numFmt: "#,##0.00" } },
    { header: "Total Comisiones Registradas", key: "total", width: 28, style: { numFmt: "#,##0.00" } },
    { header: "% Comisiones s/ Volumen", key: "ratio", width: 24, style: { numFmt: "0.00%" } },
    { header: "Observaciones Contables", key: "notes", width: 45 },
  ];

  const headerRow3 = wsFees.getRow(1);
  headerRow3.height = 26;
  headerRow3.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  for (const f of Object.keys(fiatGroups)) {
    const g = fiatGroups[f];
    const vol = g.buyTotal + g.sellTotal;
    const allFees = g.merchantFee + g.exchangeFee + g.paymentCharge;
    const ratio = vol > 0 ? allFees / vol : 0;

    const row = wsFees.addRow({
      currency: f,
      merchantFee: g.merchantFee,
      exchangeFee: g.exchangeFee,
      paymentCharge: g.paymentCharge,
      total: allFees,
      ratio: ratio,
      notes: "Tarifas operativas registradas por el comerciante.",
    });

    row.eachCell((cell) => {
      cell.border = borderThin;
      cell.alignment = { vertical: "middle" };
    });
  }

  /* =========================================================================
     HOJA 4: Parámetros del Reporte
     ========================================================================= */
  const wsParams = workbook.addWorksheet("Parámetros del Reporte");
  wsParams.columns = [
    { header: "Parámetro de Generación", key: "param", width: 32 },
    { header: "Valor Configurado", key: "value", width: 60 },
  ];

  const headerRow4 = wsParams.getRow(1);
  headerRow4.height = 26;
  headerRow4.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });

  const paramRows = [
    { param: "Espacio de Trabajo", value: sanitizeExcelFormula(workspaceName) },
    { param: "ID de Workspace", value: workspaceId },
    { param: "Fecha de Generación (UTC)", value: new Date().toISOString() },
    { param: "Total de Operaciones Exportadas", value: operations.length.toString() },
    { param: "Filtro Período", value: filters.period || "Personalizado / Histórico" },
    { param: "Filtro País", value: filters.countryCode || "Todos (ALL)" },
    { param: "Filtro Moneda Fiat", value: filters.fiatCurrency || "Todas (ALL)" },
    { param: "Filtro Estado", value: filters.status || "Todos (ALL)" },
    { param: "Filtro Exchange", value: filters.exchangeCode || "Todos (ALL)" },
    { param: "Filtro Tipo / Lado", value: filters.operationSide || "Todos (ALL)" },
    {
      param: "Cláusula Legal y Disclaimer",
      value:
        "Cyclon P2P es una bitácora y dashboard de operaciones. Este reporte exporta datos operativos del comerciante y no constituye cálculo oficial de impuestos ni asesoría tributaria. Verifique los requisitos fiscales de su país con un contador certificado.",
    },
  ];

  for (const item of paramRows) {
    const row = wsParams.addRow(item);
    row.eachCell((cell) => {
      cell.border = borderThin;
      cell.alignment = { vertical: "middle" };
    });
  }

  // Generar Buffer binario
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
