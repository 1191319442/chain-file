
import apiClient from '../api/apiClient';
import { CryptoService } from '../api/cryptoService';
import { SessionManager } from './SessionManager';
import { User, Session, LoginCredentials, RegisterData } from '@/types/auth';

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
}
