
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AccessLogTimeline from '@/components/file/AccessLogTimeline';
import { FileAccess } from '@/types/file';
import { useToast } from '@/hooks/use-toast';
import { FileService } from '@/services/fileService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCcw, FileText, CalendarDays } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LogQuery: React.FC = () => {
  const [logs, setLogs] = useState<FileAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all',
    search: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const fetchedLogs = await FileService.getAllAccessLogs();
      setLogs(fetchedLogs);
    } catch (error: any) {
      toast({
        title: "获取日志失败",
        description: error.message || "无法加载访问日志",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ ...filter, search: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    setFilter({ ...filter, type: value });
  };

  const filteredLogs = logs.filter(log => {
    // 过滤操作类型
    if (filter.type !== 'all' && log.accessType !== filter.type) {
      return false;
    }
    
    // 过滤搜索关键词
    if (filter.search && !(
      (log.fileName && log.fileName.toLowerCase().includes(filter.search.toLowerCase())) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(filter.search.toLowerCase()))
    )) {
      return false;
    }
    
    return true;
  });

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">访问日志查询</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>文件访问记录</CardTitle>
            <CardDescription>
              查看和分析所有用户对文件的访问操作
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="搜索文件名或用户..."
                  value={filter.search}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              
              <Select value={filter.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="操作类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有操作</SelectItem>
                  <SelectItem value="view">查看</SelectItem>
                  <SelectItem value="download">下载</SelectItem>
                  <SelectItem value="share">共享</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>

            <Tabs defaultValue="list">
              <TabsList className="mb-4">
                <TabsTrigger value="list">
                  <FileText className="h-4 w-4 mr-2" />
                  列表视图
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  时间线视图
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-6">加载中...</div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">无符合条件的访问记录</div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredLogs.map(log => (
                      <div key={log.id} className="py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{log.userEmail || log.userId}</span>
                            <span className="text-muted-foreground mx-2">
                              {log.accessType === 'view' ? '查看了' : 
                              log.accessType === 'download' ? '下载了' : '共享了'}
                            </span>
                            <span className="font-medium">{log.fileName || `文件(ID: ${log.fileId})`}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                        {log.txHash && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            交易哈希: {log.txHash}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="timeline">
                {isLoading ? (
                  <div className="text-center py-6">加载中...</div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">无符合条件的访问记录</div>
                ) : (
                  <AccessLogTimeline logs={filteredLogs} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default LogQuery;
