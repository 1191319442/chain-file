
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AccessLogTimeline from '@/components/file/AccessLogTimeline';
import { FileAccess } from '@/types/file';

const LogQuery: React.FC = () => {
  const [logs, setLogs] = React.useState<FileAccess[]>([]);

  // Mock data for now - will be replaced with real data
  React.useEffect(() => {
    setLogs([
      {
        id: '1',
        fileId: '1',
        userId: '1',
        accessType: 'view',
        timestamp: new Date().toISOString(),
      }
    ]);
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">访问日志查询</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <AccessLogTimeline logs={logs} />
        </div>
      </div>
    </MainLayout>
  );
};

export default LogQuery;
