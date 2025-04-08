
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, FileText, Download, Share2, ArrowUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type HistoryItem = {
  id: string;
  fileName: string;
  fileType: string;
  action: 'upload' | 'download' | 'share' | 'verify' | 'update';
  actionBy: string;
  timestamp: string;
  details: string;
  status: 'success' | 'pending' | 'failed';
};

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: '1',
    fileName: '项目方案.pdf',
    fileType: 'application/pdf',
    action: 'upload',
    actionBy: '当前用户',
    timestamp: '2025-04-08 14:32:15',
    details: '初次上传文件到区块链',
    status: 'success'
  },
  {
    id: '2',
    fileName: '项目方案.pdf',
    fileType: 'application/pdf',
    action: 'share',
    actionBy: '当前用户',
    timestamp: '2025-04-08 15:45:22',
    details: '与张三共享文件，7天有效期',
    status: 'success'
  },
  {
    id: '3',
    fileName: '会议记录.docx',
    fileType: 'application/docx',
    action: 'upload',
    actionBy: '当前用户',
    timestamp: '2025-04-07 10:12:05',
    details: '初次上传文件到区块链',
    status: 'success'
  },
  {
    id: '4',
    fileName: '会议记录.docx',
    fileType: 'application/docx',
    action: 'update',
    actionBy: '当前用户',
    timestamp: '2025-04-07 16:27:33',
    details: '更新文件内容，新增会议结论',
    status: 'success'
  },
  {
    id: '5',
    fileName: '产品设计图.png',
    fileType: 'image/png',
    action: 'upload',
    actionBy: '当前用户',
    timestamp: '2025-04-06 09:38:11',
    details: '初次上传文件到区块链',
    status: 'success'
  },
  {
    id: '6',
    fileName: '产品设计图.png',
    fileType: 'image/png',
    action: 'download',
    actionBy: '王五',
    timestamp: '2025-04-06 11:52:48',
    details: '用户王五下载了共享文件',
    status: 'success'
  },
  {
    id: '7',
    fileName: '研究数据.xlsx',
    fileType: 'application/xlsx',
    action: 'verify',
    actionBy: '系统',
    timestamp: '2025-04-05 13:20:37',
    details: '系统定期验证文件完整性',
    status: 'success'
  }
];

const History: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  // 过滤和排序历史记录
  const filteredHistory = MOCK_HISTORY
    .filter((item) => 
      (item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.details.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterAction === 'all' || item.action === filterAction)
    )
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'download':
        return <Download className="h-4 w-4 text-green-500" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-purple-500" />;
      case 'verify':
        return <FileText className="h-4 w-4 text-amber-500" />;
      case 'update':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'upload':
        return '上传';
      case 'download':
        return '下载';
      case 'share':
        return '共享';
      case 'verify':
        return '验证';
      case 'update':
        return '更新';
      default:
        return action;
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">文件历史</h1>
          <p className="text-muted-foreground mt-2">
            跟踪所有文件的操作和变更历史记录，所有操作均记录在区块链上
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="搜索文件名或详情..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="操作类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有操作</SelectItem>
              <SelectItem value="upload">上传</SelectItem>
              <SelectItem value="download">下载</SelectItem>
              <SelectItem value="share">共享</SelectItem>
              <SelectItem value="verify">验证</SelectItem>
              <SelectItem value="update">更新</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="flex gap-1 items-center"
            onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortDirection === 'desc' ? '最新优先' : '最早优先'}
          </Button>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">没有找到匹配的历史记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getActionIcon(item.action)}
                      <CardTitle className="text-base">
                        {getActionText(item.action)}: {item.fileName}
                      </CardTitle>
                    </div>
                    <Badge variant={
                      item.status === 'success' ? 'default' : 
                      item.status === 'pending' ? 'outline' : 'destructive'
                    }>
                      {item.status === 'success' ? '成功' : 
                       item.status === 'pending' ? '处理中' : '失败'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div className="text-sm space-y-2">
                      <p className="text-muted-foreground">{item.details}</p>
                      <p className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Clock className="h-3 w-3" />
                        {item.timestamp}
                        <span className="mx-1">•</span>
                        <span>操作人: {item.actionBy}</span>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 sm:mt-0"
                      onClick={() => {
                        toast({
                          title: "查看详情",
                          description: `在区块链浏览器中查看操作详情: ${item.fileName}`,
                        });
                      }}
                    >
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default History;
