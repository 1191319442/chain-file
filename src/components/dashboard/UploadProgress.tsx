
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  uploading: boolean;
  progress: number;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  uploading,
  progress
}) => {
  if (!uploading) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm mb-1">
        <span>上传进度</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground mt-1">
        正在将文件上传至区块链...
      </p>
    </div>
  );
};

export default UploadProgress;
