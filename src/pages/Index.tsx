
/**
 * 首页组件
 * 显示用户的文件列表
 */

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FileCard from '@/components/dashboard/FileCard';
import ShareDialog from '@/components/sharing/ShareDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import FilePermissionDialog from '@/components/file/FilePermissionDialog';
import FileService from '@/services/fileService';

// Define the FileItem type to match FileCard props
interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  hash?: string;
  owner: string;
  permission?: string;
}

const Index: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | undefined>(undefined);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // Mock data for frontend development
  const mockFiles: FileItem[] = [
    {
      id: 'file-1',
      name: '财务报表.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: '1024',
      uploadDate: new Date().toISOString().split('T')[0],
      hash: '0x1234567890abcdef',
      owner: 'Demo User',
      permission: 'private'
    },
    {
      id: 'file-2',
      name: '技术文档.pdf',
      type: 'application/pdf',
      size: '2048',
      uploadDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      hash: '0x0987654321fedcba',
      owner: 'Demo User',
      permission: 'shared'
    }
  ];

  // Get user files
  useEffect(() => {
    // Use mock data instead of fetching from Supabase
    setFiles(mockFiles);
  }, []);

  // Filter files based on search query
  const filteredFiles = files.filter(
    (file) => file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // File operation handlers
  const handleDownload = async (file: FileItem) => {
    toast({
      title: "文件下载已开始",
      description: `正在下载: ${file.name}`,
    });
    
    try {
      const fileBlob = await FileService.downloadFile(file.id);
      
      // Create download link
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error: any) {
      toast({
        title: "下载失败",
        description: error.message || "无法下载文件",
        variant: "destructive"
      });
    }
  };

  const handleShare = (file: FileItem) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
  };

  const handleView = async (file: FileItem) => {
    toast({
      title: "查看文件详情",
      description: `文件: ${file.name}`,
    });
  };

  const handleDelete = async (file: FileItem) => {
    try {
      await FileService.deleteFile(file.id);

      // Update local files list
      setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));

      toast({
        title: "文件已删除",
        description: `已删除: ${file.name}`,
      });
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message || "无法删除文件",
        variant: "destructive"
      });
    }
  };
  
  const handlePermission = (file: FileItem) => {
    setSelectedFile(file);
    setPermissionDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">我的文件</h1>
          <div className="flex space-x-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate('/admin/files')}>
                <Shield className="mr-2 h-4 w-4" />
                文件管理
              </Button>
            )}
            <Button onClick={() => navigate('/upload')}>
              <Upload className="mr-2 h-4 w-4" />
              上传新文件
            </Button>
          </div>
        </div>

        <div className="flex mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {files.length === 0 ? "您还没有上传任何文件" : "没有找到匹配的文件"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDownload={() => handleDownload(file)}
                onShare={() => handleShare(file)}
                onView={() => handleView(file)}
                onDelete={() => handleDelete(file)}
              />
            ))}
          </div>
        )}
      </div>

      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        file={selectedFile}
      />
      
      <FilePermissionDialog
        open={permissionDialogOpen}
        onClose={() => setPermissionDialogOpen(false)}
        file={selectedFile ? {
          id: selectedFile.id,
          name: selectedFile.name,
          owner: selectedFile.owner,
          size: selectedFile.size,
          hash: selectedFile.hash || '',
          permission: selectedFile.permission || 'private',
          sharedWith: [],
          uploadDate: selectedFile.uploadDate,
          contentType: selectedFile.type
        } : null}
        onSave={async (fileId, permission, sharedUserIds) => {
          try {
            // Use the simplified FileOperationsService
            await FileService.setFilePermission({
              fileId,
              permission,
              sharedUserIds
            });
            
            // Update local files permissions
            setFiles(prevFiles => 
              prevFiles.map(f => 
                f.id === fileId ? { ...f, permission } : f
              )
            );
            
            toast({
              title: "权限已更新",
              description: "文件访问权限设置已更新"
            });
          } catch (error: any) {
            toast({
              title: "更新失败",
              description: error.message || "无法更新文件权限",
              variant: "destructive"
            });
          }
        }}
      />
    </MainLayout>
  );
};

export default Index;
