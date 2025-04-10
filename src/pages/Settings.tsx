
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileKey, Bell, FileLock2, Database, User, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [walletAddress, setWalletAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [email, setEmail] = useState('');
  
  const [notifyOnShare, setNotifyOnShare] = useState(true);
  const [notifyOnDownload, setNotifyOnDownload] = useState(true);
  const [notifyOnVerify, setNotifyOnVerify] = useState(false);
  
  const [autoVerify, setAutoVerify] = useState(true);
  const [privateUploads, setPrivateUploads] = useState(false);
  const [highSecurity, setHighSecurity] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // 获取用户信息
  useEffect(() => {
    if (user) {
      // 设置邮箱
      setEmail(user.email || '');
      
      // 获取用户资料信息
      const fetchUserProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('获取用户资料失败:', error);
          toast({
            title: "获取用户资料失败",
            description: error.message,
            variant: "destructive",
          });
        } else if (data) {
          setUserName(data.username || '');
        }
      };
      
      fetchUserProfile();
    }
  }, [user, toast]);
  
  const saveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // 更新用户资料
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: userName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "设置已保存",
        description: "您的个人设置已成功更新",
      });
    } catch (error: any) {
      console.error('保存设置失败:', error);
      toast({
        title: "保存失败",
        description: error.message || "无法更新您的设置，请重试",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">设置</h1>
          <p className="text-muted-foreground mt-2">
            管理您的个人信息和应用程序设置
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 个人信息设置 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>个人信息</CardTitle>
                </div>
                <CardDescription>
                  管理您的账户信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input
                      id="username"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">电子邮件</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wallet">区块链钱包地址</Label>
                  <Input
                    id="wallet"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">该地址用于签名交易和验证文件所有权</p>
                </div>
              </CardContent>
            </Card>
            
            {/* 通知设置 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>通知设置</CardTitle>
                </div>
                <CardDescription>
                  配置您想要接收的通知
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify-share">文件共享通知</Label>
                    <p className="text-xs text-muted-foreground">当您的文件被访问时接收通知</p>
                  </div>
                  <Switch
                    id="notify-share"
                    checked={notifyOnShare}
                    onCheckedChange={setNotifyOnShare}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify-download">文件下载通知</Label>
                    <p className="text-xs text-muted-foreground">当您的文件被下载时接收通知</p>
                  </div>
                  <Switch
                    id="notify-download"
                    checked={notifyOnDownload}
                    onCheckedChange={setNotifyOnDownload}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify-verify">文件验证通知</Label>
                    <p className="text-xs text-muted-foreground">当您的文件被验证时接收通知</p>
                  </div>
                  <Switch
                    id="notify-verify"
                    checked={notifyOnVerify}
                    onCheckedChange={setNotifyOnVerify}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* 安全设置 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileLock2 className="h-5 w-5 text-primary" />
                  <CardTitle>安全设置</CardTitle>
                </div>
                <CardDescription>
                  配置文件安全与隐私选项
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-verify">自动文件验证</Label>
                    <p className="text-xs text-muted-foreground">定期验证文件的完整性</p>
                  </div>
                  <Switch
                    id="auto-verify"
                    checked={autoVerify}
                    onCheckedChange={setAutoVerify}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="private-uploads">默认私有上传</Label>
                    <p className="text-xs text-muted-foreground">新上传的文件默认为私有状态</p>
                  </div>
                  <Switch
                    id="private-uploads"
                    checked={privateUploads}
                    onCheckedChange={setPrivateUploads}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-security">高安全性模式</Label>
                    <p className="text-xs text-muted-foreground">使用高级加密和多重验证</p>
                  </div>
                  <Switch
                    id="high-security"
                    checked={highSecurity}
                    onCheckedChange={setHighSecurity}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 侧边栏信息卡 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileKey className="h-5 w-5 text-primary" />
                  <CardTitle>存储信息</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">已使用存储空间</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                      <div className="h-full bg-primary rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">使用了 350MB / 1GB</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">文件数量</p>
                    <p className="text-lg font-semibold">12 个文件</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">共享文件</p>
                    <p className="text-lg font-semibold">3 个文件</p>
                  </div>
                  <Button className="w-full" variant="outline">
                    升级存储空间
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>区块链网络</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">当前网络</p>
                    <p className="text-lg font-semibold">以太坊测试网</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">连接状态</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <p>已连接</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">燃料费余额</p>
                    <p className="text-lg font-semibold">0.15 ETH</p>
                  </div>
                  <Button className="w-full" variant="outline">
                    切换网络
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button onClick={saveSettings} className="px-6" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "保存中..." : "保存设置"}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
