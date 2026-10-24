export default function Loading() {
  return (
    <div className="min-h-screen bg-[#08090d] p-8 space-y-6 flex flex-col justify-center items-center">
      <div className="w-12 h-12 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center animate-pulse">
        <div className="w-5 h-5 rounded-full bg-[#00ff66]" />
      </div>
      <p className="text-xs font-mono text-slate-400">Cargando Cyclon P2P...</p>
    </div>
  );
}
