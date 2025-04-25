
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LoginCredentials } from '@/types/auth';
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';

interface LoginFormProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginForm: React.FC<LoginFormProps> = ({ isLoading, setIsLoading }) => {
  const { login } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
    setLoginError(null);
  };

  const verifyAdminAccess = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_accounts')
        .select('email')
        .eq('email', email)
        .single();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error verifying admin access:', error);
      return false;
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setHasAttemptedLogin(true);
    
    if (!loginForm.email || !loginForm.password) {
      setLoginError("请填写所有必填字段");
      return;
    }

    if (isAdminLogin) {
      const isAdmin = await verifyAdminAccess(loginForm.email);
      if (!isAdmin) {
        setLoginError("管理员登录失败：无效的管理员账户");
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      // For admin login, check if the credentials match root@example.com/123456
      if (isAdminLogin && loginForm.email === 'root@example.com' && loginForm.password !== '123456') {
        setLoginError("管理员登录失败：密码错误");
        return;
      }

      const success = await login({
        ...loginForm,
        isAdmin: isAdminLogin
      });
      
      if (!success) {
        setLoginError(isAdminLogin ? "管理员登录失败" : "登录失败，请检查您的邮箱和密码");
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

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="admin-login"
            checked={isAdminLogin}
            onCheckedChange={(checked) => {
              if (!hasAttemptedLogin) {
                setIsAdminLogin(checked as boolean);
              }
            }}
            disabled={hasAttemptedLogin || isLoading}
          />
          <Label 
            htmlFor="admin-login" 
            className={hasAttemptedLogin ? "text-muted-foreground" : ""}
          >
            管理员登录
          </Label>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isAdminLogin ? '管理员登录中...' : '登录中...'}
            </>
          ) : (isAdminLogin ? '管理员登录' : '登录')}
        </Button>
      </CardFooter>
    </form>
  );
};

export default LoginForm;
