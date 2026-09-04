import { ShieldCheck, ExternalLink, Users, Droplets, TrendingUp, Coins } from 'lucide-react';

const STATS = [
  { label: 'Precio', value: '$0.0731', icon: TrendingUp },
  { label: 'Market Cap', value: '$2.13M', icon: Coins },
  { label: 'Liquidez', value: '$145,280', icon: Droplets },
  { label: 'Holders', value: '312', icon: Users },
];

export default function LxrTokenPage() {
  return (
    <>
      <header className="lx-page-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="lx-page-title">$LXR</h1>
            <p className="lx-page-subtitle">El token nativo del ecosistema Luxor Pay.</p>
          </div>
          <a
            href="https://explorer.solana.com/address/3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE"
            target="_blank" rel="noopener noreferrer" className="lx-status"
          >
            Ver en Solana Explorer <ExternalLink size={12} />
          </a>
        </div>
      </header>

      <div className="w-full max-w-[1100px] space-y-8 p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="border-b border-white/10 pb-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold text-white">{s.value}</span>
                  <Icon size={15} className="text-white/60" />
                </div>
                <span className="text-xs text-white/50">{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-white/60" />
            <h2 className="text-[16px] font-medium text-white">Sobre $LXR</h2>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-white/60">
            LXR es el token de utilidad del ecosistema Luxor Pay: paga comisiones reducidas en la pasarela,
            desbloquea límites superiores de tesorería multisig y gobierna los parámetros del protocolo.
            Desplegado con Mint y Freeze Authority renunciadas — el supply es fijo e inmutable.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="lx-status">Mint Revoked</span>
            <span className="lx-status">Freeze Revoked</span>
            <span className="lx-status">Supply 250,000,000,000 LXR</span>
          </div>
        </div>
      </div>
    </>
  );
}
