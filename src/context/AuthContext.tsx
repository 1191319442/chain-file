
/**
 * 认证上下文组件
 * 管理用户登录状态和认证相关功能
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// 认证上下文类型定义
interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: any | null;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供器组件
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const { toast } = useToast();

  // 组件挂载时检查本地存储中的认证信息
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('解析用户信息失败', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  /**
   * 登录方法
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 登录是否成功
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: 替换为后端API - 登录接口
      // const response = await api.post('/auth/login', { email, password });
      // const { token, user } = response.data;
      
      // 模拟成功响应
      const token = 'mock_token_' + Date.now();
      const mockUser = { id: '1', email, username: email.split('@')[0] };
      
      // 存储认证信息
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // 更新状态
      setIsAuthenticated(true);
      setUser(mockUser);
      
      toast({
        title: "登录成功",
        description: `欢迎回来，${mockUser.username}！`,
      });
      
      return true;
    } catch (error) {
      console.error('登录失败', error);
      toast({
        title: "登录失败",
        description: "无法验证您的凭据，请重试",
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
      // TODO: 替换为后端API - 注册接口
      // const response = await api.post('/auth/register', { username, email, password });
      // const { token, user } = response.data;
      
      // 模拟成功响应
      const token = 'mock_token_' + Date.now();
      const mockUser = { id: '1', email, username };
      
      // 存储认证信息
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // 更新状态
      setIsAuthenticated(true);
      setUser(mockUser);
      
      toast({
        title: "注册成功",
        description: "您的账户已创建并登录成功！",
      });
      
      return true;
    } catch (error) {
      console.error('注册失败', error);
      toast({
        title: "注册失败",
        description: "无法创建账户，请重试",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * 登出方法
   */
  const logout = () => {
    // TODO: 替换为后端API - 登出接口
    // await api.post('/auth/logout');
    
    // 清除本地存储
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // 更新状态
    setIsAuthenticated(false);
    setUser(null);
    
    toast({
      title: "已登出",
      description: "您已成功退出系统",
    });
  };

  // 提供认证上下文值
  const value = {
    isAuthenticated,
    login,
    register,
    logout,
    user
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
