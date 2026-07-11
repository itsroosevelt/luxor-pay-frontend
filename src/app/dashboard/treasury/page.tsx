'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile, updateMerchantProfile } from '@/lib/merchants-api';
import { toast } from 'sonner';
import { useGetBalance } from '@/hooks/useGetBalance';
import { Keypair } from '@solana/web3.js';
import { 
  Wallet, 
  Save, 
  ShieldCheck, 
  HelpCircle, 
  ArrowUpRight, 
  Plus, 
  Pencil, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeftRight, 
  MoreHorizontal, 
  X,
  RefreshCw,
  Coins as CoinsIcon,
  Layers,
  Sparkles
} from 'lucide-react';

export default function TreasuryPage() {
  const [businessName, setBusinessName] = useState('');
  const [merchantWallet, setMerchantWallet] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Accounts state with interactive mock data
  const [accounts, setAccounts] = useState([
    { name: 'GENESYS', address: 'HQ8e6b3Jgb9dd42394b415a1bT8ejeJRe', balance: '$13.26', weight: '18%', coins: '1', stakes: '0', nfts: '0', solAmount: '0.1701' },
    { name: 'Business Wallet', address: '5YNpy6e94b415a1b3591236e3591K8sd', balance: '$45.20', weight: '60%', coins: '2', stakes: '1', nfts: '5', solAmount: '0.5810' },
    { name: 'Savings Wallet', address: '9xWk3591236ea31e4e94b9dd4239P9qm', balance: '$17.13', weight: '22%', coins: '1', stakes: '0', nfts: '0', solAmount: '0.2201' },
  ]);

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccAddress, setNewAccAddress] = useState('');

  // Selected account detail view state
  const [selectedAccountDetails, setSelectedAccountDetails] = useState<typeof accounts[0] | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'Coins' | 'NFT'>('Coins');

  // Load actual balance data from the linked wallet using the useGetBalance hook
  const { data: balanceData } = useGetBalance(merchantWallet);

  // Sync on-chain balance and address changes to the GENESYS account
  useEffect(() => {
    if (merchantWallet) {
      setAccounts(prev => prev.map(acc => {
        if (acc.name === 'GENESYS') {
          const solAmount = balanceData ? parseFloat(balanceData.solBalance).toFixed(4) : '0.1701';
          // Assuming SOL is around $140 USD for the visual conversion
          const usdVal = balanceData ? (parseFloat(balanceData.solBalance) * 140).toFixed(2) : '13.26';
          return {
            ...acc,
            address: merchantWallet,
            balance: `$${usdVal}`,
            solAmount: solAmount
          };
        }
        return acc;
      }));
    }
  }, [merchantWallet, balanceData]);

  // Keep selected details pane synchronized with active changes in the account list
  useEffect(() => {
    if (selectedAccountDetails) {
      const updated = accounts.find(a => a.name === selectedAccountDetails.name);
      if (updated) {
        setSelectedAccountDetails(updated);
      }
    }
  }, [accounts]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const profile = await getMerchantProfile(token);
        
        if (profile) {
          const loadedWallet = profile.merchantWallet ?? '';
          setBusinessName(profile.businessName ?? '');
          setMerchantWallet(loadedWallet);
          
          console.log(`[DEBUG] Loaded profile for ${user.email}. Payout Wallet from DB: "${loadedWallet}"`);
          
          // Keep it purely visual: if the backend has not set a wallet yet,
          // we display a realistic mock address for the GENESYS account in the UI.
          const activeWallet = loadedWallet || 'HQ8e6b3Jgb9dd42394b415a1bT8ejeJRe';
          
          setAccounts(prev => prev.map(acc => {
            if (acc.name === 'GENESYS') {
              return { 
                ...acc, 
                address: activeWallet,
                // If it is mock, keep the visual $13.26, otherwise it will sync dynamically
                balance: loadedWallet ? acc.balance : '$13.26',
                solAmount: loadedWallet ? acc.solAmount : '0.1701'
              };
            }
            return acc;
          }));
        }
      } catch (e) {
        console.error('[DEBUG] Error loading merchant profile:', e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      const token = await user.getIdToken();
      const trimmedWallet = merchantWallet.trim();
      await updateMerchantProfile(token, {
        businessName: businessName.trim() || undefined,
        merchantWallet: trimmedWallet || undefined,
      });

      setAccounts(prev => prev.map(acc => {
        if (acc.name === 'GENESYS') {
          return { ...acc, address: trimmedWallet };
        }
        return acc;
      }));

      // If viewing details of GENESYS, update it too
      if (selectedAccountDetails && selectedAccountDetails.name === 'GENESYS') {
        setSelectedAccountDetails(prev => prev ? { ...prev, address: trimmedWallet } : null);
      }

      toast.success('Treasury profile saved');
    } catch {
      toast.error('Could not save treasury profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim() || !newAccAddress.trim()) {
      toast.error('Please enter name and address');
      return;
    }
    setAccounts((prev) => [
      ...prev,
      {
        name: newAccName.trim(),
        address: newAccAddress.trim(),
        balance: '$0.00',
        weight: '0%',
        coins: '0',
        stakes: '0',
        nfts: '0',
        solAmount: '0.0000'
      }
    ]);
    setNewAccName('');
    setNewAccAddress('');
    setIsAddAccountOpen(false);
    toast.success('Account added');
  };

  // Helper to format long public keys
  const formatAddress = (addr: string) => {
    if (addr === 'No wallet linked') return addr;
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <header className="p-6 md:p-10 border-b border-white/5 bg-white/[0.01] flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-body mb-1">
            <span 
              onClick={() => setSelectedAccountDetails(null)} 
              className={`hover:text-white cursor-pointer transition-colors ${!selectedAccountDetails ? 'text-white' : ''}`}
            >
              Treasury
            </span>
            {selectedAccountDetails && (
              <>
                <span>/</span>
                <span className="text-white font-light">{selectedAccountDetails.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {selectedAccountDetails ? selectedAccountDetails.name : 'Treasury'}
          </h1>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full space-y-8 font-body font-light">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading profile...</span>
          </div>
        ) : selectedAccountDetails ? (
          /* ========================================================================= */
          /*                       ACCOUNT DETAIL VIEW                                 */
          /* ========================================================================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Main Balance and Actions Card */}
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(40px)',
                borderRadius: '32px',
                boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
              }}
              className="p-8 space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider font-body">
                    <span>Account Balance</span>
                    <button type="button" className="hover:text-white transition-colors" onClick={() => toast.success('Account balance refreshed')}>
                      <RefreshCw size={12} className="animate-spin-slow" />
                    </button>
                  </div>
                  <div className="text-5xl font-light text-white tracking-tight font-sans">
                    {selectedAccountDetails.balance}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 self-start md:self-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                    <span>{formatAddress(selectedAccountDetails.address)}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedAccountDetails.address);
                        toast.success('Address copied to clipboard');
                      }}
                      className="p-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                      title="Copy full address"
                    >
                      <Copy size={12} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-light text-xs hover:bg-white/90 transition-all font-sans shadow-md">
                      <ArrowUp size={14} /> Send
                    </button>
                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-light text-xs hover:bg-white/90 transition-all font-sans shadow-md">
                      <ArrowDown size={14} /> Deposit
                    </button>
                    <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-light text-xs hover:bg-white/90 transition-all font-sans shadow-md">
                      <ArrowLeftRight size={14} /> Trade
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Stats / Metrics widgets */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-2xl font-light text-white">{selectedAccountDetails.coins}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-body">Coin</div>
                  </div>
                  <CoinsIcon size={20} className="text-blue-400 opacity-60" />
                </div>
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-2xl font-light text-white">{selectedAccountDetails.stakes}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-body">Stakes</div>
                  </div>
                  <Layers size={20} className="text-purple-400 opacity-60" />
                </div>
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-2xl font-light text-white">{selectedAccountDetails.nfts}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-body">NFTs</div>
                  </div>
                  <Sparkles size={20} className="text-emerald-400 opacity-60" />
                </div>
              </div>
            </div>

            {/* Tabs (Coins, NFT) */}
            <div className="space-y-4">
              <div className="flex border-b border-white/5 gap-6 text-sm">
                <button
                  onClick={() => setActiveSubTab('Coins')}
                  className={`pb-3 font-light transition-all border-b-2 ${
                    activeSubTab === 'Coins'
                      ? 'border-[#60A5FA] text-[#60A5FA]'
                      : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Coins
                </button>
                <button
                  onClick={() => setActiveSubTab('NFT')}
                  className={`pb-3 font-light transition-all border-b-2 ${
                    activeSubTab === 'NFT'
                      ? 'border-[#60A5FA] text-[#60A5FA]'
                      : 'border-transparent text-gray-500 hover:text-white'
                  }`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  NFT
                </button>
              </div>

              {activeSubTab === 'Coins' ? (
                <div 
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(40px)',
                    borderRadius: '24px',
                    boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
                  }}
                  className="p-6 overflow-x-auto w-full"
                >
                  <table className="w-full text-left min-w-[600px] border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[11px] text-gray-500 uppercase tracking-wider font-body">
                        <th className="pb-3 font-light">Coin</th>
                        <th className="pb-3 font-light">Balance</th>
                        <th className="pb-3 font-light">Value</th>
                        <th className="pb-3 font-light">Weight</th>
                        <th className="pb-3 text-right font-light"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* SOL Detail Row */}
                      <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                        <td className="py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-light text-white">SOL</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                              <span>So11...1112</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  navigator.clipboard.writeText('So11111111111111111111111111111111111111112');
                                  toast.success('Address copied');
                                }}
                                className="text-gray-600 hover:text-white transition-colors"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm font-light text-white font-mono">{selectedAccountDetails.solAmount}</td>
                        <td className="py-4 text-sm font-light text-white">{selectedAccountDetails.balance}</td>
                        <td className="py-4 w-40">
                          <div className="space-y-1.5">
                            <span className="text-xs text-white font-mono">100%</span>
                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                              <div className="bg-[#60A5FA] h-full w-full" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="px-4 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs text-white font-light transition-all">
                              Stake
                            </button>
                            <button className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Staked Row */}
                      <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 text-sm font-light text-gray-400 pl-4">Staked</td>
                        <td className="py-4 text-sm font-light text-gray-400 font-mono">0 SOL</td>
                        <td className="py-4 text-sm font-light text-gray-400">$0.00</td>
                        <td className="py-4 text-sm font-light text-gray-400 font-mono">0%</td>
                        <td className="py-4"></td>
                      </tr>

                      {/* Unstaked Row */}
                      <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 text-sm font-light text-gray-400 pl-4">Unstaked</td>
                        <td className="py-4 text-sm font-light text-gray-400 font-mono">{selectedAccountDetails.solAmount} SOL</td>
                        <td className="py-4 text-sm font-light text-gray-400">{selectedAccountDetails.balance}</td>
                        <td className="py-4 text-sm font-light text-gray-400 font-mono">100%</td>
                        <td className="py-4"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No NFTs found in this account.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /*                       ACCOUNTS LIST VIEW                                  */
          /* ========================================================================= */
          <>
            {/* Accounts Table Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-light text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Accounts</h2>
                <button 
                  type="button"
                  onClick={() => setIsAddAccountOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-light hover:bg-white/10 hover:text-white transition-all font-sans"
                >
                  <Plus size={14} /> Add Account
                </button>
              </div>

              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(40px)',
                  borderRadius: '24px',
                  boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
                }}
                className="p-6 overflow-x-auto w-full"
              >
                <table className="w-full text-left min-w-[600px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] text-gray-500 uppercase tracking-wider font-body">
                      <th className="pb-3 font-light">Account</th>
                      <th className="pb-3 font-light">Balance</th>
                      <th className="pb-3 font-light">Weight</th>
                      <th className="pb-3 text-right font-light"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc, index) => (
                      <tr 
                        key={index} 
                        onClick={() => setSelectedAccountDetails(acc)}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors"
                      >
                        <td className="py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-light text-white">{acc.name}</span>
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success('Edit account name');
                                }}
                                className="text-gray-500 hover:text-white transition-colors"
                              >
                                <Pencil size={12} />
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                              <span>{formatAddress(acc.address)}</span>
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(acc.address);
                                  toast.success('Address copied to clipboard');
                                }}
                                className="text-gray-600 hover:text-white transition-colors"
                                title="Copy full address"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-light text-white">{acc.balance}</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">SOL</span>
                          </div>
                        </td>
                        <td className="py-4 w-40">
                          <div className="space-y-1.5">
                            <span className="text-xs text-white font-mono">{acc.weight}</span>
                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                              <div className="bg-[#60A5FA] h-full" style={{ width: acc.weight }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all" title="Send">
                              <ArrowUp size={14} />
                            </button>
                            <button type="button" className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all" title="Receive">
                              <ArrowDown size={14} />
                            </button>
                            <button type="button" className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all" title="Trade">
                              <ArrowLeftRight size={14} />
                            </button>
                            <button type="button" className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all" title="More Options">
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Config & Security Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left: Form Card */}
              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(40px)',
                  borderRadius: '32px',
                  boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
                }}
                className="p-8 lg:col-span-2 space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-[#60A5FA]">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-light text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Payout Wallet</h3>
                    <p className="text-xs text-gray-500">Configure your receiving address for payments.</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Business Name</label>
                    <input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#60A5FA] transition-colors"
                      placeholder="My Store"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Solana Payout Wallet</label>
                    <input
                      value={merchantWallet}
                      onChange={(e) => setMerchantWallet(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#60A5FA] transition-colors"
                      placeholder="Enter Solana public key (e.g. USDC / SOL)"
                    />
                    <p className="text-[10px] text-gray-500 mt-1.5">
                      Used to process all payment links, QR codes, and POS device transactions.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black font-light text-sm rounded-full hover:bg-gray-200 disabled:opacity-50 transition-all"
                    >
                      <Save size={16} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right: Informational Sidebar Card */}
              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(40px)',
                  borderRadius: '32px',
                  boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
                }}
                className="p-8 space-y-6"
              >
                <h3 className="text-base font-light text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <ShieldCheck size={18} className="text-emerald-400" />
                  Security Check
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  All transactions are routed directly to your connected Solana address on-chain. Luxor Pay never stores your private keys.
                </p>
                
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <h4 className="text-xs font-light text-white flex items-center gap-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <HelpCircle size={14} className="text-blue-400" />
                    Need assistance?
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Make sure to enter a valid Solana mainnet address. Incorrect addresses may result in permanent loss of funds.
                  </p>
                  <a href="#" className="inline-flex items-center gap-0.5 text-xs text-[#60A5FA] hover:underline pt-1">
                    View documentation <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            style={{
              background: 'rgba(10, 10, 10, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(40px)',
              borderRadius: '24px',
              boxShadow: '0 32px 64px -16px rgba(0,0,0,0.8)',
            }}
            className="w-full max-w-md p-6 space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setIsAddAccountOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              <X size={18} />
            </button>
            
            <h3 className="text-lg font-light text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Add New Account</h3>
            
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="e.g. TREASURY"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#60A5FA] transition-colors text-white font-light font-sans"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 block mb-1">Solana Address</label>
                <input
                  type="text"
                  required
                  value={newAccAddress}
                  onChange={(e) => setNewAccAddress(e.target.value)}
                  placeholder="Solana Public Key"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono focus:outline-none focus:border-[#60A5FA] transition-colors text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 rounded-full border border-white/10 text-xs hover:bg-white/5 transition-all text-white font-light font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-light text-xs rounded-full hover:bg-gray-200 transition-all font-sans"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
