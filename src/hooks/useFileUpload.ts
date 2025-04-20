
import { useState } from 'react';
import { useBlockchain } from './useBlockchain';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';

/**
 * 文件上传逻辑的自定义Hook
 */
export function useFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { bcosConnected, checkingConnection, uploadFileToBlockchain } = useBlockchain();
  const { toast } = useToast();
  const { user } = useAuth();

  // 添加文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  // 移除文件
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // 上传文件
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
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(Math.round((i / files.length) * 30));
        
        if (!user?.id) {
          throw new Error('用户未登录');
        }
        
        // 上传文件到区块链
        await uploadFileToBlockchain(file, user.id, user.email || '');
        
        setProgress(60 + Math.round((i / files.length) * 40));
      }
      
      setProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setFiles([]);
        toast({
          title: "文件上传成功",
          description: `已成功上传 ${files.length} 个文件`,
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

  return {
    files,
    uploading,
    progress,
    bcosConnected,
    checkingConnection,
    handleFileChange,
    removeFile,
    handleUpload
  };
}
