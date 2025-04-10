
/**
 * 登录表单组件
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface LoginFormProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginForm: React.FC<LoginFormProps> = ({ isLoading, setIsLoading }) => {
  const { login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // 处理登录表单变化
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    setLoginError(null); // 清除错误消息
  };

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

  return (
    <form onSubmit={handleLoginSubmit}>
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
  );
};

export default LoginForm;
