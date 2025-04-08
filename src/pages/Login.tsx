
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileText, User, Lock, Mail } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  // 处理登录表单变化
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  // 处理注册表单变化
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  // 处理登录提交
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单验证
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "输入错误",
        description: "请填写所有必填字段",
        variant: "destructive"
      });
      return;
    }
    
    // 这里应该添加实际的登录逻辑
    console.log('登录表单提交:', loginForm);
    
    // 模拟登录成功
    toast({
      title: "登录成功",
      description: "欢迎回来！"
    });
    
    // 登录成功后重定向到主页
    navigate('/');
  };

  // 处理注册提交
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单验证
    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      toast({
        title: "输入错误",
        description: "请填写所有必填字段",
        variant: "destructive"
      });
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "密码错误",
        description: "两次输入的密码不匹配",
        variant: "destructive"
      });
      return;
    }
    
    // 这里应该添加实际的注册逻辑
    console.log('注册表单提交:', registerForm);
    
    // 模拟注册成功
    toast({
      title: "注册成功",
      description: "您的账户已创建成功！"
    });
    
    // 注册成功后重定向到主页
    navigate('/');
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
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    登录
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
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    注册
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
