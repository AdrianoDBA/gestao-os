import { Module } from "@nestjs/common";
import { PartnersService } from "./partners.service";
import { PartnersController } from "./partners.controller";
import { BlockchainModule } from "../blockchain/blockchain.module";

@Module({
  imports: [BlockchainModule],
  providers: [PartnersService],
  controllers: [PartnersController],
  exports: [PartnersService],
})
export class PartnersModule {}
