import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neon" | "success" | "warning" | "error" | "info" | "neutral" | "cyber";
}

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    neon: "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/40 shadow-[0_0_10px_rgba(0,255,102,0.15)]",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    error: "bg-red-500/10 text-red-400 border border-red-500/30",
    info: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",
    neutral: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    cyber: "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_10px_rgba(0,240,255,0.15)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase font-mono",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
