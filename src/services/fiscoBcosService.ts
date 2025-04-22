
import CryptoJS from 'crypto-js';
import apiClient from '../api/apiClient';

// 计算文件的SHA-256哈希值
export const calculateFileHash = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (!event.target || !event.target.result) {
          throw new Error('读取文件失败');
        }
        
        // 计算SHA-256哈希值
        const wordArray = CryptoJS.lib.WordArray.create(event.target.result as ArrayBuffer);
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(`0x${hash}`);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export type FileInfo = {
  name: string;
  hash: string;
  size: string;
  owner: string;
  uploadDate: string;
};

/**
 * FISCO BCOS服务类
 * 通过SpringBoot后端与区块链交互
 */
class FiscoBcosService {
  private isConnected: boolean = false;
  
  /**
   * 检查与区块链的连接状态
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await apiClient.get('/blockchain/status');
      this.isConnected = response.data.connected;
      return this.isConnected;
    } catch (error) {
      console.error('连接FISCO BCOS节点失败:', error);
      this.isConnected = false;
      return false;
    }
  }
  
  /**
   * 获取连接状态
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
  
  /**
   * 上传文件信息到区块链
   */
  async uploadFile(fileInfo: FileInfo): Promise<string> {
    try {
      if (!this.isConnected) {
        await this.checkConnection();
        if (!this.isConnected) {
          throw new Error('未连接到区块链节点');
        }
      }
      
      const response = await apiClient.post('/blockchain/file', fileInfo);
      return response.data.txHash;
    } catch (error: any) {
      console.error('上传文件到区块链失败:', error);
      throw new Error(`上传文件到区块链失败: ${error.message}`);
    }
  }
  
  /**
   * 从区块链获取文件信息
   */
  async getFileInfo(fileHash: string): Promise<any> {
    try {
      if (!this.isConnected) {
        await this.checkConnection();
        if (!this.isConnected) {
          throw new Error('未连接到区块链节点');
        }
      }
      
      const response = await apiClient.get(`/blockchain/file/${fileHash}`);
      return response.data;
    } catch (error: any) {
      console.error('从区块链获取文件信息失败:', error);
      throw new Error(`从区块链获取文件信息失败: ${error.message}`);
    }
  }
  
  /**
   * 获取区块信息
   */
  async getBlockInfo(blockNumber: number): Promise<any> {
    try {
      if (!this.isConnected) {
        await this.checkConnection();
        if (!this.isConnected) {
          throw new Error('未连接到区块链节点');
        }
      }
      
      const response = await apiClient.get(`/blockchain/block/${blockNumber}`);
      return response.data;
    } catch (error: any) {
      console.error('获取区块信息失败:', error);
      throw new Error(`获取区块信息失败: ${error.message}`);
    }
  }
}

// 导出单例实例
export const fiscoBcosService = new FiscoBcosService();
export default fiscoBcosService;
