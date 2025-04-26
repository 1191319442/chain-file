
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Share from "./pages/Share";
import History from "./pages/History";
import Blockchain from "./pages/Blockchain";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import FileManagement from './pages/admin/FileManagement';
import LogQuery from './pages/admin/LogQuery';
import AdminRoute from './components/auth/AdminRoute';

// 创建React Query客户端实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      retry: 1,
    },
  },
});

/**
 * 应用根组件
 */
const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/share" element={<ProtectedRoute><Share /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/blockchain" element={<ProtectedRoute><Blockchain /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              
              {/* Admin routes */}
              <Route path="/admin/files" element={<AdminRoute><FileManagement /></AdminRoute>} />
              <Route path="/admin/logs" element={<AdminRoute><LogQuery /></AdminRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
