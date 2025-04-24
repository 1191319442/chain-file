import { supabase } from '@/integrations/supabase/client';
import { SessionManager } from './SessionManager';
import { User, Session, LoginCredentials, RegisterData } from '@/types/auth';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<Session | null> {
    try {
      // 使用 Supabase 进行身份验证
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw error;
      
      if (authData.session) {
        // 检查用户角色是否为管理员
        if (credentials.isAdmin) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
          // 临时使用username字段判断管理员权限
          if (!profileData || profileData.username !== 'admin') {
            throw new Error('您没有管理员权限');
          }
        }
        
        // 获取用户的配置文件
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        // 判断是否为管理员
        const isAdmin = (profileData && profileData.username === 'admin');
        
        // 构造会话对象
        const session: Session = {
          token: authData.session.access_token,
          user: {
            id: authData.user.id,
            email: authData.user.email || '',
            username: profileData?.username || authData.user.email || '',
            role: isAdmin ? 'admin' : 'user',
            publicKey: authData.user.user_metadata?.publicKey || ''
          },
          expiresAt: new Date(authData.session.expires_at || 0).getTime()
        };
        
        SessionManager.saveSession(session);
        return session;
      }
      return null;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  static async register(data: RegisterData): Promise<boolean> {
    try {
      // 生成密钥对
      const keyPair = CryptoService.generateKeyPair();
      
      // 使用 Supabase 注册用户
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            publicKey: keyPair.publicKey,
            role: 'user' // 默认为普通用户
          }
        }
      });
      
      if (error) throw error;
      
      // 存储私钥
      localStorage.setItem('user_private_key', keyPair.privateKey);
      
      return true;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  }

  static async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        SessionManager.clearSession();
        return false;
      }
      return true;
    } catch {
      SessionManager.clearSession();
      return false;
    }
  }

  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      SessionManager.clearSession();
    }
  }

  static isAdmin(user: User | null): boolean {
    return user?.role === 'admin';
  }

  static async updateProfile(data: { username?: string }): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: data
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('资料更新失败:', error);
      throw error;
    }
  }
}

// 简化的加密服务，实际应用中应使用更安全的实现
class CryptoService {
  static generateKeyPair() {
    // 生成随机ID作为示例
    const randomId = Math.random().toString(36).substring(2, 15);
    return {
      privateKey: `private_${randomId}`,
      publicKey: `public_${randomId}`
    };
  }
}
