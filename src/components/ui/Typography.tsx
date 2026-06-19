'use client';

import styled from 'styled-components';
import { theme } from '@/styles/theme';

export const H1 = styled.h1`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.typography.h1.fontSize};
  font-weight: ${theme.typography.h1.fontWeight};
  letter-spacing: ${theme.typography.h1.letterSpacing};
  color: ${theme.typography.h1.color};
  line-height: 1.1;
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}) {
    font-size: 60px;
  }
`;

export const H2 = styled.h2`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.typography.h2.fontSize};
  font-weight: ${theme.typography.h2.fontWeight};
  letter-spacing: ${theme.typography.h2.letterSpacing};
  color: ${theme.typography.h2.color};
  line-height: 1.15;
  margin: 0;

  @media (min-width: ${theme.breakpoints.lg}) {
    font-size: 60px;
  }
`;

export const H3 = styled.h3`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.typography.h3.fontSize};
  font-weight: ${theme.typography.h3.fontWeight};
  letter-spacing: ${theme.typography.h3.letterSpacing};
  color: ${theme.typography.h3.color};
  line-height: 1.4;
  margin: 0;
`;

export const Body = styled.p`
  font-family: ${theme.fonts.body};
  font-size: ${theme.typography.body.fontSize};
  font-weight: ${theme.typography.body.fontWeight};
  line-height: ${theme.typography.body.lineHeight};
  color: ${theme.typography.body.color};
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}) {
    font-size: 16px;
  }
`;

export const Eyebrow = styled.span`
  font-family: ${theme.fonts.heading};
  font-size: ${theme.typography.eyebrow.fontSize};
  font-weight: ${theme.typography.eyebrow.fontWeight};
  letter-spacing: ${theme.typography.eyebrow.letterSpacing};
  text-transform: ${theme.typography.eyebrow.textTransform};
  color: ${theme.typography.eyebrow.color};
  display: inline-block;
`;

export const GradientText = styled.span`
  background: ${theme.gradient.text};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;
