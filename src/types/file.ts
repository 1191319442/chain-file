
export type FilePermission = 'public' | 'private' | 'shared';

export interface FileAccess {
  id: string;
  fileId: string;
  userId: string;
  accessType: 'view' | 'download' | 'share';
  timestamp: string;
  txHash?: string;
  fileName?: string; // 文件名（用于显示）
  userEmail?: string; // 用户邮箱（用于显示）
}

export interface FilePermissionSettings {
  fileId: string;
  permission: FilePermission;
  sharedUserIds?: string[];
}

export interface FileMetadata {
  id: string;
  name: string;
  owner: string;
  ownerName?: string; // 所有者用户名（用于显示）
  size: number | string;
  hash: string;
  permission: FilePermission;
  sharedWith: string[];
  uploadDate: string;
  contentType: string;
}

export interface FileStatus {
  fileName: string;
  status: 'preparing' | 'hashing' | 'uploading' | 'processing' | 'blockchain' | 'complete' | 'error' | 'exists';
  progress: number;
  message: string;
}

export interface FileAccessLog {
  id: string;
  fileId: string;
  userId: string;
  accessType: 'view' | 'download' | 'share';
  timestamp: number;
  details?: string;
  username?: string;
}
