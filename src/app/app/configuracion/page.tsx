"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import {
  Sliders,
  Plus,
  Landmark,
  CreditCard,
  Edit2,
  Trash2,
  Save,
  Settings,
  CheckCircle2,
  Globe2,
} from "lucide-react";
import {
  fetchFullConfigurationAction,
  addBankAction,
  updateBankAction,
  deleteBankAction,
  addPaymentMethodAction,
  updatePaymentMethodAction,
  deletePaymentMethodAction,
  saveCommissionProfileAction,
  saveWorkspaceSettingsAction,
} from "@/app/actions/catalogs";

interface CountryConfig {
  code: string;
  name: string;
  defaultFiat: string;
}

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = React.useState<"commissions" | "banks" | "methods" | "settings">("commissions");
  const [isLoading, setIsLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Data from DB
  const [countries, setCountries] = React.useState<CountryConfig[]>([]);
  const [fiatCurrencies, setFiatCurrencies] = React.useState<any[]>([]);
  const [banks, setBanks] = React.useState<any[]>([]);
  const [methods, setMethods] = React.useState<any[]>([]);
  const [commissionProfiles, setCommissionProfiles] = React.useState<any[]>([]);
  const [settings, setSettings] = React.useState<any>(null);

  // Bank Form State
  const [newBankName, setNewBankName] = React.useState("");
  const [newBankCountry, setNewBankCountry] = React.useState("VE");
  const [isAddingBank, setIsAddingBank] = React.useState(false);

  // Method Form State
  const [newMethodName, setNewMethodName] = React.useState("");
  const [newMethodCountry, setNewMethodCountry] = React.useState("VE");
  const [newMethodRequiresBank, setNewMethodRequiresBank] = React.useState(false);
  const [isAddingMethod, setIsAddingMethod] = React.useState(false);

  // Editing Profile Dialog
  const [editingCountry, setEditingCountry] = React.useState<CountryConfig | null>(null);
  const [editBuyPercentage, setEditBuyPercentage] = React.useState("1.00");
  const [editSellPercentage, setEditSellPercentage] = React.useState("1.20");
  const [editFixedFee, setEditFixedFee] = React.useState("0.00");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  // Settings State
  const [primaryCountry, setPrimaryCountry] = React.useState("VE");
  const [timezone, setTimezone] = React.useState("America/Caracas");
  const [enabledFiats, setEnabledFiats] = React.useState<string[]>(["VES", "USD"]);
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchFullConfigurationAction();
      setCountries(data.countries || []);
      setFiatCurrencies(data.fiatCurrencies || []);
      setBanks(data.banks || []);
      setMethods(data.paymentMethods || []);
      setCommissionProfiles(data.commissionProfiles || []);

      if (data.settings) {
        setSettings(data.settings);
        setPrimaryCountry(data.settings.primaryCountry || "VE");
        setTimezone(data.settings.timezone || "America/Caracas");
        setEnabledFiats(data.settings.enabledFiatCurrencies || ["VES", "USD"]);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Error al cargar configuración." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const notify = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Bancos
  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim()) return;
    setIsAddingBank(true);
    try {
      await addBankAction({ countryCode: newBankCountry, name: newBankName });
      setNewBankName("");
      notify("Banco creado y asociado a tu espacio de trabajo.");
      await loadData();
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setIsAddingBank(false);
    }
  };

  const handleToggleBank = async (bank: any) => {
    try {
      await updateBankAction({ id: bank.id, isActive: !bank.isActive });
      notify(`Banco '${bank.name}' ${bank.isActive ? "desactivado" : "activado"}.`);
      await loadData();
    } catch (err: any) {
      notify(err.message, "error");
    }
  };

  const handleDeleteBank = async (id: string) => {
    try {
      await deleteBankAction(id);
      notify("Banco desactivado correctamente (historial preservado).");
      await loadData();
    } catch (err: any) {
      notify(err.message, "error");
    }
  };

  // Métodos de Pago
  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodName.trim()) return;
    setIsAddingMethod(true);
    try {
      await addPaymentMethodAction({
        name: newMethodName,
        countryCode: newMethodCountry,
        requiresBank: newMethodRequiresBank,
      });
      setNewMethodName("");
      setNewMethodRequiresBank(false);
      notify("Método de pago personalizado agregado a tu catálogo.");
      await loadData();
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setIsAddingMethod(false);
    }
  };

  const handleToggleMethod = async (m: any) => {
    try {
      await updateWorkspacePaymentMethodAction(m.id, { isActive: !m.isActive });
      notify(`Método '${m.name}' ${m.isActive ? "desactivado" : "activado"}.`);
      await loadData();
    } catch (err: any) {
      notify(err.message, "error");
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      await deletePaymentMethodAction(id);
      notify("Método desactivado correctamente (historial preservado).");
      await loadData();
    } catch (err: any) {
      notify(err.message, "error");
    }
  };

  // Helper local para método
  const updateWorkspacePaymentMethodAction = async (id: string, updates: any) => {
    return updatePaymentMethodAction({ id, ...updates });
  };

  // Perfiles de Comisión
  const openEditProfile = (country: CountryConfig) => {
    setEditingCountry(country);
    const buyProf = commissionProfiles.find(
      (p) => p.countryCode === country.code && (p.operationSide === "buy" || p.operationSide === "all")
    );
    const sellProf = commissionProfiles.find(
      (p) => p.countryCode === country.code && p.operationSide === "sell"
    );

    setEditBuyPercentage(buyProf ? (parseFloat(buyProf.percentage) * 100).toFixed(2) : "1.00");
    setEditSellPercentage(sellProf ? (parseFloat(sellProf.percentage) * 100).toFixed(2) : "1.20");
    setEditFixedFee(buyProf ? parseFloat(buyProf.fixedFee).toFixed(2) : "0.00");
  };

  const handleSaveCommissionProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCountry) return;
    setIsSavingProfile(true);

    try {
      // Guardar comisión compra
      await saveCommissionProfileAction({
        countryCode: editingCountry.code,
        fiatCurrency: editingCountry.defaultFiat,
        operationSide: "buy",
        percentage: (parseFloat(editBuyPercentage) / 100).toFixed(4),
        fixedFee: editFixedFee,
      });

      // Guardar comisión venta
      await saveCommissionProfileAction({
        countryCode: editingCountry.code,
        fiatCurrency: editingCountry.defaultFiat,
        operationSide: "sell",
        percentage: (parseFloat(editSellPercentage) / 100).toFixed(4),
        fixedFee: editFixedFee,
      });

      notify(`Perfiles de comisión para ${editingCountry.name} guardados en Neon.`);
      setEditingCountry(null);
      await loadData();
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Ajustes de Workspace
  const handleToggleFiat = (code: string) => {
    setEnabledFiats((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await saveWorkspaceSettingsAction({
        primaryCountry,
        timezone,
        enabledFiatCurrencies: enabledFiats,
      });
      notify("Ajustes del espacio de trabajo guardados exitosamente.");
      await loadData();
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#1c2230]">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Configuración Operativa
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Administra las reglas de comisión por país, tus bancos y métodos de pago privados, y los ajustes del Workspace.
        </p>
      </div>

      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : "error"}
          title={feedback.type === "success" ? "Operación Exitosa" : "Error de Configuración"}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#1f2533] space-x-6 text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab("commissions")}
          className={`pb-3 border-b-2 font-semibold transition-colors cursor-pointer shrink-0 ${
            activeTab === "commissions"
              ? "border-[#00ff66] text-[#00ff66]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 inline mr-1.5" />
          Comisiones por País ({countries.length})
        </button>
        <button
          onClick={() => setActiveTab("banks")}
          className={`pb-3 border-b-2 font-semibold transition-colors cursor-pointer shrink-0 ${
            activeTab === "banks"
              ? "border-[#00ff66] text-[#00ff66]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Landmark className="w-3.5 h-3.5 inline mr-1.5" />
          Bancos del Comerciante ({banks.length})
        </button>
        <button
          onClick={() => setActiveTab("methods")}
          className={`pb-3 border-b-2 font-semibold transition-colors cursor-pointer shrink-0 ${
            activeTab === "methods"
              ? "border-[#00ff66] text-[#00ff66]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 inline mr-1.5" />
          Métodos de Pago ({methods.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 border-b-2 font-semibold transition-colors cursor-pointer shrink-0 ${
            activeTab === "settings"
              ? "border-[#00ff66] text-[#00ff66]"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Settings className="w-3.5 h-3.5 inline mr-1.5" />
          Ajustes de Workspace
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono text-slate-500">
          Cargando configuración desde la base de datos de Neon...
        </div>
      ) : (
        <>
          {/* TAB 1: Comisiones por País */}
          {activeTab === "commissions" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#0e1017] border border-[#1f2637] text-xs text-slate-400">
                💡 <strong>Regla del Negocio:</strong> Cada país cuenta con perfiles de comisión independientes para Compra y Venta en su moneda fiat oficial ISO 4217. Estos valores se guardan como instantánea histórica al registrar cada operación P2P.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countries.map((c) => {
                  const buyProf = commissionProfiles.find(
                    (p) => p.countryCode === c.code && (p.operationSide === "buy" || p.operationSide === "all")
                  );
                  const sellProf = commissionProfiles.find(
                    (p) => p.countryCode === c.code && p.operationSide === "sell"
                  );
                  const isConfigured = !!buyProf || !!sellProf;

                  return (
                    <Card
                      key={c.code}
                      className="bg-[#10131a] border-[#1e2433] hover:border-[#2b3345] transition-all"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-[#181c26] border border-[#232938] flex items-center justify-center font-mono font-bold text-xs text-white">
                              {c.code}
                            </span>
                            <div>
                              <CardTitle className="text-sm">{c.name}</CardTitle>
                              <span className="text-[10px] font-mono text-slate-400">
                                Moneda: {c.defaultFiat}
                              </span>
                            </div>
                          </div>

                          {isConfigured ? (
                            <Badge variant="neon" className="text-[9px]">Configurado</Badge>
                          ) : (
                            <Badge variant="warning" className="text-[9px]">Pendiente</Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 pt-0 text-xs">
                        <div className="p-2.5 rounded-lg bg-[#0a0c12] border border-[#1a1e2a] font-mono space-y-1">
                          <div className="flex justify-between text-slate-400">
                            <span>Comisión Compra:</span>
                            <span className="text-emerald-400 font-semibold">
                              {buyProf ? `${(parseFloat(buyProf.percentage) * 100).toFixed(2)}%` : "0.00%"}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Comisión Venta:</span>
                            <span className="text-blue-400 font-semibold">
                              {sellProf ? `${(parseFloat(sellProf.percentage) * 100).toFixed(2)}%` : "0.00%"}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Cargo Fijo:</span>
                            <span className="text-white font-semibold">
                              {buyProf ? parseFloat(buyProf.fixedFee).toFixed(2) : "0.00"} {c.defaultFiat}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => openEditProfile(c)}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                          Configurar Perfil
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Bancos Propios */}
          {activeTab === "banks" && (
            <div className="space-y-6">
              <Card className="bg-[#10131a] border-[#1e2433]">
                <CardHeader>
                  <CardTitle className="text-sm">Agregar Banco a tu Workspace</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBank} className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Nombre del Banco (ej. Banesco, Bancolombia, Nubank)"
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      className="text-xs flex-1"
                      required
                    />
                    <Select
                      value={newBankCountry}
                      onChange={(e) => setNewBankCountry(e.target.value)}
                      className="w-full sm:w-48 text-xs"
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </Select>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="shrink-0"
                      isLoading={isAddingBank}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Banco
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-[#10131a] border-[#1e2433]">
                <CardContent className="p-0">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-[#141722] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#1f2637]">
                      <tr>
                        <th className="p-3">Nombre del Banco</th>
                        <th className="p-3">País Asignado</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#191f2c] text-slate-200">
                      {banks.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500">
                            No tienes bancos configurados aún. Agrega el primero arriba.
                          </td>
                        </tr>
                      ) : (
                        banks.map((b) => (
                          <tr key={b.id} className="hover:bg-[#151926]">
                            <td className="p-3 font-semibold text-white">{b.name}</td>
                            <td className="p-3 text-slate-400">
                              <span className="px-1.5 py-0.5 rounded bg-[#1c2230] text-slate-300">
                                {b.countryCode}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleBank(b)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                                  b.isActive
                                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                    : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                                }`}
                              >
                                {b.isActive ? "Activo" : "Desactivado"}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteBank(b.id)}
                                title="Desactivar banco"
                                className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: Métodos de Pago */}
          {activeTab === "methods" && (
            <div className="space-y-6">
              <Card className="bg-[#10131a] border-[#1e2433]">
                <CardHeader>
                  <CardTitle className="text-sm">Agregar Método de Pago Propio</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddMethod} className="flex flex-col sm:flex-row gap-3 items-center">
                    <Input
                      placeholder="Nombre del método (ej. Pago Móvil, Zinli, Transferencia)"
                      value={newMethodName}
                      onChange={(e) => setNewMethodName(e.target.value)}
                      className="text-xs flex-1 w-full"
                      required
                    />
                    <Select
                      value={newMethodCountry}
                      onChange={(e) => setNewMethodCountry(e.target.value)}
                      className="w-full sm:w-44 text-xs"
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </Select>
                    <label className="flex items-center gap-2 text-xs text-slate-300 font-mono cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={newMethodRequiresBank}
                        onChange={(e) => setNewMethodRequiresBank(e.target.checked)}
                        className="rounded border-[#222838] bg-[#12151e] text-[#00ff66]"
                      />
                      <span>Requiere Banco</span>
                    </label>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="shrink-0"
                      isLoading={isAddingMethod}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Método
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-[#10131a] border-[#1e2433]">
                <CardContent className="p-0">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-[#141722] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#1f2637]">
                      <tr>
                        <th className="p-3">Método de Pago</th>
                        <th className="p-3">País Asignado</th>
                        <th className="p-3">Asociación Bancaria</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#191f2c] text-slate-200">
                      {methods.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-500">
                            No tienes métodos de pago configurados aún. Agrega el primero arriba.
                          </td>
                        </tr>
                      ) : (
                        methods.map((m) => (
                          <tr key={m.id} className="hover:bg-[#151926]">
                            <td className="p-3 font-semibold text-white">{m.name}</td>
                            <td className="p-3 text-slate-400">
                              <span className="px-1.5 py-0.5 rounded bg-[#1c2230] text-slate-300">
                                {m.countryCode || "Global"}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400">
                              {m.requiresBank ? (
                                <span className="text-amber-400">Requiere Banco</span>
                              ) : (
                                <span className="text-slate-500">Independiente (Wallet / Efectivo)</span>
                              )}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleMethod(m)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                                  m.isActive
                                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                    : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                                }`}
                              >
                                {m.isActive ? "Activo" : "Desactivado"}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteMethod(m.id)}
                                title="Desactivar método"
                                className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 4: Ajustes de Workspace */}
          {activeTab === "settings" && (
            <Card className="bg-[#10131a] border-[#1e2433]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-[#00ff66]" />
                  Ajustes Generales del Espacio de Trabajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="País Primario de Operación"
                      value={primaryCountry}
                      onChange={(e) => setPrimaryCountry(e.target.value)}
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.code} — {c.defaultFiat})
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="Zona Horaria Operativa"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="America/Caracas">America/Caracas (UTC-4)</option>
                      <option value="America/Bogota">America/Bogota (UTC-5)</option>
                      <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</option>
                      <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires (UTC-3)</option>
                      <option value="America/Lima">America/Lima (UTC-5)</option>
                      <option value="America/Santiago">America/Santiago (UTC-3)</option>
                      <option value="UTC">UTC (Universal)</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-300">
                      Monedas Fiat Habilitadas en tu Negocio (ISO 4217)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Selecciona las divisas que aceptas en tus transacciones. El USD puede habilitarse en cualquier país además de la moneda local.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {fiatCurrencies.map((f) => {
                        const isChecked = enabledFiats.includes(f.code);
                        return (
                          <label
                            key={f.code}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                              isChecked
                                ? "bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66] font-bold"
                                : "bg-[#141722] border-[#1e2433] text-slate-400 hover:text-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleFiat(f.code)}
                              className="rounded border-[#222838] bg-[#12151e] text-[#00ff66]"
                            />
                            <span>{f.code}</span>
                            <span className="text-[10px] text-slate-500 font-normal">({f.symbol})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSavingSettings}
                    className="mt-4"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    Guardar Ajustes de Workspace
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* MODAL: Configuración de Perfil de Comisión */}
      {editingCountry && (
        <Dialog
          isOpen={!!editingCountry}
          onClose={() => setEditingCountry(null)}
          title={`Reglas de Comisión — ${editingCountry.name} (${editingCountry.defaultFiat})`}
        >
          <form onSubmit={handleSaveCommissionProfile} className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-[#0e1017] border border-[#1f2533] text-xs text-slate-400">
              Establece las tarifas para las operaciones en <strong>{editingCountry.name}</strong>. Estas se aplicarán automáticamente a tus órdenes.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Comisión Compra (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={editBuyPercentage}
                onChange={(e) => setEditBuyPercentage(e.target.value)}
                placeholder="1.00"
                required
              />

              <Input
                label="Comisión Venta (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={editSellPercentage}
                onChange={(e) => setEditSellPercentage(e.target.value)}
                placeholder="1.20"
                required
              />
            </div>

            <Input
              label={`Cargo Fijo por Operación (${editingCountry.defaultFiat})`}
              type="number"
              step="0.01"
              min="0"
              value={editFixedFee}
              onChange={(e) => setEditFixedFee(e.target.value)}
              placeholder="0.00"
              helperText="Opcional. Se suma al porcentaje en cada cálculo."
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-[#1f2533]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEditingCountry(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingProfile}
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                Guardar Perfil
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
