import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query 
} from "@nestjs/common"
import { AIService } from "./ai.service"

@Controller("ai")
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post("suggest")
  getSuggestions(
    @Body() body: { 
      deviceBrand: string; 
      deviceModel: string; 
      reportedDefect: string 
    }
  ) {
    return this.aiService.getSuggestions(
      body.deviceBrand || "",
      body.deviceModel || "",
      body.reportedDefect || ""
    )
  }

  @Get("kb")
  searchKnowledgeBase(@Query("search") search?: string) {
    return this.aiService.searchKnowledgeBase(search)
  }
}
