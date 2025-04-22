
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fiscoBcosService } from '@/services/fiscoBcosService';
import { useToast } from '@/components/ui/use-toast';
import { Transaction } from '@/components/blockchain/TransactionCard';

export const useBlockchainData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlockchainData = async () => {
    try {
      setLoading(true);
      
      // 获取区块链交易数据
      const { data: txData, error: txError } = await supabase
        .from('blockchain_transactions')
        .select(`
          *,
          files (
            name,
            hash,
            user_id,
            content_type
          )
        `)
        .order('created_at', { ascending: false });

      if (txError) throw txError;

      // 获取文件对应的区块信息
      const blockData = await Promise.all(
        (txData || [])
          .filter(tx => tx.block_number)
          .map(tx => fiscoBcosService.getBlockInfo(tx.block_number))
      );

      // 格式化交易数据
      const formattedTx: Transaction[] = (txData || []).map(tx => ({
        id: tx.id,
        type: tx.status === 'confirmed' ? 'upload' : 'verification',
        timestamp: new Date(tx.created_at || '').toLocaleString(),
        fileName: tx.files?.name || '未知文件',
        fileHash: tx.files?.hash || tx.tx_hash,
        user: tx.files?.user_id || '未知用户',
        status: tx.status === 'confirmed' ? 'confirmed' : 'pending',
        blockNumber: tx.block_number
      }));

      setTransactions(formattedTx);
      setBlocks(blockData);

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

  // 实时订阅区块链交易更新
  useEffect(() => {
    const channel = supabase
      .channel('blockchain-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blockchain_transactions'
        },
        () => {
          fetchBlockchainData();
        }
      )
      .subscribe();

    fetchBlockchainData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    transactions,
    blocks,
    loading,
    refetch: fetchBlockchainData
  };
};
