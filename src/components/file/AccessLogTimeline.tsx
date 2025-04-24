
import React from 'react';
import { FileAccess } from '@/types/file';
import { cn } from "@/lib/utils";
import { Download, Eye, Share } from 'lucide-react';

interface AccessLogTimelineProps {
  logs: FileAccess[];
}

const AccessLogTimeline: React.FC<AccessLogTimelineProps> = ({ logs }) => {
  const getIcon = (accessType: string) => {
    switch (accessType) {
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'share':
        return <Share className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionText = (accessType: string) => {
    switch (accessType) {
      case 'download':
        return '下载了文件';
      case 'view':
        return '查看了文件';
      case 'share':
        return '共享了文件';
      default:
        return '访问了文件';
    }
  };

  return (
    <div className="space-y-8">
      {logs.map((log, index) => (
        <div key={log.id} className="relative pl-8">
          <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
            {getIcon(log.accessType)}
          </div>
          <div className={cn(
            "absolute left-2 top-5 w-px bg-border",
            index === logs.length - 1 ? "h-0" : "h-full"
          )} />
          <div className="space-y-1">
            <div className="text-sm font-medium">{getActionText(log.accessType)}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(log.timestamp).toLocaleString()}
            </div>
            {log.txHash && (
              <div className="text-xs text-muted-foreground">
                交易哈希: {log.txHash}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccessLogTimeline;
