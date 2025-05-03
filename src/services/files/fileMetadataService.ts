
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
    const { data, error } = await supabase
      .from('files')
      .select(`
        id,
        name,
        size,
        hash,
        content_type,
        permission,
        created_at,
        user_id
      `)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return data.map(file => ({
      id: file.id,
      name: file.name,
      owner: file.user_id,
      size: file.size,
      hash: file.hash,
      permission: (file.permission || 'private') as any,
      sharedWith: [],
      uploadDate: new Date(file.created_at).toISOString(),
      contentType: file.content_type || 'application/octet-stream'
    }));
  }

  /**
   * 获取文件详情
   */
  static async getFileDetails(fileId: string): Promise<FileMetadata> {
    const { data, error } = await supabase
      .from('files')
      .select(`
        id,
        name,
        size,
        hash,
        content_type,
        permission,
        created_at,
        user_id
      `)
      .eq('id', fileId)
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      owner: data.user_id,
      size: data.size,
      hash: data.hash,
      permission: (data.permission || 'private') as any,
      sharedWith: [],
      uploadDate: new Date(data.created_at).toISOString(),
      contentType: data.content_type || 'application/octet-stream'
    };
  }

  /**
   * 获取所有文件（仅管理员）
   */
  static async getAllFiles(): Promise<FileMetadata[]> {
    // For admin use, fetch from the admin view
    const { data, error } = await supabase
      .from('admin_files_view')
      .select(`
        id,
        name,
        size,
        hash,
        content_type,
        permission,
        created_at,
        user_id,
        owner_name
      `);
      
    if (error) throw error;
    
    return data.map(file => ({
      id: file.id,
      name: file.name,
      owner: file.user_id,
      ownerName: file.owner_name,
      size: file.size,
      hash: file.hash,
      permission: (file.permission || 'private') as any,
      sharedWith: [],
      uploadDate: new Date(file.created_at).toISOString(),
      contentType: file.content_type || 'application/octet-stream'
    }));
  }
}

export async function getFilesList() {
  const { data, error } = await supabase
    .from('files')
    .select(`
      id,
      name,
      size,
      hash,
      content_type,
      permission,
      created_at,
      user_id,
      profiles(username)
    `);
    
  if (error) throw error;
  
  return data.map(file => ({
    ...file,
    id: file.id,
    username: file.profiles?.username || 'Unknown User'
  }));
}
