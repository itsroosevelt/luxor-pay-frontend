import { Flame, ExternalLink } from 'lucide-react';

const TRENDING = [
  { symbol: 'LXR', name: 'Luxor Ecosystem Token', mc: '$2.13M', change: '+18.4%', up: true, age: '5d' },
  { symbol: 'SOLC', name: 'Solana Coffee Co-op', mc: '$614K', change: '+6.2%', up: true, age: '2d' },
  { symbol: 'PAYX', name: 'PayFlex Rewards', mc: '$312K', change: '-3.1%', up: false, age: '11h' },
  { symbol: 'MRKT', name: 'MarketMaker DAO', mc: '$98K', change: '+41.7%', up: true, age: '3h' },
];

export default function ExplorePage() {
  return (
    <>
      <header className="lx-page-header">
        <h1 className="lx-page-title">Explore</h1>
        <p className="lx-page-subtitle">Recently launched tokens across the Luxor Pay ecosystem.</p>
      </header>

      <div className="w-full max-w-[1100px] p-6 md:p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-white/60" />
            <h2 className="text-[16px] font-medium text-white">Trending Tokens</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 font-medium text-xs text-white/50">Token</th>
                  <th className="pb-3 font-medium text-xs text-white/50">Market Cap</th>
                  <th className="pb-3 font-medium text-xs text-white/50">24h</th>
                  <th className="pb-3 font-medium text-xs text-white/50">Age</th>
                  <th className="pb-3 text-right font-medium text-xs text-white/50">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {TRENDING.map((t) => (
                  <tr key={t.symbol}>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold bg-white/10 border border-white/15 text-white">
                          {t.symbol.slice(0, 3)}
                        </span>
                        <div>
                          <p className="font-medium text-white">{t.symbol}</p>
                          <p className="text-[11px] text-white/50">{t.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-white">{t.mc}</td>
                    <td className="py-3.5 font-medium text-white">{t.change}</td>
                    <td className="py-3.5 text-white/60">{t.age}</td>
                    <td className="py-3.5 text-right">
                      <a href="#" className="inline-flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition-colors">
                        View <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs pt-2 text-white/40">
            Sample data — live source served via on-chain indexer (Helius).
          </p>
        </div>
      </div>
    </>
  );
}
