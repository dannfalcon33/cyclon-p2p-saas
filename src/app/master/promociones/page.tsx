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
  Plus,
  PauseCircle,
  PlayCircle,
  Tag,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Megaphone,
} from "lucide-react";
import {
  fetchMasterPromotionsAction,
  createMasterPromotionAction,
  toggleMasterPromotionAction,
} from "@/app/actions/master";
import { usePageLoading } from "@/components/ui/page-loader";

export default function MasterPromotionsPage() {
  const [promos, setPromos] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  usePageLoading(isLoading, "Cargando Promociones Demo...");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form State
  const [newCode, setNewCode] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newDiscountType, setNewDiscountType] = React.useState<"percentage" | "fixed">("percentage");
  const [newDiscountValue, setNewDiscountValue] = React.useState("20");
  const [newMaxUses, setNewMaxUses] = React.useState("50");
  const [activateInBanner, setActivateInBanner] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadPromotions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchMasterPromotionsAction();
      setPromos(data);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al cargar promociones.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const activeBannerPromo = React.useMemo(
    () => promos.find((p) => p.isActive) || null,
    [promos]
  );

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const cleanCode = newCode.trim().toUpperCase();
      await createMasterPromotionAction({
        code: cleanCode,
        description: newDescription.trim() || `Cupón ${cleanCode}`,
        discountType: newDiscountType,
        discountValue: parseFloat(newDiscountValue) || 10,
        applicablePlans: ["business", "enterprise"],
        maxUses: newMaxUses ? parseInt(newMaxUses) : undefined,
        activateInBanner,
      });

      setFeedback({
        type: "success",
        message: activateInBanner
          ? `Cupón '${cleanCode}' creado y activado como promoción única en el cintillo del Landing Page.`
          : `Cupón '${cleanCode}' creado en estado pausado.`,
      });

      setIsModalOpen(false);
      setNewCode("");
      setNewDescription("");
      setActivateInBanner(true);
      await loadPromotions();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al crear la promoción.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleMasterPromotionAction(id);
      setFeedback({
        type: "success",
        message: res.isActive
          ? `¡Cupón '${res.code}' activado en el cintillo de carrusel del Landing Page! Los demás cupones pasaron automáticamente a estado Pausado.`
          : `Cupón '${res.code}' pausado y ocultado del cintillo del Landing Page.`,
      });
      await loadPromotions();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Error al cambiar estado del cupón.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#261f18] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-400" />
            Gestión de Promociones y Cintillo del Landing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configura cupones de descuento y elige cuál se muestra en el cintillo de carrusel debajo del header del Landing Page (solo 1 activo a la vez).
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadPromotions}
            disabled={isLoading}
            className="text-xs font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refrescar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-mono"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Crear Promoción
          </Button>
        </div>
      </div>

      {/* Live Preview Status of the Landing Carousel Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          activeBannerPromo
            ? "bg-[#0a1912] border-[#00ff66]/40 shadow-[0_0_25px_rgba(0,255,102,0.08)]"
            : "bg-[#120f0b] border-[#292017]"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
              activeBannerPromo
                ? "bg-[#00ff66]/15 border-[#00ff66]/40 text-[#00ff66]"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                Estado del Cintillo de Carrusel en Landing:
              </span>
              {activeBannerPromo ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00ff66]/15 border border-[#00ff66]/40 text-[#00ff66] font-mono text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse" />
                  VISIBLE EN LANDING ({activeBannerPromo.code})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px]">
                  SIN PROMOCIÓN ACTIVA (CINTILLO OCULTO)
                </span>
              )}
            </div>

            {activeBannerPromo ? (
              <p className="text-xs text-slate-300 font-mono">
                Mostrando debajo del header:{" "}
                <strong className="text-[#00ff66]">{activeBannerPromo.code}</strong> —{" "}
                <strong>
                  {activeBannerPromo.discountType === "percentage"
                    ? `${parseFloat(activeBannerPromo.discountValue)}% OFF`
                    : `$${parseFloat(activeBannerPromo.discountValue).toFixed(2)} USD OFF`}
                </strong>{" "}
                ({activeBannerPromo.description})
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Haz clic en <strong>&ldquo;Activar en Cintillo&rdquo;</strong> en cualquiera de los cupones de la tabla para publicarlo en el carrusel superior del Landing Page.
              </p>
            )}
          </div>
        </div>

        <Link href="/" target="_blank" className="shrink-0">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs font-mono border-[#00ff66]/40 text-[#00ff66] hover:bg-[#00ff66]/10"
          >
            <span>Ver Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>

      {feedback && (
        <Alert
          variant={feedback.type === "success" ? "success" : "error"}
          title={feedback.type === "success" ? "Operación Exitosa" : "Error"}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Promos Table */}
      <Card className="bg-[#120f0b] border-[#292017]">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500">
              Cargando promociones desde Neon PostgreSQL...
            </div>
          ) : !promos.length ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500">
              No hay cupones configurados. Crea uno con el botón superior.
            </div>
          ) : (
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-[#18130e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#292017]">
                <tr>
                  <th className="p-3.5">Código / Descripción</th>
                  <th className="p-3.5">Descuento</th>
                  <th className="p-3.5">Planes Elegibles</th>
                  <th className="p-3.5">Usos / Límite</th>
                  <th className="p-3.5">Cintillo en Landing / Estado</th>
                  <th className="p-3.5 text-right">Acción (1 Activa a la vez)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#211a13] text-slate-200">
                {promos.map((promo) => (
                  <tr
                    key={promo.id}
                    className={`transition-colors ${
                      promo.isActive
                        ? "bg-[#0c1a13]/60 hover:bg-[#0f2118]"
                        : "hover:bg-[#1a140f]"
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-white tracking-wider flex items-center gap-1.5">
                        <Tag
                          className={`w-3.5 h-3.5 ${
                            promo.isActive ? "text-[#00ff66]" : "text-amber-400"
                          }`}
                        />
                        {promo.code}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {promo.description}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[#00ff66] font-bold text-sm">
                        {promo.discountType === "percentage"
                          ? `${parseFloat(promo.discountValue)}% OFF`
                          : `$${parseFloat(promo.discountValue).toFixed(2)} USD OFF`}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {(promo.applicablePlans as string[])?.join(", ") || "Todos"}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-white">{promo.timesUsed}</span>
                      <span className="text-slate-500">
                        {" "}
                        / {promo.maxUses ?? "Ilimitado"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {promo.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00ff66]/15 border border-[#00ff66]/40 text-[#00ff66] text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" />
                          ACTIVO EN CINTILLO LANDING
                        </span>
                      ) : (
                        <Badge
                          variant="neutral"
                          className="text-[9px] text-slate-400 border-slate-700"
                        >
                          Pausado (Oculto)
                        </Badge>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant={promo.isActive ? "secondary" : "primary"}
                        size="sm"
                        className={`text-xs ${
                          promo.isActive
                            ? "border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                            : "bg-[#00ff66] text-[#08090d] font-bold hover:bg-[#00e55b]"
                        }`}
                        onClick={() => handleToggleStatus(promo.id)}
                      >
                        {promo.isActive ? (
                          <>
                            <PauseCircle className="w-3.5 h-3.5 mr-1" />
                            Pausar / Ocultar
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 mr-1" />
                            Activar en Cintillo
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Creation Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Promoción para Checkout Demo"
        description="Generación de cupones de demostración con publicación en el cintillo del Landing Page"
      >
        <form onSubmit={handleCreatePromo} className="space-y-4">
          <Input
            label="Código del Cupón (Ej. CYCLON50)"
            placeholder="CYBERP2P"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            className="uppercase font-mono text-xs"
            required
          />

          <Input
            label="Descripción para el Cintillo del Landing"
            placeholder="Ej. 50% de descuento en tu primer mes Business o Enterprise..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="text-xs"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">
                Tipo de Descuento
              </label>
              <Select
                value={newDiscountType}
                onChange={(e) => setNewDiscountType(e.target.value as any)}
                className="text-xs"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo (USD)</option>
              </Select>
            </div>

            <Input
              label={
                newDiscountType === "percentage" ? "Valor (%)" : "Valor ($ USD)"
              }
              type="number"
              value={newDiscountValue}
              onChange={(e) => setNewDiscountValue(e.target.value)}
              className="text-xs font-mono"
              required
            />
          </div>

          <Input
            label="Límite Máximo de Usos (Opcional)"
            type="number"
            value={newMaxUses}
            onChange={(e) => setNewMaxUses(e.target.value)}
            className="text-xs font-mono"
            placeholder="Dejar vacío para ilimitado"
          />

          <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0d1512] border border-[#00ff66]/30 cursor-pointer">
            <input
              type="checkbox"
              checked={activateInBanner}
              onChange={(e) => setActivateInBanner(e.target.checked)}
              className="mt-0.5 accent-[#00ff66]"
            />
            <div className="text-xs">
              <span className="font-semibold text-white block">
                Activar inmediatamente en el cintillo del Landing Page
              </span>
              <span className="text-[11px] text-slate-400">
                Pausará automáticamente cualquier otra promoción activa para que solo esta se muestre debajo del header.
              </span>
            </div>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !newCode.trim()}
            >
              {isSubmitting ? "Guardando en Neon..." : "Crear Promoción"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
