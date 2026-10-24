import { MasterSidebar } from "@/components/layout/MasterSidebar";
import { requirePlatformOwner } from "@/lib/auth/session";

export default async function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validación estricta en el servidor del rol global 'platform_owner'
  // 1. Si no hay sesión autenticada -> redirige inmediatamente a /login
  // 2. Si el usuario es un comerciante estándar -> redirige a /app
  const owner = await requirePlatformOwner();

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

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="hidden sm:inline-block text-amber-300/80">
              Propietario: <strong className="text-white">{owner.email}</strong>
            </span>
            <span>
              Ambiente: <strong className="text-white">DEMO_PORTFOLIO</strong>
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
