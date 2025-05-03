
/**
 * 认证上下文组件
 * 管理用户登录状态和认证相关功能
 */

import React, { createContext, useContext } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from "@/hooks/use-toast";
import { LoginCredentials, RegisterData, User, Session } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { CryptoService } from '@/api/cryptoService';

// 认证上下文类型定义
interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  session: Session | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { username?: string }) => Promise<boolean>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供器组件
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, session, setSession, isAuthenticated } = useAuthState();
  const { toast } = useToast();
  
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // 使用 Supabase 进行身份验证
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw error;
      
      // 验证管理员权限（如果需要）
      if (credentials.isAdmin && data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', data.user.id)
          .single();
        
        if (!profileData || !profileData.is_admin) {
          throw new Error('您没有管理员权限');
        }
      }

      toast({
        title: "登录成功",
        description: `欢迎回来！`,
      });
      
      return true;
    } catch (error: any) {
      console.error('登录失败:', error);
      toast({
        title: "登录失败",
        description: error.message || "无法验证您的凭据，请重试",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      // 生成加密密钥对
      const keyPair = CryptoService.generateKeyPair();

      // 使用 Supabase 注册用户
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            publicKey: keyPair.publicKey
          }
        }
      });
      
      if (error) throw error;
      
      // 存储私钥到本地存储
      localStorage.setItem('user_private_key', keyPair.privateKey);
      
      toast({
        title: "注册成功",
        description: "您的账户已创建，请登录",
      });
      
      return true;
    } catch (error: any) {
      console.error('注册失败:', error);
      toast({
        title: "注册失败",
        description: error.message || "无法创建账户，请重试",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "已登出",
        description: "您已成功退出系统",
      });
    } catch (error: any) {
      console.error('登出失败:', error);
      toast({
        title: "登出失败",
        description: "退出系统时出现错误，请重试",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (data: { username?: string }): Promise<boolean> => {
    try {
      if (!user) throw new Error("用户未登录");
      
      // 更新 Supabase 用户元数据
      const { error: updateError } = await supabase.auth.updateUser({
        data: data
      });
      
      if (updateError) throw updateError;
      
      // 更新本地用户状态
      if (data.username && user) {
        const updatedUser = {...user, username: data.username};
        setUser(updatedUser);
        
        // 更新会话中的用户信息
        if (session) {
          setSession({
            ...session,
            user: updatedUser
          });
        }
      }
      
      toast({
        title: "更新成功",
        description: "您的个人资料已更新",
      });
      
      return true;
    } catch (error: any) {
      console.error('更新资料失败', error);
      toast({
        title: "更新资料失败",
        description: error.message || "无法更新您的资料，请重试",
        variant: "destructive",
      });
      return false;
    }
  };

  // 判断用户是否为管理员
  const isAdmin = user?.role === 'admin';

  // 提供认证上下文值
  const value: AuthContextType = {
    isAuthenticated,
    isAdmin,
    user,
    session,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 使用认证上下文的自定义Hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
