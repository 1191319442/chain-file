
/**
 * 文件上传组件
 * 提供文件选择、预览和上传功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { fiscoBcosService, calculateFileHash } from '@/services/fiscoBcosService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/context/AuthContext';

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bcosConnected, setBcosConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // 检查区块链连接状态
  useEffect(() => {
    const checkBcosConnection = async () => {
      setCheckingConnection(true);
      const connected = await fiscoBcosService.checkConnection();
      setBcosConnected(connected);
      setCheckingConnection(false);
    };
    
    checkBcosConnection();
  }, []);

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

  // 文件上传到区块链
  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "请选择要上传的文件",
        variant: "destructive",
      });
      return;
    }

    if (!bcosConnected) {
      toast({
        title: "区块链连接失败",
        description: "无法连接到FISCO BCOS节点，请检查网络连接",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    
    try {
      // 上传所有文件
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // 更新进度
        setProgress(Math.round((i / files.length) * 50));
        
        // 计算文件哈希
        const fileHash = await calculateFileHash(file);
        
        // 准备文件信息
        const fileInfo = {
          name: file.name,
          hash: fileHash,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          owner: user?.email || '未知用户',
          uploadDate: new Date().toISOString().split('T')[0],
        };
        
        // 上传文件信息到区块链
        const txHash = await fiscoBcosService.uploadFile(fileInfo);
        console.log('文件上传成功，交易哈希:', txHash);
        
        // 更新进度
        setProgress(50 + Math.round((i / files.length) * 50));
      }
      
      // 完成所有上传
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
      
    } catch (error: any) {
      console.error('文件上传失败:', error);
      setUploading(false);
      toast({
        title: "上传失败",
        description: error.message || "文件上传过程中发生错误",
        variant: "destructive",
      });
    }
  };

  // 重试连接区块链
  const handleRetryConnection = async () => {
    setCheckingConnection(true);
    const connected = await fiscoBcosService.checkConnection();
    setBcosConnected(connected);
    setCheckingConnection(false);
    
    if (connected) {
      toast({
        title: "连接成功",
        description: "已成功连接到FISCO BCOS区块链节点",
      });
    } else {
      toast({
        title: "连接失败",
        description: "无法连接到FISCO BCOS节点，请检查网络连接",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {!bcosConnected && !checkingConnection && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>区块链连接失败</AlertTitle>
              <AlertDescription>
                无法连接到FISCO BCOS节点，部分功能可能不可用。
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetryConnection}
                  className="ml-2"
                >
                  重试连接
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {checkingConnection && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>正在连接区块链节点...</span>
            </div>
          )}

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
              disabled={uploading || (!bcosConnected && !checkingConnection)}
            />
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center ${
                (!bcosConnected && !checkingConnection) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
              }`}
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
            disabled={files.length === 0 || uploading || (!bcosConnected && !checkingConnection)}
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
