
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

interface Block {
  blockNumber: number;
  timestamp: string;
  transactions: number;
  size: string;
  hash: string;
}

interface BlocksListProps {
  blocks: Block[];
}

const BlocksList: React.FC<BlocksListProps> = ({ blocks }) => {
  if (blocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">没有找到匹配的区块信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((block) => (
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
  );
};

export default BlocksList;
