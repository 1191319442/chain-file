
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlockchainTransaction } from '@/types/transaction';

export const useBlockchainData = () => {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [latestBlocks, setLatestBlocks] = useState<number[]>([]);

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        setLoading(true);
        
        // Fetch transactions from Supabase
        const { data, error } = await supabase
          .from('blockchain_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        // Map database results to our BlockchainTransaction type
        const formattedTransactions: BlockchainTransaction[] = (data || []).map(tx => ({
          id: tx.id || '',
          type: tx.type || 'upload',
          timestamp: new Date(tx.created_at || Date.now()).getTime(),
          fileName: tx.file_name || '',
          fileHash: tx.file_hash || '',
          userId: tx.user_id || '',
          status: tx.status || 'confirmed',
          blockNumber: tx.block_number || 0,
          txHash: tx.tx_hash || ''
        }));

        // Extract unique block numbers for block list
        const blockNumbers = [...new Set(
          formattedTransactions
            .filter(tx => tx.blockNumber > 0)
            .map(tx => tx.blockNumber)
        )].sort((a, b) => b - a).slice(0, 5);

        setTransactions(formattedTransactions);
        setLatestBlocks(blockNumbers);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch blockchain data:", err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching blockchain data'));
      } finally {
        setLoading(false);
      }
    };

    fetchBlockchainData();

    // Subscribe to changes in the blockchain_transactions table
    const subscription = supabase
      .channel('blockchain_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'blockchain_transactions' 
        }, 
        fetchBlockchainData
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { transactions, latestBlocks, loading, error };
};
