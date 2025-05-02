
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Transaction } from '@/components/blockchain/TransactionCard';

// Mock data for frontend development
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'upload',
    timestamp: new Date().toLocaleString(),
    fileName: '财务报表.xlsx',
    fileHash: '0x1234567890abcdef',
    user: 'user-1',
    status: 'confirmed',
    blockNumber: 12345
  },
  {
    id: 'tx-2',
    type: 'verification',
    timestamp: new Date(Date.now() - 86400000).toLocaleString(),
    fileName: '技术文档.pdf',
    fileHash: '0x0987654321fedcba',
    user: 'user-2',
    status: 'confirmed',
    blockNumber: 12344
  }
];

const MOCK_BLOCKS = [
  {
    number: 12345,
    hash: '0xblock12345',
    timestamp: Date.now(),
    transactions: ['0x1234567890abcdef']
  },
  {
    number: 12344,
    hash: '0xblock12344',
    timestamp: Date.now() - 86400000,
    transactions: ['0x0987654321fedcba']
  }
];

export const useBlockchainData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlockchainData = async () => {
    try {
      setLoading(true);
      
      // Use mock data instead of fetching from Supabase
      setTransactions(MOCK_TRANSACTIONS);
      setBlocks(MOCK_BLOCKS);

    } catch (error: any) {
      toast({
        title: "获取区块链数据失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Simulate real-time updates with setTimeout
  useEffect(() => {
    fetchBlockchainData();
    
    // Simulate periodic updates
    const interval = setInterval(() => {
      fetchBlockchainData();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return {
    transactions,
    blocks,
    loading,
    refetch: fetchBlockchainData
  };
};
