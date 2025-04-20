
import { useState, useEffect } from 'react';
import { fiscoBcosService, calculateFileHash } from '@/services/fiscoBcosService';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export type FileInfo = {
  name: string;
  hash: string;
  size: string;
  owner: string;
  uploadDate: string;
};

/**
 * 区块链连接和文件操作的自定义Hook
 */
export function useBlockchain() {
  const [bcosConnected, setBcosConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const { toast } = useToast();

  // 检查与区块链的连接状态
  const checkConnection = async () => {
    setCheckingConnection(true);
    const connected = await fiscoBcosService.checkConnection();
    setBcosConnected(connected);
    setCheckingConnection(false);
    return connected;
  };

  // 重试连接
  const retryConnection = async () => {
    const connected = await checkConnection();
    
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

  // 上传文件到区块链
  const uploadFileToBlockchain = async (file: File, userId: string, email: string): Promise<string> => {
    // 计算文件哈希
    const fileHash = await calculateFileHash(file);
    
    // 构建文件信息
    const fileInfo: FileInfo = {
      name: file.name,
      hash: fileHash,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      owner: email || '未知用户',
      uploadDate: new Date().toISOString().split('T')[0],
    };
    
    // 上传到区块链
    const txHash = await fiscoBcosService.uploadFile(fileInfo);
    
    // 保存到Supabase
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        hash: fileHash,
        content_type: file.type,
        tx_hash: txHash,
        user_id: userId
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
    
    return txHash;
  };

  // 初始化 - 检查连接
  useEffect(() => {
    checkConnection();
  }, []);

  return {
    bcosConnected,
    checkingConnection,
    checkConnection,
    retryConnection,
    uploadFileToBlockchain,
  };
}
