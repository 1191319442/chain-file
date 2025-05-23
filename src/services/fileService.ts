
import { FileMetadata, FilePermission, FilePermissionSettings, FileAccess, FileAccessLog } from '@/types/file';
import { FileMetadataService } from './files/fileMetadataService';
import { FileUploadService } from './files/fileUploadService';
import { FileAccessService } from './files/fileAccessService';
import { FileOperationsService } from './files/fileOperationsService';

/**
 * 文件服务类
 * 提供文件相关的业务逻辑的统一入口
 */
export class FileService {
  static getUserFiles = FileMetadataService.getUserFiles;
  static getFileDetails = FileMetadataService.getFileDetails;
  static getAllFiles = FileMetadataService.getAllFiles;
  
  static uploadFile = FileUploadService.uploadFile;
  
  static getFileAccessLogs = FileAccessService.getFileAccessLogs;
  static logFileAccess = FileAccessService.logAccess;
  static getUserFileAccessLogs = FileAccessService.getUserFileAccessLogs;
  
  static deleteFile = FileOperationsService.deleteFile;
  static shareFile = FileOperationsService.shareFile;
  static setFilePermission = FileOperationsService.setFilePermission;
  static downloadFile = FileOperationsService.downloadFile;
  
  // Alias method to match expected function name in LogQuery.tsx
  static getAllAccessLogs(fileHash: string): Promise<FileAccessLog[]> {
    return FileAccessService.getFileAccessLogs(fileHash);
  }
}

export default FileService;
