/**
 * 主布局组件
 * 提供应用的整体布局结构，包括顶部导航栏和侧边栏
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Users,
  History,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
};

/**
 * 侧边栏导航项组件
 */
const NavItem = ({ icon, label, to, active }: NavItemProps) => (
  <Link to={to}>
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 py-2 px-3 mb-1",
        active && "bg-primary/10 text-primary hover:bg-primary/20"
      )}
    >
      {icon}
      <span>{label}</span>
    </Button>
  </Link>
);

/**
 * 主布局组件，包含顶部导航栏和侧边栏
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { isAuthenticated, logout, user } = useAuth(); // 使用认证上下文

  const isActive = (path: string) => location.pathname === path;

  // 导航菜单配置
  const navigation = [
    { icon: <FileText size={18} />, label: "我的文件", to: "/dashboard" },
    { icon: <Upload size={18} />, label: "上传文件", to: "/upload" },
    { icon: <Users size={18} />, label: "文件共享", to: "/share" },
    { icon: <History size={18} />, label: "文件历史", to: "/history" },
    { icon: <BarChart2 size={18} />, label: "区块链记录", to: "/blockchain" },
    { icon: <Settings size={18} />, label: "设置", to: "/settings" },
  ];

  // 处理登出功能
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 获取用户显示名
  const getUserDisplayName = () => {
    if (!user) return "";
    return user.username || user.email?.split('@')[0] || "用户";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="h-16 border-b bg-white flex items-center px-4 justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden mr-2"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary-500 text-white p-1 rounded">
              <FileText size={24} />
            </div>
            <h1 className="text-xl font-bold text-primary-500">区块链文件追踪系统</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <Button variant="ghost" size="sm" className="text-sm gap-2">
                <User size={16} />
                <span>欢迎, {getUserDisplayName()}</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={handleLogout}>
                <LogOut size={16} />
                <span className="hidden sm:inline">退出</span>
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="gap-1">
                <LogOut size={16} />
                <span className="hidden sm:inline">登录/注册</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* 侧边栏 */}
        <aside
          className={cn(
            "w-64 border-r bg-white p-4 transition-all duration-300 ease-in-out",
            "fixed md:relative inset-y-0 left-0 z-50 md:translate-x-0 h-[calc(100vh-4rem)]",
            !sidebarOpen && "-translate-x-full"
          )}
        >
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-md font-semibold text-muted-foreground px-3">导航菜单</h2>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <NavItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  active={isActive(item.to)}
                />
              ))}
            </nav>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
