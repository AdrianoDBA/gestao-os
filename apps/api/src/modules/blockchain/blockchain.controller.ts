import { Controller, Get, Post, Body, Param, NotFoundException } from "@nestjs/common";
import { BlockchainService } from "./blockchain.service";

@Controller("blockchain")
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // Simula a verificação de integridade comparando o hash de dados enviados com o armazenado
  @Post("verify")
  verifyData(@Body() body: { originalHash: string; currentData: any }) {
    const computedHash = this.blockchainService.calculateHash(body.currentData);
    const isValid = computedHash === body.originalHash;
    
    return {
      isValid,
      computedHash,
      originalHash: body.originalHash,
      verifiedAt: new Date().toISOString(),
      status: isValid ? "INTEGRITY_VERIFIED" : "TAMPERED_WARNING"
    };
  }
}
