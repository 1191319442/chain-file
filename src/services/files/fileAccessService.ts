
import { FileAccess } from '@/types/file';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service handling file access and permissions
 * Integrated with Supabase
 */
export class FileAccessService {
  /**
   * 获取文件访问日志
   */
  static async getFileAccessLogs(fileId: string): Promise<FileAccess[]> {
    // First get the file hash
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('hash, name')
      .eq('id', fileId)
      .single();
      
    if (fileError) throw fileError;
    
    // Then get all logs for this file hash
    const { data: logsData, error: logsError } = await supabase
      .from('file_access_logs')
      .select(`
        id,
        file_hash,
        user_id,
        access_type,
        timestamp,
        details,
        profiles(username, email)
      `)
      .eq('file_hash', fileData.hash);
      
    if (logsError) throw logsError;
    
    return logsData.map(log => ({
      id: log.id,
      fileId: fileId,
      userId: log.user_id,
      accessType: log.access_type as any,
      timestamp: new Date(log.timestamp).toISOString(),
      fileName: fileData.name,
      userEmail: log.profiles?.email || log.profiles?.username || log.user_id
    }));
  }

  /**
   * 记录文件访问
   */
  static async logFileAccess(fileId: string, accessType: 'view' | 'download' | 'share'): Promise<boolean> {
    // Get file hash
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('hash')
      .eq('id', fileId)
      .single();
      
    if (fileError) throw fileError;
    
    // Log access
    const { error: logError } = await supabase
      .from('file_access_logs')
      .insert({
        file_hash: fileData.hash,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        access_type: accessType
      });
      
    if (logError) throw logError;
    
    return true;
  }

  /**
   * 验证文件访问权限
   */
  static async checkFileAccess(fileId: string): Promise<boolean> {
    // Check if user has access to this file
    const { data, error } = await supabase
      .from('files')
      .select('id')
      .eq('id', fileId);
      
    if (error) throw error;
    
    return data.length > 0;
  }

  /**
   * 获取所有访问日志（仅管理员）
   */
  static async getAllAccessLogs(): Promise<FileAccess[]> {
    const { data, error } = await supabase
      .from('file_access_logs')
      .select(`
        id,
        file_hash,
        user_id,
        access_type,
        timestamp,
        details,
        profiles:user_id(username, email)
      `)
      .order('timestamp', { ascending: false });
      
    if (error) throw error;
    
    // Get file names for each hash
    const fileHashes = [...new Set(data.map(log => log.file_hash))];
    const { data: filesData, error: filesError } = await supabase
      .from('files')
      .select('hash, name, id')
      .in('hash', fileHashes);
      
    if (filesError) throw filesError;
    
    const hashToFileMap = new Map();
    filesData.forEach(file => {
      hashToFileMap.set(file.hash, { name: file.name, id: file.id });
    });
    
    return data.map(log => {
      const fileInfo = hashToFileMap.get(log.file_hash) || { name: 'Unknown File', id: null };
      
      return {
        id: log.id,
        fileId: fileInfo.id || 'unknown',
        userId: log.user_id,
        accessType: log.access_type as any,
        timestamp: new Date(log.timestamp).toISOString(),
        fileName: fileInfo.name,
        userEmail: log.profiles?.email || log.profiles?.username || log.user_id,
        txHash: log.access_type === 'share' ? `0x${uuidv4().replace(/-/g, '')}` : undefined
      };
    });
  }
}
