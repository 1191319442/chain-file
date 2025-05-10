
import { supabase } from '@/integrations/supabase/client';
import { FileAccess, FileAccessLog } from '@/types/file';

/**
 * Service for handling file access logging
 */
export class FileAccessService {
  /**
   * Log file access event
   */
  static async logAccess(fileId: string, fileHash: string, accessType: 'view' | 'download' | 'share', details?: string): Promise<boolean> {
    try {
      // Get current user
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) {
        console.error("User not authenticated");
        return false;
      }

      // Call RPC function to log access
      const { error } = await supabase
        .rpc('log_file_access', {
          file_hash_param: fileHash,
          access_type_param: accessType,
          details_param: details || null
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
      // Call the stored procedure to get file access logs
      const { data, error } = await supabase
        .rpc('get_file_access_logs', { file_hash_param: fileHash });
      
      if (error) {
        console.error('Error fetching file access logs:', error);
        return [];
      }
      
      return (data || []).map((log: any) => ({
        id: log.id || '',
        fileId: log.file_hash || '',
        userId: log.user_id || '',
        accessType: log.access_type || 'view',
        timestamp: new Date(log.timestamp).getTime(),
        details: log.details || '',
        username: log.username || 'Unknown User'
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
      // Call the stored procedure to get user's file access logs
      const { data, error } = await supabase
        .rpc('get_user_file_access_logs', { user_id_param: userId });
      
      if (error) {
        console.error('Error fetching user file access logs:', error);
        return [];
      }
      
      return (data || []).map((log: any) => ({
        id: log.id || '',
        fileId: log.file_hash || '',
        userId: log.user_id || '',
        accessType: log.access_type || 'view',
        timestamp: new Date(log.timestamp).getTime(),
        details: log.details || '',
        username: log.username || 'Unknown User'
      }));
    } catch (error) {
      console.error('Failed to get user file access logs:', error);
      return [];
    }
  }
}
