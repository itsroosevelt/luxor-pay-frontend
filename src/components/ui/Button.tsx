'use client';

import styled, { css } from 'styled-components';
import { theme } from '@/styles/theme';

export type ButtonVariant = 'primary' | 'secondary';

const variantStyles = {
  primary: css`
    background: transparent;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.45);

    &:hover:not(:disabled) {
      background: ${theme.colors.accentDark};
      border-color: ${theme.colors.accentDark};
      color: #ffffff;
    }
  `,
  secondary: css`
    background: transparent;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.45);
      color: #ffffff;
    }
  `,
};

export const Button = styled.button<{ $variant?: ButtonVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: ${theme.radii.pill};
  padding: 0.75rem 1.5rem;
  font-family: ${theme.fonts.heading};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease,
    transform 0.15s ease;
  text-decoration: none;

  ${({ $variant = 'primary' }) => variantStyles[$variant]}

  &:focus-visible {
    outline: ${theme.focus.outline};
    outline-offset: ${theme.focus.outlineOffset};
  }

  &:disabled,
  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const ButtonLink = styled.a<{ $variant?: ButtonVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: ${theme.radii.pill};
  padding: 0.75rem 1.5rem;
  font-family: ${theme.fonts.heading};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  text-decoration: none;

  ${({ $variant = 'primary' }) => variantStyles[$variant]}

  &:focus-visible {
    outline: ${theme.focus.outline};
    outline-offset: ${theme.focus.outlineOffset};
  }
`;
