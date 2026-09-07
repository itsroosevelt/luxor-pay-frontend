'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Code2,
  Users,
  Bell,
  Landmark,
  Globe,
  Copy,
  Check,
  Key,
  ShieldCheck,
  Mail,
  Plus,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface AccordionItemProps {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function ProfileAccordionItem({ icon: Icon, title, subtitle, children }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-panel overflow-hidden transition-all border border-white/10 rounded-2xl bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/[0.03] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white shrink-0">
            <Icon size={19} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white font-['Outfit']">
              {title}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-['Montserrat'] truncate">
              {subtitle}
            </p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4 text-xs font-mono">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProfileSettingsAccordions() {
  const [copiedLiveKey, setCopiedLiveKey] = useState(false);
  const [copiedTestKey, setCopiedTestKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.luxorpay.io/v1/webhook');
  
  // Notification states
  const [notifyPayment, setNotifyPayment] = useState(true);
  const [notifyPayout, setNotifyPayout] = useState(true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(false);

  // Auto-Payout threshold
  const [autoPayoutLimit, setAutoPayoutLimit] = useState('10.0');
  const [targetCurrency, setTargetCurrency] = useState<'USDC' | 'SOL' | 'USD'>('USDC');

  const handleCopy = (text: string, type: 'live' | 'test') => {
    navigator.clipboard.writeText(text);
    if (type === 'live') {
      setCopiedLiveKey(true);
      setTimeout(() => setCopiedLiveKey(false), 1500);
    } else {
      setCopiedTestKey(true);
      setTimeout(() => setCopiedTestKey(false), 1500);
    }
    toast.success('API Key copied to clipboard');
  };

  return (
    <div className="space-y-4">
      {/* 1. Developers & API Keys */}
      <ProfileAccordionItem
        id="developers"
        icon={Code2}
        title="Developers & API Keys"
        subtitle="Workbench, developer tools, API keys, and Webhooks"
      >
        <div className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
              Live API Key (Production)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value="lxr_live_9f82a17b841092e4a11029c"
                readOnly
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-300 outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopy('lxr_live_9f82a17b841092e4a11029c', 'live')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedLiveKey ? <Check size={13} /> : <Copy size={13} />}
                {copiedLiveKey ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
              Test API Key (Test Mode)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value="lxr_test_1e4902bca8817410f92881a"
                readOnly
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-300 outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopy('lxr_test_1e4902bca8817410f92881a', 'test')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedTestKey ? <Check size={13} /> : <Copy size={13} />}
                {copiedTestKey ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
              Webhook Endpoint URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://yourcompany.com/api/webhooks"
                className="flex-1 bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-3.5 py-2 text-xs font-mono text-white outline-none"
              />
              <button
                type="button"
                onClick={() => toast.success('Webhook URL updated')}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors shrink-0 font-['Outfit']"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </ProfileAccordionItem>

      {/* 2. Communication Preferences */}
      <ProfileAccordionItem
        id="communication"
        icon={Bell}
        title="Communication Preferences"
        subtitle="Customize email, SMS, and push notification alerts"
      >
        <div className="space-y-3 font-sans text-xs">
          <div className="flex items-center justify-between py-1.5">
            <div>
              <p className="text-white font-medium">Payment Received Notification</p>
              <p className="text-gray-400 text-[11px]">Receive an email for every confirmed on-chain transaction</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifyPayment((prev) => !prev)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                notifyPayment ? 'bg-white' : 'bg-white/10'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.75 transition-all ${
                  notifyPayment ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-1.5 border-t border-white/5">
            <div>
              <p className="text-white font-medium">Payout & Cash Out Alerts</p>
              <p className="text-gray-400 text-[11px]">Notifications when bank payouts or withdrawals are processed</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifyPayout((prev) => !prev)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                notifyPayout ? 'bg-white' : 'bg-white/10'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.75 transition-all ${
                  notifyPayout ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-1.5 border-t border-white/5">
            <div>
              <p className="text-white font-medium">Daily Balance Summary</p>
              <p className="text-gray-400 text-[11px]">Send accounting ledger summary every midnight (UTC)</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifyDailySummary((prev) => !prev)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                notifyDailySummary ? 'bg-white' : 'bg-white/10'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.75 transition-all ${
                  notifyDailySummary ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </ProfileAccordionItem>

      {/* 3. Linked Payout Accounts */}
      <ProfileAccordionItem
        id="payouts"
        icon={Landmark}
        title="Linked Payout Accounts"
        subtitle="Bank accounts, auto-withdrawal rules, and settlement currencies"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center font-['Outfit']">
                USD
              </div>
              <div>
                <p className="text-white font-semibold font-['Outfit']">Bank Account (SEPA/ACH)</p>
                <p className="text-[11px] text-gray-400 font-mono">Chase Bank •••• 8821</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px] uppercase border border-white/15">
              Verified
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-3">
            <label className="block text-[11px] font-mono uppercase text-gray-400">
              Auto-Offramp Rule (Withdrawal Threshold)
            </label>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-gray-400">Auto cash-out when SOL balance &ge;</span>
              <input
                type="text"
                value={autoPayoutLimit}
                onChange={(e) => setAutoPayoutLimit(e.target.value)}
                className="w-24 bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-3 py-1.5 text-xs text-white text-center outline-none"
              />
              <span className="text-white font-bold">SOL</span>
            </div>
          </div>
        </div>
      </ProfileAccordionItem>

      {/* 4. Team & Security */}
      <ProfileAccordionItem
        id="team"
        icon={Users}
        title="Team & Security"
        subtitle="Team members, roles, account security, and shared resources"
      >
        <div className="space-y-3 font-sans text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-gray-400 font-mono uppercase text-[11px]">Team Members (2)</span>
            <button
              type="button"
              onClick={() => toast.info('Invitation sent via email')}
              className="px-3 py-1 rounded-full bg-white text-black font-bold font-['Outfit'] hover:bg-gray-200 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Plus size={12} /> Invite
            </button>
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-[10px]">
                  P
                </div>
                <span className="text-white">Owner (You)</span>
              </div>
              <span className="text-gray-400 text-[11px]">Global Admin</span>
            </div>

            <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-[10px]">
                  D
                </div>
                <span className="text-white">dev@yourcompany.com</span>
              </div>
              <span className="text-gray-400 text-[11px]">Developer</span>
            </div>
          </div>
        </div>
      </ProfileAccordionItem>

      {/* 5. Company & Brand */}
      <ProfileAccordionItem
        id="company"
        icon={Globe}
        title="Company & Brand"
        subtitle="Account details, public profile, legal entity, and custom domains"
      >
        <div className="space-y-3 font-sans text-xs">
          <div>
            <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
              Public Entity Name
            </label>
            <input
              type="text"
              defaultValue="Luxor Pay Web3 Inc."
              className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
              Customer Support Email
            </label>
            <input
              type="email"
              defaultValue="support@luxorpay.io"
              className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono"
            />
          </div>
        </div>
      </ProfileAccordionItem>
    </div>
  );
}
