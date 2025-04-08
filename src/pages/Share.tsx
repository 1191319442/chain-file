
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, User, Link2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type SharedItem = {
  id: string;
  fileName: string;
  fileType: string;
  sharedWith: string;
  sharedDate: string;
  expiryDate: string;
  accessLink: string;
  permissions: 'readonly' | 'readwrite';
  status: 'active' | 'expired';
};

type ReceivedItem = {
  id: string;
  fileName: string;
  fileType: string;
  sharedBy: string;
  sharedDate: string;
  expiryDate: string;
  accessLink: string;
  permissions: 'readonly' | 'readwrite';
  status: 'active' | 'expired';
};

const MOCK_SHARED: SharedItem[] = [
  {
    id: '1',
    fileName: '项目方案.pdf',
    fileType: 'application/pdf',
    sharedWith: '张三',
    sharedDate: '2025-04-05',
    expiryDate: '2025-04-12',
    accessLink: 'https://chain-file.example.com/s/abc123',
    permissions: 'readonly',
    status: 'active'
  },
  {
    id: '2',
    fileName: '会议记录.docx',
    fileType: 'application/docx',
    sharedWith: '李四',
    sharedDate: '2025-04-03',
    expiryDate: '2025-04-10',
    accessLink: 'https://chain-file.example.com/s/def456',
    permissions: 'readwrite',
    status: 'active'
  },
  {
    id: '3',
    fileName: '产品设计图.png',
    fileType: 'image/png',
    sharedWith: '王五',
    sharedDate: '2025-03-28',
    expiryDate: '2025-04-05',
    accessLink: 'https://chain-file.example.com/s/ghi789',
    permissions: 'readonly',
    status: 'expired'
  }
];

const MOCK_RECEIVED: ReceivedItem[] = [
  {
    id: '1',
    fileName: '市场分析报告.pdf',
    fileType: 'application/pdf',
    sharedBy: '赵六',
    sharedDate: '2025-04-06',
    expiryDate: '2025-04-13',
    accessLink: 'https://chain-file.example.com/s/jkl012',
    permissions: 'readonly',
    status: 'active'
  },
  {
    id: '2',
    fileName: '财务数据.xlsx',
    fileType: 'application/xlsx',
    sharedBy: '钱七',
    sharedDate: '2025-04-02',
    expiryDate: '2025-04-09',
    accessLink: 'https://chain-file.example.com/s/mno345',
    permissions: 'readwrite',
    status: 'active'
  }
];

const Share: React.FC = () => {
  const [sharedSearchQuery, setSharedSearchQuery] = useState('');
  const [receivedSearchQuery, setReceivedSearchQuery] = useState('');
  const { toast } = useToast();

  const filteredShared = MOCK_SHARED.filter(
    (item) => item.fileName.toLowerCase().includes(sharedSearchQuery.toLowerCase()) ||
              item.sharedWith.toLowerCase().includes(sharedSearchQuery.toLowerCase())
  );

  const filteredReceived = MOCK_RECEIVED.filter(
    (item) => item.fileName.toLowerCase().includes(receivedSearchQuery.toLowerCase()) ||
              item.sharedBy.toLowerCase().includes(receivedSearchQuery.toLowerCase())
  );

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "链接已复制",
      description: "分享链接已复制到剪贴板",
    });
  };

  const handleRevokeAccess = (item: SharedItem) => {
    toast({
      title: "访问已撤销",
      description: `已撤销对 ${item.fileName} 的共享访问`,
      variant: "destructive",
    });
    // 实际应用中这里会调用撤销API
  };

  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">文件共享</h1>
          <p className="text-muted-foreground mt-2">
            管理您共享的文件和其他人与您共享的文件
          </p>
        </div>

        <Tabs defaultValue="shared" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="shared">我共享的文件</TabsTrigger>
            <TabsTrigger value="received">共享给我的文件</TabsTrigger>
          </TabsList>

          <TabsContent value="shared">
            <div className="flex mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="搜索文件名或接收人..."
                  value={sharedSearchQuery}
                  onChange={(e) => setSharedSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {filteredShared.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">没有找到匹配的共享文件</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredShared.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{item.fileName}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />
                            共享给: {item.sharedWith}
                          </CardDescription>
                        </div>
                        <Badge variant={item.status === 'active' ? 'default' : 'outline'}>
                          {item.status === 'active' ? '有效' : '已过期'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-sm space-y-1">
                          <p className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {item.permissions === 'readonly' ? '只读' : '可编辑'}
                            </Badge>
                          </p>
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            共享日期: {item.sharedDate} | 过期日期: {item.expiryDate}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(item.accessLink)}
                          >
                            <Link2 className="mr-1 h-4 w-4" />
                            复制链接
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeAccess(item)}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            撤销访问
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="received">
            <div className="flex mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="搜索文件名或共享人..."
                  value={receivedSearchQuery}
                  onChange={(e) => setReceivedSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {filteredReceived.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">没有找到匹配的已接收文件</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReceived.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{item.fileName}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />
                            共享人: {item.sharedBy}
                          </CardDescription>
                        </div>
                        <Badge variant={item.status === 'active' ? 'default' : 'outline'}>
                          {item.status === 'active' ? '有效' : '已过期'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-sm space-y-1">
                          <p className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {item.permissions === 'readonly' ? '只读' : '可编辑'}
                            </Badge>
                          </p>
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            共享日期: {item.sharedDate} | 过期日期: {item.expiryDate}
                          </p>
                        </div>
                        <Button variant="default" size="sm">
                          查看文件
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Share;
