
/**
 * 登录与注册页面组件
 * 提供用户登录和注册功能
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileText, User, Lock, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, login, register } = useAuth();
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  
  // 获取重定向前的路径
  const from = location.state?.from?.pathname || "/dashboard";
  
  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 错误信息
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // 处理登录表单变化
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    setLoginError(null); // 清除错误消息
  };

  // 处理注册表单变化
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
    setRegisterError(null); // 清除错误消息
  };

  // 如果已经登录，重定向到主页
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // 处理登录提交
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    // 简单验证
    if (!loginForm.email || !loginForm.password) {
      setLoginError("请填写所有必填字段");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用登录方法
      const success = await login(loginForm.email, loginForm.password);
      
      if (!success) {
        setLoginError("登录失败，请检查您的邮箱和密码");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 处理注册提交
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    
    // 简单验证
    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setRegisterError("请填写所有必填字段");
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError("两次输入的密码不匹配");
      return;
    }

    if (registerForm.password.length < 6) {
      setRegisterError("密码长度必须至少为6个字符");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用注册方法
      const success = await register(
        registerForm.username,
        registerForm.email,
        registerForm.password
      );
      
      if (success) {
        // 清空表单
        setRegisterForm({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setRegisterError("注册失败，请重试");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded bg-primary/10 p-2 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">链文件系统</h2>
          <p className="mt-2 text-sm text-gray-600">
            安全、透明的区块链文件管理平台
          </p>
        </div>

        <Card>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit}>
                <CardHeader>
                  <CardTitle>账户登录</CardTitle>
                  <CardDescription>
                    输入您的账户信息登录系统
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="login-email" 
                        name="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        className="pl-10"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="login-password" 
                        name="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        登录中...
                      </>
                    ) : "登录"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit}>
                <CardHeader>
                  <CardTitle>创建账户</CardTitle>
                  <CardDescription>
                    注册一个新账户以使用所有功能
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {registerError && (
                    <Alert variant="destructive">
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="register-username">用户名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="register-username" 
                        name="username" 
                        placeholder="用户名" 
                        className="pl-10"
                        value={registerForm.username}
                        onChange={handleRegisterChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="register-email" 
                        name="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        className="pl-10"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="register-password" 
                        name="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">确认密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="register-confirm-password" 
                        name="confirmPassword" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10"
                        value={registerForm.confirmPassword}
                        onChange={handleRegisterChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        注册中...
                      </>
                    ) : "注册"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
