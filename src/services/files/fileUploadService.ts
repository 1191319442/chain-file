
import { supabase } from '@/integrations/supabase/client';

/**
 * Service handling file upload operations
 */
export class FileUploadService {
  /**
   * 上传文件
   */
  static async uploadFile(file: File, userId: string, email: string): Promise<string> {
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const fileHash = await this.calculateFileHash(file);
    
    const { error: uploadError } = await supabase
      .storage
      .from('files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
    
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
      await supabase.storage.from('files').remove([filePath]);
      throw dbError;
    }
    
    return fileHash;
  }

  /**
   * 计算文件哈希
   */
  private static async calculateFileHash(file: File): Promise<string> {
    return new Promise((resolve) => {
      const hashValue = `${file.size}-${file.lastModified}`;
      resolve(hashValue);
    });
  }
}

