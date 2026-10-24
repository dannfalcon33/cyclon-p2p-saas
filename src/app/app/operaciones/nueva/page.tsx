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
} from "lucide-react";
import { fetchFullConfigurationAction } from "@/app/actions/catalogs";
import { createOperationAction } from "@/app/actions/operations";

export default function NewOperationPage() {
  const router = useRouter();

  // Loading state
  const [isLoading, setIsLoading] = React.useState(true);

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
  const [fiatAmount, setFiatAmount] = React.useState("");

  const [selectedMethodId, setSelectedMethodId] = React.useState<string>("");
  const [selectedBankId, setSelectedBankId] = React.useState<string>("");
  const [customMethodName, setCustomMethodName] = React.useState("");
  const [customBankName, setCustomBankName] = React.useState("");

  const [merchantFee, setMerchantFee] = React.useState("0.00");
  const [exchangeFee, setExchangeFee] = React.useState("0.00");
  const [paymentCharge, setPaymentCharge] = React.useState("0.00");

  const [reference, setReference] = React.useState("");
  const [counterpartyAlias, setCounterpartyAlias] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Load catalogs on mount
  React.useEffect(() => {
    async function loadCatalogs() {
      try {
        setIsLoading(true);
        const config = await fetchFullConfigurationAction();
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

  // Derive unit rate: fiat / crypto
  const calculatedRate = React.useMemo(() => {
    const c = parseFloat(cryptoAmount);
    const f = parseFloat(fiatAmount);
    if (!isNaN(c) && !isNaN(f) && c > 0) {
      return (f / c).toFixed(4);
    }
    return "";
  }, [cryptoAmount, fiatAmount]);

  // Recalculate merchant fee when fiat amount or commission rule changes
  React.useEffect(() => {
    const f = parseFloat(fiatAmount);
    if (!isNaN(f) && f > 0 && activeCommissionRule) {
      const pct = parseFloat(activeCommissionRule.percentage) || 0;
      const fixed = parseFloat(activeCommissionRule.fixedFee) || 0;
      const calculated = (f * pct) + fixed;
      setMerchantFee(calculated.toFixed(2));
    } else if (isNaN(f) || f <= 0) {
      setMerchantFee("0.00");
    }
  }, [fiatAmount, activeCommissionRule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createOperationAction({
        countryCode: country,
        exchangeCode: exchange,
        operationSide: side,
        assetSymbol: asset,
        assetAmount: cryptoAmount,
        fiatCurrency,
        fiatAmount,
        merchantFee,
        exchangeFee,
        paymentCharge,
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
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Tipo de Operación
                  </label>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <Input
                  label={`Cantidad Cripto (${asset})`}
                  type="number"
                  step="any"
                  placeholder="Ej. 500.00"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(e.target.value)}
                  required
                />

                <Input
                  label={`Importe Fiat Total (${fiatCurrency})`}
                  type="number"
                  step="any"
                  placeholder="Ej. 19325.00"
                  value={fiatAmount}
                  onChange={(e) => setFiatAmount(e.target.value)}
                  required
                />

                <Input
                  label={`Tasa Unitaria Calculada (${fiatCurrency}/${asset})`}
                  value={calculatedRate ? `${calculatedRate} ${fiatCurrency}` : "Pendiente de importes"}
                  readOnly
                  className="bg-[#0b0d13] text-[#00ff66] font-mono font-bold"
                  leftIcon={<Calculator className="w-4 h-4 text-[#00ff66]" />}
                />
              </div>
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
                  Desglose de Cargos, Método y Banco Privado
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label={`Comisión Comerciante (${fiatCurrency})`}
                  type="number"
                  step="any"
                  value={merchantFee}
                  onChange={(e) => setMerchantFee(e.target.value)}
                  helperText={
                    activeCommissionRule
                      ? `Calculada automáticamente con perfil ${country}`
                      : "Entrada manual libre (sin regla configurada)"
                  }
                />

                <Input
                  label={`Tarifa del Exchange (${fiatCurrency})`}
                  type="number"
                  step="any"
                  value={exchangeFee}
                  onChange={(e) => setExchangeFee(e.target.value)}
                  helperText="Si el exchange cobró tarifa en fiat"
                />

                <Input
                  label={`Cargo Método de Pago (${fiatCurrency})`}
                  type="number"
                  step="any"
                  value={paymentCharge}
                  onChange={(e) => setPaymentCharge(e.target.value)}
                  helperText="Comisión bancaria / pasarela"
                />
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
              className="px-8"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Operación
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

