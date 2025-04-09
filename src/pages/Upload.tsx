
/**
 * 文件上传页面
 * 提供用户上传文件到区块链的功能
 */

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FileUploader from '@/components/dashboard/FileUploader';

const Upload: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">上传文件</h1>
          <p className="text-muted-foreground mt-2">
            上传文件到区块链，确保文件的完整性和可追溯性
          </p>
        </div>

        <div className="max-w-3xl">
          <FileUploader />
          
          <div className="mt-8 bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">关于区块链文件上传</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>所有上传的文件将使用SHA-256算法计算哈希值</li>
              <li>文件哈希和元数据将存储在区块链上，确保文件的不可篡改性</li>
              <li>文件实际内容加密后存储在分布式存储网络</li>
              <li>您可以随时下载、共享和验证您的文件</li>
              <li>上传操作会消耗少量的燃料费用，请确保您的账户有足够的余额</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Upload;
