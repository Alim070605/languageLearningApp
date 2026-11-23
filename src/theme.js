import React, { createContext, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';

const base = { primary: '#3D3AF2', onPrimary: '#FFFFFF' };

export const lightColors = {
  ...base,
  isDark: false,
  bg: '#F6F6FB',
  card: '#FFFFFF',
  text: '#14142B',
  muted: '#6E6E85',
  border: '#E2E2EE',
  primarySoft: '#ECECFF',
  yellow: '#FFE7A3',
  onYellow: '#6B4E00',
  green: '#1E8F5C',
  greenSoft: '#E2F5EA',
  red: '#D23C3C',
  redSoft: '#FDEBEB',
  track: '#E4E4F0',
  ink: '#14142B',
  onInk: '#FFFFFF',
};

export const darkColors = {
  ...base,
  isDark: true,
  primary: '#6B69FF',
  bg: '#0F0F1A',
  card: '#1A1A2B',
  text: '#F2F2FA',
  muted: '#9A9AB5',
  border: '#2C2C44',
  primarySoft: '#25254D',
  yellow: '#4A3C10',
  onYellow: '#FFD76A',
  green: '#3CC386',
  greenSoft: '#12362A',
  red: '#FF6B6B',
  redSoft: '#3A1818',
  track: '#2A2A40',
  ink: '#F2F2FA',
  onInk: '#14142B',
};

const Ctx = createContext(lightColors);

export function ThemeProvider({ dark, children }) {
  return <Ctx.Provider value={dark ? darkColors : lightColors}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

// Стили строятся один раз на тему: useStyles(makeStyles)
export function useStyles(factory) {
  const c = useContext(Ctx);
  return useMemo(() => StyleSheet.create(factory(c)), [c]);
}
