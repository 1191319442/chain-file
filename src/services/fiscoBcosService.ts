
/**
 * Frontend-only mock blockchain service
 */

// Mock file hash calculation 
export const calculateFileHash = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    // Simulate hash calculation with random hash
    setTimeout(() => {
      const hash = `0x${Array.from(new Array(40), () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      resolve(hash);
    }, 200);
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
 * Mock blockchain service for frontend-only implementation
 */
class FiscoBcosService {
  private isConnected: boolean = true;
  
  /**
   * Check connection status - frontend mock
   */
  async checkConnection(): Promise<boolean> {
    // Simulate connection check
    await new Promise(resolve => setTimeout(resolve, 300));
    this.isConnected = true;
    return this.isConnected;
  }
  
  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
  
  /**
   * Upload file info - frontend mock
   */
  async uploadFile(fileInfo: FileInfo): Promise<string> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return `tx-${Date.now()}`;
  }
  
  /**
   * Get file info - frontend mock
   */
  async getFileInfo(fileHash: string): Promise<any> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      name: "示例文件.pdf",
      hash: fileHash,
      size: "1024",
      owner: "demo@example.com",
      uploadDate: new Date().toISOString().split('T')[0],
      verified: true
    };
  }
  
  /**
   * Get block info - frontend mock
   */
  async getBlockInfo(blockNumber: number): Promise<any> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      blockNumber,
      hash: `0xblock${blockNumber}`,
      timestamp: Date.now() - (Math.random() * 86400000),
      transactions: [`0x${Math.random().toString(36).substring(2, 15)}`]
    };
  }
  
  /**
   * Record access log - frontend mock
   */
  async recordAccessLog(logData: {
    fileId: string;
    userId: string;
    accessType: string;
    timestamp: string;
  }): Promise<string> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    return `tx-log-${Date.now()}`;
  }
}

// Export singleton instance
export const fiscoBcosService = new FiscoBcosService();
export default fiscoBcosService;
