
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share, FileText, MoreVertical, File, Image, FileArchive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilePermission } from '@/types/file';

export type FileItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  hash: string;
  owner: string;
  permission?: FilePermission;
};

type FileCardProps = {
  file: FileItem;
  onDownload: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onView: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
};

const getFileIcon = (type: string) => {
  if (type.includes("image")) return <Image size={24} />;
  if (type.includes("pdf")) return <FileText size={24} />;
  if (type.includes("zip") || type.includes("rar")) return <FileArchive size={24} />;
  return <File size={24} />;
};

const FileCard: React.FC<FileCardProps> = ({ file, onDownload, onShare, onView, onDelete }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3 items-center">
            <div className="p-2 bg-primary-50 text-primary-500 rounded-lg">
              {getFileIcon(file.type)}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-medium text-base truncate">{file.name}</h3>
              <p className="text-sm text-muted-foreground">{file.size} • {file.uploadDate}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView(file)}>
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(file)}>
                下载文件
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(file)}>
                分享文件
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(file)}>
                删除文件
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 text-xs text-muted-foreground overflow-hidden">
          <p className="truncate">文件哈希: {file.hash}</p>
          <p>所有者: {file.owner}</p>
        </div>
        <div className="mt-4 flex justify-between gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1"
            onClick={() => onDownload(file)}
          >
            <Download size={14} className="mr-1" />
            下载
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onShare(file)}
          >
            <Share size={14} className="mr-1" />
            分享
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileCard;
