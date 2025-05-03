
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Transaction } from '@/components/blockchain/TransactionCard';
import { supabase } from '@/integrations/supabase/client';

export const useBlockchainData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlockchainData = async () => {
    try {
      setLoading(true);
      
      // Fetch blockchain transactions from Supabase
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('blockchain_transactions')
        .select(`
          id,
          tx_hash,
          type,
          file_name,
          file_hash,
          user_id,
          status,
          block_number,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Transform database records to match the Transaction type
      const transformedTransactions = transactionsData.map(tx => ({
        id: tx.id,
        type: tx.type as 'upload' | 'verification',
        timestamp: new Date(tx.created_at).toLocaleString(),
        fileName: tx.file_name,
        fileHash: tx.file_hash,
        user: tx.user_id,
        status: tx.status,
        blockNumber: tx.block_number
      }));

      setTransactions(transformedTransactions);

      // Group transactions by block number to create blocks data
      const blockNumbersSet = new Set(transactionsData.map(tx => tx.block_number).filter(Boolean));
      const blocksList = Array.from(blockNumbersSet).map(blockNum => {
        const blockTransactions = transactionsData.filter(tx => tx.block_number === blockNum);
        const latestTx = blockTransactions.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        return {
          number: blockNum,
          hash: `0xblock${blockNum}`,
          timestamp: new Date(latestTx.created_at).getTime(),
          transactions: blockTransactions.map(tx => tx.tx_hash)
        };
      });

      setBlocks(blocksList);

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

  // Fetch data initially and set up subscription
  useEffect(() => {
    fetchBlockchainData();
    
    // Set up real-time subscription for new transactions
    const channel = supabase
      .channel('blockchain-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blockchain_transactions' }, 
        () => {
          fetchBlockchainData();
        }
      )
      .subscribe();
    
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
