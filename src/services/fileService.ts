import { supabase } from '@/integrations/supabase/client';
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
  static async getUserFiles(userId: string): Promise<FileMetadata[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      owner: userId,
      size: item.size,
      hash: item.hash,
      permission: 'private' as FilePermission, // 使用默认值，因为files表可能没有permission字段
      sharedWith: [],  // 使用默认值，因为files表可能没有shared_with字段
      uploadDate: new Date(item.created_at).toISOString(),
      contentType: item.content_type || 'application/octet-stream'
    }));
  }

  /**
   * 获取文件详情
   * @param fileId 文件ID
   * @returns 返回Promise，解析为文件详情
   */
  static async getFileDetails(fileId: string): Promise<FileMetadata> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      owner: data.user_id,
      size: data.size,
      hash: data.hash,
      permission: 'private' as FilePermission, // 使用默认值
      sharedWith: [],  // 使用默认值
      uploadDate: new Date(data.created_at).toISOString(),
      contentType: data.content_type || 'application/octet-stream'
    };
  }

  /**
   * 删除文件
   * @param fileId 文件ID
   * @returns 返回Promise，解析为操作结果
   */
  static async deleteFile(fileId: string): Promise<boolean> {
    // 从数据库中删除元数据
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);
      
    if (error) throw error;
    
    return true;
  }
  
  /**
   * 上传文件
   * @param file 文件对象
   * @param userId 用户ID
   * @param email 用户邮箱
   * @returns 返回Promise，解析为上传结果
   */
  static async uploadFile(file: File, userId: string, email: string): Promise<string> {
    // 生成唯一文件路径
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // 计算文件哈希
    const fileHash = await this.calculateFileHash(file);
    
    // 上传到 Supabase 存储
    const { error: uploadError } = await supabase
      .storage
      .from('files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
    
    // 创建文件元数据记录
    const { error: dbError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        user_id: userId,
        size: file.size.toString(),
        content_type: file.type || 'application/octet-stream',
        hash: fileHash
      });
      
    if (dbError) {
      // 如果创建元数据失败，删除已上传的文件
      await supabase.storage.from('files').remove([filePath]);
      throw dbError;
    }
    
    return fileHash;
  }
  
  /**
   * 计算文件哈希
   */
  static async calculateFileHash(file: File): Promise<string> {
    return new Promise((resolve) => {
      // 实际项目中应使用 crypto API 计算真实的哈希值
      // 这里仅返回文件大小和最后修改时间的简单组合
      const hashValue = `${file.size}-${file.lastModified}`;
      resolve(hashValue);
    });
  }
  
  /**
   * 共享文件
   */
  static async shareFile(fileId: string, targetUserId: string): Promise<boolean> {
    // 无法共享文件，因为没有共享功能
    console.warn('共享文件功能未实现，因为数据库架构不支持');
    return false;
  }

  /**
   * 设置文件访问权限
   */
  static async setFilePermission(settings: FilePermissionSettings): Promise<boolean> {
    // 无法设置权限，因为没有权限字段
    console.warn('设置文件权限功能未实现，因为数据库架构不支持');
    return false;
  }

  /**
   * 获取文件访问日志
   */
  static async getFileAccessLogs(fileId: string): Promise<FileAccess[]> {
    return []; // 无法获取访问日志，因为没有日志表
  }

  /**
   * 记录文件访问
   */
  static async logFileAccess(fileId: string, accessType: 'view' | 'download' | 'share'): Promise<boolean> {
    // 无法记录访问，因为没有日志表
    return false;
  }

  /**
   * 验证文件访问权限
   */
  static async checkFileAccess(fileId: string): Promise<boolean> {
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;
    
    // 查询文件信息
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();
      
    if (error) return false;
    
    // 检查访问权限 - 只支持文件所有者访问
    const userId = session.user.id;
    return data.user_id === userId;
  }

  /**
   * 下载文件
   */
  static async downloadFile(fileId: string): Promise<Blob> {
    // 在实际实现中，这里应该从文件存储中获取文件
    throw new Error('下载文件功能未实现');
  }
  
  /**
   * 获取所有文件（仅管理员）
   */
  static async getAllFiles(): Promise<FileMetadata[]> {
    const { data, error } = await supabase
      .from('files')
      .select(`
        *,
        profiles:user_id(username)
      `);
      
    if (error) throw error;
    
    return (data || []).map(item => {
      // 处理可能的关联查询错误，添加null检查
      const ownerName = item.profiles && 
        typeof item.profiles === 'object' && 
        'username' in item.profiles 
          ? (item.profiles as { username?: string }).username
          : undefined;
        
      return {
        id: item.id,
        name: item.name,
        owner: item.user_id,
        ownerName: ownerName,
        size: item.size,
        hash: item.hash,
        permission: 'private' as FilePermission, // 使用默认值
        sharedWith: [],  // 使用默认值
        uploadDate: new Date(item.created_at).toISOString(),
        contentType: item.content_type || 'application/octet-stream'
      };
    });
  }
  
  /**
   * 获取所有访问日志（仅管理员）
   */
  static async getAllAccessLogs(): Promise<FileAccess[]> {
    // 无法获取访问日志，因为没有日志表
    return [];
  }
}

export default FileService;
