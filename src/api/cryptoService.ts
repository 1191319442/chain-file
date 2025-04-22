
import { ec as EC } from 'elliptic';
import CryptoJS from 'crypto-js';

export class CryptoService {
  private static ec = new EC('secp256k1'); // 使用与FISCO BCOS兼容的椭圆曲线

  /**
   * 生成椭圆曲线密钥对
   */
  static generateKeyPair() {
    const keyPair = this.ec.genKeyPair();
    return {
      privateKey: keyPair.getPrivate('hex'),
      publicKey: keyPair.getPublic('hex')
    };
  }

  /**
   * 使用ECC签名消息
   * @param message 要签名的消息
   * @param privateKey 私钥
   */
  static sign(message: string, privateKey: string) {
    const key = this.ec.keyFromPrivate(privateKey, 'hex');
    const msgHash = CryptoJS.SHA256(message).toString();
    const signature = key.sign(msgHash);
    return signature.toDER('hex');
  }

  /**
   * 验证ECC签名
   * @param message 原始消息
   * @param signature 签名
   * @param publicKey 公钥
   */
  static verify(message: string, signature: string, publicKey: string) {
    const key = this.ec.keyFromPublic(publicKey, 'hex');
    const msgHash = CryptoJS.SHA256(message).toString();
    return key.verify(msgHash, signature);
  }

  /**
   * 计算密码哈希值（用于存储在数据库中）
   * @param password 原始密码
   * @param salt 盐值（可选）
   */
  static hashPassword(password: string, salt = '') {
    // 使用PBKDF2算法派生密钥
    return CryptoJS.PBKDF2(password, salt || CryptoJS.lib.WordArray.random(128/8), {
      keySize: 512/32,
      iterations: 10000
    }).toString();
  }

  /**
   * 验证密码哈希
   * @param password 明文密码
   * @param hash 存储的哈希值
   * @param salt 盐值
   */
  static verifyPassword(password: string, hash: string, salt: string) {
    const calculatedHash = this.hashPassword(password, salt);
    return calculatedHash === hash;
  }
}
