
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { FileStatus } from '@/types/file';

// Simulated blockchain hash generation
const generateFileHash = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a simple hash from file details for demo purposes
      const hashInput = `${file.name}-${file.size}-${Date.now()}`;
      const hash = btoa(hashInput).substring(0, 44);
      resolve(hash);
    }, 500);
  });
};

export const useFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileStatus, setFileStatus] = useState<FileStatus | null>(null);
  const [bcosConnected, setBcosConnected] = useState(true);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    // Upload one file at a time
    for (const file of files) {
      await uploadFile(file);
    }
    
    // Clear files after upload
    setFiles([]);
  };

  const uploadFile = async (file: File) => {
    if (!file) return;
    
    try {
      setUploading(true);
      setProgress(0);
      setFileStatus({
        fileName: file.name,
        status: 'preparing',
        progress: 0,
        message: '准备上传...'
      });

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('用户未登录');
      }
      
      // Step 1: Generate file hash
      setFileStatus({
        fileName: file.name,
        status: 'hashing',
        progress: 10,
        message: '计算文件哈希...'
      });
      
      const fileHash = await generateFileHash(file);
      
      // Step 2: Check if file already exists in database
      const { data: existingFiles } = await supabase
        .from('files')
        .select('id, hash')
        .eq('hash', fileHash)
        .eq('user_id', user.id);
      
      if (existingFiles && existingFiles.length > 0) {
        toast({
          title: "文件已存在",
          description: `${file.name} 已在您的文件列表中`,
          variant: "default"
        });
        setFileStatus({
          fileName: file.name,
          status: 'exists',
          progress: 100,
          message: '文件已存在'
        });
        return;
      }
      
      // Step 3: Upload to storage
      setFileStatus({
        fileName: file.name,
        status: 'uploading',
        progress: 30,
        message: '上传中...'
      });
      
      // Create a unique file path
      const filePath = `${user.id}/${uuidv4()}-${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Step 4: Add file metadata to database
      setFileStatus({
        fileName: file.name,
        status: 'processing',
        progress: 70,
        message: '处理文件元数据...'
      });
      
      const fileId = uuidv4();
      
      // Add file to database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          id: fileId,
          name: file.name,
          size: file.size.toString(),
          hash: fileHash,
          content_type: file.type,
          user_id: user.id,
          permission: 'private'
        });
      
      if (dbError) throw dbError;
      
      // Step 5: Add blockchain transaction record
      setFileStatus({
        fileName: file.name,
        status: 'blockchain',
        progress: 90,
        message: '提交到区块链...'
      });
      
      const txHash = `tx_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      
      // Add blockchain transaction record
      const { error: txError } = await supabase
        .from('blockchain_transactions')
        .insert({
          tx_hash: txHash,
          type: 'upload',
          file_name: file.name,
          file_hash: fileHash,
          user_id: user.id,
          status: 'confirmed',
          block_number: Math.floor(Math.random() * 10000000),
          file_id: fileId
        });
      
      if (txError) throw txError;
      
      // Complete upload
      setFileStatus({
        fileName: file.name,
        status: 'complete',
        progress: 100,
        message: '上传完成'
      });
      
      toast({
        title: "上传成功",
        description: `${file.name} 已成功上传并记录到区块链`,
      });
      
      // Reset upload state after a short delay
      setTimeout(() => {
        setFileStatus(null);
        setProgress(0);
      }, 3000);
      
      return fileId;
    } catch (error: any) {
      console.error('Upload failed:', error);
      setFileStatus({
        fileName: file.name,
        status: 'error',
        progress: 0,
        message: `上传失败: ${error.message}`
      });
      
      toast({
        title: "上传失败",
        description: error.message || "文件上传过程中出错",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    files,
    uploading,
    progress,
    fileStatus,
    bcosConnected,
    checkingConnection,
    handleFileChange,
    removeFile,
    handleUpload,
    uploadFile
  };
};
