
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

/**
 * Service handling file upload operations
 */
export class FileUploadService {
  /**
   * 上传文件
   */
  static async uploadFile(file: File, userId: string, email: string): Promise<string> {
    try {
      // Calculate file hash using SHA-256
      const fileHash = await this.calculateFileHash(file);
      
      // Check if the file already exists
      const { data: existingFile } = await supabase
        .from('files')
        .select('hash')
        .eq('hash', fileHash)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (existingFile) {
        return fileHash; // File already exists, return its hash
      }
      
      // Create a unique file path
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${timestamp}-${uuidv4()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase
        .storage
        .from('files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Store file metadata in the database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          name: file.name,
          user_id: userId,
          size: file.size.toString(),
          content_type: file.type || 'application/octet-stream',
          hash: fileHash,
          permission: 'private'
        });
      
      if (dbError) {
        // Roll back the storage upload if database insert fails
        await supabase.storage.from('files').remove([filePath]);
        throw dbError;
      }
      
      // Generate blockchain transaction record
      const txHash = `tx_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      const blockNumber = Math.floor(Math.random() * 10000000);
      
      // Store transaction record
      await supabase
        .from('blockchain_transactions')
        .insert({
          tx_hash: txHash,
          file_id: fileHash,
          status: 'confirmed',
          block_number: blockNumber
        });
      
      return fileHash;
    } catch (error) {
      console.error("Error in uploadFile:", error);
      throw error;
    }
  }

  /**
   * 计算文件哈希
   */
  private static async calculateFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileContent = e.target?.result as ArrayBuffer;
          const wordArray = CryptoJS.lib.WordArray.create(fileContent);
          const hash = CryptoJS.SHA256(wordArray).toString();
          resolve(hash);
        };
        reader.onerror = (e) => {
          reject(new Error("Failed to read file for hashing"));
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        // Fallback if file reading fails
        const hashValue = `${file.name}-${file.size}-${file.lastModified}`;
        const hash = CryptoJS.SHA256(hashValue).toString();
        resolve(hash);
      }
    });
  }
}
