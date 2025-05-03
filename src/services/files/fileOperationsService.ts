
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service handling basic file operations
 * Integrated with Supabase
 */
export class FileOperationsService {
  /**
   * 删除文件
   */
  static async deleteFile(fileId: string): Promise<boolean> {
    // First get the file info to get the hash
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('hash')
      .eq('id', fileId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Delete the file from the database
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);
      
    if (deleteError) throw deleteError;
    
    // Log the deletion in blockchain_transactions
    await supabase
      .from('blockchain_transactions')
      .insert({
        tx_hash: `tx-${uuidv4().substring(0, 8)}`,
        type: 'verification',
        file_name: 'deleted_file',
        file_hash: fileData.hash,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        status: 'confirmed',
        block_number: Math.floor(10000 + Math.random() * 5000)
      });

    return true;
  }

  /**
   * 共享文件
   */
  static async shareFile(fileId: string, targetUserId: string): Promise<boolean> {
    // Get file info
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('hash, name')
      .eq('id', fileId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Log the share action in file_access_logs
    const { error: logError } = await supabase
      .from('file_access_logs')
      .insert({
        file_hash: fileData.hash,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        access_type: 'share',
        details: JSON.stringify({ shared_with: targetUserId })
      });
      
    if (logError) throw logError;
    
    // Record in blockchain transactions
    await supabase
      .from('blockchain_transactions')
      .insert({
        tx_hash: `tx-${uuidv4().substring(0, 8)}`,
        type: 'share',
        file_name: fileData.name,
        file_hash: fileData.hash,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        status: 'confirmed',
        block_number: Math.floor(10000 + Math.random() * 5000)
      });

    return true;
  }

  /**
   * 设置文件访问权限
   */
  static async setFilePermission(settings: { fileId: string, permission: string, sharedUserIds?: string[] }): Promise<boolean> {
    // Update file permission
    const { error: updateError } = await supabase
      .from('files')
      .update({ permission: settings.permission })
      .eq('id', settings.fileId);
      
    if (updateError) throw updateError;

    return true;
  }

  /**
   * 下载文件
   */
  static async downloadFile(fileId: string): Promise<Blob> {
    // Get file info
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('hash, name')
      .eq('id', fileId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Log the download action
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    await supabase
      .from('file_access_logs')
      .insert({
        file_hash: fileData.hash,
        user_id: userId,
        access_type: 'download'
      });
    
    // Record in blockchain transactions
    await supabase
      .from('blockchain_transactions')
      .insert({
        tx_hash: `tx-${uuidv4().substring(0, 8)}`,
        type: 'download',
        file_name: fileData.name,
        file_hash: fileData.hash,
        user_id: userId,
        status: 'confirmed',
        block_number: Math.floor(10000 + Math.random() * 5000)
      });
    
    // In a real application, we would download the actual file from storage
    // For now, return a dummy blob as we don't have actual file storage implemented yet
    return new Blob(['示例文件内容'], { type: 'text/plain' });
  }
}
