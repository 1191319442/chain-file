
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
};

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

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { icon: <FileText size={18} />, label: "我的文件", to: "/" },
    { icon: <Upload size={18} />, label: "上传文件", to: "/upload" },
    { icon: <Users size={18} />, label: "文件共享", to: "/share" },
    { icon: <History size={18} />, label: "文件历史", to: "/history" },
    { icon: <BarChart2 size={18} />, label: "区块链记录", to: "/blockchain" },
    { icon: <Settings size={18} />, label: "设置", to: "/settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-500 text-white p-1 rounded">
              <FileText size={24} />
            </div>
            <h1 className="text-xl font-bold text-primary-500">链文件系统</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-sm">
            欢迎, 用户
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <LogOut size={16} />
            <span className="hidden sm:inline">退出</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
