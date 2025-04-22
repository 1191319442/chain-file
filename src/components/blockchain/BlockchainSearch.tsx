
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BlockchainSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const BlockchainSearch: React.FC<BlockchainSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative flex mb-6 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="搜索文件名、哈希、用户或区块..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default BlockchainSearch;
