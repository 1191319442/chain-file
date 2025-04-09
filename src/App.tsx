
/**
 * 主应用组件
 * 包含全局状态管理、路由配置和UI组件初始化
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Share from "./pages/Share";
import History from "./pages/History";
import Blockchain from "./pages/Blockchain";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// 创建React Query客户端实例
const queryClient = new QueryClient();

/**
 * 应用根组件
 * 配置全局提供器和路由系统
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/share" element={<Share />} />
          <Route path="/history" element={<History />} />
          <Route path="/blockchain" element={<Blockchain />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
