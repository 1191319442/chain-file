
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAdminRole, setHasAdminRole] = useState(false);

  useEffect(() => {
    const verifyAdminRole = async () => {
      if (!isAuthenticated || !user) {
        setIsVerifying(false);
        return;
      }

      try {
        // 从 Supabase 查询用户的角色
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        const isUserAdmin = data?.role === 'admin';
        setHasAdminRole(isUserAdmin);
        
        if (!isUserAdmin) {
          toast({
            title: "访问被拒绝",
            description: "您没有管理员权限访问此页面",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('验证管理员权限失败:', error);
        setHasAdminRole(false);
        
        toast({
          title: "权限验证失败",
          description: "无法验证您的管理员权限",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdminRole();
  }, [isAuthenticated, user, toast]);

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">验证权限中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAdminRole) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
