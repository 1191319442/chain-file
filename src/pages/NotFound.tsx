
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary-50 rounded-full">
            <FileQuestion className="h-16 w-16 text-primary-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900">404</h1>
        <p className="text-xl text-gray-700 mb-6">页面未找到</p>
        <p className="text-muted-foreground mb-8">
          您访问的页面不存在或已被移动。请返回首页继续浏览。
        </p>
        <Link to="/">
          <Button className="px-6">返回首页</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
