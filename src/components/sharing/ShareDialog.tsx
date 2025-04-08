
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CopyIcon, ShareIcon } from "lucide-react";
import { FileItem } from '@/components/dashboard/FileCard';
import { useToast } from "@/components/ui/use-toast";

type ShareDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  file?: FileItem;
};

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, file }) => {
  const [copied, setCopied] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [expiryDays, setExpiryDays] = useState("7");
  const { toast } = useToast();
  
  const shareUrl = file ? `https://chain-file.example.com/s/${file.id}` : '';
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "已复制链接",
      description: "分享链接已复制到剪贴板",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = () => {
    toast({
      title: "分享成功",
      description: `文件已分享，${readOnly ? '只读' : '可编辑'}，有效期${expiryDays}天`,
    });
    onClose();
  };
  
  if (!file) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享文件</DialogTitle>
          <DialogDescription>
            创建链接与他人共享您的文件，所有共享操作将记录在区块链上
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              分享链接
            </Label>
            <Input
              id="link"
              value={shareUrl}
              readOnly
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            size="sm" 
            className="px-3" 
            onClick={handleCopyLink}
          >
            {copied ? <CopyIcon className="h-4 w-4 text-green-600" /> : <CopyIcon className="h-4 w-4" />}
            <span className="sr-only">复制</span>
          </Button>
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="readonly" 
              checked={readOnly} 
              onCheckedChange={(checked) => setReadOnly(checked as boolean)}
            />
            <Label htmlFor="readonly">仅允许查看（只读）</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiry">访问有效期（天）</Label>
            <Input 
              id="expiry" 
              type="number" 
              min="1" 
              max="30" 
              value={expiryDays} 
              onChange={(e) => setExpiryDays(e.target.value)} 
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>文件信息：{file.name} ({file.size})</p>
            <p className="mt-1">分享后的所有访问记录将存储在区块链上</p>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleShare}>
            <ShareIcon className="mr-2 h-4 w-4" />
            确认分享
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
