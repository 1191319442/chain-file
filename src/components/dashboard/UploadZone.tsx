
import React from 'react';
import { Upload } from "lucide-react";

interface UploadZoneProps {
  filesCount: number;
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  filesCount,
  disabled,
  onChange
}) => {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        filesCount > 0 ? 'border-primary' : 'border-muted-foreground/30'
      }`}
    >
      <input
        type="file"
        id="file-upload"
        multiple
        onChange={onChange}
        className="hidden"
        disabled={disabled}
      />
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center ${
          disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
        }`}
      >
        <Upload
          className={`h-12 w-12 mb-4 ${
            filesCount > 0 ? 'text-primary' : 'text-muted-foreground/50'
          }`}
        />
        <p className="text-lg font-medium text-foreground">点击或拖拽文件到此处</p>
        <p className="text-sm text-muted-foreground mt-1">
          支持任何类型的文件, 最大支持 20MB
        </p>
      </label>
    </div>
  );
};

export default UploadZone;
