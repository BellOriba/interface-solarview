export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  api_key?: string;
}

export interface PanelModel {
  id: string;
  name: string;
  capacity: number;
  efficiency: number;
  manufacturer: string;
  type: string;
}

export interface CalculationRequest {
  lat: number;
  lon: number;
  peakpower: number;
  loss: number;
}

export interface CalculationResult {
  outputs: {
    monthly: Array<{
      month: number;
      E_m: number;
    }>;
    totals: {
      E_y: number;
    };
  };
  meta: {
    latitude: number;
    longitude: number;
    elevation: number;
    optimal_inclination: number;
    optimal_azimuth: number;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface LanguageContextType {
  language: 'pt-BR' | 'en';
  t: (key: string) => string;
  setLanguage: (lang: 'pt-BR' | 'en') => void;
}