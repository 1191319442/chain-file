
import axios from 'axios';
import { SessionManager } from './SessionManager';
import { User, Session, LoginCredentials, RegisterData } from '@/types/auth';

// Create a simple apiClient for auth operations
const API_BASE_URL = 'http://localhost:8080/api'; // Your API base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Simple crypto service for key generation
class CryptoService {
  static generateKeyPair() {
    // This is a simplified version - in a real app you'd use actual crypto libraries
    const randomId = Math.random().toString(36).substring(2, 15);
    return {
      privateKey: `private_${randomId}`,
      publicKey: `public_${randomId}`
    };
  }
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<Session | null> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.token) {
        const session: Session = {
          token: response.data.token,
          user: response.data.user,
          expiresAt: response.data.expiresAt || (Date.now() + 24 * 60 * 60 * 1000)
        };
        
        SessionManager.saveSession(session);
        return session;
      }
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  static async register(data: RegisterData): Promise<boolean> {
    try {
      const keyPair = CryptoService.generateKeyPair();
      
      const response = await apiClient.post('/auth/register', {
        ...data,
        publicKey: keyPair.publicKey
      });
      
      if (response.data.success) {
        localStorage.setItem('user_private_key', keyPair.privateKey);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  static async validateSession(): Promise<boolean> {
    try {
      await apiClient.get('/auth/validate');
      return true;
    } catch {
      SessionManager.clearSession();
      return false;
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      SessionManager.clearSession();
    }
  }

  static isAdmin(user: User | null): boolean {
    return user?.role === 'admin';
  }

  static async updateProfile(data: { username?: string }): Promise<boolean> {
    try {
      const response = await apiClient.put('/auth/profile', data);
      
      if (response.data.success) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }
}
