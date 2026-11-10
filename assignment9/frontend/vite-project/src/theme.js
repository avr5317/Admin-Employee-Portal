import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Every text/background pair below was checked for WCAG AA (4.5:1) in both modes.
const palettes = {
  light: {
    primary: { main: '#3846A8', contrastText: '#FFFFFF' },
    secondary: { main: '#00695C', contrastText: '#FFFFFF' },
    success: { main: '#1B7A38', contrastText: '#FFFFFF' },
    error: { main: '#B3261E', contrastText: '#FFFFFF' },
    background: { default: '#F6F7FB', paper: '#FFFFFF' },
    text: { primary: '#1B1E2E', secondary: '#4B516B' },
    divider: 'rgba(27, 30, 46, 0.14)',
    inputBorder: '#767C94', // >= 3:1 against the paper color
    grey: {
      50: '#F6F7FB', 100: '#E8EAF2', 200: '#D5D9E6', 300: '#B8BDD0', 400: '#9096AE',
      500: '#767C94', 600: '#5D637B', 700: '#4B516B', 800: '#33374D', 900: '#1B1E2E',
    },
  },
  dark: {
    primary: { main: '#A5B0F2', contrastText: '#10142B' },
    secondary: { main: '#5CD0BE', contrastText: '#05211C' },
    success: { main: '#6FD08A', contrastText: '#07210F' },
    error: { main: '#F2928B', contrastText: '#2B0805' },
    background: { default: '#0E1120', paper: '#171B2E' },
    text: { primary: '#E9EBF8', secondary: '#AEB4D2' },
    divider: 'rgba(233, 235, 248, 0.16)',
    inputBorder: '#7F86A8', // >= 3:1 against the paper color
    grey: {
      50: '#E9EBF8', 100: '#D3D7EC', 200: '#AEB4D2', 300: '#8D94B8', 400: '#6F7699',
      500: '#565D80', 600: '#3F4566', 700: '#2B3050', 800: '#171B2E', 900: '#0E1120',
    },
  },
};

const fontStack =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function getTheme(mode) {
  const { inputBorder, ...palette } = palettes[mode];

  const theme = createTheme({
    palette: { mode, ...palette },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: fontStack,
      h1: { fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' },
      h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
      h3: { fontSize: '1.625rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' },
      h4: { fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.3 },
      h5: { fontSize: '1.1875rem', fontWeight: 600, lineHeight: 1.35 },
      h6: { fontSize: '1.0625rem', fontWeight: 600, lineHeight: 1.4 },
      subtitle1: { fontSize: '1.0625rem', lineHeight: 1.5 },
      body1: { fontSize: '1rem', lineHeight: 1.65 },
      body2: { fontSize: '0.9375rem', lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (t) => ({
          body: { minWidth: 320 },
          // Visible keyboard focus everywhere
          'a:focus-visible, button:focus-visible, [tabindex]:focus-visible, summary:focus-visible': {
            outline: `3px solid ${t.palette.primary.main}`,
            outlineOffset: 2,
          },
          // Skip-to-content link (visible only when focused)
          '.skip-link': {
            position: 'absolute',
            left: 8,
            top: -100,
            zIndex: t.zIndex.tooltip + 1,
            padding: '10px 16px',
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: 'none',
            backgroundColor: t.palette.primary.main,
            color: t.palette.primary.contrastText,
          },
          '.skip-link:focus': { top: 8 },
          // Respect reduced-motion preferences
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        }),
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, fontWeight: 600 },
          sizeLarge: { padding: '10px 22px', fontSize: '1rem' },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme: t }) => ({
            borderRadius: 16,
            border: `1px solid ${t.palette.divider}`,
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: 16 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme: t }) => ({
            backgroundImage: 'none',
            backgroundColor: t.palette.background.paper,
            color: t.palette.text.primary,
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 10 },
          notchedOutline: { borderColor: inputBorder },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8 },
        },
      },
    },
  });

  return responsiveFontSizes(theme, { factor: 2.5 });
}
