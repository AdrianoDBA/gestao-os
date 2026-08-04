import { Module, Global } from "@nestjs/common"
import { AIService } from "./ai.service"
import { AIController } from "./ai.controller"

@Global()
@Module({
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
