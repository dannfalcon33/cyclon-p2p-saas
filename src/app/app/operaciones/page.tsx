"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import {
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Landmark,
  CreditCard,
  FileSpreadsheet,
} from "lucide-react";
import { fetchOperationsAction, cancelOperationAction } from "@/app/actions/operations";

export default function OperationsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [operations, setOperations] = React.useState<any[]>([]);
  const [summary, setSummary] = React.useState({ completed: 0, pending: 0, cancelled: 0, total: 0 });
  const [pagination, setPagination] = React.useState({ page: 1, pageSize: 15, total: 0, totalPages: 1, hasMore: false });

  // Filters
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCountry, setSelectedCountry] = React.useState("ALL");
  const [selectedSide, setSelectedSide] = React.useState<"ALL" | "buy" | "sell">("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<"ALL" | "completed" | "pending" | "cancelled">("ALL");
  const [selectedAsset, setSelectedAsset] = React.useState("ALL");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Cancellation Dialog State
  const [cancellingOp, setCancellingOp] = React.useState<any | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Excel Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [exportPeriod, setExportPeriod] = React.useState("all");
  const [exportCountry, setExportCountry] = React.useState("ALL");
  const [exportCurrency, setExportCurrency] = React.useState("ALL");
  const [exportStatus, setExportStatus] = React.useState("ALL");
  const [exportSide, setExportSide] = React.useState("ALL");
  const [exportExchange, setExportExchange] = React.useState("ALL");

  const loadOperations = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchOperationsAction({
        page: currentPage,
        pageSize: 15,
        search: searchTerm || undefined,
        countryCode: selectedCountry !== "ALL" ? selectedCountry : undefined,
        operationSide: selectedSide !== "ALL" ? selectedSide : undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        assetSymbol: selectedAsset !== "ALL" ? selectedAsset : undefined,
      });

      setOperations(data.items || []);
      setPagination(data.pagination);
      setSummary(data.summary);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Error al cargar las operaciones" });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, selectedCountry, selectedSide, selectedStatus, selectedAsset]);

  React.useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  const notify = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOp) return;
    setIsCancelling(true);
    try {
      await cancelOperationAction(cancellingOp.id, cancelReason);
      notify(`Operación ${cancellingOp.id.slice(0, 8)} cancelada exitosamente.`);
      setCancellingOp(null);
      setCancelReason("");
      await loadOperations();
    } catch (err: any) {
      notify(err.message || "Error al cancelar la operación", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2230]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Bitácora de Operaciones P2P
            <Badge variant="neon" className="text-[10px] font-mono">
              En Vivo (Neon DB)
            </Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro auditable de operaciones en Binance, Bybit y Bitget. Filtros y cálculo de tasas en servidor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadOperations()}
            className="text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            className="text-xs font-mono"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-[#00ff66]" />
            Exportar Excel (.xlsx)
          </Button>

          <Link href="/app/operaciones/nueva">
            <Button variant="primary" size="sm" className="text-xs">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Nueva Operación
            </Button>
          </Link>
        </div>
      </div>

      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : "error"}
          title={feedback.type === "success" ? "Acción Completada" : "Error"}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-mono">Total Registros</p>
              <h3 className="text-xl font-bold text-white font-mono mt-1">{summary.total}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-300">
              <Filter className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 font-mono">Completadas</p>
              <h3 className="text-xl font-bold text-emerald-400 font-mono mt-1">{summary.completed}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-400 font-mono">Pendientes</p>
              <h3 className="text-xl font-bold text-amber-400 font-mono mt-1">{summary.pending}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#10131a] border-[#1e2433]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-rose-400 font-mono">Canceladas</p>
              <h3 className="text-xl font-bold text-rose-400 font-mono mt-1">{summary.cancelled}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="bg-[#10131a] border-[#1e2433]">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <Input
                placeholder="Buscar por ref, contraparte, banco o nota..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={<Search className="w-4 h-4 text-slate-500" />}
                className="text-xs"
              />
            </div>

            <Select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs"
            >
              <option value="ALL">Todos los Países</option>
              <option value="VE">Venezuela (VE)</option>
              <option value="CO">Colombia (CO)</option>
              <option value="BR">Brasil (BR)</option>
              <option value="AR">Argentina (AR)</option>
              <option value="EC">Ecuador (EC)</option>
              <option value="PE">Perú (PE)</option>
              <option value="CL">Chile (CL)</option>
            </Select>

            <Select
              value={selectedSide}
              onChange={(e) => {
                setSelectedSide(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs"
            >
              <option value="ALL">Lado (Compra / Venta)</option>
              <option value="buy">COMPRA (Inflow)</option>
              <option value="sell">VENTA (Outflow)</option>
            </Select>

            <Select
              value={selectedAsset}
              onChange={(e) => {
                setSelectedAsset(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs"
            >
              <option value="ALL">Todos los Activos</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="SOL">SOL</option>
              <option value="BNB">BNB</option>
            </Select>

            <Select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="completed">Completadas</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Canceladas</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="bg-[#10131a] border-[#1e2433] overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-xs font-mono text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#00ff66]" />
            Cargando operaciones desde Neon PostgreSQL...
          </div>
        ) : operations.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#141822] border border-[#222838] flex items-center justify-center mx-auto text-slate-500">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No se encontraron operaciones</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No hay registros que coincidan con los filtros seleccionados o tu espacio de trabajo aún no tiene operaciones registradas.
            </p>
            <Link href="/app/operaciones/nueva">
              <Button variant="primary" size="sm" className="mt-2 text-xs">
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                Registrar Primera Operación
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0b0e14] border-b border-[#1e2433] text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha / ID</th>
                  <th className="py-3 px-3">Exchange / País</th>
                  <th className="py-3 px-3">Lado</th>
                  <th className="py-3 px-3 text-right">Cantidad Cripto</th>
                  <th className="py-3 px-3 text-right">Importe Fiat</th>
                  <th className="py-3 px-3 text-right">Tasa Unitaria</th>
                  <th className="py-3 px-3">Método / Banco</th>
                  <th className="py-3 px-3 text-right">Comisión</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181d28]">
                {operations.map((op) => {
                  const isBuy = op.operationSide === "buy";
                  const bankName = op.bank?.name || op.bankNameSnapshot || "N/A";
                  const methodName = op.paymentMethod?.name || op.paymentMethodNameSnapshot || "N/A";

                  return (
                    <tr
                      key={op.id}
                      className="hover:bg-[#141824]/60 transition-colors group"
                    >
                      {/* ID / Fecha */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link
                          href={`/app/operaciones/${op.id}`}
                          className="font-bold text-white hover:text-[#00ff66] transition-colors"
                        >
                          #{op.id.slice(0, 8)}
                        </Link>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {formatDate(op.occurredAt)}
                        </div>
                      </td>

                      {/* Exchange / País */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-200 capitalize">
                          {op.exchangeCode}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#1c2232] border border-[#2b3345] inline-flex items-center justify-center text-[8px] font-bold">
                            {op.countryCode}
                          </span>
                          <span>{op.countryCode}</span>
                        </div>
                      </td>

                      {/* Lado */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <Badge
                          variant={isBuy ? "success" : "info"}
                          className="text-[9px] font-bold"
                        >
                          {isBuy ? "COMPRA" : "VENTA"}
                        </Badge>
                      </td>

                      {/* Cantidad Cripto */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-white">
                        {parseFloat(op.assetAmount).toFixed(4)} {op.assetSymbol}
                      </td>

                      {/* Importe Fiat */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-semibold text-slate-100">
                        {parseFloat(op.fiatAmount).toLocaleString("es-ES", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-[10px] text-slate-400">{op.fiatCurrency}</span>
                      </td>

                      {/* Tasa Unitaria */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono text-[#00ff66] font-bold">
                        {parseFloat(op.unitRate).toFixed(2)}
                      </td>

                      {/* Método / Banco */}
                      <td className="py-3.5 px-3 max-w-[160px] truncate">
                        <div className="text-slate-200 font-medium truncate flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{methodName}</span>
                        </div>
                        {bankName !== "N/A" && (
                          <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <Landmark className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                            <span className="truncate">{bankName}</span>
                          </div>
                        )}
                      </td>

                      {/* Comisión */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap text-slate-300">
                        {parseFloat(op.merchantFee).toFixed(2)} {op.fiatCurrency}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {op.status === "completed" && (
                          <Badge variant="success" className="text-[9px]">
                            Completada
                          </Badge>
                        )}
                        {op.status === "pending" && (
                          <Badge variant="warning" className="text-[9px]">
                            Pendiente
                          </Badge>
                        )}
                        {op.status === "cancelled" && (
                          <Badge variant="error" className="text-[9px]">
                            Cancelada
                          </Badge>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/app/operaciones/${op.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-white"
                              title="Ver detalle"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>

                          {op.status !== "cancelled" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Cancelar operación"
                              onClick={() => {
                                setCancellingOp(op);
                                setCancelReason("");
                              }}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#1e2433] flex items-center justify-between text-xs font-mono text-slate-400 bg-[#0d1016]">
            <div>
              Mostrando página <strong>{pagination.page}</strong> de{" "}
              <strong>{pagination.totalPages}</strong> ({pagination.total} operaciones)
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2 text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={!pagination.hasMore}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-8 px-2 text-xs"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Confirmation Dialog for Cancellation */}
      <Dialog
        isOpen={!!cancellingOp}
        onClose={() => setCancellingOp(null)}
        title="Cancelar Operación P2P"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="text-slate-300">
            ¿Estás seguro de que deseas cancelar la operación{" "}
            <strong className="text-white">#{cancellingOp?.id?.slice(0, 8)}</strong>?
          </p>

          <div className="p-3 rounded-lg bg-[#141822] border border-[#222838] space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Monto Cripto:</span>
              <span className="text-white font-bold">
                {cancellingOp?.assetAmount} {cancellingOp?.assetSymbol}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Importe Fiat:</span>
              <span className="text-white font-bold">
                {cancellingOp?.fiatAmount} {cancellingOp?.fiatCurrency}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
            ⚠️ <strong>Preservación de Auditoría:</strong> El registro no se eliminará físicamente de la base de datos, sino que se marcará como cancelado para garantizar la trazabilidad de tus reportes contables.
          </div>

          <Input
            label="Motivo de la cancelación (Opcional)"
            placeholder="Ej. Contraparte no liberó / orden cancelada en Binance"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCancellingOp(null)}>
              Volver
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleConfirmCancel}
            >
              Confirmar Cancelación
            </Button>
          </div>
        </div>
      </Dialog>

      {/* MODAL: Exportación a Excel (.xlsx) */}
      <Dialog
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Exportar Bitácora a Excel (.xlsx)"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-[#0e1017] border border-[#1f2533] text-slate-300 space-y-1">
            <p className="font-semibold text-white">Generador de Reportes Multilibro:</p>
            <p className="text-[11px] text-slate-400">
              Genera un archivo nativo <strong className="text-[#00ff66]">.xlsx</strong> con 4 hojas: <em>Operaciones</em>, <em>Resumen por Moneda</em>, <em>Comisiones</em> y <em>Parámetros del Reporte</em>, con celdas numéricas y sanitizado contra formula injection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Período Temporal"
              value={exportPeriod}
              onChange={(e) => setExportPeriod(e.target.value)}
            >
              <option value="all">Todo el Historial</option>
              <option value="today">Hoy</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="month">Este Mes</option>
            </Select>

            <Select
              label="País Operativo"
              value={exportCountry}
              onChange={(e) => setExportCountry(e.target.value)}
            >
              <option value="ALL">Todos los Países</option>
              <option value="VE">Venezuela (VE)</option>
              <option value="CO">Colombia (CO)</option>
              <option value="BR">Brasil (BR)</option>
              <option value="AR">Argentina (AR)</option>
              <option value="EC">Ecuador (EC)</option>
              <option value="PE">Perú (PE)</option>
              <option value="CL">Chile (CL)</option>
            </Select>

            <Select
              label="Moneda Fiat"
              value={exportCurrency}
              onChange={(e) => setExportCurrency(e.target.value)}
            >
              <option value="ALL">Todas las Monedas</option>
              <option value="VES">VES — Bolívar</option>
              <option value="USD">USD — Dólar</option>
              <option value="COP">COP — Peso Col.</option>
              <option value="BRL">BRL — Real Bras.</option>
              <option value="ARS">ARS — Peso Arg.</option>
              <option value="PEN">PEN — Sol Peruano</option>
              <option value="CLP">CLP — Peso Chileno</option>
            </Select>

            <Select
              label="Estado de la Orden"
              value={exportStatus}
              onChange={(e) => setExportStatus(e.target.value)}
            >
              <option value="ALL">Todos los Estados</option>
              <option value="completed">Solo Completadas</option>
              <option value="pending">Solo Pendientes</option>
              <option value="cancelled">Solo Canceladas</option>
            </Select>

            <Select
              label="Lado / Tipo"
              value={exportSide}
              onChange={(e) => setExportSide(e.target.value)}
            >
              <option value="ALL">Compras y Ventas</option>
              <option value="buy">Solo Compras</option>
              <option value="sell">Solo Ventas</option>
            </Select>

            <Select
              label="Exchange"
              value={exportExchange}
              onChange={(e) => setExportExchange(e.target.value)}
            >
              <option value="ALL">Todos los Exchanges</option>
              <option value="binance">Binance P2P</option>
              <option value="bybit">Bybit P2P</option>
              <option value="bitget">Bitget P2P</option>
            </Select>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
            ⚠️ <strong>Disclaimer Legal:</strong> Este reporte exporta datos operativos para tu control contable y no certifica cumplimiento tributario por sí solo ni constituye declaración oficial ante entes fiscales.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a1f2c]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExportModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams();
                if (exportPeriod !== "all") params.set("period", exportPeriod);
                if (exportCountry !== "ALL") params.set("country", exportCountry);
                if (exportCurrency !== "ALL") params.set("currency", exportCurrency);
                if (exportStatus !== "ALL") params.set("status", exportStatus);
                if (exportSide !== "ALL") params.set("side", exportSide);
                if (exportExchange !== "ALL") params.set("exchange", exportExchange);

                window.open(`/api/export/excel?${params.toString()}`, "_blank");
                setIsExportModalOpen(false);
                notify("Descarga iniciada: Generando libro Excel con hojas de Operaciones, Resumen y Comisiones.");
              }}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Descargar Libro Excel (.xlsx)
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
