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

export interface MonthlyEntry {
  month: number;
  E_d: number;
  E_m: number;
  [key: string]: number | string | undefined;
}

export interface CalculationResultTotalsFixed {
  E_d: number;
  E_m: number;
  E_y: number;
  [key: string]: number | string | undefined;
}

export interface CalculationResult {
  latitude: number;
  longitude: number;
  elevation: number;
  meteo_data: {
    year_min: number;
    year_max: number;
  };
  mounting_system: {
    fixed: {
      slope: { value: number; optimal: boolean };
      azimuth: { value: number; optimal: boolean };
      type: string;
    };
  };
  pv_module: {
    technology: string;
    peak_power: number;
    system_loss: number;
  };
  economic_data: Record<string, number | null>;
  outputs: {
    monthly: {
      fixed: MonthlyEntry[];
    };
    totals: {
      fixed: CalculationResultTotalsFixed;
    };
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