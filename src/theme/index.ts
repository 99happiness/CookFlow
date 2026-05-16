export const Colors = {
  background: '#FDF6EC',
  cardBackground: '#FFFFFF',
  primary: '#E07A5F',
  primaryDark: '#C4583C',
  secondary: '#81B29A',
  accent: '#F2CC8F',
  textPrimary: '#2D2D2D',
  textSecondary: '#6B6B6B',
  textLight: '#999999',
  border: '#E8E0D4',
  shadow: '#00000015',
  white: '#FFFFFF',
  black: '#1A1A1A',
  cookingBg: '#1A1A2E',
  cookingText: '#FFFFFF',
  cookingAccent: '#E07A5F',
  cookingRing: '#F2CC8F',
  cookingRingBg: '#2D2D4A',
  success: '#81B29A',
  danger: '#E07A5F',
};

export const Fonts = {
  titleLarge: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  titleMedium: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  titleSmall: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textLight,
  },
  cookingStep: {
    fontSize: 32,
    fontWeight: '600' as const,
    color: Colors.cookingText,
  },
  cookingTimer: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.cookingText,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  button: {
    shadowColor: '#E07A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};
