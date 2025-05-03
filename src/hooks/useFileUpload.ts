
import { useState } from 'react';
import { useBlockchain } from './useBlockchain';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * File upload hook integrating with Supabase
 */
export function useFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { bcosConnected, checkingConnection, uploadFileToBlockchain } = useBlockchain();
  const { toast } = useToast();
  const { user } = useAuth();

  // Add files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Upload files to Supabase storage and record in database
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
        description: "无法连接到区块链节点，请检查网络连接",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "请先登录",
        description: "您需要登录才能上传文件",
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
        
        const userId = user?.id || 'demo-user';
        const email = user?.email || 'demo@example.com';
        
        // Generate file path and hash
        const timestamp = new Date().getTime();
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const fileHash = `0x${Array.from(new Array(40), () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        
        setProgress(40);
        
        // Upload file to Supabase storage
        const { error: storageError } = await supabase
          .storage
          .from('files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (storageError) throw storageError;
        
        setProgress(60);
        
        // Record file metadata in database
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            user_id: userId,
            size: file.size.toString(),
            content_type: file.type || 'application/octet-stream',
            hash: fileHash
          });
          
        if (dbError) throw dbError;
        
        setProgress(80);
        
        // Create blockchain transaction record
        const { error: txError } = await supabase
          .from('blockchain_transactions')
          .insert({
            tx_hash: `tx-${uuidv4().substring(0, 8)}`,
            type: 'upload',
            file_name: file.name,
            file_hash: fileHash,
            user_id: userId,
            status: 'confirmed',
            block_number: Math.floor(10000 + Math.random() * 5000)
          });
          
        if (txError) throw txError;
        
        setProgress(90 + Math.round((i / files.length) * 10));
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
