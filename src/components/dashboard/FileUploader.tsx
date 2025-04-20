/**
 * 文件上传组件
 * 提供文件选择、预览和上传功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { fiscoBcosService, calculateFileHash } from '@/services/fiscoBcosService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import BlockchainStatus from './BlockchainStatus';
import UploadZone from './UploadZone';
import FileList from './FileList';
import UploadProgress from './UploadProgress';

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bcosConnected, setBcosConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const checkBcosConnection = async () => {
      setCheckingConnection(true);
      const connected = await fiscoBcosService.checkConnection();
      setBcosConnected(connected);
      setCheckingConnection(false);
    };
    
    checkBcosConnection();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

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
        
        // 计算文件哈希
        const fileHash = await calculateFileHash(file);
        
        // 上传文件信息到区块链
        const fileInfo = {
          name: file.name,
          hash: fileHash,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          owner: user?.email || '未知用户',
          uploadDate: new Date().toISOString().split('T')[0],
        };
        
        // 将文件信息上传到区块链
        const txHash = await fiscoBcosService.uploadFile(fileInfo);
        setProgress(30 + Math.round((i / files.length) * 30));

        // 将文件信息保存到Supabase
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            size: `${(file.size / 1024).toFixed(2)} KB`,
            hash: fileHash,
            content_type: file.type,
            tx_hash: txHash,
            user_id: user?.id
          })
          .select()
          .single();

        if (fileError) throw fileError;

        // 记录区块链交易
        const { error: txError } = await supabase
          .from('blockchain_transactions')
          .insert({
            tx_hash: txHash,
            file_id: fileData.id,
            status: 'pending'
          });

        if (txError) throw txError;
        
        setProgress(60 + Math.round((i / files.length) * 40));
      }
      
      setProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setFiles([]);
        toast({
          title: "文件上传成功",
          description: `已成功上传 ${files.length} 个文件`,
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

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <BlockchainStatus 
            bcosConnected={bcosConnected}
            checkingConnection={checkingConnection}
            onRetryConnection={handleRetryConnection}
          />

          <UploadZone
            filesCount={files.length}
            disabled={uploading || (!bcosConnected && !checkingConnection)}
            onChange={handleFileChange}
          />

          <FileList
            files={files}
            uploading={uploading}
            onRemove={removeFile}
          />

          <UploadProgress
            uploading={uploading}
            progress={progress}
          />

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
