
import { Session } from '@/types/auth';

export class SessionManager {
  private static readonly SESSION_KEY = 'auth_session';
  private static readonly TOKEN_KEY = 'auth_token';

  static saveSession(session: Session): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(this.TOKEN_KEY, session.token);
  }

  static getSession(): Session | null {
    const savedSession = localStorage.getItem(this.SESSION_KEY);
    if (!savedSession) return null;
    try {
      return JSON.parse(savedSession) as Session;
    } catch {
      return null;
    }
  }

  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isSessionValid(session: Session): boolean {
    return session.expiresAt > Date.now();
  }
}
