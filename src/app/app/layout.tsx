import { AppSidebar } from "@/components/layout/AppSidebar";
import { DemoNoticeBadge } from "@/components/ui/demo-badge";
import { getAuthenticatedWorkspace } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validación server-side estricta de autenticación y aislamiento multinquilino
  const { user, workspace, subscription } = await getAuthenticatedWorkspace();

  return (
    <div className="flex min-h-screen bg-[#08090d] text-slate-100">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with dynamic merchant session info */}
        <header className="h-16 border-b border-[#1a1f2c] bg-[#090b10]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              Workspace: <strong className="text-white">{workspace.name}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {subscription?.plan?.name || "Free Trial Activo"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
              <span>{user.email}</span>
            </div>
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
