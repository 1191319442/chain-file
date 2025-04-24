
import { useState, useEffect } from 'react';
import { User, Session } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. 设置认证状态变更监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        console.log('Auth state changed:', event);
        
        if (supabaseSession) {
          try {
            // 获取用户信息
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', supabaseSession.user.id)
              .single();
            
            // 判断用户是否为管理员（目前使用username字段判断）
            const isAdmin = (profileData && profileData.username === 'admin');
            
            const newUser: User = {
              id: supabaseSession.user.id,
              username: profileData?.username || supabaseSession.user.email || '',
              email: supabaseSession.user.email || '',
              role: isAdmin ? 'admin' : 'user',
              publicKey: supabaseSession.user.user_metadata.publicKey
            };
            
            const newSession: Session = {
              token: supabaseSession.access_token,
              user: newUser,
              expiresAt: new Date(supabaseSession.expires_at || 0).getTime()
            };
            
            setUser(newUser);
            setSession(newSession);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Failed to get user profile:', error);
            setUser(null);
            setSession(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
        }
      }
    );

    // 2. 检查当前会话状态
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        
        if (supabaseSession) {
          try {
            // 获取用户信息
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', supabaseSession.user.id)
              .single();
              
            // 判断用户是否为管理员（目前使用username字段判断）
            const isAdmin = (profileData && profileData.username === 'admin');
            
            const newUser: User = {
              id: supabaseSession.user.id,
              username: profileData?.username || supabaseSession.user.email || '',
              email: supabaseSession.user.email || '',
              role: isAdmin ? 'admin' : 'user',
              publicKey: supabaseSession.user.user_metadata.publicKey
            };
            
            const newSession: Session = {
              token: supabaseSession.access_token,
              user: newUser,
              expiresAt: new Date(supabaseSession.expires_at || 0).getTime()
            };
            
            setUser(newUser);
            setSession(newSession);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Failed to get user profile:', error);
            setUser(null);
            setSession(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('获取会话失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // 清理订阅
    return () => { subscription.unsubscribe(); };
  }, []);

  return {
    user,
    setUser,
    session,
    setSession,
    isAuthenticated,
    isLoading
  };
};
