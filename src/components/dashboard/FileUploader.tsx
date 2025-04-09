
/**
 * 文件上传组件
 * 提供文件选择、预览和上传功能
 */

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  // 移除选择的文件
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // TODO: 替换为后端API - 文件上传接口
  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "请选择要上传的文件",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    
    // 示例:
    // try {
    //   const formData = new FormData();
    //   files.forEach((file) => {
    //     formData.append('files', file);
    //   });
    //
    //   // 使用支持进度报告的axios
    //   const response = await api.post('/files/upload', formData, {
    //     onUploadProgress: (progressEvent) => {
    //       const percentCompleted = Math.round(
    //         (progressEvent.loaded * 100) / progressEvent.total
    //       );
    //       setProgress(percentCompleted);
    //     }
    //   });
    //
    //   if (response.data.success) {
    //     toast({
    //       title: "文件上传成功",
    //       description: `已成功上传 ${files.length} 个文件到区块链`,
    //     });
    //     setFiles([]);
    //   }
    // } catch (error) {
    //   toast({
    //     title: "上传失败",
    //     description: error.message || "文件上传过程中发生错误",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setUploading(false);
    // }
    
    // 模拟上传进度
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // 模拟上传延迟
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setFiles([]);
        toast({
          title: "文件上传成功",
          description: `已成功上传 ${files.length} 个文件到区块链`,
          variant: "default",
        });
      }, 500);
    }, 3000);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              files.length > 0 ? 'border-primary' : 'border-muted-foreground/30'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload
                className={`h-12 w-12 mb-4 ${
                  files.length > 0 ? 'text-primary' : 'text-muted-foreground/50'
                }`}
              />
              <p className="text-lg font-medium text-foreground">点击或拖拽文件到此处</p>
              <p className="text-sm text-muted-foreground mt-1">
                支持任何类型的文件, 最大支持 20MB
              </p>
            </label>
          </div>

          {files.length > 0 && (
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
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
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
          )}

          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="mt-4"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在上传...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                上传到区块链
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
