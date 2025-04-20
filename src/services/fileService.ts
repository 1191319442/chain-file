
import { supabase } from '@/integrations/supabase/client';
import { fiscoBcosService } from './fiscoBcosService';

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
    const { data, error } = await supabase
      .from('files')
      .select(`
        id,
        name,
        size,
        hash,
        content_type,
        tx_hash,
        created_at,
        blockchain_transactions (
          tx_hash,
          status,
          block_number
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }

  /**
   * 获取文件详情
   * @param fileId 文件ID
   * @returns 返回Promise，解析为文件详情
   */
  static async getFileDetails(fileId: string) {
    const { data, error } = await supabase
      .from('files')
      .select(`
        *,
        blockchain_transactions (*)
      `)
      .eq('id', fileId)
      .single();
      
    if (error) throw error;
    
    // 从区块链获取文件信息
    try {
      const blockchainData = await fiscoBcosService.getFileInfo(data.hash);
      return { ...data, blockchain: blockchainData };
    } catch (err) {
      console.error('无法从区块链获取额外信息:', err);
      return data;
    }
  }

  /**
   * 删除文件
   * @param fileId 文件ID
   * @returns 返回Promise，解析为操作结果
   */
  static async deleteFile(fileId: string) {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);
      
    if (error) throw error;
    return { success: true };
  }
}

export default FileService;
