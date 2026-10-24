"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastVariant = "info" | "success" | "warning" | "error" | "neon";

export interface ToastItem {
  id: string;
  variant?: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  toast: (options: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = React.useCallback(
    ({
      variant = "info",
      title,
      description,
      duration = 4000,
    }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newItem: ToastItem = { id, variant, title, description, duration };
      setToasts((prev) => [...prev, newItem]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const styles: Record<ToastVariant, string> = {
    info: "bg-[#10141f]/95 border-cyan-500/40 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    success:
      "bg-[#0d1712]/95 border-emerald-500/40 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    warning:
      "bg-[#1c1409]/95 border-amber-500/40 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    error:
      "bg-[#1c0d0d]/95 border-red-500/40 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    neon: "bg-[#0a140f]/95 border-[#00ff66]/50 text-white shadow-[0_0_25px_rgba(0,255,102,0.2)]",
  };

  const icons: Record<ToastVariant, React.ReactNode> = {
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />,
    neon: <CheckCircle2 className="w-5 h-5 text-[#00ff66] shrink-0 mt-0.5" />,
  };

  const variant = item.variant || "info";

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
        styles[variant]
      )}
    >
      {icons[variant]}
      <div className="flex-1 space-y-0.5">
        <h6 className="text-xs font-semibold tracking-wide text-white font-mono">
          {item.title}
        </h6>
        {item.description && (
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(item.id)}
        className="text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-md"
        aria-label="Cerrar notificación"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
