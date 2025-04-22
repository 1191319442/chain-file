
import apiClient from './apiClient';
import { CryptoService } from './cryptoService';

export interface User {
  id: string;
  username: string;
  email: string;
  publicKey?: string;
  role?: string;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: number; // UNIX时间戳
}

export class AuthService {
  private static currentSession: Session | null = null;
  private static listeners: ((session: Session | null) => void)[] = [];

  /**
   * 初始化认证服务
   */
  static async initialize() {
    // 从本地存储中恢复会话
    const savedSession = localStorage.getItem('auth_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession) as Session;
        // 检查会话是否过期
        if (session.expiresAt > Date.now()) {
          this.setSession(session);
          // 验证token有效性
          await this.validateToken();
        } else {
          // 会话已过期，清除
          this.clearSession();
        }
      } catch (error) {
        console.error('恢复会话失败:', error);
        this.clearSession();
      }
    }
  }

  /**
   * 验证当前token是否有效
   */
  private static async validateToken() {
    try {
      await apiClient.get('/auth/validate');
      return true;
    } catch (error) {
      this.clearSession();
      return false;
    }
  }

  /**
   * 用户注册
   */
  static async register(username: string, email: string, password: string): Promise<boolean> {
    try {
      // 生成用户的椭圆曲线密钥对
      const keyPair = CryptoService.generateKeyPair();
      
      // 计算密码哈希值（实际上后端会重新计算哈希值，这里只是演示）
      const passwordHash = CryptoService.hashPassword(password);
      
      // 发送注册请求
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        passwordHash,
        publicKey: keyPair.publicKey
      });
      
      // 如果注册成功，将私钥安全地存储在本地
      if (response.data.success) {
        // 注意：在生产环境中，应该采取更安全的措施来存储私钥
        // 这里仅作为示例
        localStorage.setItem('user_private_key', keyPair.privateKey);
        return true;
      }
      return false;
    } catch (error) {
      console.error('注册失败:', error);
      return false;
    }
  }

  /**
   * 用户登录
   */
  static async login(email: string, password: string): Promise<boolean> {
    try {
      // 发送登录请求
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      if (response.data.token) {
        // 创建会话对象
        const session: Session = {
          token: response.data.token,
          user: response.data.user,
          expiresAt: response.data.expiresAt || (Date.now() + 24 * 60 * 60 * 1000) // 默认24小时
        };
        
        // 设置当前会话
        this.setSession(session);
        return true;
      }
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  }

  /**
   * 用户注销
   */
  static async logout(): Promise<void> {
    try {
      // 调用后端注销接口
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('注销请求失败:', error);
    } finally {
      // 无论注销请求是否成功，都清除本地会话
      this.clearSession();
    }
  }

  /**
   * 获取当前会话
   */
  static getSession(): Session | null {
    return this.currentSession;
  }

  /**
   * 获取当前用户
   */
  static getUser(): User | null {
    return this.currentSession?.user || null;
  }

  /**
   * 检查用户是否已登录
   */
  static isAuthenticated(): boolean {
    return !!this.currentSession;
  }

  /**
   * 设置当前会话
   */
  private static setSession(session: Session | null) {
    this.currentSession = session;
    
    if (session) {
      // 将会话保存到本地存储
      localStorage.setItem('auth_session', JSON.stringify(session));
      localStorage.setItem('auth_token', session.token);
    } else {
      this.clearSession();
    }
    
    // 通知所有监听器
    this.notifyListeners();
  }

  /**
   * 清除当前会话
   */
  private static clearSession() {
    this.currentSession = null;
    localStorage.removeItem('auth_session');
    localStorage.removeItem('auth_token');
    // 通知所有监听器
    this.notifyListeners();
  }

  /**
   * 添加会话变化监听器
   */
  static addListener(listener: (session: Session | null) => void) {
    this.listeners.push(listener);
    // 立即通知新监听器当前状态
    listener(this.currentSession);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * 通知所有监听器会话变化
   */
  private static notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.currentSession);
    });
  }

  /**
   * 更新用户资料
   */
  static async updateProfile(data: {username?: string}): Promise<boolean> {
    try {
      const response = await apiClient.put('/auth/profile', data);
      
      if (response.data.success && this.currentSession) {
        // 更新会话中的用户信息
        const updatedSession = {
          ...this.currentSession,
          user: {
            ...this.currentSession.user,
            ...data
          }
        };
        this.setSession(updatedSession);
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新资料失败:', error);
      return false;
    }
  }
}

// 初始化认证服务
AuthService.initialize();
