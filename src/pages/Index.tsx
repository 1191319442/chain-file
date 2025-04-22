
/**
 * 首页组件
 * 显示用户的文件列表，通过 Supabase 获取真实文件数据
 */

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FileCard, { FileItem } from '@/components/dashboard/FileCard';
import ShareDialog from '@/components/sharing/ShareDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Index: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | undefined>(undefined);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 获取用户文件
  const fetchUserFiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedFiles: FileItem[] = data.map(file => ({
        id: file.id,
        name: file.name,
        type: file.content_type || 'application/octet-stream',
        size: file.size,
        uploadDate: new Date(file.created_at || '').toISOString().split('T')[0],
        hash: file.hash,
        owner: user.email || '未知用户'
      }));

      setFiles(formattedFiles);
    } catch (error: any) {
      toast({
        title: "获取文件失败",
        description: error.message || "无法加载文件列表",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUserFiles();
  }, [user]);

  // 根据搜索关键词筛选文件
  const filteredFiles = files.filter(
    (file) => file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 文件操作处理函数
  const handleDownload = async (file: FileItem) => {
    toast({
      title: "文件下载已开始",
      description: `正在从区块链下载: ${file.name}`,
    });
  };

  const handleShare = (file: FileItem) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
  };

  const handleView = (file: FileItem) => {
    toast({
      title: "查看文件详情",
      description: `文件: ${file.name}`,
    });
  };

  const handleDelete = async (file: FileItem) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;

      // 更新本地文件列表
      setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));

      toast({
        title: "文件已删除",
        description: `已从区块链中删除: ${file.name}`,
      });
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message || "无法删除文件",
        variant: "destructive"
      });
    }
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
