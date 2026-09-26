import { useColorScheme } from 'react-native';

const light = {
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F8',
  text: '#0E1726',
  textMuted: '#5B6678',
  textFaint: '#8A94A6',
  border: '#E3E8F0',
  primary: '#0B2A5B',
  primarySoft: '#E6EDF8',
  accent: '#F26B1D',
  accentSoft: '#FFF0E6',
  success: '#16A34A',
  successSoft: '#E8F7EE',
  warning: '#D97706',
  warningSoft: '#FEF3E2',
  danger: '#DC2626',
  tabBar: '#FFFFFF',
  heroFrom: '#0B2A5B',
  heroTo: '#1C4E9C',
};

const dark: typeof light = {
  bg: '#0A0F1A',
  surface: '#131A27',
  surfaceAlt: '#1B2433',
  text: '#F2F5FA',
  textMuted: '#A5AFBF',
  textFaint: '#6F7A8C',
  border: '#232D3E',
  primary: '#6EA2F7',
  primarySoft: '#1A2A45',
  accent: '#FF8A45',
  accentSoft: '#3A2415',
  success: '#34D399',
  successSoft: '#12302A',
  warning: '#FBBF24',
  warningSoft: '#342A12',
  danger: '#F87171',
  tabBar: '#101622',
  heroFrom: '#0B2A5B',
  heroTo: '#16407F',
};

export type Palette = typeof light;

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { c: isDark ? dark : light, isDark };
}

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

export function shadow(isDark: boolean) {
  return {
    shadowColor: '#0E1726',
    shadowOpacity: isDark ? 0 : 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  };
}
