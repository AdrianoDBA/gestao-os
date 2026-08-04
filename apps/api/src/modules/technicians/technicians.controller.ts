import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query 
} from "@nestjs/common"
import { TechniciansService } from "./technicians.service"

@Controller("technicians")
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  findAll(
    @Query("search") search?: string,
    @Query("status") status?: string
  ) {
    return this.techniciansService.findAll(search, status)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.techniciansService.findOne(id)
  }

  @Post()
  create(@Body() body: any) {
    return this.techniciansService.create(body)
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() body: any) {
    return this.techniciansService.update(id, body)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.techniciansService.remove(id)
  }
}
