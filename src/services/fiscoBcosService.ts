
import Web3 from 'web3';
import axios from 'axios';
import CryptoJS from 'crypto-js';

// FISCO BCOS节点配置
const FISCO_CONFIG = {
  // 这些配置应该从环境变量或配置文件中获取
  rpcUrl: 'http://localhost:8545', // FISCO BCOS节点RPC地址
  groupId: 1,                     // 群组ID
  chainId: 1,                     // 链ID
};

/**
 * 计算文件的SHA-256哈希值
 * @param file 文件对象
 * @returns 返回Promise，解析为文件的哈希值
 */
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

/**
 * FISCO BCOS服务类
 * 提供与区块链交互的方法
 */
class FiscoBcosService {
  private web3: Web3;
  private isConnected: boolean = false;
  
  constructor() {
    // 初始化Web3实例
    this.web3 = new Web3(FISCO_CONFIG.rpcUrl);
    this.checkConnection();
  }
  
  /**
   * 检查与区块链的连接状态
   * @returns 返回Promise，解析为连接状态
   */
  async checkConnection(): Promise<boolean> {
    try {
      // 尝试从节点获取区块号来验证连接
      await axios.post(FISCO_CONFIG.rpcUrl, {
        jsonrpc: '2.0',
        method: 'getBlockNumber',
        params: [FISCO_CONFIG.groupId],
        id: 1
      });
      
      this.isConnected = true;
      console.log('成功连接到FISCO BCOS节点');
      return true;
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
   * @param fileInfo 文件信息对象
   * @returns 返回Promise，解析为交易哈希
   */
  async uploadFile(fileInfo: {
    name: string;
    hash: string;
    size: string;
    owner: string;
    uploadDate: string;
  }): Promise<string> {
    try {
      if (!this.isConnected) {
        await this.checkConnection();
        if (!this.isConnected) {
          throw new Error('未连接到区块链节点');
        }
      }
      
      // 在实际应用中，这里应该调用智能合约
      // 这里我们模拟上传成功，返回一个模拟的交易哈希
      console.log('文件信息上传到区块链:', fileInfo);
      const simulatedTxHash = `0x${CryptoJS.SHA256(JSON.stringify(fileInfo)).toString()}`;
      
      return simulatedTxHash;
    } catch (error: any) {
      console.error('上传文件到区块链失败:', error);
      throw new Error(`上传文件到区块链失败: ${error.message}`);
    }
  }
  
  /**
   * 从区块链获取文件信息
   * @param fileHash 文件哈希
   * @returns 返回Promise，解析为文件信息
   */
  async getFileInfo(fileHash: string): Promise<any> {
    try {
      if (!this.isConnected) {
        await this.checkConnection();
        if (!this.isConnected) {
          throw new Error('未连接到区块链节点');
        }
      }
      
      // 在实际应用中，这里应该调用智能合约
      // 这里我们返回一个模拟的文件信息
      console.log('从区块链获取文件信息:', fileHash);
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 这里返回模拟数据，实际应用中应该从区块链获取
      return {
        name: "模拟文件.pdf",
        hash: fileHash,
        size: "1.2 MB",
        owner: "当前用户",
        uploadDate: new Date().toISOString().split('T')[0],
        blockNumber: 12345,
        status: 'confirmed'
      };
    } catch (error: any) {
      console.error('从区块链获取文件信息失败:', error);
      throw new Error(`从区块链获取文件信息失败: ${error.message}`);
    }
  }
  
  /**
   * 获取区块信息
   * @param blockNumber 区块号
   * @returns 返回Promise，解析为区块信息
   */
  async getBlockInfo(blockNumber: number): Promise<any> {
    try {
      if (!this.isConnected) {
        await this.checkConnection();
        if (!this.isConnected) {
          throw new Error('未连接到区块链节点');
        }
      }
      
      // 在实际应用中，这里应该调用Web3 API获取区块信息
      console.log('获取区块信息:', blockNumber);
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 这里返回模拟数据，实际应用中应该从区块链获取
      return {
        blockNumber,
        timestamp: new Date().toISOString(),
        transactions: Math.floor(Math.random() * 20) + 1,
        size: `${(Math.random() * 5).toFixed(1)} KB`,
        hash: `0x${CryptoJS.SHA256(blockNumber.toString()).toString().substring(0, 40)}`
      };
    } catch (error: any) {
      console.error('获取区块信息失败:', error);
      throw new Error(`获取区块信息失败: ${error.message}`);
    }
  }
}

// 导出单例实例
export const fiscoBcosService = new FiscoBcosService();
export default fiscoBcosService;
