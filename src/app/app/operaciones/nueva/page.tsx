"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calculator,
  Save,
  Landmark,
  CreditCard,
  Sliders,
  Settings,
  HelpCircle,
  Zap,
  RefreshCw,
  Sparkles,
  Percent,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Coins,
} from "lucide-react";
import { fetchFullConfigurationAction } from "@/app/actions/catalogs";
import { createOperationAction, fetchWorkspaceBalancesAction } from "@/app/actions/operations";
import { fetchWorkspaceSubscriptionAction } from "@/app/actions/plans";
import { fetchMultiExchangeP2PAction } from "@/app/actions/multi-exchange";
import type { MultiExchangeP2PComparison } from "@/lib/services/multi-exchange-service";

export default function NewOperationPage() {
  const router = useRouter();

  // Loading state
  const [isLoading, setIsLoading] = React.useState(true);

  // Capital y Saldos disponibles en tiempo real (con tasas históricas)
  const [balances, setBalances] = React.useState<{
    crypto: Record<string, { initial: number; bought: number; sold: number; available: number }>;
    fiat: Record<string, { initial: number; received: number; spent: number; fees: number; available: number }>;
    rates?: Record<string, { buyAvgRate: number | null; sellAvgRate: number | null }>;
  } | null>(null);

  // Catalogs from DB
  const [countries, setCountries] = React.useState<any[]>([]);
  const [fiatCurrencies, setFiatCurrencies] = React.useState<any[]>([]);
  const [cryptoAssets, setCryptoAssets] = React.useState<any[]>([]);
  const [exchanges, setExchanges] = React.useState<any[]>([]);
  const [allBanks, setAllBanks] = React.useState<any[]>([]);
  const [allMethods, setAllMethods] = React.useState<any[]>([]);
  const [commissionProfiles, setCommissionProfiles] = React.useState<any[]>([]);

  // Form State
  const [country, setCountry] = React.useState("VE");
  const [fiatCurrency, setFiatCurrency] = React.useState("VES");
  const [exchange, setExchange] = React.useState("binance");
  const [side, setSide] = React.useState<"buy" | "sell">("buy");
  const [asset, setAsset] = React.useState("USDT");

  const [cryptoAmount, setCryptoAmount] = React.useState("");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [fiatAmount, setFiatAmount] = React.useState("");

  // Precio de Referencia / Costo Base editable por el usuario
  const [customRefPrice, setCustomRefPrice] = React.useState("");

  // Multi-Exchange P2P Real-Time Benchmark State
  const [multiP2PData, setMultiP2PData] = React.useState<MultiExchangeP2PComparison | null>(null);
  const [selectedP2PExchange, setSelectedP2PExchange] = React.useState<"binance" | "bybit">("binance");
  const [isLoadingRates, setIsLoadingRates] = React.useState(false);

  const [selectedMethodId, setSelectedMethodId] = React.useState<string>("");
  const [selectedBankId, setSelectedBankId] = React.useState<string>("");
  const [customMethodName, setCustomMethodName] = React.useState("");
  const [customBankName, setCustomBankName] = React.useState("");

  // Comisiones con soporte dual (% Porcentaje o Monto Fijo en fiat)
  const [merchantFeeMode, setMerchantFeeMode] = React.useState<"percent" | "fixed">("percent");
  const [merchantFeePercent, setMerchantFeePercent] = React.useState("0.50");
  const [merchantFeeFixed, setMerchantFeeFixed] = React.useState("0.00");

  const [exchangeFeeMode, setExchangeFeeMode] = React.useState<"percent" | "fixed">("percent");
  const [exchangeFeePercent, setExchangeFeePercent] = React.useState("0.10");
  const [exchangeFeeFixed, setExchangeFeeFixed] = React.useState("0.00");

  const [paymentChargeMode, setPaymentChargeMode] = React.useState<"percent" | "fixed">("fixed");
  const [paymentChargePercent, setPaymentChargePercent] = React.useState("0.30");
  const [paymentChargeFixed, setPaymentChargeFixed] = React.useState("0.00");

  const [reference, setReference] = React.useState("");
  const [counterpartyAlias, setCounterpartyAlias] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isPlanExpired, setIsPlanExpired] = React.useState(false);

  // Sync active P2P exchange with form exchange selection
  React.useEffect(() => {
    if (exchange === "bybit") setSelectedP2PExchange("bybit");
    else setSelectedP2PExchange("binance");
  }, [exchange]);

  // Load live Multi-Exchange P2P rates when fiat or asset changes
  React.useEffect(() => {
    if (asset !== "USDT") {
      setMultiP2PData(null);
      return;
    }
    let isMounted = true;
    async function loadRates() {
      try {
        setIsLoadingRates(true);
        const res = await fetchMultiExchangeP2PAction(fiatCurrency);
        if (isMounted) {
          setMultiP2PData(res);
        }
      } catch (err) {
        console.warn("No se pudo cargar tasas multi-exchange P2P:", err);
      } finally {
        if (isMounted) setIsLoadingRates(false);
      }
    }
    loadRates();
    return () => {
      isMounted = false;
    };
  }, [fiatCurrency, asset]);

  // Active market reference rate for the selected side and exchange
  const activeMarketRef = React.useMemo(() => {
    if (!multiP2PData) return null;
    const curEx =
      multiP2PData.exchanges.find((e) => e.exchange === selectedP2PExchange) ||
      multiP2PData.exchanges[0];
    if (!curEx) return null;
    return side === "buy" ? curEx.buyAvg : curEx.sellAvg;
  }, [multiP2PData, selectedP2PExchange, side]);

  // Sincronización bidireccional inteligente: Cripto * Precio = Fiat
  const handleCryptoChange = (val: string) => {
    setCryptoAmount(val);
    const c = parseFloat(val);
    const p = parseFloat(unitPrice);
    const f = parseFloat(fiatAmount);

    if (!isNaN(c) && c > 0) {
      if (!isNaN(p) && p > 0) {
        setFiatAmount((c * p).toFixed(2));
      } else if (!isNaN(f) && f > 0) {
        setUnitPrice((f / c).toFixed(4));
      }
    } else if (val === "") {
      setFiatAmount("");
    }
  };

  const handlePriceChange = (val: string) => {
    setUnitPrice(val);
    const p = parseFloat(val);
    const c = parseFloat(cryptoAmount);
    const f = parseFloat(fiatAmount);

    if (!isNaN(p) && p > 0) {
      if (!isNaN(c) && c > 0) {
        setFiatAmount((c * p).toFixed(2));
      } else if (!isNaN(f) && f > 0) {
        setCryptoAmount((f / p).toFixed(4));
      }
    }
  };

  const handleFiatChange = (val: string) => {
    setFiatAmount(val);
    const f = parseFloat(val);
    const c = parseFloat(cryptoAmount);
    const p = parseFloat(unitPrice);

    if (!isNaN(f) && f > 0) {
      if (!isNaN(c) && c > 0) {
        setUnitPrice((f / c).toFixed(4));
      } else if (!isNaN(p) && p > 0) {
        setCryptoAmount((f / p).toFixed(4));
      }
    }
  };

  // Tasa histórica del workspace (promedio ponderado de compras o ventas previas)
  const historicalRate = React.useMemo(() => {
    const key = `${asset.toUpperCase()}_${fiatCurrency.toUpperCase()}`;
    const r = (balances as any)?.rates?.[key];
    if (!r) return null;
    return side === "sell" ? r.buyAvgRate : r.sellAvgRate;
  }, [balances, asset, fiatCurrency, side]);

  // Precio de referencia por defecto:
  // En Venta: Costo base histórico (si existe) o precio de compra P2P de mercado
  // En Compra: Precio objetivo de venta histórico (si existe) o precio de venta P2P de mercado
  const defaultRefRate = React.useMemo(() => {
    if (side === "sell") {
      if (historicalRate && historicalRate > 0) return historicalRate;
      if (multiP2PData) {
        const curEx =
          multiP2PData.exchanges.find((e) => e.exchange === selectedP2PExchange) ||
          multiP2PData.exchanges[0];
        if (curEx && curEx.buyAvg > 0) return curEx.buyAvg;
      }
      return activeMarketRef || 0;
    } else {
      if (historicalRate && historicalRate > 0) return historicalRate;
      if (multiP2PData) {
        const curEx =
          multiP2PData.exchanges.find((e) => e.exchange === selectedP2PExchange) ||
          multiP2PData.exchanges[0];
        if (curEx && curEx.sellAvg > 0) return curEx.sellAvg;
      }
      return activeMarketRef || 0;
    }
  }, [side, historicalRate, multiP2PData, selectedP2PExchange, activeMarketRef]);

  // Tasa efectiva de referencia (el usuario puede sobreescribirla en cualquier momento)
  const effectiveRefRate = React.useMemo(() => {
    const custom = parseFloat(customRefPrice);
    if (!isNaN(custom) && custom > 0) return custom;
    return defaultRefRate;
  }, [customRefPrice, defaultRefRate]);

  // Cálculo de montos de comisión en fiat según el modo (Porcentaje o Monto Fijo)
  const currentFiatVal = parseFloat(fiatAmount) || 0;

  const computedMerchantFee = React.useMemo(() => {
    if (merchantFeeMode === "percent") {
      const p = parseFloat(merchantFeePercent) || 0;
      return (currentFiatVal * p) / 100;
    }
    return parseFloat(merchantFeeFixed) || 0;
  }, [merchantFeeMode, merchantFeePercent, merchantFeeFixed, currentFiatVal]);

  const computedExchangeFee = React.useMemo(() => {
    if (exchangeFeeMode === "percent") {
      const p = parseFloat(exchangeFeePercent) || 0;
      return (currentFiatVal * p) / 100;
    }
    return parseFloat(exchangeFeeFixed) || 0;
  }, [exchangeFeeMode, exchangeFeePercent, exchangeFeeFixed, currentFiatVal]);

  const computedPaymentCharge = React.useMemo(() => {
    if (paymentChargeMode === "percent") {
      const p = parseFloat(paymentChargePercent) || 0;
      return (currentFiatVal * p) / 100;
    }
    return parseFloat(paymentChargeFixed) || 0;
  }, [paymentChargeMode, paymentChargePercent, paymentChargeFixed, currentFiatVal]);

  // Aplicar tasa de mercado o referencia directamente
  const applyExchangeRate = (rateToApply: number) => {
    if (!rateToApply || rateToApply <= 0) return;
    const formattedRate = rateToApply.toFixed(4);
    setUnitPrice(formattedRate);
    const c = parseFloat(cryptoAmount);
    const f = parseFloat(fiatAmount);

    if (!isNaN(c) && c > 0) {
      setFiatAmount((c * rateToApply).toFixed(2));
    } else if (!isNaN(f) && f > 0) {
      setCryptoAmount((f / rateToApply).toFixed(4));
    } else {
      setCryptoAmount("10.00");
      setFiatAmount((10 * rateToApply).toFixed(2));
    }
  };

  // Aplicar spread directo en moneda fiat (+2.00, +5.00, etc.) sobre la referencia
  const applyUnitSpread = (delta: number) => {
    if (effectiveRefRate <= 0) return;
    const targetRate = side === "sell"
      ? effectiveRefRate + delta
      : Math.max(0.0001, effectiveRefRate - delta);

    setUnitPrice(targetRate.toFixed(4));
    const c = parseFloat(cryptoAmount);
    if (!isNaN(c) && c > 0) {
      setFiatAmount((c * targetRate).toFixed(2));
    } else {
      setCryptoAmount("10.00");
      setFiatAmount((10 * targetRate).toFixed(2));
    }
  };

  // Fijar sobrante deseado en fiat total y derivar automáticamente la tasa unitaria requerida
  const handleDesiredSurplusChange = (desiredSurplusVal: string) => {
    const targetSurplus = parseFloat(desiredSurplusVal);
    const c = parseFloat(cryptoAmount);
    if (isNaN(targetSurplus) || effectiveRefRate <= 0) return;

    if (c > 0) {
      const requiredSpread = targetSurplus / c;
      const targetRate = side === "sell"
        ? effectiveRefRate + requiredSpread
        : Math.max(0.0001, effectiveRefRate - requiredSpread);

      setUnitPrice(targetRate.toFixed(4));
      setFiatAmount((c * targetRate).toFixed(2));
    }
  };

  // Pasos dinámicos en moneda fiat para botones de spread según la magnitud del precio
  const dynamicSpreadSteps = React.useMemo(() => {
    const ref = effectiveRefRate || 1000;
    if (ref >= 500) return [2, 5, 10, 20, 50];
    if (ref >= 100) return [1, 2, 5, 10, 20];
    if (ref >= 10) return [0.2, 0.5, 1, 2, 5];
    return [0.01, 0.02, 0.05, 0.10, 0.20];
  }, [effectiveRefRate]);

  // Inteligencia de Sobrante de la Transacción y Rentabilidad Neta
  const currentUnitPrice = parseFloat(unitPrice) || 0;
  const currentCrypto = parseFloat(cryptoAmount) || 0;

  const surplusAnalysis = React.useMemo(() => {
    if (effectiveRefRate <= 0 || currentUnitPrice <= 0) {
      return null;
    }

    // Diferencial por unidad de cripto (spread en fiat)
    // En venta: si se vende a 1015.81 y el promedio es 1006.01, la ganancia es +9.80 VES por USDT
    // En compra: si se compra a 1006.01 y la referencia de venta es 1015.81, el margen es +9.80 VES por USDT
    const unitDiff = side === "sell"
      ? currentUnitPrice - effectiveRefRate
      : effectiveRefRate - currentUnitPrice;

    const isProfitable = unitDiff > 0.0001;
    const isBreakEven = Math.abs(unitDiff) <= 0.0001;

    // Sobrante Bruto = Cantidad Cripto * Diferencial por unidad
    const grossSurplus = currentCrypto > 0 ? currentCrypto * unitDiff : 0;

    // Impacto de comisiones
    const netCommissionAdjustment = computedMerchantFee - computedExchangeFee - computedPaymentCharge;
    const netSurplus = grossSurplus + netCommissionAdjustment;

    const marginPct = effectiveRefRate > 0 ? (unitDiff / effectiveRefRate) * 100 : 0;

    return {
      unitDiff,
      grossSurplus,
      netCommissionAdjustment,
      netSurplus,
      marginPct,
      isProfitable,
      isBreakEven,
    };
  }, [
    effectiveRefRate,
    currentUnitPrice,
    currentCrypto,
    side,
    computedMerchantFee,
    computedExchangeFee,
    computedPaymentCharge,
  ]);

  // Load catalogs on mount
  React.useEffect(() => {
    async function loadCatalogs() {
      try {
        setIsLoading(true);
        const [config, subData, balData] = await Promise.all([
          fetchFullConfigurationAction(),
          fetchWorkspaceSubscriptionAction().catch(() => null),
          fetchWorkspaceBalancesAction().catch(() => null),
        ]);

        if (subData?.subscription?.isExpired) {
          setIsPlanExpired(true);
        }

        if (balData) {
          setBalances(balData);
        }

        setCountries(config.countries || []);
        setFiatCurrencies(config.fiatCurrencies || []);
        setCryptoAssets(config.cryptoAssets || []);
        setExchanges(config.exchanges || []);
        setAllBanks(config.banks || []);
        setAllMethods(config.paymentMethods || []);
        setCommissionProfiles(config.commissionProfiles || []);

        // Initial default country from settings
        const initialCountry = config.settings?.primaryCountry || "VE";
        setCountry(initialCountry);

        // Find initial fiat
        const countryObj = (config.countries || []).find((c: any) => c.code === initialCountry);
        if (countryObj) {
          setFiatCurrency(countryObj.defaultFiat);
        }
      } catch (err) {
        console.error("Error al cargar catálogos:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalogs();
  }, []);

  // Filter active banks for the selected country
  const filteredBanks = React.useMemo(() => {
    return allBanks.filter((b) => b.isActive && b.countryCode === country);
  }, [allBanks, country]);

  // Filter active payment methods for the selected country (or global methods where countryCode is null)
  const filteredMethods = React.useMemo(() => {
    return allMethods.filter(
      (m) => m.isActive && (m.countryCode === null || m.countryCode === country)
    );
  }, [allMethods, country]);

  // Find currently selected method object
  const selectedMethodObj = React.useMemo(() => {
    return allMethods.find((m) => m.id === selectedMethodId);
  }, [allMethods, selectedMethodId]);

  // Check if method requires bank
  const requiresBank = React.useMemo(() => {
    if (!selectedMethodObj) return true; // Default to true if not selected yet
    return selectedMethodObj.requiresBank;
  }, [selectedMethodObj]);

  // Find active commission profile for selected country and side
  const activeCommissionRule = React.useMemo(() => {
    // 1st preference: exact country and side
    const specific = commissionProfiles.find(
      (p) => p.isActive && p.countryCode === country && p.operationSide === side
    );
    if (specific) return specific;

    // 2nd preference: country and 'all' side
    const generic = commissionProfiles.find(
      (p) => p.isActive && p.countryCode === country && p.operationSide === "all"
    );
    return generic || null;
  }, [commissionProfiles, country, side]);

  // Update country and adjust defaults
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const countryObj = countries.find((c) => c.code === newCountry);
    if (countryObj) {
      setFiatCurrency(countryObj.defaultFiat);
    }
    // Reset bank and method selection when country changes
    setSelectedBankId("");
    setSelectedMethodId("");
  };

  // Balances en tiempo real para validación estricta
  const activeCryptoBalance = React.useMemo(() => {
    if (!balances?.crypto) return 0;
    const item = balances.crypto[asset.toUpperCase()];
    return item ? item.available : 0;
  }, [balances, asset]);

  const activeFiatBalance = React.useMemo(() => {
    if (!balances?.fiat) return 0;
    const item = balances.fiat[fiatCurrency.toUpperCase()];
    return item ? item.available : 0;
  }, [balances, fiatCurrency]);

  const cryptoVal = parseFloat(cryptoAmount) || 0;
  const fiatVal = parseFloat(fiatAmount) || 0;

  // Validación estricta: bloqueo por falta de activos (venta) o falta de fiat (compra)
  const isInsufficientBalance = React.useMemo(() => {
    if (side === "sell") {
      if (activeCryptoBalance <= 0) return true;
      if (cryptoVal > activeCryptoBalance) return true;
    } else if (side === "buy") {
      if (activeFiatBalance <= 0) return true;
      if (fiatVal > activeFiatBalance) return true;
    }
    return false;
  }, [side, activeCryptoBalance, activeFiatBalance, cryptoVal, fiatVal]);

  const balanceErrorMessage = React.useMemo(() => {
    if (side === "sell") {
      if (activeCryptoBalance <= 0) {
        return `⚠️ Sin activos para vender: Tu capital de ${asset} está en 0. No puedes registrar una venta sin activos en inventario.`;
      }
      if (cryptoVal > activeCryptoBalance) {
        return `⚠️ Capital insuficiente: Quieres vender ${cryptoVal.toFixed(4)} ${asset}, pero solo dispones de ${activeCryptoBalance.toFixed(4)} ${asset}.`;
      }
    } else if (side === "buy") {
      if (activeFiatBalance <= 0) {
        return `⚠️ Sin fondos fiat para comprar: Tu saldo fiat en ${fiatCurrency} está en 0. No puedes registrar una compra sin saldo fiat disponible.`;
      }
      if (fiatVal > activeFiatBalance) {
        return `⚠️ Saldo insuficiente: El costo de compra es ${fiatVal.toFixed(2)} ${fiatCurrency}, pero solo dispones de ${activeFiatBalance.toFixed(2)} ${fiatCurrency}.`;
      }
    }
    return null;
  }, [side, asset, fiatCurrency, activeCryptoBalance, activeFiatBalance, cryptoVal, fiatVal]);

  // Tasa unitaria efectiva (precio de la orden)
  const calculatedRate = React.useMemo(() => {
    if (unitPrice && !isNaN(parseFloat(unitPrice)) && parseFloat(unitPrice) > 0) {
      return parseFloat(unitPrice).toFixed(4);
    }
    const c = parseFloat(cryptoAmount);
    const f = parseFloat(fiatAmount);
    if (!isNaN(c) && !isNaN(f) && c > 0) {
      return (f / c).toFixed(4);
    }
    return "";
  }, [unitPrice, cryptoAmount, fiatAmount]);

  // Sincronizar regla de comisión del perfil activo con el formulario
  React.useEffect(() => {
    if (activeCommissionRule) {
      const pct = parseFloat(activeCommissionRule.percentage) || 0;
      const fixed = parseFloat(activeCommissionRule.fixedFee) || 0;
      if (pct > 0) {
        setMerchantFeeMode("percent");
        setMerchantFeePercent((pct * 100).toFixed(2));
      } else if (fixed > 0) {
        setMerchantFeeMode("fixed");
        setMerchantFeeFixed(fixed.toFixed(2));
      }
    }
  }, [activeCommissionRule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInsufficientBalance) {
      setErrorMessage(balanceErrorMessage || "Saldo insuficiente para registrar la operación.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const finalCrypto = cryptoAmount;
      let finalFiat = fiatAmount;
      if ((!finalFiat || parseFloat(finalFiat) <= 0) && parseFloat(finalCrypto) > 0 && parseFloat(unitPrice) > 0) {
        finalFiat = (parseFloat(finalCrypto) * parseFloat(unitPrice)).toFixed(2);
      }

      await createOperationAction({
        countryCode: country,
        exchangeCode: exchange,
        operationSide: side,
        assetSymbol: asset,
        assetAmount: finalCrypto,
        fiatCurrency,
        fiatAmount: finalFiat,
        merchantFee: computedMerchantFee.toFixed(2),
        exchangeFee: computedExchangeFee.toFixed(2),
        paymentCharge: computedPaymentCharge.toFixed(2),
        paymentMethodId: selectedMethodId && selectedMethodId !== "custom" ? selectedMethodId : null,
        bankId: requiresBank && selectedBankId && selectedBankId !== "custom" ? selectedBankId : null,
        customMethodName: selectedMethodId === "custom" ? customMethodName : undefined,
        customBankName: requiresBank && selectedBankId === "custom" ? customBankName : undefined,
        externalReference: reference,
        counterpartyAlias,
        notes,
      });

      setSuccessMessage(
        "Operación P2P registrada con éxito en Neon PostgreSQL. Tasa calculada y snapshots inmutables vinculados."
      );
      setTimeout(() => {
        router.push("/app/operaciones");
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Error al registrar la operación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1c2230]">
        <div className="flex items-center gap-3">
          <Link href="/app/operaciones">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Registrar Operación P2P
            </h1>
            <p className="text-xs text-slate-400">
              Captura precisa de cantidades, cargos del exchange y regla de comisión por país.
            </p>
          </div>
        </div>

        <Link href="/app/configuracion">
          <Button variant="secondary" size="sm" className="text-xs">
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Configurar Catálogos
          </Button>
        </Link>
      </div>

      {isPlanExpired && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs">
            <strong>Prueba gratuita finalizada:</strong> Para registrar nuevas operaciones P2P debes activar un plan Business o Enterprise en modo demo. Conservas acceso total para consultar y exportar tu historial.
          </div>
          <Link href="/app/plan">
            <Button variant="primary" size="sm" className="shrink-0 text-xs bg-rose-600 hover:bg-rose-500 text-white">
              Activar Plan &rarr;
            </Button>
          </Link>
        </div>
      )}

      {errorMessage && (
        <Alert variant="error" title="Error de Validación">
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" title="¡Registro Exitoso!">
          {successMessage}
        </Alert>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono text-slate-500 bg-[#10131a] rounded-xl border border-[#1e2433]">
          Cargando catálogos globales y configuración privada de tu Workspace...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Context and Exchange */}
          <Card className="bg-[#10131a] border-[#1e2433]">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#00ff66]/10 text-[#00ff66] text-xs flex items-center justify-center font-mono">
                    1
                  </span>
                  Jurisdicción y Exchange
                </div>
                <Badge variant="neutral" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400">
                  Filtro Dinámico Activo
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="País de Operación"
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </Select>

              <Select
                label="Moneda Fiat"
                value={fiatCurrency}
                onChange={(e) => setFiatCurrency(e.target.value)}
              >
                {fiatCurrencies.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.code} — {f.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Exchange P2P"
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
              >
                {exchanges.map((ex) => (
                  <option key={ex.code} value={ex.code}>
                    {ex.name}
                  </option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {/* Step 2: Amounts and Crypto Asset */}
          <Card className="bg-[#10131a] border-[#1e2433]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#00ff66]/10 text-[#00ff66] text-xs flex items-center justify-center font-mono">
                  2
                </span>
                Dirección y Montos Financieros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Tipo de Operación
                    </label>
                    {side === "sell" ? (
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-all ${
                        activeCryptoBalance <= 0
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                      }`}>
                        Disponible: {activeCryptoBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {asset}
                      </span>
                    ) : (
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-all ${
                        activeFiatBalance <= 0
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}>
                        Saldo Fiat: {activeFiatBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fiatCurrency}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSide("buy")}
                      className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                        side === "buy"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : "bg-[#141722] text-slate-400 border-[#222838] hover:text-white"
                      }`}
                    >
                      COMPRA (Inflow)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide("sell")}
                      className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                        side === "sell"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                          : "bg-[#141722] text-slate-400 border-[#222838] hover:text-white"
                      }`}
                    >
                      VENTA (Outflow)
                    </button>
                  </div>
                </div>

                <Select
                  label="Activo Cripto"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                >
                  {cryptoAssets.map((a) => (
                    <option key={a.symbol} value={a.symbol}>
                      {a.symbol} — {a.name}
                    </option>
                  ))}
                </Select>
              </div>

              {balanceErrorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{balanceErrorMessage}</span>
                </div>
              )}

              {/* Indicador Multi-Exchange P2P en Vivo (Binance, Bybit, OKX) con Selector y Ajuste */}
              {asset === "USDT" && (
                <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#1e2535] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        Tasas P2P Multi-Exchange en Vivo
                      </span>
                      <Badge variant="neutral" className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                        Binance · Bybit (0-Key)
                      </Badge>
                    </div>

                    {/* Selector de Exchange para cotización */}
                    <div className="flex items-center gap-1 bg-[#141824] p-1 rounded-lg border border-[#1e2638]">
                      {(["binance", "bybit"] as const).map((exKey) => (
                        <button
                          key={exKey}
                          type="button"
                          onClick={() => setSelectedP2PExchange(exKey)}
                          className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded capitalize transition-all cursor-pointer ${
                            selectedP2PExchange === exKey
                              ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/40"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {exKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isLoadingRates ? (
                    <div className="text-xs font-mono text-slate-500 py-2 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      Consultando libros de órdenes P2P en tiempo real ({fiatCurrency})...
                    </div>
                  ) : multiP2PData ? (
                    (() => {
                      const curEx =
                        multiP2PData.exchanges.find((e) => e.exchange === selectedP2PExchange) ||
                        multiP2PData.exchanges[0];

                      return (
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {/* Promedio de Compra */}
                            <div className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                              side === "buy" ? "bg-emerald-500/10 border-emerald-500/40" : "bg-[#121622] border-[#1f2638]"
                            }`}>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                                    Promedio Compra ({curEx.exchangeName})
                                  </span>
                                  {side === "buy" && (
                                    <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-400">
                                      Sugerida
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm font-mono font-bold text-emerald-400">
                                  {curEx.buyAvg > 0
                                    ? `${curEx.buyAvg.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${fiatCurrency}`
                                    : "Sin ofertas"}
                                </span>
                              </div>
                              {curEx.buyAvg > 0 && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => applyExchangeRate(curEx.buyAvg)}
                                  className="text-[11px] font-mono h-7 px-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                                >
                                  <Zap className="w-3 h-3 mr-1 text-emerald-400" />
                                  Aplicar Compra
                                </Button>
                              )}
                            </div>

                            {/* Promedio de Venta */}
                            <div className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                              side === "sell" ? "bg-blue-500/10 border-blue-500/40" : "bg-[#121622] border-[#1f2638]"
                            }`}>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                                    Promedio Venta ({curEx.exchangeName})
                                  </span>
                                  {side === "sell" && (
                                    <span className="text-[9px] font-mono px-1 rounded bg-blue-500/20 text-blue-400">
                                      Sugerida
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm font-mono font-bold text-blue-400">
                                  {curEx.sellAvg > 0
                                    ? `${curEx.sellAvg.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${fiatCurrency}`
                                    : "Sin ofertas"}
                                </span>
                              </div>
                              {curEx.sellAvg > 0 && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => applyExchangeRate(curEx.sellAvg)}
                                  className="text-[11px] font-mono h-7 px-2.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30"
                                >
                                  <Zap className="w-3 h-3 mr-1 text-blue-400" />
                                  Aplicar Venta
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Oportunidad inter-exchange */}
                          {multiP2PData.arbitrageSpreadPercent > 0 && (
                            <div className="flex items-center justify-between text-[11px] font-mono px-3 py-1.5 rounded-lg bg-[#0e1622] border border-[#1c293d] text-slate-300">
                              <span>
                                Spread Interno {curEx.exchangeName}: <strong className="text-amber-300">+{curEx.spreadPercent}%</strong>
                              </span>
                              <span className="text-cyan-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-cyan-400" />
                                Mejor Compra: <strong>{multiP2PData.bestBuy.exchangeName}</strong> | Mejor Venta: <strong>{multiP2PData.bestSell.exchangeName}</strong> (+{multiP2PData.arbitrageSpreadPercent}%)
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-[11px] font-mono text-slate-400">
                      Sin cotizaciones P2P directas para {fiatCurrency}. Puedes ingresar los montos de forma manual.
                    </div>
                  )}
                </div>
              )}

              {/* Panel de Costo Base / Precio de Referencia para Medir el Sobrante */}
              <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-[#1e2535] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[#00ff66]" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {side === "sell"
                        ? "Precio Promedio de Costo / Referencia"
                        : "Precio Objetivo de Reventa / Referencia"}
                    </span>
                    <Badge variant="neutral" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      Base de Cálculo
                    </Badge>
                  </div>

                  {/* Acciones para fijar referencia de costo rápidamente */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {historicalRate && historicalRate > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomRefPrice(historicalRate.toFixed(4));
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161c28] hover:bg-[#1e2738] text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                      >
                        Costo Histórico ({historicalRate.toFixed(2)} {fiatCurrency})
                      </button>
                    )}
                    {activeMarketRef && activeMarketRef > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomRefPrice(activeMarketRef.toFixed(4));
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161c28] hover:bg-[#1e2738] text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                      >
                        Mercado P2P ({activeMarketRef.toFixed(2)} {fiatCurrency})
                      </button>
                    )}
                    {customRefPrice && (
                      <button
                        type="button"
                        onClick={() => setCustomRefPrice("")}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c1824] hover:bg-[#281e35] text-slate-400 hover:text-white border border-[#2d253a] transition-all cursor-pointer"
                      >
                        Restablecer Auto
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <Input
                      label={`Precio Referencia / Costo Base (${fiatCurrency}/${asset})`}
                      type="number"
                      step="any"
                      placeholder={defaultRefRate > 0 ? defaultRefRate.toFixed(4) : "Ej. 1006.01"}
                      value={customRefPrice}
                      onChange={(e) => setCustomRefPrice(e.target.value)}
                      helperText={
                        customRefPrice
                          ? "Costo personalizado fijado manualmente"
                          : historicalRate
                          ? `Calculado de tus compras previas de ${asset}`
                          : activeMarketRef
                          ? `Tomado del promedio del mercado P2P actual`
                          : "Define el costo base de adquisición"
                      }
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#111520] border border-[#1e2536] text-[11px] font-mono text-slate-300 space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                      Lógica de Comerciante P2P:
                    </div>
                    <div className="text-slate-300 leading-relaxed">
                      {side === "sell" ? (
                        <span>
                          Tu costo base es de{" "}
                          <strong className="text-white">
                            {effectiveRefRate > 0 ? effectiveRefRate.toFixed(2) : "0.00"} {fiatCurrency}
                          </strong>
                          . Al vender por encima de este precio, la diferencia total es tu{" "}
                          <span className="text-[#00ff66] font-bold">sobrante de transacción</span>.
                        </span>
                      ) : (
                        <span>
                          Tu precio de referencia es de{" "}
                          <strong className="text-white">
                            {effectiveRefRate > 0 ? effectiveRefRate.toFixed(2) : "0.00"} {fiatCurrency}
                          </strong>
                          . Al comprar con descuento bajo este precio, aseguras tu{" "}
                          <span className="text-[#00ff66] font-bold">margen de ganancia</span>.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Montos y Precio de la Operación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <Input
                  label={`Cantidad Cripto (${asset})`}
                  type="number"
                  step="any"
                  placeholder="Ej. 10.00"
                  value={cryptoAmount}
                  onChange={(e) => handleCryptoChange(e.target.value)}
                  helperText="Cantidad cripto que compras o vendes"
                  required
                />

                <Input
                  label={`Precio / Tasa de Operación (${fiatCurrency}/${asset})`}
                  type="number"
                  step="any"
                  placeholder={effectiveRefRate > 0 ? effectiveRefRate.toFixed(2) : "Ej. 1015.81"}
                  value={unitPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="bg-[#0b0d13] text-[#00ff66] font-mono font-bold"
                  leftIcon={<Calculator className="w-4 h-4 text-[#00ff66]" />}
                  helperText={
                    side === "sell"
                      ? "Fija un precio superior a tu costo para generar sobrante"
                      : "Fija un precio con descuento para comprar barato"
                  }
                  required
                />

                <Input
                  label={`Importe Fiat Total (${fiatCurrency})`}
                  type="number"
                  step="any"
                  placeholder="Ej. 10158.10"
                  value={fiatAmount}
                  onChange={(e) => handleFiatChange(e.target.value)}
                  helperText="Importe fiat total resultante"
                  required
                />
              </div>

              {/* Calculador de Sobrante de Transacción & Fijador de Spread en Fiat */}
              <div className="p-3 rounded-xl bg-[#0e121b] border border-[#1d2638] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-200">
                    <Sliders className="w-3.5 h-3.5 text-[#00ff66]" />
                    <span className="font-bold">Fijar Ganancia / Spread en {fiatCurrency}:</span>
                    {effectiveRefRate > 0 && (
                      <span className="text-[11px] text-slate-400">
                        (Ref: <strong className="text-white">{effectiveRefRate.toFixed(2)}</strong> {fiatCurrency})
                      </span>
                    )}
                  </div>

                  {/* Botones de Diferencial por Unidad en Moneda Fiat */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyUnitSpread(0)}
                      disabled={effectiveRefRate <= 0}
                      className="px-2.5 py-1 text-[11px] font-mono rounded bg-[#161c28] hover:bg-[#1e2738] text-slate-300 border border-[#232c3e] transition-all cursor-pointer disabled:opacity-50"
                    >
                      A la Par (0)
                    </button>

                    {dynamicSpreadSteps.map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => applyUnitSpread(step)}
                        disabled={effectiveRefRate <= 0}
                        className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded border transition-all cursor-pointer disabled:opacity-50 ${
                          side === "sell"
                            ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                        }`}
                      >
                        {side === "sell"
                          ? `+${step < 1 ? step.toFixed(2) : step} ${fiatCurrency}`
                          : `-${step < 1 ? step.toFixed(2) : step} ${fiatCurrency}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bidireccionalidad: Entrada de Sobrante Deseado o Diferencial por Unidad */}
                {currentCrypto > 0 && effectiveRefRate > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1a2130] items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-mono text-slate-300 shrink-0">
                        Sobrante Deseado ({fiatCurrency}):
                      </label>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="any"
                          placeholder={surplusAnalysis ? surplusAnalysis.grossSurplus.toFixed(2) : "Ej. 98.00"}
                          value={surplusAnalysis && surplusAnalysis.grossSurplus !== 0 ? surplusAnalysis.grossSurplus.toFixed(2) : ""}
                          onChange={(e) => handleDesiredSurplusChange(e.target.value)}
                          className="w-full h-8 px-2.5 text-xs font-mono font-bold rounded bg-[#0a0d14] border border-[#232c40] text-[#00ff66] focus:border-[#00ff66] outline-none"
                        />
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between sm:justify-end gap-2">
                      <span>Diferencial por {asset}:</span>
                      <strong className={surplusAnalysis && surplusAnalysis.isProfitable ? "text-emerald-400" : "text-amber-400"}>
                        {surplusAnalysis
                          ? `${surplusAnalysis.unitDiff >= 0 ? "+" : ""}${surplusAnalysis.unitDiff.toFixed(2)} ${fiatCurrency}/${asset}`
                          : `0.00 ${fiatCurrency}/${asset}`}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Widget de Inteligencia de Sobrante y Rentabilidad Neta de la Operación */}
              {surplusAnalysis && (
                <div
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono transition-all ${
                    surplusAnalysis.isProfitable
                      ? "bg-[#091510] border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      : surplusAnalysis.isBreakEven
                      ? "bg-[#10141d] border-slate-700 text-slate-300"
                      : "bg-[#18110b] border-amber-500/30 text-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        surplusAnalysis.isProfitable
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : surplusAnalysis.isBreakEven
                          ? "bg-slate-800 text-slate-400 border border-slate-700"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      }`}
                    >
                      {side === "sell" ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">
                          {side === "sell" ? "Ganancia de Venta (Sobrante):" : "Margen de Compra (Descuento):"}
                        </strong>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            surplusAnalysis.isProfitable
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : surplusAnalysis.isBreakEven
                              ? "bg-slate-800 text-slate-300 border border-slate-700"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {surplusAnalysis.unitDiff >= 0 ? "+" : ""}
                          {surplusAnalysis.unitDiff.toFixed(2)} {fiatCurrency}/{asset} ({surplusAnalysis.marginPct >= 0 ? "+" : ""}{surplusAnalysis.marginPct.toFixed(2)}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Costo Ref:{" "}
                        <strong className="text-slate-300">
                          {effectiveRefRate.toFixed(2)} {fiatCurrency}
                        </strong>{" "}
                        · Tu Precio:{" "}
                        <strong className="text-white">
                          {currentUnitPrice.toFixed(2)} {fiatCurrency}
                        </strong>{" "}
                        · Volumen:{" "}
                        <strong className="text-white">
                          {currentCrypto.toFixed(2)} {asset}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {currentCrypto > 0 && (
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">
                          Sobrante Bruto
                        </span>
                        <span
                          className={`text-sm font-bold font-mono ${
                            surplusAnalysis.isProfitable ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {surplusAnalysis.grossSurplus >= 0 ? "+" : ""}
                          {surplusAnalysis.grossSurplus.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          <span className="text-[10px] text-slate-400">{fiatCurrency}</span>
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0e121b] border border-[#1e2638] text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          Ganancia Neta (Final)
                        </span>
                        <span
                          className={`text-base font-bold font-mono ${
                            surplusAnalysis.netSurplus >= 0 ? "text-[#00ff66]" : "text-amber-400"
                          }`}
                        >
                          {surplusAnalysis.netSurplus >= 0 ? "+" : ""}
                          {surplusAnalysis.netSurplus.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          <span className="text-xs text-slate-400">{fiatCurrency}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Commission Breakdown and Payment Method */}
          <Card className="bg-[#10131a] border-[#1e2433]">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#00ff66]/10 text-[#00ff66] text-xs flex items-center justify-center font-mono">
                    3
                  </span>
                  Desglose de Cargos, Comisiones y Banco Privado
                </div>
                {activeCommissionRule ? (
                  <Badge variant="neon" className="text-[10px] font-mono">
                    Regla: {(parseFloat(activeCommissionRule.percentage) * 100).toFixed(2)}% + {activeCommissionRule.fixedFee} {fiatCurrency}
                  </Badge>
                ) : (
                  <Badge variant="neutral" className="text-[10px] font-mono text-slate-400">
                    Sin regla para {country} ({side.toUpperCase()})
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bloques de Comisiones en Modo Dual (% o Monto Fijo) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Comisión Comerciante */}
                <div className="p-3.5 rounded-xl bg-[#0c1017] border border-[#1e2636] space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-bold text-slate-200">
                        Comisión Comerciante
                      </label>
                      <div className="flex items-center bg-[#141824] p-0.5 rounded border border-[#222838]">
                        <button
                          type="button"
                          onClick={() => setMerchantFeeMode("percent")}
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                            merchantFeeMode === "percent"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => setMerchantFeeMode("fixed")}
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                            merchantFeeMode === "fixed"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {fiatCurrency}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          step="any"
                          placeholder={merchantFeeMode === "percent" ? "0.50" : "0.00"}
                          value={merchantFeeMode === "percent" ? merchantFeePercent : merchantFeeFixed}
                          onChange={(e) =>
                            merchantFeeMode === "percent"
                              ? setMerchantFeePercent(e.target.value)
                              : setMerchantFeeFixed(e.target.value)
                          }
                        />
                      </div>
                      {merchantFeeMode === "percent" && (
                        <div className="px-2.5 py-2 rounded-lg bg-[#141824] border border-[#222838] text-xs font-mono font-bold text-emerald-400 shrink-0">
                          = {computedMerchantFee.toFixed(2)} {fiatCurrency}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-wrap pt-2">
                      {merchantFeeMode === "percent"
                        ? ["0", "0.25", "0.50", "1.00", "1.50", "2.00"].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setMerchantFeePercent(p)}
                              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                                merchantFeePercent === p
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-[#141824] text-slate-400 border-[#222838] hover:text-white"
                              }`}
                            >
                              {p}%
                            </button>
                          ))
                        : ["0", "10", "25", "50", "100"].map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setMerchantFeeFixed(f)}
                              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                                merchantFeeFixed === f
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                  : "bg-[#141824] text-slate-400 border-[#222838] hover:text-white"
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 pt-1">
                    {activeCommissionRule
                      ? `Regla catálogo ${country}: ${(parseFloat(activeCommissionRule.percentage) * 100).toFixed(2)}%`
                      : "Comisión adicional a favor del comerciante"}
                  </p>
                </div>

                {/* 2. Tarifa del Exchange */}
                <div className="p-3.5 rounded-xl bg-[#0c1017] border border-[#1e2636] space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-bold text-slate-200">
                        Tarifa del Exchange
                      </label>
                      <div className="flex items-center bg-[#141824] p-0.5 rounded border border-[#222838]">
                        <button
                          type="button"
                          onClick={() => setExchangeFeeMode("percent")}
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                            exchangeFeeMode === "percent"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => setExchangeFeeMode("fixed")}
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                            exchangeFeeMode === "fixed"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {fiatCurrency}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          step="any"
                          placeholder={exchangeFeeMode === "percent" ? "0.10" : "0.00"}
                          value={exchangeFeeMode === "percent" ? exchangeFeePercent : exchangeFeeFixed}
                          onChange={(e) =>
                            exchangeFeeMode === "percent"
                              ? setExchangeFeePercent(e.target.value)
                              : setExchangeFeeFixed(e.target.value)
                          }
                        />
                      </div>
                      {exchangeFeeMode === "percent" && (
                        <div className="px-2.5 py-2 rounded-lg bg-[#141824] border border-[#222838] text-xs font-mono font-bold text-blue-400 shrink-0">
                          = {computedExchangeFee.toFixed(2)} {fiatCurrency}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-wrap pt-2">
                      {exchangeFeeMode === "percent"
                        ? [
                            { label: "0% (Taker)", val: "0" },
                            { label: "0.015%", val: "0.015" },
                            { label: "0.05%", val: "0.05" },
                            { label: "0.10% (Maker)", val: "0.10" },
                            { label: "0.20%", val: "0.20" },
                            { label: "0.35% (Binance)", val: "0.35" },
                          ].map((p) => (
                            <button
                              key={p.val}
                              type="button"
                              onClick={() => setExchangeFeePercent(p.val)}
                              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                                exchangeFeePercent === p.val
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                  : "bg-[#141824] text-slate-400 border-[#222838] hover:text-white"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))
                        : ["0", "5", "10", "20"].map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setExchangeFeeFixed(f)}
                              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                                exchangeFeeFixed === f
                                  ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                  : "bg-[#141824] text-slate-400 border-[#222838] hover:text-white"
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 pt-1">
                    Tarifa del exchange {exchange} (descuenta del sobrante)
                  </p>
                </div>

                {/* 3. Cargo Método de Pago */}
                <div className="p-3.5 rounded-xl bg-[#0c1017] border border-[#1e2636] space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono font-bold text-slate-200">
                        Cargo Método de Pago
                      </label>
                      <div className="flex items-center bg-[#141824] p-0.5 rounded border border-[#222838]">
                        <button
                          type="button"
                          onClick={() => setPaymentChargeMode("percent")}
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                            paymentChargeMode === "percent"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentChargeMode("fixed")}
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                            paymentChargeMode === "fixed"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {fiatCurrency}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          step="any"
                          placeholder={paymentChargeMode === "percent" ? "0.30" : "0.00"}
                          value={paymentChargeMode === "percent" ? paymentChargePercent : paymentChargeFixed}
                          onChange={(e) =>
                            paymentChargeMode === "percent"
                              ? setPaymentChargePercent(e.target.value)
                              : setPaymentChargeFixed(e.target.value)
                          }
                        />
                      </div>
                      {paymentChargeMode === "percent" && (
                        <div className="px-2.5 py-2 rounded-lg bg-[#141824] border border-[#222838] text-xs font-mono font-bold text-purple-400 shrink-0">
                          = {computedPaymentCharge.toFixed(2)} {fiatCurrency}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-wrap pt-2">
                      {paymentChargeMode === "percent"
                        ? [
                            { label: "0% (Libre)", val: "0" },
                            { label: "0.05%", val: "0.05" },
                            { label: "0.30% (Pago Móvil)", val: "0.30" },
                            { label: "0.50%", val: "0.50" },
                          ].map((p) => (
                            <button
                              key={p.val}
                              type="button"
                              onClick={() => setPaymentChargePercent(p.val)}
                              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                                paymentChargePercent === p.val
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                  : "bg-[#141824] text-slate-400 border-[#222838] hover:text-white"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))
                        : ["0", "2", "5", "10"].map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setPaymentChargeFixed(f)}
                              className={`px-1.5 py-0.5 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                                paymentChargeFixed === f
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                  : "bg-[#141824] text-slate-400 border-[#222838] hover:text-white"
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 pt-1">
                    Comisión bancaria o pasarela (descuenta del sobrante)
                  </p>
                </div>
              </div>

              {/* Resumen de Liquidación y Desglose Financiero */}
              <div className="p-3.5 rounded-xl bg-[#090c12] border border-[#1b2332] text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Subtotal Comisiones Deducidas (Exchange + Banco):</span>
                  <span className="text-rose-400 font-bold">
                    -{(computedExchangeFee + computedPaymentCharge).toFixed(2)} {fiatCurrency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Comisión a Favor del Comerciante:</span>
                  <span className="text-emerald-400 font-bold">
                    +{computedMerchantFee.toFixed(2)} {fiatCurrency}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-[#18202d] flex items-center justify-between">
                  <span className="text-slate-300 font-bold">Impacto Neto de Comisiones en Transacción:</span>
                  <span
                    className={`font-bold ${
                      computedMerchantFee - computedExchangeFee - computedPaymentCharge >= 0
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {computedMerchantFee - computedExchangeFee - computedPaymentCharge >= 0 ? "+" : ""}
                    {(computedMerchantFee - computedExchangeFee - computedPaymentCharge).toFixed(2)} {fiatCurrency}
                  </span>
                </div>
              </div>

              {/* Dynamic Payment Method and Bank Filtered by Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#00ff66]" />
                      Método de Pago ({country})
                    </span>
                    <Link
                      href="/app/configuracion"
                      className="text-[11px] text-[#00ff66] hover:underline"
                    >
                      + Gestionar Métodos
                    </Link>
                  </label>
                  {filteredMethods.length > 0 ? (
                    <Select
                      value={selectedMethodId}
                      onChange={(e) => setSelectedMethodId(e.target.value)}
                    >
                      <option value="">-- Seleccionar Método Configurado --</option>
                      {filteredMethods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} {!m.requiresBank ? "(Wallet / Sin Banco)" : ""}
                        </option>
                      ))}
                      <option value="custom">Otro (Manual)</option>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        placeholder="Escribe el nombre del método (ej. Pago Móvil)"
                        value={customMethodName}
                        onChange={(e) => setCustomMethodName(e.target.value)}
                      />
                      <p className="text-[11px] text-amber-400">
                        No tienes métodos guardados para {country}. Puedes guardarlos en Configuración.
                      </p>
                    </div>
                  )}

                  {selectedMethodId === "custom" && (
                    <Input
                      placeholder="Nombre del método manual"
                      value={customMethodName}
                      onChange={(e) => setCustomMethodName(e.target.value)}
                      className="mt-2 text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-[#00ff66]" />
                      Banco / Entidad ({country})
                    </span>
                    <Link
                      href="/app/configuracion"
                      className="text-[11px] text-[#00ff66] hover:underline"
                    >
                      + Gestionar Bancos
                    </Link>
                  </label>

                  {!requiresBank ? (
                    <div className="h-10 px-3 py-2 rounded-lg bg-[#141722] border border-[#222838] flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Badge variant="neutral" className="text-[9px] border-slate-600">
                        No Aplica
                      </Badge>
                      <span>Este método no requiere cuenta bancaria.</span>
                    </div>
                  ) : filteredBanks.length > 0 ? (
                    <Select
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                    >
                      <option value="">-- Seleccionar Banco Configurado --</option>
                      {filteredBanks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                      <option value="custom">Otro (Manual)</option>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        placeholder="Escribe el nombre del banco (ej. Banesco)"
                        value={customBankName}
                        onChange={(e) => setCustomBankName(e.target.value)}
                      />
                      <p className="text-[11px] text-amber-400">
                        Sin bancos registrados para {country}. Configúralos en tu espacio de trabajo.
                      </p>
                    </div>
                  )}

                  {requiresBank && selectedBankId === "custom" && (
                    <Input
                      placeholder="Nombre del banco manual"
                      value={customBankName}
                      onChange={(e) => setCustomBankName(e.target.value)}
                      className="mt-2 text-xs"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Referencia Externa (Opcional)"
                  placeholder="Ej. ID de orden Binance / TXID"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />

                <Input
                  label="Alias de Contraparte (Opcional)"
                  placeholder="Ej. PedroP2P_Trader"
                  value={counterpartyAlias}
                  onChange={(e) => setCounterpartyAlias(e.target.value)}
                />
              </div>

              <Input
                label="Notas Adicionales"
                placeholder="Observaciones de la contraparte o transacción"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href="/app/operaciones">
              <Button variant="ghost" type="button">
                Cancelar
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting || isPlanExpired || isInsufficientBalance}
              className={`px-8 ${
                isPlanExpired || isInsufficientBalance
                  ? "opacity-50 cursor-not-allowed bg-slate-750 text-slate-400"
                  : ""
              }`}
            >
              <Save className="w-4 h-4 mr-2" />
              {isPlanExpired
                ? "Prueba Finalizada (Requiere Plan)"
                : isInsufficientBalance
                ? "Fondos Insuficientes"
                : "Guardar Operación"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

