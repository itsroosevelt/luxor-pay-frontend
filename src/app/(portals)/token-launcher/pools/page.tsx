import { TrendingUp, ExternalLink } from 'lucide-react';

const POOLS = [
  { symbol: 'LXR', pair: 'LXR / SOL', dex: 'Raydium AMM', liquidity: '$145,280.00', status: 'Activo' },
];

export default function PoolsPage() {
  return (
    <>
      <header className="lx-page-header">
        <h1 className="lx-page-title">Mis Pools & Tokens</h1>
        <p className="lx-page-subtitle">Activos y pools de liquidez que has creado desde este portal.</p>
      </header>

      <div className="w-full max-w-[1100px] p-6 md:p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-white/60" />
            <h2 className="text-[16px] font-medium text-white">Pools &amp; activos registrados</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 font-medium text-xs text-white/50">Token / Par</th>
                  <th className="pb-3 font-medium text-xs text-white/50">DEX</th>
                  <th className="pb-3 font-medium text-xs text-white/50">Liquidez</th>
                  <th className="pb-3 font-medium text-xs text-white/50">Estado</th>
                  <th className="pb-3 text-right font-medium text-xs text-white/50">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {POOLS.map((p) => (
                  <tr key={p.pair}>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold bg-white/10 border border-white/15 text-white">
                          {p.symbol}
                        </span>
                        <span className="font-medium text-white">{p.pair}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-white/60">{p.dex}</td>
                    <td className="py-3.5 font-mono text-white">{p.liquidity}</td>
                    <td className="py-3.5"><span className="lx-status">{p.status}</span></td>
                    <td className="py-3.5 text-right">
                      <a href="https://raydium.io" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition-colors">
                        Ver en DEX <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
