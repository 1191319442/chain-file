import apiClient from '../api/apiClient';
import { fiscoBcosService } from './fiscoBcosService';
import { FilePermission, FilePermissionSettings, FileMetadata, FileAccess } from '@/types/file';

/**
 * 文件服务类
 * 提供文件相关的业务逻辑
 */
export class FileService {
  /**
   * 获取用户的文件列表
   * @param userId 用户ID
   * @returns 返回Promise，解析为文件列表
   */
  static async getUserFiles(userId: string) {
    const response = await apiClient.get(`/files/user/${userId}`);
    return response.data;
  }

  /**
   * 获取文件详情
   * @param fileId 文件ID
   * @returns 返回Promise，解析为文件详情
   */
  static async getFileDetails(fileId: string) {
    const response = await apiClient.get(`/files/${fileId}`);
    const fileData = response.data;
    
    // 从区块链获取文件信息
    try {
      const blockchainData = await fiscoBcosService.getFileInfo(fileData.hash);
      return { ...fileData, blockchain: blockchainData };
    } catch (err) {
      console.error('无法从区块链获取额外信息:', err);
      return fileData;
    }
  }

  /**
   * 删除文件
   * @param fileId 文件ID
   * @returns 返回Promise，解析为操作结果
   */
  static async deleteFile(fileId: string) {
    const response = await apiClient.delete(`/files/${fileId}`);
    return response.data;
  }
  
  /**
   * 上传文件
   * @param file 文件对象
   * @param userId 用户ID
   * @param email 用户邮箱
   * @returns 返回Promise，解析为上传结果
   */
  static async uploadFile(file: File, userId: string, email: string) {
    // 创建FormData对象上传文件
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('email', email);
    
    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
  
  /**
   * 共享文件
   * @param fileId 文件ID
   * @param targetUserId 目标用户ID
   * @returns 返回Promise，解析为操作结果
   */
  static async shareFile(fileId: string, targetUserId: string) {
    const response = await apiClient.post(`/files/${fileId}/share`, {
      targetUserId
    });
    return response.data;
  }

  /**
   * 设置文件访问权限
   */
  static async setFilePermission(settings: FilePermissionSettings) {
    const response = await apiClient.post(`/files/${settings.fileId}/permissions`, settings);
    return response.data;
  }

  /**
   * 获取文件访问日志
   */
  static async getFileAccessLogs(fileId: string): Promise<FileAccess[]> {
    const response = await apiClient.get(`/files/${fileId}/access-logs`);
    return response.data;
  }

  /**
   * 记录文件访问
   */
  static async logFileAccess(fileId: string, accessType: 'view' | 'download' | 'share') {
    const response = await apiClient.post(`/files/${fileId}/access-logs`, { accessType });
    return response.data;
  }

  /**
   * 验证文件访问权限
   */
  static async checkFileAccess(fileId: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/files/${fileId}/check-access`);
      return response.data.hasAccess;
    } catch (error) {
      return false;
    }
  }

  /**
   * 下载文件
   */
  static async downloadFile(fileId: string) {
    const response = await apiClient.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    });
    
    // 记录下载操作
    await this.logFileAccess(fileId, 'download');
    
    return response.data;
  }
}

export default FileService;
