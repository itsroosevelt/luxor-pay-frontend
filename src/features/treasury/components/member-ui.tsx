'use client';

/** Building blocks shared by the Members page and the Treasury page (modal shell, role chips, form field style). */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { MEMBER_ROLE_META, type MemberRoleKey } from '@/features/treasury/api/members-api';

/* ───────────────────────── small building blocks ───────────────────────── */

export function RoleChip({
  role, active, onClick, disabled,
}: { role: MemberRoleKey; active: boolean; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; disabled?: boolean }) {
  const meta = MEMBER_ROLE_META[role];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      disabled={disabled}
      title={disabled ? meta.description : `${meta.description} — clic para cambiar`}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-[12.5px] font-medium transition-all disabled:opacity-40"
      style={{
        fontFamily: "'Outfit', sans-serif",
        borderRadius: '9999px',
        background: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)',
        color: active ? '#000000' : 'rgba(255, 255, 255, 0.6)',
        border: active ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.1)',
        fontWeight: active ? 600 : 500,
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {active && <Check size={13} className="text-black" />}
      {meta.short}
    </button>
  );
}

export function ModalShell({
  title, subtitle, icon, onClose, children, maxWidth = 480,
}: {
  title: string; subtitle?: string; icon?: React.ReactNode; onClose: () => void;
  children: React.ReactNode; maxWidth?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', bounce: 0.22, duration: 0.4 }}
        className="w-full relative overflow-hidden"
        style={{
          maxWidth,
          background: '#0B0C10',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '36px',
          padding: '36px 32px 32px 32px',
          boxShadow: '0 32px 80px -16px rgba(0, 0, 0, 0.95), 0 0 50px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Close button X top right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/12 text-white/60 hover:text-white hover:bg-white/12 transition-all cursor-pointer z-20"
        >
          <X size={16} />
        </button>

        {/* Centered Title & Subtitle */}
        <div className="mb-7 text-center relative z-10">
          <h2 className="flex items-center justify-center gap-2.5 text-[24px] font-semibold tracking-tight text-white font-sans">
            {icon && (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/80">
                {icon}
              </span>
            )}
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-[13.5px] text-white/60 font-body leading-relaxed max-w-sm mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="relative z-10">{children}</div>
      </motion.div>
    </motion.div>
  );
}

export const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 18px',
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#FFFFFF',
  fontSize: 14,
  fontFamily: "'Outfit', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease',
};

