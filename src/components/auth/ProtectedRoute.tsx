
/**
 * 受保护路由组件
 * 检查用户是否已认证，未认证则重定向到登录页面
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  // 如果未登录，提示并重定向到登录页面
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "需要登录",
        description: "请登录后访问此页面",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, toast]);

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
