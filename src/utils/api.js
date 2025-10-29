// Cliente HTTP para comunicação com o backend
import config from '../config/index.js';

const API_BASE_URL = config.API_URL;

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Se token expirou ou é inválido, redirecionar para login
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }

  // Métodos de autenticação
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe() {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
