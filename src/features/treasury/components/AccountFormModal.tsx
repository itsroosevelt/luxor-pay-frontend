'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
} from 'lucide-react';

interface AccountFormModalProps {
  open: boolean;
  title: string;
  subtitle: string;
  label: string;
  onLabelChange: (value: string) => void;
  labelPlaceholder?: string;
  showWeight: boolean;
  weight: string;
  onWeightChange: (value: string) => void;
  isSaving: boolean;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** Create / edit dialog for a treasury account (name + target weight). */
export function AccountFormModal({
  open,
  title,
  subtitle,
  label,
  onLabelChange,
  labelPlaceholder,
  showWeight,
  weight,
  onWeightChange,
  isSaving,
  submitLabel,
  onClose,
  onSubmit,
}: AccountFormModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
            style={{
              width: '100%',
              maxWidth: 520,
              background: 'rgba(10, 10, 10, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 32px 64px -16px rgba(0,0,0,0.9)',
              borderRadius: 40,
              padding: '36px 40px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 500, letterSpacing: '-1px', color: '#FFFFFF', margin: '0 0 6px 0' }}>
                  {title}
                </h2>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 300, color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: 1.5 }}>
                  {subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF', cursor: 'pointer', borderRadius: 9999, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                  NOMBRE DE LA CUENTA *
                </label>
                <input
                  type="text"
                  placeholder={labelPlaceholder}
                  value={label}
                  onChange={(e) => onLabelChange(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {showWeight && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.85)', textTransform: 'uppercase' }}>
                    PESO OBJETIVO (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weight}
                    onChange={(e) => onWeightChange(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    height: 44,
                    padding: '11px 24px',
                    borderRadius: 9999,
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#E2E8F0',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    fontFamily: 'Outfit, sans-serif',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    height: 44,
                    padding: '11px 24px',
                    borderRadius: 9999,
                    background: '#FFFFFF',
                    border: 'none',
                    color: '#000000',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    fontFamily: 'Outfit, sans-serif',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isSaving ? 'Guardando...' : submitLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
