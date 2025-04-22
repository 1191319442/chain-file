/**
 * 应用 Logo 组件
 */

import React from 'react';
import { FileText } from "lucide-react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = "medium", showText = true }) => {
  // 根据尺寸确定图标大小
  const getIconSize = () => {
    switch (size) {
      case "small": return 16;
      case "large": return 32;
      default: return 24;
    }
  };

  // 根据尺寸确定容器类名
  const getContainerClass = () => {
    switch (size) {
      case "small": return "h-8 w-8 p-1.5";
      case "large": return "h-16 w-16 p-3";
      default: return "h-12 w-12 p-2";
    }
  };

  // 根据尺寸确定文本类名
  const getTextClass = () => {
    switch (size) {
      case "small": return "text-xl";
      case "large": return "text-4xl";
      default: return "text-3xl";
    }
  };

  return (
    <div className="text-center">
      <div className={`mx-auto ${getContainerClass()} rounded bg-primary/10 flex items-center justify-center`}>
        <FileText className={`h-${getIconSize()} w-${getIconSize()} text-primary`} />
      </div>
      {showText && (
        <>
          <h2 className={`mt-6 ${getTextClass()} font-bold text-gray-900`}>区块链文件追踪与共享系统</h2>
          <p className="mt-2 text-sm text-gray-600">
            安全、透明的文件管理与区块链追溯平台
          </p>
        </>
      )}
    </div>
  );
};

export default Logo;
