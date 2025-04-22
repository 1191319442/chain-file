import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionCard from '@/components/blockchain/TransactionCard';
import { Input } from "@/components/ui/input";
import { Search, Database, Loader2 } from "lucide-react";
import { useBlockchainData } from '@/hooks/useBlockchainData';

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

        <div className="relative flex mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="搜索文件名、哈希、用户或区块..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="transactions">交易记录</TabsTrigger>
            <TabsTrigger value="blocks">区块信息</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">没有找到匹配的交易记录</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="blocks">
            {filteredBlocks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">没有找到匹配的区块信息</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBlocks.map((block) => (
                  <Card key={block.blockNumber}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">
                          区块 #{block.blockNumber}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-2">
                        <p>
                          <span className="text-muted-foreground">时间戳：</span>
                          {block.timestamp}
                        </p>
                        <p>
                          <span className="text-muted-foreground">交易数量：</span>
                          {block.transactions}
                        </p>
                        <p>
                          <span className="text-muted-foreground">区块大小：</span>
                          {block.size}
                        </p>
                        <p className="truncate">
                          <span className="text-muted-foreground">区块哈希：</span>
                          {block.hash}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Blockchain;
