
/**
 * 文件上传组件
 * 提供文件选择、预览和上传功能
 */

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import BlockchainStatus from './BlockchainStatus';
import UploadZone from './UploadZone';
import FileList from './FileList';
import UploadProgress from './UploadProgress';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useFileUpload } from '@/hooks/useFileUpload';

const FileUploader: React.FC = () => {
  const { retryConnection } = useBlockchain();
  const {
    files,
    uploading,
    progress,
    bcosConnected,
    checkingConnection,
    handleFileChange,
    removeFile,
    handleUpload
  } = useFileUpload();

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <BlockchainStatus 
            bcosConnected={bcosConnected}
            checkingConnection={checkingConnection}
            onRetryConnection={retryConnection}
          />

          <UploadZone
            filesCount={files.length}
            disabled={uploading || (!bcosConnected && !checkingConnection)}
            onChange={handleFileChange}
          />

          <FileList
            files={files}
            uploading={uploading}
            onRemove={removeFile}
          />

          <UploadProgress
            uploading={uploading}
            progress={progress}
          />

          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading || (!bcosConnected && !checkingConnection)}
            className="mt-4"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在上传...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                上传到区块链
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
