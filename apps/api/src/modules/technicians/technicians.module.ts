import { Module, Global } from "@nestjs/common"
import { TechniciansService } from "./technicians.service"
import { TechniciansController } from "./technicians.controller"

@Global()
@Module({
  controllers: [TechniciansController],
  providers: [TechniciansService],
  exports: [TechniciansService],
})
export class TechniciansModule {}
