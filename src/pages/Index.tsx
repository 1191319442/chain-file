
/**
 * 首页组件
 * 显示用户的文件列表，提供搜索和文件操作功能
 */

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FileCard, { FileItem } from '@/components/dashboard/FileCard';
import ShareDialog from '@/components/sharing/ShareDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

// 模拟文件数据 - 生产环境中应该从API获取
const MOCK_FILES: FileItem[] = [
  {
    id: '1',
    name: '项目方案.pdf',
    type: 'application/pdf',
    size: '2.4 MB',
    uploadDate: '2025-04-08',
    hash: '0x8f5e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    owner: '当前用户'
  },
  {
    id: '2',
    name: '会议记录.docx',
    type: 'application/docx',
    size: '1.1 MB',
    uploadDate: '2025-04-07',
    hash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
    owner: '当前用户'
  },
  {
    id: '3',
    name: '产品设计图.png',
    type: 'image/png',
    size: '3.2 MB',
    uploadDate: '2025-04-06',
    hash: '0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    owner: '当前用户'
  },
  {
    id: '4',
    name: '研究数据.xlsx',
    type: 'application/xlsx',
    size: '1.7 MB',
    uploadDate: '2025-04-05',
    hash: '0x5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    owner: '当前用户'
  },
  {
    id: '5',
    name: '系统文档.pdf',
    type: 'application/pdf',
    size: '4.3 MB',
    uploadDate: '2025-04-04',
    hash: '0x4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    owner: '当前用户'
  },
  {
    id: '6',
    name: '源代码压缩包.zip',
    type: 'application/zip',
    size: '7.5 MB',
    uploadDate: '2025-04-03',
    hash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    owner: '当前用户'
  }
];

const Index: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | undefined>(undefined);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 根据搜索关键词筛选文件
  const filteredFiles = MOCK_FILES.filter(
    (file) => file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // TODO: 替换为后端API - 文件下载接口
  const handleDownload = (file: FileItem) => {
    // 示例:
    // try {
    //   const response = await api.get(`/files/${file.id}/download`, { responseType: 'blob' });
    //   // 创建下载链接
    //   const url = window.URL.createObjectURL(new Blob([response.data]));
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.setAttribute('download', file.name);
    //   document.body.appendChild(link);
    //   link.click();
    //   link.remove();
    // } catch (error) {
    //   toast({
    //     title: "下载失败",
    //     description: error.message || "无法下载文件",
    //     variant: "destructive"
    //   });
    // }
    
    toast({
      title: "文件下载已开始",
      description: `正在从区块链下载: ${file.name}`,
    });
  };

  // 处理文件分享
  const handleShare = (file: FileItem) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
  };

  // TODO: 替换为后端API - 文件详情查看接口
  const handleView = (file: FileItem) => {
    // 示例:
    // try {
    //   const response = await api.get(`/files/${file.id}`);
    //   // 处理文件详情数据
    //   setFileDetails(response.data);
    //   setFileDetailsModalOpen(true);
    // } catch (error) {
    //   toast({
    //     title: "获取文件详情失败",
    //     description: error.message || "无法获取文件信息",
    //     variant: "destructive"
    //   });
    // }
    
    toast({
      title: "查看文件详情",
      description: `文件: ${file.name}`,
    });
  };

  // TODO: 替换为后端API - 文件删除接口
  const handleDelete = (file: FileItem) => {
    // 示例:
    // try {
    //   await api.delete(`/files/${file.id}`);
    //   // 更新文件列表
    //   setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));
    //   toast({
    //     title: "文件已删除",
    //     description: `已从区块链中删除: ${file.name}`,
    //   });
    // } catch (error) {
    //   toast({
    //     title: "删除失败",
    //     description: error.message || "无法删除文件",
    //     variant: "destructive"
    //   });
    // }
    
    toast({
      title: "文件已删除",
      description: `已从区块链中删除: ${file.name}`,
      variant: "destructive",
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">我的文件</h1>
          <Button onClick={() => navigate('/upload')}>
            <Upload className="mr-2 h-4 w-4" />
            上传新文件
          </Button>
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
            <p className="text-muted-foreground">没有找到匹配的文件</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDownload={handleDownload}
                onShare={handleShare}
                onView={handleView}
                onDelete={handleDelete}
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
    </MainLayout>
  );
};

export default Index;
