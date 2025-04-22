
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useBlockchainData } from '@/hooks/useBlockchainData';
import TransactionsList from '@/components/blockchain/TransactionsList';
import BlocksList from '@/components/blockchain/BlocksList';
import BlockchainSearch from '@/components/blockchain/BlockchainSearch';

const Blockchain: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { transactions, blocks, loading } = useBlockchainData();

  const filteredTransactions = transactions.filter(
    (tx) => tx.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.fileHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBlocks = blocks.filter(
    (block) => block.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
               block.blockNumber.toString().includes(searchQuery)
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">加载区块链数据中...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">区块链记录</h1>
          <p className="text-muted-foreground mt-2">
            查看所有区块链交易记录和区块信息
          </p>
        </div>

        <BlockchainSearch value={searchQuery} onChange={setSearchQuery} />

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="transactions">交易记录</TabsTrigger>
            <TabsTrigger value="blocks">区块信息</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <TransactionsList transactions={filteredTransactions} />
          </TabsContent>

          <TabsContent value="blocks">
            <BlocksList blocks={filteredBlocks} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Blockchain;
