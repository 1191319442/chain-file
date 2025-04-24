
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FilePermissionDialog from '@/components/file/FilePermissionDialog';
import { FileMetadata } from '@/types/file';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Share, Trash2, Upload, Eye, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import FileService from '@/services/fileService';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FileManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [fileDetailOpen, setFileDetailOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const allFiles = await FileService.getAllFiles();
      setFiles(allFiles);
    } catch (error: any) {
      toast({
        title: "获取文件失败",
        description: error.message || "无法加载文件列表",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionClick = (file: FileMetadata) => {
    setSelectedFile(file);
    setPermissionDialogOpen(true);
  };

  const handleDeleteFile = async (file: FileMetadata) => {
    if (confirm(`确定删除文件 "${file.name}"?`)) {
      try {
        await FileService.deleteFile(file.id);
        toast({
          title: "文件已删除",
          description: `文件 "${file.name}" 已成功删除`
        });
        fetchFiles(); // 重新加载文件列表
      } catch (error: any) {
        toast({
          title: "删除失败",
          description: error.message || "无法删除文件",
          variant: "destructive"
        });
      }
    }
  };

  const handleViewFileDetails = (file: FileMetadata) => {
    setSelectedFile(file);
    setFileDetailOpen(true);
  };

  const handleDownloadFile = async (file: FileMetadata) => {
    try {
      const fileBlob = await FileService.downloadFile(file.id);
      
      // 创建下载链接
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast({
        title: "下载成功",
        description: `文件 "${file.name}" 已开始下载`
      });
    } catch (error: any) {
      toast({
        title: "下载失败",
        description: error.message || "无法下载文件",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">文件管理</h1>
          <Button onClick={() => window.location.href = '/upload'}>
            <Upload className="w-4 h-4 mr-2" />
            上传文件
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">加载文件列表中...</p>
          </div>
        ) : (
          <Table>
            <TableCaption>系统中的所有文件</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>文件名</TableHead>
                <TableHead>所有者</TableHead>
                <TableHead>大小</TableHead>
                <TableHead>上传日期</TableHead>
                <TableHead>权限</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">暂无文件</TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>{file.name}</TableCell>
                    <TableCell>{file.ownerName || file.owner}</TableCell>
                    <TableCell>{typeof file.size === 'number' ? `${(file.size / 1024).toFixed(2)} KB` : file.size}</TableCell>
                    <TableCell>{new Date(file.uploadDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {file.permission === 'public' ? '公开' : 
                       file.permission === 'private' ? '私有' : '共享'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewFileDetails(file)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadFile(file)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handlePermissionClick(file)}>
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <FilePermissionDialog
          open={permissionDialogOpen}
          onClose={() => setPermissionDialogOpen(false)}
          file={selectedFile}
          onSave={async (fileId, permission, sharedUserIds) => {
            try {
              await FileService.setFilePermission({
                fileId,
                permission,
                sharedUserIds
              });
              
              toast({
                title: "权限已更新",
                description: "文件访问权限设置已更新"
              });
              
              fetchFiles(); // 重新加载文件列表
            } catch (error: any) {
              toast({
                title: "更新失败",
                description: error.message || "无法更新文件权限",
                variant: "destructive"
              });
            }
            setPermissionDialogOpen(false);
          }}
        />

        <Dialog open={fileDetailOpen} onOpenChange={setFileDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>文件详情</DialogTitle>
            </DialogHeader>
            {selectedFile && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="font-medium">文件名:</div>
                  <div>{selectedFile.name}</div>
                  
                  <div className="font-medium">所有者:</div>
                  <div>{selectedFile.ownerName || selectedFile.owner}</div>
                  
                  <div className="font-medium">大小:</div>
                  <div>{typeof selectedFile.size === 'number' ? `${(selectedFile.size / 1024).toFixed(2)} KB` : selectedFile.size}</div>
                  
                  <div className="font-medium">类型:</div>
                  <div>{selectedFile.contentType}</div>
                  
                  <div className="font-medium">上传日期:</div>
                  <div>{new Date(selectedFile.uploadDate).toLocaleString()}</div>
                  
                  <div className="font-medium">权限:</div>
                  <div>
                    {selectedFile.permission === 'public' ? '公开' : 
                     selectedFile.permission === 'private' ? '私有' : '共享'}
                  </div>
                  
                  <div className="font-medium">哈希值:</div>
                  <div className="break-all text-xs">{selectedFile.hash}</div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default FileManagement;
