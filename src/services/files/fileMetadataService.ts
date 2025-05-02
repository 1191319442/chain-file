
import { FileMetadata } from '@/types/file';

// Mock data for frontend development
const MOCK_FILES = [
  {
    id: 'file-1',
    name: '财务报表.xlsx',
    user_id: 'user-1',
    size: '1024',
    hash: '0x1234567890abcdef',
    created_at: new Date().toISOString(),
    content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  {
    id: 'file-2',
    name: '技术文档.pdf',
    user_id: 'user-1',
    size: '2048',
    hash: '0x0987654321fedcba',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    content_type: 'application/pdf'
  }
];

/**
 * Service handling file metadata operations
 * Frontend-only implementation
 */
export class FileMetadataService {
  /**
   * 获取用户的文件列表
   */
  static async getUserFiles(userId: string): Promise<FileMetadata[]> {
    // Frontend-only implementation with mock data
    return MOCK_FILES
      .filter(item => item.user_id === userId)
      .map(item => ({
        id: item.id,
        name: item.name,
        owner: userId,
        size: item.size,
        hash: item.hash,
        permission: 'private',
        sharedWith: [],
        uploadDate: new Date(item.created_at).toISOString(),
        contentType: item.content_type || 'application/octet-stream'
      }));
  }

  /**
   * 获取文件详情
   */
  static async getFileDetails(fileId: string): Promise<FileMetadata> {
    // Frontend-only implementation with mock data
    const file = MOCK_FILES.find(f => f.id === fileId);
    
    if (!file) {
      throw new Error('File not found');
    }
    
    return {
      id: file.id,
      name: file.name,
      owner: file.user_id,
      size: file.size,
      hash: file.hash,
      permission: 'private',
      sharedWith: [],
      uploadDate: new Date(file.created_at).toISOString(),
      contentType: file.content_type || 'application/octet-stream'
    };
  }

  /**
   * 获取所有文件（仅管理员）
   */
  static async getAllFiles(): Promise<FileMetadata[]> {
    // Frontend-only implementation with mock data
    return MOCK_FILES.map(item => {
      const ownerName = item.user_id === 'user-1' ? 'Demo User' : 'Unknown';
        
      return {
        id: item.id,
        name: item.name,
        owner: item.user_id,
        ownerName: ownerName,
        size: item.size,
        hash: item.hash,
        permission: 'private',
        sharedWith: [],
        uploadDate: new Date(item.created_at).toISOString(),
        contentType: item.content_type || 'application/octet-stream'
      };
    });
  }
}

export async function getFilesList() {
  // Frontend-only implementation with mock data
  return MOCK_FILES.map(item => ({
    ...item,
    id: item.id,
    username: item.user_id === 'user-1' ? 'Demo User' : 'Unknown User'
  }));
}
