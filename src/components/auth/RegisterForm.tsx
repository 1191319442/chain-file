
/**
 * 注册表单组件
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardContent, CardFooter } from "@/components/ui/card";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface RegisterFormProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ isLoading, setIsLoading }) => {
  const { register } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 处理注册表单变化
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
    setRegisterError(null); // 清除错误消息
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
    <form onSubmit={handleRegisterSubmit}>
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
  );
};

export default RegisterForm;
