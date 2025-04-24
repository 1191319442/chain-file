/**
 * 认证上下文组件
 * 管理用户登录状态和认证相关功能
 */

import React, { createContext, useContext } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from "@/hooks/use-toast";
import { AuthService } from '@/services/auth/AuthService';
import { LoginCredentials, RegisterData, User, Session } from '@/types/auth';

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
      const newSession = await AuthService.login(credentials);
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        toast({
          title: "登录成功",
          description: `欢迎回来！`,
        });
        return true;
      }
      throw new Error("登录失败");
    } catch (error: any) {
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
      const success = await AuthService.register(data);
      if (success) {
        toast({
          title: "注册成功",
          description: "您的账户已创建，请登录",
        });
        return true;
      }
      throw new Error("注册失败");
    } catch (error: any) {
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
      await AuthService.logout();
      setSession(null);
      setUser(null);
      toast({
        title: "已登出",
        description: "您已成功退出系统",
      });
    } catch (error: any) {
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
      
      const success = await AuthService.updateProfile(data);
      
      if (!success) throw new Error("更新失败");
      
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

  // 提供认证上下文值
  const value = {
    isAuthenticated,
    isAdmin: AuthService.isAdmin(user),
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
