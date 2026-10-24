import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error" | "neon";
  title?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
  ...props
}: AlertProps) {
  const styles = {
    info: "bg-cyan-950/20 border-cyan-500/30 text-cyan-200",
    success: "bg-emerald-950/20 border-emerald-500/30 text-emerald-200",
    warning: "bg-amber-950/20 border-amber-500/30 text-amber-200",
    error: "bg-red-950/20 border-red-500/30 text-red-200",
    neon: "bg-[#00ff66]/5 border-[#00ff66]/30 text-emerald-100",
  };

  const icons = {
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />,
    neon: <CheckCircle2 className="w-5 h-5 text-[#00ff66] shrink-0 mt-0.5" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 p-4 rounded-xl border text-sm",
        styles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold tracking-tight">{title}</h5>}
        <div className="text-xs opacity-90 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
