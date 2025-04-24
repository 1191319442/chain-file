
export type FilePermission = 'public' | 'private' | 'shared';

export interface FileAccess {
  id: string;
  fileId: string;
  userId: string;
  accessType: 'view' | 'download' | 'share';
  timestamp: string;
  txHash?: string;
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
  size: number;
  hash: string;
  permission: FilePermission;
  sharedWith: string[];
  uploadDate: string;
  contentType: string;
}
