
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export type FileInfo = {
  name: string;
  hash: string;
  size: string;
  owner: string;
  uploadDate: string;
};

/**
 * Frontend-only mock blockchain hook
 */
export function useBlockchain() {
  const [bcosConnected, setBcosConnected] = useState(true);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const { toast } = useToast();

  // Check connection status - frontend mock
  const checkConnection = async () => {
    setCheckingConnection(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setBcosConnected(true);
    setCheckingConnection(false);
    return true;
  };

  // Retry connection - frontend mock
  const retryConnection = async () => {
    setCheckingConnection(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setBcosConnected(true);
    setCheckingConnection(false);
    
    toast({
      title: "连接成功",
      description: "已成功连接到区块链节点",
    });
    
    return true;
  };

  // Upload file - frontend mock
  const uploadFileToBlockchain = async (file: File, userId: string, email: string): Promise<string> => {
    // Calculate mock hash
    const fileHash = `0x${Array.from(new Array(40), () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return `tx-${Date.now()}`;
  };

  // Init - check connection
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
