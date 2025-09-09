export const Colors = {
  light: {
    primary: '#FF6B35',
    secondary: '#FFFFFF',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#6C757D',
    border: '#E9ECEF',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
  },
  dark: {
    primary: '#FF6B35',
    secondary: '#1A1A1A',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0BEC5',
    border: '#333333',
    error: '#FF5252',
    success: '#4CAF50',
    warning: '#FFC107',
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};