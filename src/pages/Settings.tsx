
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Key, Bell, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  // Form states
  const [username, setUsername] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  
  // Update settings state using user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
    }
  }, [user]);
  
  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const success = await updateProfile({ username });
      
      if (success) {
        toast({
          title: "个人资料已更新",
          description: "您的设置已成功保存"
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Toggle notification settings
  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    toast({
      title: enabled ? "通知已开启" : "通知已关闭",
      description: enabled ? "您将接收系统通知" : "您将不再接收系统通知"
    });
  };
  
  // Toggle auto-backup settings
  const handleToggleAutoBackup = (enabled: boolean) => {
    setAutoBackupEnabled(enabled);
    toast({
      title: enabled ? "自动备份已开启" : "自动备份已关闭",
      description: enabled ? "系统将自动备份您的文件" : "系统将不再自动备份您的文件"
    });
  };
  
  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">设置</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            个人资料
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Key className="w-4 h-4 mr-2" />
            安全设置
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            通知与备份
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>
                管理您的个人资料信息
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="您的用户名"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">电子邮箱</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ""} 
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : "保存更改"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>
                管理您的账户安全设置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>您的账户是安全的</AlertTitle>
                <AlertDescription>
                  我们使用先进的加密技术保护您的数据安全。
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>用户角色</Label>
                  <div className="p-3 border rounded-md bg-gray-50">
                    <p className="font-medium">
                      {user?.role === "admin" ? "管理员" : "普通用户"}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>区块链公钥</Label>
                  <div className="p-3 border rounded-md bg-gray-50 overflow-x-auto">
                    <p className="font-mono text-xs">
                      {user?.publicKey || "未设置公钥"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知与备份</CardTitle>
              <CardDescription>
                配置系统通知和备份选项
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>系统通知</Label>
                    <p className="text-sm text-muted-foreground">
                      接收有关文件状态和系统更新的通知
                    </p>
                  </div>
                  <Switch 
                    checked={notificationsEnabled}
                    onCheckedChange={handleToggleNotifications}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自动备份</Label>
                    <p className="text-sm text-muted-foreground">
                      自动备份您的文件到区块链上
                    </p>
                  </div>
                  <Switch 
                    checked={autoBackupEnabled}
                    onCheckedChange={handleToggleAutoBackup}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
