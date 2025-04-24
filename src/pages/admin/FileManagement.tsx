
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { FilePermissionDialog } from '@/components/file/FilePermissionDialog';
import { FileMetadata } from '@/types/file';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const FileManagement: React.FC = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = React.useState<FileMetadata | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = React.useState(false);

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">文件管理</h1>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            上传文件
          </Button>
        </div>
        
        <div className="grid gap-4">
          {/* File list will be implemented here */}
        </div>

        <FilePermissionDialog
          open={permissionDialogOpen}
          onClose={() => setPermissionDialogOpen(false)}
          file={selectedFile}
          onSave={(fileId, permission, sharedUserIds) => {
            // Handle permission save
            console.log('Saving permissions:', { fileId, permission, sharedUserIds });
            setPermissionDialogOpen(false);
          }}
        />
      </div>
    </MainLayout>
  );
};

export default FileManagement;
