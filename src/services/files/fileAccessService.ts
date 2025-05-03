
import { supabase } from '@/integrations/supabase/client';
import { FileAccessLog } from '@/types/file';

/**
 * Service for handling file access logging
 */
export class FileAccessService {
  /**
   * Log file access event
   */
  static async logAccess(fileId: string, fileHash: string, accessType: 'view' | 'download' | 'share', details?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('file_access_logs')
        .insert({
          file_hash: fileHash,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          access_type: accessType,
          details
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to log file access:', error);
      return false;
    }
  }

  /**
   * Get access logs for a specific file
   */
  static async getFileAccessLogs(fileHash: string): Promise<FileAccessLog[]> {
    try {
      const { data, error } = await supabase
        .from('file_access_logs')
        .select(`
          id,
          file_hash,
          user_id,
          access_type,
          timestamp,
          details,
          profiles:user_id (username)
        `)
        .eq('file_hash', fileHash)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(log => ({
        id: log.id,
        fileId: log.file_hash,
        userId: log.user_id,
        accessType: log.access_type,
        timestamp: new Date(log.timestamp).getTime(),
        details: log.details || '',
        username: log.profiles?.username || 'Unknown User'
      }));
    } catch (error) {
      console.error('Failed to get file access logs:', error);
      return [];
    }
  }
  
  /**
   * Get access logs for a user's files
   */
  static async getUserFileAccessLogs(userId: string): Promise<FileAccessLog[]> {
    try {
      const { data, error } = await supabase
        .from('file_access_logs')
        .select(`
          id,
          file_hash,
          user_id,
          access_type,
          timestamp,
          details
        `)
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(log => ({
        id: log.id,
        fileId: log.file_hash,
        userId: log.user_id,
        accessType: log.access_type,
        timestamp: new Date(log.timestamp).getTime(),
        details: log.details || '',
        username: 'Current User'
      }));
    } catch (error) {
      console.error('Failed to get user file access logs:', error);
      return [];
    }
  }
}
