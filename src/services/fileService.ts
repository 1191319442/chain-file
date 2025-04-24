
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
      .from('file_metadata')
      .select('*')
      .eq('owner_id', userId);
      
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      owner: userId,
      size: item.size_bytes,
      hash: item.hash,
      permission: item.permission as FilePermission,
      sharedWith: item.shared_with || [],
      uploadDate: new Date(item.created_at).toISOString(),
      contentType: item.mime_type
    }));
  }

  /**
   * 获取文件详情
   * @param fileId 文件ID
   * @returns 返回Promise，解析为文件详情
   */
  static async getFileDetails(fileId: string): Promise<FileMetadata> {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('id', fileId)
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      owner: data.owner_id,
      size: data.size_bytes,
      hash: data.hash,
      permission: data.permission as FilePermission,
      sharedWith: data.shared_with || [],
      uploadDate: new Date(data.created_at).toISOString(),
      contentType: data.mime_type
    };
  }

  /**
   * 删除文件
   * @param fileId 文件ID
   * @returns 返回Promise，解析为操作结果
   */
  static async deleteFile(fileId: string): Promise<boolean> {
    // 先获取文件信息以确定存储路径
    const { data: fileData } = await supabase
      .from('file_metadata')
      .select('storage_path')
      .eq('id', fileId)
      .single();
      
    if (fileData?.storage_path) {
      // 从存储中删除文件
      const { error: storageError } = await supabase
        .storage
        .from('files')
        .remove([fileData.storage_path]);
        
      if (storageError) throw storageError;
    }
    
    // 从数据库中删除元数据
    const { error } = await supabase
      .from('file_metadata')
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
    const { error: uploadError, data } = await supabase
      .storage
      .from('files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
    
    // 创建文件元数据记录
    const { error: dbError } = await supabase
      .from('file_metadata')
      .insert({
        name: file.name,
        owner_id: userId,
        size_bytes: file.size,
        mime_type: file.type || 'application/octet-stream',
        hash: fileHash,
        storage_path: filePath,
        permission: 'private' as FilePermission
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
   * @param file 文件对象
   * @returns 返回Promise，解析为文件哈希值
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
   * @param fileId 文件ID
   * @param targetUserId 目标用户ID
   * @returns 返回Promise，解析为操作结果
   */
  static async shareFile(fileId: string, targetUserId: string): Promise<boolean> {
    // 获取当前文件信息
    const { data: fileData, error: fetchError } = await supabase
      .from('file_metadata')
      .select('shared_with, permission')
      .eq('id', fileId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // 更新共享用户列表
    const sharedWith = fileData?.shared_with || [];
    if (!sharedWith.includes(targetUserId)) {
      sharedWith.push(targetUserId);
    }
    
    // 更新文件权限设置
    const { error: updateError } = await supabase
      .from('file_metadata')
      .update({
        shared_with: sharedWith,
        permission: 'shared'
      })
      .eq('id', fileId);
      
    if (updateError) throw updateError;
    
    // 记录访问日志
    await this.logFileAccess(fileId, 'share');
    
    return true;
  }

  /**
   * 设置文件访问权限
   */
  static async setFilePermission(settings: FilePermissionSettings): Promise<boolean> {
    const { fileId, permission, sharedUserIds } = settings;
    
    // 更新文件权限
    const { error } = await supabase
      .from('file_metadata')
      .update({
        permission: permission,
        shared_with: sharedUserIds || []
      })
      .eq('id', fileId);
      
    if (error) throw error;
    
    return true;
  }

  /**
   * 获取文件访问日志
   */
  static async getFileAccessLogs(fileId: string): Promise<FileAccess[]> {
    const { data, error } = await supabase
      .from('file_access_logs')
      .select('*')
      .eq('file_id', fileId)
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(log => ({
      id: log.id,
      fileId: log.file_id,
      userId: log.user_id,
      accessType: log.action_type as 'view' | 'download' | 'share',
      timestamp: log.timestamp,
      txHash: log.tx_hash
    }));
  }

  /**
   * 记录文件访问
   */
  static async logFileAccess(fileId: string, accessType: 'view' | 'download' | 'share'): Promise<boolean> {
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;
    
    // 记录访问日志
    const { error } = await supabase
      .from('file_access_logs')
      .insert({
        file_id: fileId,
        user_id: session.user.id,
        action_type: accessType,
        ip_address: '127.0.0.1', // 实际项目中应获取真实IP
        user_agent: navigator.userAgent
      });
      
    if (error) throw error;
    
    return true;
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
      .from('file_metadata')
      .select('permission, owner_id, shared_with')
      .eq('id', fileId)
      .single();
      
    if (error) return false;
    
    // 检查访问权限
    const userId = session.user.id;
    
    // 文件所有者可以访问
    if (data.owner_id === userId) return true;
    
    // 公共文件任何人可访问
    if (data.permission === 'public') return true;
    
    // 私有文件仅所有者可访问
    if (data.permission === 'private') return false;
    
    // 共享文件检查共享列表
    if (data.permission === 'shared') {
      return (data.shared_with || []).includes(userId);
    }
    
    return false;
  }

  /**
   * 下载文件
   */
  static async downloadFile(fileId: string): Promise<Blob> {
    // 获取文件信息
    const { data: fileData, error: fetchError } = await supabase
      .from('file_metadata')
      .select('storage_path, name')
      .eq('id', fileId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // 下载文件
    const { data, error: downloadError } = await supabase
      .storage
      .from('files')
      .download(fileData.storage_path);
      
    if (downloadError) throw downloadError;
    
    // 记录访问日志
    await this.logFileAccess(fileId, 'download');
    
    return data;
  }
  
  /**
   * 获取所有文件（仅管理员）
   */
  static async getAllFiles(): Promise<FileMetadata[]> {
    const { data, error } = await supabase
      .from('file_metadata')
      .select('*, profiles:owner_id(username)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      owner: item.owner_id,
      size: item.size_bytes,
      hash: item.hash,
      permission: item.permission as FilePermission,
      sharedWith: item.shared_with || [],
      uploadDate: new Date(item.created_at).toISOString(),
      contentType: item.mime_type,
      ownerName: item.profiles?.username
    }));
  }
  
  /**
   * 获取所有访问日志（仅管理员）
   */
  static async getAllAccessLogs(): Promise<FileAccess[]> {
    const { data, error } = await supabase
      .from('file_access_logs')
      .select(`
        *,
        file:file_id(name),
        user:user_id(email)
      `)
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    
    return (data || []).map(log => ({
      id: log.id,
      fileId: log.file_id,
      userId: log.user_id,
      accessType: log.action_type as 'view' | 'download' | 'share',
      timestamp: log.timestamp,
      fileName: log.file?.name,
      userEmail: log.user?.email
    }));
  }
}

export default FileService;
