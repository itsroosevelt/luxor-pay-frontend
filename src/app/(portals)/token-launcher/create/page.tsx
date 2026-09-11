'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { Rocket, ShieldCheck, Zap, Upload, Globe, MessageCircle, Share2, CheckCircle2, Coins, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
`;

const ContentLayout = styled.div`
  padding: 32px 40px 60px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

export default function CreateTokenPage() {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialBuy, setInitialBuy] = useState('0.1');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  const [revokeMint, setRevokeMint] = useState(true);
  const [revokeFreeze, setRevokeFreeze] = useState(true);
  const [revokeUpdate, setRevokeUpdate] = useState(true);
  
  const [isDeploying, setIsDeploying] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeployToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName || !tokenSymbol) {
      toast.error('Please enter a Token Name and Symbol');
      return;
    }

    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      toast.success(`🎉 Token $${tokenSymbol.toUpperCase()} launched successfully on Solana!`);
    }, 1800);
  };

  return (
    <PageContainer>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title flex items-center gap-3">
            <Rocket size={28} className="text-white shrink-0" /> Create Token
          </h1>
          <p className="lx-page-subtitle">
            Deploy an SPL token with automatic bonding curve &amp; liquidity pool on Solana in seconds.
          </p>
        </div>
      </header>

      <ContentLayout>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Launch Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleDeployToken} className="space-y-5 bg-white/[0.02] border border-white/10 p-6 md:p-8 rounded-3xl">
              <h2 className="text-base font-semibold text-white font-['Outfit'] flex items-center gap-2">
                <Coins size={18} className="text-gray-300" /> Token Parameters
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-mono text-gray-400">Token Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pepe Luxor"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="w-full rounded-2xl px-4 py-2.5 text-sm bg-black/60 border border-white/15 text-white placeholder-gray-600 outline-none focus:border-white/40 transition-colors font-['Outfit']"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-mono text-gray-400">Ticker Symbol *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PLX"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                    className="w-full rounded-2xl px-4 py-2.5 text-sm bg-black/60 border border-white/15 text-white placeholder-gray-600 outline-none focus:border-white/40 transition-colors uppercase font-mono"
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-mono text-gray-400">Description</span>
                <textarea
                  rows={3}
                  placeholder="Describe your coin, backstory, or ecosystem utility..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl px-4 py-2.5 text-sm bg-black/60 border border-white/15 text-white placeholder-gray-600 outline-none focus:border-white/40 transition-colors font-['Montserrat'] resize-none"
                />
              </label>

              {/* Image Dropzone */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-gray-400">Token Logo / Image</span>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/15 hover:border-white/30 rounded-2xl cursor-pointer bg-black/40 transition-colors group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-2xl border border-white/20" />
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-gray-300 group-hover:scale-110 transition-transform">
                        <Upload size={18} />
                      </div>
                      <p className="text-xs text-gray-300 font-mono">Click or drag image (PNG, JPG, GIF max 5MB)</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              {/* Social Links */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono text-gray-400">Social Channels (Optional)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative">
                    <Share2 size={14} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Twitter / X URL"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      className="w-full rounded-2xl pl-9 pr-3 py-2 text-xs bg-black/60 border border-white/15 text-white outline-none focus:border-white/40"
                    />
                  </div>
                  <div className="relative">
                    <MessageCircle size={14} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Telegram Group"
                      value={telegramUrl}
                      onChange={(e) => setTelegramUrl(e.target.value)}
                      className="w-full rounded-2xl pl-9 pr-3 py-2 text-xs bg-black/60 border border-white/15 text-white outline-none focus:border-white/40"
                    />
                  </div>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Website Domain"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full rounded-2xl pl-9 pr-3 py-2 text-xs bg-black/60 border border-white/15 text-white outline-none focus:border-white/40"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Buy Option */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white font-['Outfit']">Initial Developer Snipe (Optional)</span>
                  <span className="text-[10px] font-mono text-gray-400">Buy first on bonding curve</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={initialBuy}
                    onChange={(e) => setInitialBuy(e.target.value)}
                    className="flex-1 rounded-xl px-3 py-2 text-xs font-mono bg-black/80 border border-white/15 text-white outline-none focus:border-white/40"
                    placeholder="0.0 SOL"
                  />
                  <span className="text-xs font-bold font-mono text-white">SOL</span>
                </div>
              </div>

              {/* Security Authorities */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs font-mono text-gray-400 block mb-1">Security Authority Policies</span>
                <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={revokeMint}
                    onChange={(e) => setRevokeMint(e.target.checked)}
                    className="rounded accent-white"
                  />
                  <ShieldCheck size={14} className="text-white" /> Revoke Mint Authority (100% Fixed Supply)
                </label>
                <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={revokeFreeze}
                    onChange={(e) => setRevokeFreeze(e.target.checked)}
                    className="rounded accent-white"
                  />
                  <ShieldCheck size={14} className="text-white" /> Revoke Freeze Authority (No Account Freezing)
                </label>
                <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={revokeUpdate}
                    onChange={(e) => setRevokeUpdate(e.target.checked)}
                    className="rounded accent-white"
                  />
                  <ShieldCheck size={14} className="text-white" /> Revoke Metadata Update (Immutable Token Info)
                </label>
              </div>

              <button
                type="submit"
                disabled={isDeploying}
                className="w-full py-3.5 rounded-full bg-white text-black font-['Outfit'] font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                {isDeploying ? (
                  'Deploying Token to Solana...'
                ) : (
                  <>
                    <Rocket size={16} /> Deploy Token (~0.02 SOL Fee)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Live Preview Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl space-y-4">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest block">Live Token Preview</span>
              
              <div className="rounded-2xl bg-black/60 border border-white/15 p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      '🚀'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white font-['Outfit'] truncate">
                      {tokenName || 'Your Token Name'}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono font-bold">
                      ${tokenSymbol ? tokenSymbol.toUpperCase() : 'TICKER'}
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] font-mono text-gray-300">
                      Market Cap: $5.2K
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed font-['Montserrat'] line-clamp-3">
                  {description || 'Token description will appear here once typed.'}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-gray-400">
                  {twitterUrl && <Share2 size={14} className="hover:text-white" />}
                  {telegramUrl && <MessageCircle size={14} className="hover:text-white" />}
                  {websiteUrl && <Globe size={14} className="hover:text-white" />}
                  {!twitterUrl && !telegramUrl && !websiteUrl && (
                    <span className="text-[10px] font-mono text-gray-500">No social links added</span>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-mono text-gray-400 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span>Initial Supply:</span>
                  <span className="text-white font-bold">1,000,000,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bonding Curve:</span>
                  <span className="text-white">Solana Pump Standard</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Raydium Migration:</span>
                  <span className="text-white font-bold">At $69,000 MC</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
              <Zap size={16} className="text-gray-300 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed font-mono">
                When bonding curve completes 100%, $12,000 SOL is automatically deposited into Raydium AMM V4 &amp; burned forever.
              </p>
            </div>
          </div>
        </div>
      </ContentLayout>
    </PageContainer>
  );
}

