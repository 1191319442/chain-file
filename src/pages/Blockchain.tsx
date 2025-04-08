
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionCard, { Transaction } from '@/components/blockchain/TransactionCard';
import { Input } from "@/components/ui/input";
import { Search, Database } from "lucide-react";

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'upload',
    timestamp: '2025-04-08 14:32:15',
    fileName: '项目方案.pdf',
    fileHash: '0x8f5e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    user: '当前用户',
    status: 'confirmed',
    blockNumber: 3856201
  },
  {
    id: '2',
    type: 'share',
    timestamp: '2025-04-08 15:45:22',
    fileName: '项目方案.pdf',
    fileHash: '0x8f5e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    user: '当前用户',
    status: 'confirmed',
    blockNumber: 3856230
  },
  {
    id: '3',
    type: 'upload',
    timestamp: '2025-04-07 10:12:05',
    fileName: '会议记录.docx',
    fileHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
    user: '当前用户',
    status: 'confirmed',
    blockNumber: 3855978
  },
  {
    id: '4',
    type: 'verification',
    timestamp: '2025-04-07 16:27:33',
    fileName: '会议记录.docx',
    fileHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
    user: '系统',
    status: 'confirmed',
    blockNumber: 3856023
  },
  {
    id: '5',
    type: 'download',
    timestamp: '2025-04-06 11:52:48',
    fileName: '产品设计图.png',
    fileHash: '0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    user: '王五',
    status: 'confirmed',
    blockNumber: 3855789
  },
  {
    id: '6',
    type: 'upload',
    timestamp: '2025-04-04 09:38:11',
    fileName: '系统文档.pdf',
    fileHash: '0x4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    user: '当前用户',
    status: 'pending'
  },
];

// 块数据
const MOCK_BLOCKS = [
  {
    blockNumber: 3856201,
    timestamp: '2025-04-08 14:32:20',
    transactions: 12,
    size: '2.3 KB',
    hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
  },
  {
    blockNumber: 3856230,
    timestamp: '2025-04-08 15:45:30',
    transactions: 8,
    size: '1.8 KB',
    hash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c'
  },
  {
    blockNumber: 3855978,
    timestamp: '2025-04-07 10:12:15',
    transactions: 15,
    size: '3.1 KB',
    hash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'
  },
  {
    blockNumber: 3856023,
    timestamp: '2025-04-07 16:27:45',
    transactions: 10,
    size: '2.0 KB',
    hash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e'
  },
  {
    blockNumber: 3855789,
    timestamp: '2025-04-06 11:53:00',
    transactions: 9,
    size: '1.9 KB',
    hash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f'
  }
];

const Blockchain: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = MOCK_TRANSACTIONS.filter(
    (tx) => tx.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.fileHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBlocks = MOCK_BLOCKS.filter(
    (block) => block.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
               block.blockNumber.toString().includes(searchQuery)
  );

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
