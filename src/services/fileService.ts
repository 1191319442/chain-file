
import { FileMetadata, FilePermission, FilePermissionSettings, FileAccess } from '@/types/file';
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
  static logFileAccess = FileAccessService.logFileAccess;
  static checkFileAccess = FileAccessService.checkFileAccess;
  static getAllAccessLogs = FileAccessService.getAllAccessLogs;
  
  static deleteFile = FileOperationsService.deleteFile;
  static shareFile = FileOperationsService.shareFile;
  static setFilePermission = FileOperationsService.setFilePermission;
  static downloadFile = FileOperationsService.downloadFile;
}

export default FileService;

