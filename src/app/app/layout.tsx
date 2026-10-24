import { AppSidebar } from "@/components/layout/AppSidebar";
import { DemoNoticeBadge } from "@/components/ui/demo-badge";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#08090d] text-slate-100">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with demo alert */}
        <header className="h-16 border-b border-[#1a1f2c] bg-[#090b10]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Workspace: <strong className="text-white">Crypto Trading Desk</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Free Trial Activo
            </span>
          </div>

          <div className="flex items-center gap-4">
            <DemoNoticeBadge />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
