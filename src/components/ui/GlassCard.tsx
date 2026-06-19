'use client';

import styled from 'styled-components';
import { theme } from '@/styles/theme';

export const GlassCard = styled.div`
  background: ${theme.glass.background};
  border: ${theme.glass.border};
  backdrop-filter: ${theme.glass.backdropFilter};
  border-radius: ${theme.glass.borderRadius};
  box-shadow: ${theme.glass.boxShadow};
`;
