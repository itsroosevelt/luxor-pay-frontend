import Link from 'next/link';
import { Rocket, Droplets, TrendingUp, ArrowUpRight, Coins, Compass, ExternalLink } from 'lucide-react';

const STATS = [
  { label: 'Created Tokens', value: '3', icon: Coins },
  { label: 'Managed Liquidity', value: '$163,420', icon: Droplets },
  { label: 'Active Pools', value: '1', icon: TrendingUp },
];

const ACTIVITY = [
  { title: 'LXR/SOL pool reached $145,280 in liquidity', time: '2h ago', symbol: 'LXR' },
  { title: 'LXR token deployed on Solana Mainnet-Beta', time: '5d ago', symbol: 'LXR' },
  { title: 'Mint & Freeze Authority revoked for LXR', time: '5d ago', symbol: 'LXR' },
];

const QUICK_LINKS = [
  { href: '/token-launcher/explore', label: 'Explore tokens', note: 'Discover what others are launching', icon: Compass, external: false },
  { href: '/token-launcher/liquidity', label: 'Provide liquidity', note: 'Create a liquidity pool on Raydium or Meteora', icon: Droplets, external: false },
  { href: 'https://docs.luxorpay.io/token-launcher', label: 'Documentation', note: 'How token authorities and DEX pools operate', icon: ExternalLink, external: true },
];

export default function TokenLauncherHomePage() {
  return (
    <>
      <header className="lx-page-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="lx-page-title">Launcher & DEX Liquidity</h1>
            <p className="lx-page-subtitle">Deploy SPL tokens and add automated liquidity on Raydium &amp; Meteora.</p>
          </div>
          <Link href="/token-launcher/create" className="px-4 py-2 rounded-full bg-white text-black font-medium text-xs hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5">
            <Rocket size={15} /> Create Token
          </Link>
        </div>
      </header>

      <div className="w-full max-w-[1200px] space-y-8 p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="border-b border-white/10 pb-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-white">{s.value}</span>
                  <Icon size={16} className="text-white/60" />
                </div>
                <span className="text-xs text-white/50">{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-4 pt-2 border-t border-white/10">
          <h2 className="text-[16px] font-medium text-white">Recent Activity</h2>
          <div className="divide-y divide-white/10">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold bg-white/10 border border-white/15 text-white">
                  {a.symbol}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{a.title}</p>
                  <p className="text-xs text-white/40">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/10">
          <h2 className="mb-2 text-[16px] font-medium text-white">Quick Links</h2>
          <div className="divide-y divide-white/10">
            {QUICK_LINKS.map((q) => {
              const Icon = q.icon;
              const content = (
                <>
                  <Icon size={16} className="flex-shrink-0 text-white/50" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{q.label}</p>
                    <p className="text-xs text-white/40">{q.note}</p>
                  </div>
                  <ArrowUpRight size={15} className="flex-shrink-0 text-white/40 group-hover:text-white transition-colors" />
                </>
              );
              return q.external ? (
                <a key={q.href} href={q.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-3 group">
                  {content}
                </a>
              ) : (
                <Link key={q.href} href={q.href} className="flex items-center gap-3 py-3 group">
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
