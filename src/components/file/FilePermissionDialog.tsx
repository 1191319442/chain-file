
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FilePermission, FileMetadata } from '@/types/file';
import UserSelect from './UserSelect';

interface FilePermissionDialogProps {
  open: boolean;
  onClose: () => void;
  file: FileMetadata | null;
  onSave: (fileId: string, permission: FilePermission, sharedUserIds: string[]) => void;
}

const FilePermissionDialog: React.FC<FilePermissionDialogProps> = ({
  open,
  onClose,
  file,
  onSave
}) => {
  const [permission, setPermission] = useState<FilePermission>('private');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSave = () => {
    if (file) {
      onSave(file.id, permission, selectedUsers);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>设置文件访问权限</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup
            value={permission}
            onValueChange={(value) => setPermission(value as FilePermission)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public">公开 - 所有用户可访问</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private">私有 - 仅自己可访问</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="shared" id="shared" />
              <Label htmlFor="shared">共享 - 指定用户可访问</Label>
            </div>
          </RadioGroup>

          {permission === 'shared' && (
            <UserSelect
              selectedUsers={selectedUsers}
              onSelectionChange={setSelectedUsers}
            />
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePermissionDialog;
