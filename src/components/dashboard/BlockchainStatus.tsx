
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockchainStatusProps {
  bcosConnected: boolean;
  checkingConnection: boolean;
  onRetryConnection: () => void;
}

const BlockchainStatus: React.FC<BlockchainStatusProps> = ({
  bcosConnected,
  checkingConnection,
  onRetryConnection
}) => {
  if (checkingConnection) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>正在连接区块链节点...</span>
      </div>
    );
  }

  if (!bcosConnected) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>区块链连接失败</AlertTitle>
        <AlertDescription>
          无法连接到FISCO BCOS节点，部分功能可能不可用。
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetryConnection}
            className="ml-2"
          >
            重试连接
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default BlockchainStatus;
