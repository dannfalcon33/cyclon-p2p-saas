import { MasterSidebar } from "@/components/layout/MasterSidebar";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#090705] text-slate-100">
      <MasterSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#261f18] bg-[#0c0906]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-400 font-bold tracking-wider uppercase">
              Consola del Propietario (SaaS Administration)
            </span>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Ambiente: <strong className="text-white">DEMO_PORTFOLIO</strong>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
