import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface CommissionRuleSnapshot {
  ruleId: string | null;
  countryCode: string;
  fiatCurrency: string;
  operationSide: "buy" | "sell" | "all";
  exchangeCode: string | null;
  paymentMethodId: string | null;
  feeType: "percentage" | "fixed" | "percentage_and_fixed";
  percentage: string;
  fixedFee: string;
  calculatedFee: string;
  appliedAt: string;
  isOverride?: boolean;
  overrideReason?: string | null;
}

export interface ResolveCommissionParams {
  countryCode: string;
  fiatCurrency: string;
  operationSide: "buy" | "sell";
  exchangeCode?: string;
  paymentMethodId?: string;
  fiatAmount?: number | string;
}

export interface ResolveCommissionResult {
  isConfigured: boolean;
  ruleId: string | null;
  percentage: string;
  fixedFee: string;
  feeType: "percentage" | "fixed" | "percentage_and_fixed";
  calculatedFee: string;
  snapshot: CommissionRuleSnapshot;
  description: string;
}

/**
 * Sanitiza cualquier texto para prevenir Inyección de Fórmulas en Excel / CSV.
 * Si la cadena comienza con '=', '+', '-', '@', '\t' o '\r', antepone un apóstrofe (').
 */
export function sanitizeExcelFormula(input: string | null | undefined): string {
  if (!input) return "";
  const trimmed = String(input).trim();
  if (
    trimmed.startsWith("=") ||
    trimmed.startsWith("+") ||
    trimmed.startsWith("-") ||
    trimmed.startsWith("@") ||
    trimmed.startsWith("\t") ||
    trimmed.startsWith("\r")
  ) {
    return `'${trimmed}`;
  }
  return trimmed;
}

/**
 * Calcula el importe de comisión en base al tipo de regla
 * Fórmula base: (importe_fiat * porcentaje / 100) + cargo_fijo
 */
export function calculateCommissionFee(
  fiatAmount: number,
  percentageDecimal: number,
  fixedFee: number,
  feeType: "percentage" | "fixed" | "percentage_and_fixed" = "percentage"
): number {
  if (fiatAmount <= 0) return 0;

  let fee = 0;
  if (feeType === "percentage") {
    fee = fiatAmount * percentageDecimal;
  } else if (feeType === "fixed") {
    fee = fixedFee;
  } else if (feeType === "percentage_and_fixed") {
    fee = fiatAmount * percentageDecimal + fixedFee;
  }

  // Redondeo a 2 decimales para divisas fiat
  return Math.round(fee * 100) / 100;
}

/**
 * Resolución determinista de reglas de comisión por país para un workspace
 * Jerarquía de selección:
 * 1. País + Moneda + Lado + Exchange + Método de pago
 * 2. País + Moneda + Lado + Exchange
 * 3. País + Moneda + Lado
 * 4. País + Moneda + 'all'
 * 5. País + 'all'
 */
export async function resolveCommissionRule(
  workspaceId: string,
  params: ResolveCommissionParams
): Promise<ResolveCommissionResult> {
  const fiatAmt = typeof params.fiatAmount === "string" ? parseFloat(params.fiatAmount || "0") : (params.fiatAmount || 0);

  // Consultar todas las reglas activas para este workspace y país
  const rules = await db.query.commissionProfiles.findMany({
    where: and(
      eq(schema.commissionProfiles.workspaceId, workspaceId),
      eq(schema.commissionProfiles.countryCode, params.countryCode),
      eq(schema.commissionProfiles.isActive, true)
    ),
    orderBy: [desc(schema.commissionProfiles.priority), desc(schema.commissionProfiles.createdAt)],
  });

  // 1. Coincidencia completa: País + Moneda + Lado + Exchange + Método
  let matched = rules.find(
    (r) =>
      r.fiatCurrency === params.fiatCurrency &&
      (r.operationSide === params.operationSide || r.operationSide === "all") &&
      params.exchangeCode &&
      r.exchangeCode === params.exchangeCode &&
      params.paymentMethodId &&
      r.paymentMethodId === params.paymentMethodId
  );

  // 2. Coincidencia: País + Moneda + Lado + Exchange
  if (!matched && params.exchangeCode) {
    matched = rules.find(
      (r) =>
        r.fiatCurrency === params.fiatCurrency &&
        (r.operationSide === params.operationSide || r.operationSide === "all") &&
        r.exchangeCode === params.exchangeCode &&
        !r.paymentMethodId
    );
  }

  // 3. Coincidencia: País + Moneda + Lado específico ('buy' o 'sell')
  if (!matched) {
    matched = rules.find(
      (r) =>
        r.fiatCurrency === params.fiatCurrency &&
        r.operationSide === params.operationSide &&
        !r.exchangeCode &&
        !r.paymentMethodId
    );
  }

  // 4. Coincidencia: País + Moneda + Lado general ('all')
  if (!matched) {
    matched = rules.find(
      (r) =>
        r.fiatCurrency === params.fiatCurrency &&
        r.operationSide === "all" &&
        !r.exchangeCode &&
        !r.paymentMethodId
    );
  }

  // 5. Coincidencia: País + Lado general ('all')
  if (!matched) {
    matched = rules.find(
      (r) =>
        r.operationSide === "all" &&
        !r.exchangeCode &&
        !r.paymentMethodId
    );
  }

  const nowIso = new Date().toISOString();

  if (matched) {
    const pct = parseFloat(matched.percentage || "0");
    const fixed = parseFloat(matched.fixedFee || "0");
    const feeType = matched.feeType as "percentage" | "fixed" | "percentage_and_fixed";
    const calculated = calculateCommissionFee(fiatAmt, pct, fixed, feeType);

    const snapshot: CommissionRuleSnapshot = {
      ruleId: matched.id,
      countryCode: matched.countryCode,
      fiatCurrency: matched.fiatCurrency,
      operationSide: matched.operationSide as "buy" | "sell" | "all",
      exchangeCode: matched.exchangeCode || null,
      paymentMethodId: matched.paymentMethodId || null,
      feeType,
      percentage: matched.percentage,
      fixedFee: matched.fixedFee,
      calculatedFee: calculated.toFixed(2),
      appliedAt: nowIso,
    };

    const pctDisplay = (pct * 100).toFixed(2);
    let desc = `${pctDisplay}%`;
    if (feeType === "fixed") desc = `${fixed.toFixed(2)} ${matched.fiatCurrency}`;
    if (feeType === "percentage_and_fixed") desc = `${pctDisplay}% + ${fixed.toFixed(2)} ${matched.fiatCurrency}`;

    return {
      isConfigured: true,
      ruleId: matched.id,
      percentage: matched.percentage,
      fixedFee: matched.fixedFee,
      feeType,
      calculatedFee: calculated.toFixed(2),
      snapshot,
      description: `Regla activa (${matched.countryCode} - ${matched.operationSide.toUpperCase()}): ${desc}`,
    };
  }

  // Sin regla configurada (neutro 0.00)
  const defaultSnapshot: CommissionRuleSnapshot = {
    ruleId: null,
    countryCode: params.countryCode,
    fiatCurrency: params.fiatCurrency,
    operationSide: params.operationSide,
    exchangeCode: params.exchangeCode || null,
    paymentMethodId: params.paymentMethodId || null,
    feeType: "percentage",
    percentage: "0.0000",
    fixedFee: "0.00",
    calculatedFee: "0.00",
    appliedAt: nowIso,
  };

  return {
    isConfigured: false,
    ruleId: null,
    percentage: "0.0000",
    fixedFee: "0.00",
    feeType: "percentage",
    calculatedFee: "0.00",
    snapshot: defaultSnapshot,
    description: `Sin regla configurada para ${params.countryCode} (${params.operationSide.toUpperCase()}) — Tasa neutra 0.00`,
  };
}

/**
 * Lista o inicializa los perfiles de los 7 países base para un workspace
 */
export async function getWorkspaceCommissionProfilesWithDefaults(workspaceId: string) {
  const countries = [
    { code: "VE", name: "Venezuela", defaultFiat: "VES" },
    { code: "CO", name: "Colombia", defaultFiat: "COP" },
    { code: "BR", name: "Brasil", defaultFiat: "BRL" },
    { code: "AR", name: "Argentina", defaultFiat: "ARS" },
    { code: "EC", name: "Ecuador", defaultFiat: "USD" },
    { code: "PE", name: "Perú", defaultFiat: "PEN" },
    { code: "CL", name: "Chile", defaultFiat: "CLP" },
  ];

  const existing = await db.query.commissionProfiles.findMany({
    where: eq(schema.commissionProfiles.workspaceId, workspaceId),
  });

  return countries.map((c) => {
    const buyRule = existing.find(
      (r) => r.countryCode === c.code && (r.operationSide === "buy" || r.operationSide === "all")
    );
    const sellRule = existing.find(
      (r) => r.countryCode === c.code && (r.operationSide === "sell" || r.operationSide === "all")
    );

    const isConfigured = Boolean(buyRule || sellRule);

    return {
      countryCode: c.code,
      countryName: c.name,
      defaultFiat: c.defaultFiat,
      isConfigured,
      buyPercentage: buyRule ? (parseFloat(buyRule.percentage) * 100).toFixed(2) : "0.00",
      sellPercentage: sellRule ? (parseFloat(sellRule.percentage) * 100).toFixed(2) : "0.00",
      fixedFee: buyRule ? parseFloat(buyRule.fixedFee).toFixed(2) : "0.00",
      buyRuleId: buyRule?.id || null,
      sellRuleId: sellRule?.id || null,
      isActive: (buyRule?.isActive ?? true) && (sellRule?.isActive ?? true),
    };
  });
}
