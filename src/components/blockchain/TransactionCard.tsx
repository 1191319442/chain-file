
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, User, FileCheck, FileQuestion } from "lucide-react";

export type Transaction = {
  id: string;
  type: 'upload' | 'download' | 'share' | 'verification';
  timestamp: string;
  fileName: string;
  fileHash: string;
  user: string;
  status: 'confirmed' | 'pending';
  blockNumber?: number;
};

type TransactionCardProps = {
  transaction: Transaction;
};

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const getIcon = () => {
    switch (transaction.type) {
      case 'upload':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'download':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'share':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'verification':
        return transaction.status === 'confirmed' 
          ? <FileCheck className="h-5 w-5 text-green-500" />
          : <FileQuestion className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeText = () => {
    switch (transaction.type) {
      case 'upload':
        return '文件上传';
      case 'download':
        return '文件下载';
      case 'share':
        return '文件分享';
      case 'verification':
        return '文件验证';
      default:
        return transaction.type;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-base">{getTypeText()}</CardTitle>
          </div>
          <Badge variant={transaction.status === 'confirmed' ? 'default' : 'outline'}>
            {transaction.status === 'confirmed' ? '已确认' : '待确认'}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {transaction.timestamp}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <p className="truncate">
            <span className="text-muted-foreground">文件名：</span>
            {transaction.fileName}
          </p>
          <p className="truncate">
            <span className="text-muted-foreground">文件哈希：</span>
            {transaction.fileHash}
          </p>
          <p className="truncate">
            <span className="text-muted-foreground">用户：</span>
            {transaction.user}
          </p>
          {transaction.blockNumber && (
            <p>
              <span className="text-muted-foreground">区块编号：</span>
              {transaction.blockNumber}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
