
/**
 * 认证上下文组件
 * 管理用户登录状态和认证相关功能
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { AuthService, User, Session } from "@/api/authService";

// 认证上下文类型定义
interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  user: User | null;
  session: Session | null;
  updateProfile: (data: { username?: string }) => Promise<boolean>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供器组件
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  // 初始化认证状态和监听变化
  useEffect(() => {
    // 设置认证状态监听器
    const unsubscribe = AuthService.addListener((newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsAuthenticated(!!newSession);

      // 对状态变化做出反应
      if (newSession && !session) {
        toast({
          title: "登录成功",
          description: `欢迎回来！`,
        });
      } else if (!newSession && session) {
        toast({
          title: "已登出",
          description: "您已成功退出系统",
        });
      }
    });

    // 清理订阅
    return () => {
      unsubscribe();
    };
  }, [toast, session]);

  /**
   * 更新用户资料
   * @param data 要更新的数据
   * @returns 更新是否成功
   */
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

  /**
   * 登录方法
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 登录是否成功
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const success = await AuthService.login(email, password);
      
      if (!success) {
        throw new Error("邮箱或密码不正确");
      }
      
      return true;
    } catch (error: any) {
      console.error('登录失败', error);
      toast({
        title: "登录失败",
        description: error.message || "无法验证您的凭据，请重试",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * 注册方法
   * @param username 用户名
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 注册是否成功
   */
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const success = await AuthService.register(username, email, password);

      if (!success) {
        throw new Error("注册失败");
      }
      
      toast({
        title: "注册成功",
        description: "您的账户已创建，请登录",
      });
      
      return true;
    } catch (error: any) {
      console.error('注册失败', error);
      toast({
        title: "注册失败",
        description: error.message || "无法创建账户，请重试",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * 登出方法
   */
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error: any) {
      console.error('登出失败', error);
      toast({
        title: "登出失败",
        description: "退出系统时出现错误，请重试",
        variant: "destructive",
      });
    }
  };

  // 提供认证上下文值
  const value = {
    isAuthenticated,
    login,
    register,
    logout,
    user,
    session,
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
