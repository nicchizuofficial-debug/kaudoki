import { useColorScheme } from 'react-native';

export interface AppTheme {
  mode: 'light' | 'dark';
  page: string;
  surface: string;
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  gridline: string;
  border: string;
  seriesBlue: string;
  accentRed: string;
  goodGreen: string;
  ctaFrom: string;
  ctaTo: string;
  shopAmazon: string;
  shopRakuten: string;
  shopYahoo: string;
  shadowColor: string;
  shadowOpacity: number;
}

const light: AppTheme = {
  mode: 'light',
  page: '#f9f9f7',
  surface: '#fcfcfb',
  primaryText: '#0b0b0b',
  secondaryText: '#52514e',
  mutedText: '#898781',
  gridline: '#e1e0d9',
  border: 'rgba(11,11,11,0.08)',
  seriesBlue: '#2a78d6',
  accentRed: '#e34948',
  goodGreen: '#0ca30c',
  ctaFrom: '#eb6834',
  ctaTo: '#e34948',
  shopAmazon: '#eb6834',
  shopRakuten: '#e34948',
  shopYahoo: '#4a3aa7',
  shadowColor: '#0b0b0b',
  shadowOpacity: 0.08,
};

const dark: AppTheme = {
  mode: 'dark',
  page: '#0d0d0d',
  surface: '#1a1a19',
  primaryText: '#ffffff',
  secondaryText: '#c3c2b7',
  mutedText: '#898781',
  gridline: '#2c2c2a',
  border: 'rgba(255,255,255,0.10)',
  seriesBlue: '#3987e5',
  accentRed: '#e66767',
  goodGreen: '#0ca30c',
  ctaFrom: '#d95926',
  ctaTo: '#e66767',
  shopAmazon: '#d95926',
  shopRakuten: '#e66767',
  shopYahoo: '#9085e9',
  shadowColor: '#000000',
  shadowOpacity: 0.45,
};

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export function cardShadow(theme: AppTheme) {
  return {
    shadowColor: theme.shadowColor,
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  } as const;
}
