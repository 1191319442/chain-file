
/**
 * 登录与注册页面组件
 * 提供用户登录和注册功能
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Logo from '@/components/common/Logo';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  
  // 获取重定向前的路径
  const from = location.state?.from?.pathname || "/dashboard";
  
  // 如果已经登录，重定向到相应页面
  useEffect(() => {
    if (isAuthenticated) {
      // 如果是管理员，可以考虑重定向到管理员页面
      const redirectTo = isAdmin ? "/admin/files" : from;
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <Logo size="medium" showText={true} />

        <Card>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>账户登录</CardTitle>
                <CardDescription>
                  输入您的账户信息登录系统
                </CardDescription>
              </CardHeader>
              <LoginForm isLoading={isLoading} setIsLoading={setIsLoading} />
            </TabsContent>
            
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>创建账户</CardTitle>
                <CardDescription>
                  注册一个新账户以使用所有功能
                </CardDescription>
              </CardHeader>
              <RegisterForm isLoading={isLoading} setIsLoading={setIsLoading} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
