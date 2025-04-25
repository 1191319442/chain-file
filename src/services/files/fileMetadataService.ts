import { supabase } from '@/integrations/supabase/client';
import { FileMetadata } from '@/types/file';

/**
 * Service handling file metadata operations
 */
export class FileMetadataService {
  /**
   * 获取用户的文件列表
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
      permission: 'private',
      sharedWith: [],
      uploadDate: new Date(data.created_at).toISOString(),
      contentType: data.content_type || 'application/octet-stream'
    };
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
        permission: 'private',
        sharedWith: [],
        uploadDate: new Date(item.created_at).toISOString(),
        contentType: item.content_type || 'application/octet-stream'
      };
    });
  }
}

export async function getFilesList() {
  const { data: files, error } = await supabase
    .from('files')
    .select(`
      *,
      profiles (
        username,
        is_admin
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching files:', error);
    return [];
  }

  return files.map(item => ({
    ...item,
    username: item.profiles?.username || 'Unknown User'
  }));
}
