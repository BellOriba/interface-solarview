import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, PanelModel, CalculationRequest, CalculationResult } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://wb-solarview.onrender.com';
const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD || '';

class ApiService {
  private adminApiKey: string | null = null;

  private async getHeaders(apiKey?: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as T;
  }

  async getAdminApiKey(): Promise<string> {
    if (this.adminApiKey) {
      return this.adminApiKey;
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Admin credentials are not configured. Please set EXPO_PUBLIC_ADMIN_EMAIL and EXPO_PUBLIC_ADMIN_PASSWORD environment variables.');
    }

    try {
      const params = new URLSearchParams();
      params.append('email', ADMIN_EMAIL);
      params.append('password', ADMIN_PASSWORD);
      
      const response = await fetch(
        `${API_BASE_URL}/auth/login?${params.toString()}`,
        {
          method: 'POST',
          headers: await this.getHeaders()
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Admin login failed: ${error}`);
      }

      const data: { api_key: string } = await response.json();
      
      if (!data.api_key) {
        throw new Error('No API key received in the response');
      }
      
      this.adminApiKey = data.api_key;
      return this.adminApiKey;
    } catch (error) {
      console.error('Error getting admin API key:', error);
      throw new Error(`Failed to get admin API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async login(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const params = new URLSearchParams();
      params.append('email', email);
      params.append('password', password);
      
      const response = await fetch(
        `${API_BASE_URL}/auth/login?${params.toString()}`,
        {
          method: 'POST',
          headers: await this.getHeaders()
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
      }

      const user = await response.json();
      
      if (!user.api_key) {
        throw new Error('No API key received in the response');
      }
      
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('apiKey', user.api_key);

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async register(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const adminApiKey = await this.getAdminApiKey();
      
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: await this.getHeaders(adminApiKey),
        body: JSON.stringify({
          email,
          password,
          is_admin: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Registration failed');
      }

      return this.login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCurrentUser(apiKey: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: await this.getHeaders(apiKey),
    });

    return this.handleResponse<User>(response);
  }

  async rotateApiKey(currentApiKey: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/rotate-key`, {
      method: 'POST',
      headers: await this.getHeaders(currentApiKey),
    });

    const data = await this.handleResponse<{ api_key: string }>(response);
    
    await AsyncStorage.setItem('apiKey', data.api_key);
    
    return data.api_key;
  }

  async getPanelModels(apiKey: string, filters?: {
    manufacturer?: string;
    min_capacity?: number;
    min_efficiency?: number;
    panel_type?: string;
  }): Promise<PanelModel[]> {
    let url = `${API_BASE_URL}/api/panel-models/`;
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getHeaders(apiKey),
    });

    return this.handleResponse<PanelModel[]>(response);
  }

  async getPanelModel(apiKey: string, modelId: string): Promise<PanelModel> {
    const response = await fetch(`${API_BASE_URL}/api/panel-models/${modelId}`, {
      method: 'GET',
      headers: await this.getHeaders(apiKey),
    });

    return this.handleResponse<PanelModel>(response);
  }

  async createPanelModel(apiKey: string, model: Omit<PanelModel, 'id'>): Promise<PanelModel> {
    const response = await fetch(`${API_BASE_URL}/api/panel-models/`, {
      method: 'POST',
      headers: await this.getHeaders(apiKey),
      body: JSON.stringify(model),
    });

    return this.handleResponse<PanelModel>(response);
  }

  async updatePanelModel(apiKey: string, modelId: string, updates: Partial<PanelModel>): Promise<PanelModel> {
    const response = await fetch(`${API_BASE_URL}/api/panel-models/${modelId}`, {
      method: 'PUT',
      headers: await this.getHeaders(apiKey),
      body: JSON.stringify(updates),
    });

    return this.handleResponse<PanelModel>(response);
  }

  async deletePanelModel(apiKey: string, modelId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/panel-models/${modelId}`, {
      method: 'DELETE',
      headers: await this.getHeaders(apiKey),
    });

    await this.handleResponse<void>(response);
  }

  async calculateSolarProduction(apiKey: string, request: CalculationRequest): Promise<CalculationResult> {
    const response = await fetch(`${API_BASE_URL}/calculate`, {
      method: 'POST',
      headers: await this.getHeaders(apiKey),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CalculationResult>(response);
  }

  async checkHealth(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });

    return this.handleResponse<{ status: string }>(response);
  }
}

export const apiService = new ApiService();