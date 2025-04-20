
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FileListProps {
  files: File[];
  uploading: boolean;
  onRemove: (index: number) => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  uploading,
  onRemove
}) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">已选择 {files.length} 个文件</h3>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between bg-muted p-2 rounded"
          >
            <div className="truncate flex-1 text-sm">
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              disabled={uploading}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
