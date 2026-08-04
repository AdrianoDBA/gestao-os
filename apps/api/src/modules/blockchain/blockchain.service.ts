import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  dataHash: string;
  timestamp: string;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  // Calcula o Hash SHA-256 de qualquer objeto de dados síncronos
  calculateHash(data: any): string {
    const dataString = typeof data === "string" ? data : JSON.stringify(data);
    return crypto.createHash("sha256").update(dataString).digest("hex");
  }

  // Simula a gravação do log na rede de Blockchain (Polygon L2 / Proof of Existence)
  async anchorLog(entityName: string, entityId: string, data: any): Promise<BlockchainTransaction> {
    const dataHash = this.calculateHash(data);
    
    // Simula tempo de rede e validação em bloco criptográfico
    await new Promise((resolve) => setTimeout(resolve, 800));

    const dummyTxHash = "0x" + crypto.randomBytes(32).toString("hex");
    const dummyBlock = Math.floor(Math.random() * 1000000) + 18293847;

    this.logger.log(
      `[BLOCKCHAIN - ANCORADO] Entidade: ${entityName} | ID: ${entityId} | Hash: ${dataHash} | TxHash: ${dummyTxHash} | Bloco: ${dummyBlock}`
    );

    return {
      txHash: dummyTxHash,
      blockNumber: dummyBlock,
      dataHash,
      timestamp: new Date().toISOString(),
    };
  }
}
