
import { FileMetadata } from '@/types/file';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service handling file metadata operations
 * Integrated with Supabase
 */
export class FileMetadataService {
  /**
   * 获取用户的文件列表
   */
  static async getUserFiles(userId: string): Promise<FileMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select(`
          hash,
          name,
          size,
          content_type,
          permission,
          created_at,
          user_id
        `)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      return (data || []).map(file => ({
        id: file.hash, // Use hash as ID since id column doesn't exist
        name: file.name,
        owner: file.user_id,
        size: file.size,
        hash: file.hash,
        permission: (file.permission || 'private') as any,
        sharedWith: [],
        uploadDate: new Date(file.created_at).toISOString(),
        contentType: file.content_type || 'application/octet-stream'
      }));
    } catch (error) {
      console.error('Error fetching user files:', error);
      return [];
    }
  }

  /**
   * 获取文件详情
   */
  static async getFileDetails(fileHash: string): Promise<FileMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select(`
          hash,
          name,
          size,
          content_type,
          permission,
          created_at,
          user_id
        `)
        .eq('hash', fileHash)
        .maybeSingle();
        
      if (error || !data) {
        console.error('Error fetching file details:', error || 'File not found');
        return null;
      }
      
      return {
        id: data.hash, // Use hash as ID
        name: data.name,
        owner: data.user_id,
        size: data.size,
        hash: data.hash,
        permission: (data.permission || 'private') as any,
        sharedWith: [],
        uploadDate: new Date(data.created_at).toISOString(),
        contentType: data.content_type || 'application/octet-stream'
      };
    } catch (error) {
      console.error('Error fetching file details:', error);
      return null;
    }
  }

  /**
   * 获取所有文件（仅管理员）
   */
  static async getAllFiles(): Promise<FileMetadata[]> {
    try {
      // Instead of querying admin_files_view which doesn't exist,
      // join the files table with profiles to get owner information
      const { data, error } = await supabase
        .from('files')
        .select(`
          hash,
          name,
          size,
          content_type,
          permission,
          created_at,
          user_id,
          profiles:profiles(username)
        `);
      
      if (error) throw error;
      
      return (data || []).map(file => ({
        id: file.hash, // Use hash as ID
        name: file.name,
        owner: file.user_id,
        ownerName: file.profiles?.username || 'Unknown User',
        size: file.size,
        hash: file.hash,
        permission: (file.permission || 'private') as any,
        sharedWith: [],
        uploadDate: new Date(file.created_at).toISOString(),
        contentType: file.content_type || 'application/octet-stream'
      }));
    } catch (error) {
      console.error('Error fetching all files:', error);
      return [];
    }
  }
}

export async function getFilesList() {
  try {
    const { data, error } = await supabase
      .from('files')
      .select(`
        hash,
        name,
        size,
        content_type,
        permission,
        created_at,
        user_id,
        profiles:profiles(username)
      `);
      
    if (error) throw error;
    
    return (data || []).map(file => ({
      ...file,
      id: file.hash, // Use hash as ID
      username: file.profiles?.username || 'Unknown User'
    }));
  } catch (error) {
    console.error('Error fetching files list:', error);
    return [];
  }
}
