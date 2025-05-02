
import { FileAccess } from '@/types/file';

/**
 * Service handling file access and permissions
 * Frontend-only implementation
 */
export class FileAccessService {
  /**
   * 获取文件访问日志
   */
  static async getFileAccessLogs(fileId: string): Promise<FileAccess[]> {
    // Frontend-only mock data
    const currentTime = new Date().toISOString();
    const mockLogs: FileAccess[] = [
      {
        id: `log-${Date.now()}-1`,
        fileId,
        userId: 'user-1',
        accessType: 'view',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        fileName: '示例文件.pdf'
      },
      {
        id: `log-${Date.now()}-2`,
        fileId,
        userId: 'user-2',
        accessType: 'download',
        timestamp: currentTime,
        fileName: '示例文件.pdf'
      }
    ];
    
    return mockLogs;
  }

  /**
   * 记录文件访问
   */
  static async logFileAccess(fileId: string, accessType: 'view' | 'download' | 'share'): Promise<boolean> {
    // Frontend-only mock implementation
    console.log(`记录文件访问: ${fileId}, 类型: ${accessType}, 时间: ${new Date().toISOString()}`);
    return true;
  }

  /**
   * 验证文件访问权限
   */
  static async checkFileAccess(fileId: string): Promise<boolean> {
    // Frontend-only mock implementation
    return true;
  }

  /**
   * 获取所有访问日志（仅管理员）
   */
  static async getAllAccessLogs(): Promise<FileAccess[]> {
    // Frontend-only mock data
    const currentTime = new Date().toISOString();
    const mockLogs: FileAccess[] = [
      {
        id: `log-${Date.now()}-1`,
        fileId: 'file-1',
        userId: 'user-1',
        accessType: 'view',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        fileName: '财务报表.xlsx',
        userEmail: 'user1@example.com'
      },
      {
        id: `log-${Date.now()}-2`,
        fileId: 'file-2',
        userId: 'user-2',
        accessType: 'download',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        fileName: '技术文档.pdf',
        userEmail: 'user2@example.com'
      },
      {
        id: `log-${Date.now()}-3`,
        fileId: 'file-1',
        userId: 'user-3',
        accessType: 'share',
        timestamp: currentTime,
        fileName: '财务报表.xlsx',
        userEmail: 'user3@example.com',
        txHash: '0x1234567890abcdef'
      }
    ];
    
    return mockLogs;
  }
}
