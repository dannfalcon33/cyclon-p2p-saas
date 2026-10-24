import * as React from "react";
import { ShieldAlert } from "lucide-react";

export function DemoNoticeBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium tracking-wide">
      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>DEMO PORTAFOLIO — Sin transacciones ni dinero real</span>
    </div>
  );
}
