'use client';

import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${theme.fonts.body};
    background: radial-gradient(circle at top left, #1a1a1a, ${theme.colors.background});
    color: ${theme.colors.foreground};
    min-height: 100vh;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  button {
    font-family: ${theme.fonts.heading};
  }

  code,
  pre,
  .font-mono {
    font-family: ${theme.fonts.mono};
  }

  *:focus-visible {
    outline: ${theme.focus.outline};
    outline-offset: ${theme.focus.outlineOffset};
  }

  @media (min-width: ${theme.breakpoints.md}) {
    body {
      font-size: 16px;
    }
  }
`;


