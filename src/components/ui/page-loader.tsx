"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

interface PageLoadingContextValue {
  registerTask: (id: string, message?: string) => void;
  unregisterTask: (id: string) => void;
  startNavigation: (message?: string) => void;
}

const PageLoadingContext = React.createContext<PageLoadingContextValue | null>(null);

/**
 * Hook para que cualquier página u opción activa muestre el círculo verde y barra de carga
 * centrados mientras obtiene datos o procesa un cambio de vista.
 */
export function usePageLoading(isLoading: boolean, message?: string) {
  const ctx = React.useContext(PageLoadingContext);
  const taskId = React.useId();

  React.useEffect(() => {
    if (!ctx) return;
    if (isLoading) {
      ctx.registerTask(taskId, message);
    } else {
      ctx.unregisterTask(taskId);
    }
    return () => {
      ctx.unregisterTask(taskId);
    };
  }, [ctx, isLoading, message, taskId]);
}

export function PageLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [navMessage, setNavMessage] = React.useState<string>("Cargando página...");
  const [tasks, setTasks] = React.useState<Record<string, string>>({});
  const lastPathnameRef = React.useRef(pathname);

  const registerTask = React.useCallback((id: string, message = "Cargando datos...") => {
    setTasks((prev) => {
      if (prev[id] === message) return prev;
      return { ...prev, [id]: message };
    });
  }, []);

  const unregisterTask = React.useCallback((id: string) => {
    setTasks((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const startNavigation = React.useCallback((message = "Cargando página...") => {
    setNavMessage(message);
    setIsNavigating(true);
  }, []);

  // Cuando cambia la ruta actual, damos un breve margen de 120ms para empalmar sin parpadeo
  // con el estado `isLoading` de la nueva página que se monta.
  React.useEffect(() => {
    if (lastPathnameRef.current !== pathname) {
      lastPathnameRef.current = pathname;
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Safety timeout por si una navegación es cancelada o redirigida al mismo lugar
  React.useEffect(() => {
    if (!isNavigating) return;
    const safetyTimer = setTimeout(() => {
      setIsNavigating(false);
    }, 6000);
    return () => clearTimeout(safetyTimer);
  }, [isNavigating]);

  // Interceptor global de clics en enlaces internos (<Link> / <a>)
  React.useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;

      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr || hrefAttr.startsWith("#") || hrefAttr.startsWith("javascript:")) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        // Si es exactamente la misma ruta (ej. ancla en la misma página o link ya activo), no activar
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }

        // Extraer nombre amigable de la opción clickeada
        const cleanText = anchor.innerText
          ?.replace(/PRO|→|&rarr;/g, "")
          ?.trim();
        const label =
          cleanText && cleanText.length > 1 && cleanText.length < 36
            ? `Cargando ${cleanText}...`
            : "Cargando página...";

        setNavMessage(label);
        setIsNavigating(true);
      } catch {
        // Ignorar URLs inválidas
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  const taskValues = Object.values(tasks);
  const isVisible = isNavigating || taskValues.length > 0;
  const activeMessage = taskValues[taskValues.length - 1] || navMessage || "Cargando...";

  const contextValue = React.useMemo(
    () => ({
      registerTask,
      unregisterTask,
      startNavigation,
    }),
    [registerTask, unregisterTask, startNavigation]
  );

  return (
    <PageLoadingContext.Provider value={contextValue}>
      {children}

      {isVisible && (
        <>
          {/* Barra superior de progreso en verde neón */}
          <div className="fixed top-0 left-0 right-0 z-[120] h-1 bg-[#08090d]/60 overflow-hidden pointer-events-none">
            <div
              className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#00ff66] to-[#00f0ff] shadow-[0_0_15px_#00ff66]"
              style={{
                animation: "cyclon-progress-slide 1.15s ease-in-out infinite",
              }}
            />
          </div>

          {/* Overlay central con círculo verde neón + barra de carga */}
          <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-[115] flex items-center justify-center bg-[#06080d]/60 backdrop-blur-[2px] animate-in fade-in duration-150"
          >
            <div className="relative px-7 py-6 rounded-2xl bg-[#0b0e17]/95 border border-[#00ff66]/40 shadow-[0_0_45px_rgba(0,255,102,0.18)] flex flex-col items-center gap-4 min-w-[270px] max-w-xs text-center">
              {/* Efecto de resplandor ambiental */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-[#00ff66]/15 to-transparent blur-md pointer-events-none" />

              {/* Círculo de carga verde neón */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                {/* Anillo base */}
                <div className="absolute inset-0 rounded-full border-2 border-[#00ff66]/20" />
                {/* Anillo giratorio principal verde neón */}
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#00ff66] border-r-[#00ff66]/70 animate-spin shadow-[0_0_18px_rgba(0,255,102,0.4)]" />
                {/* Anillo interior secundario */}
                <div
                  className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#00f0ff]/80 animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "1.4s" }}
                />
                {/* Icono central */}
                <div className="w-6 h-6 rounded-full bg-[#00ff66]/15 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-[#00ff66] animate-pulse" />
                </div>
              </div>

              {/* Texto informativo */}
              <div className="space-y-1 relative z-10">
                <p className="text-xs font-mono font-bold text-white tracking-wide">
                  {activeMessage}
                </p>
                <p className="text-[11px] font-mono text-slate-400">
                  Por favor espera un momento...
                </p>
              </div>

              {/* Barra de carga central */}
              <div className="w-48 h-1.5 rounded-full bg-[#141a26] border border-[#1f293d] overflow-hidden relative z-10">
                <div
                  className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#00ff66]/20 via-[#00ff66] to-[#00f0ff] shadow-[0_0_12px_#00ff66]"
                  style={{
                    animation: "cyclon-progress-slide 1.1s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          </div>

          <style jsx global>{`
            @keyframes cyclon-progress-slide {
              0% {
                transform: translateX(-120%);
              }
              50% {
                transform: translateX(60%);
              }
              100% {
                transform: translateX(220%);
              }
            }
          `}</style>
        </>
      )}
    </PageLoadingContext.Provider>
  );
}

