
export interface BlockchainTransaction {
  id: string;
  type: 'upload' | 'download' | 'share' | 'verification';
  timestamp: number;
  fileName: string;
  fileHash: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber: number;
  txHash: string;
}

export interface Block {
  number: number;
  timestamp: number;
  transactionCount: number;
  hash: string;
}

export interface Transaction {
  id: string;
  type: 'upload' | 'download' | 'share' | 'verification';
  timestamp: number;
  fileName: string;
  fileHash: string;
  user: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber: number;
  txHash: string;
}
