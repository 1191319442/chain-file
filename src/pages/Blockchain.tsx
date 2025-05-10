
/**
 * 区块链浏览器页面
 * 提供查看区块链交易记录、验证文件等功能
 */

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useBlockchainData } from '@/hooks/useBlockchainData';
import BlocksList from '@/components/blockchain/BlocksList';
import TransactionsList from '@/components/blockchain/TransactionsList';
import BlockchainSearch from '@/components/blockchain/BlockchainSearch';
import { Transaction } from '@/types/transaction';

const Blockchain: React.FC = () => {
  const { transactions, latestBlocks, loading, error } = useBlockchainData();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Transaction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Transform BlockchainTransaction to Transaction for display
  const transformedTransactions: Transaction[] = transactions.map(tx => ({
    ...tx,
    user: tx.userId // Map userId to user for compatibility
  }));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Filter transactions by hash, file name, or user
    const results = transformedTransactions.filter(tx => 
      tx.txHash.toLowerCase().includes(query.toLowerCase()) ||
      tx.fileName.toLowerCase().includes(query.toLowerCase()) ||
      tx.user.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
    setIsSearching(false);
  };

  if (error) {
    console.error("Blockchain data error:", error);
  }

  const displayTransactions = searchResults.length > 0 ? searchResults : transformedTransactions;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">区块链浏览器</h1>
          <p className="text-muted-foreground">查看区块链交易记录和文件验证信息</p>
        </div>
        
        <BlockchainSearch value={searchQuery} onChange={handleSearch} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <BlocksList blocks={latestBlocks.map(blockNumber => ({
            blockNumber,
            timestamp: new Date().toLocaleString(),
            transactions: Math.floor(Math.random() * 10) + 1,
            size: `${Math.floor(Math.random() * 100) + 10} KB`,
            hash: `0x${Array.from(new Array(64), () => Math.floor(Math.random() * 16).toString(16)).join('')}`
          }))} />
          
          <TransactionsList transactions={displayTransactions} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Blockchain;
