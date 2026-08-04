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
import { UsersService } from "./users.service"

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query("search") search?: string,
    @Query("role") role?: string,
    @Query("status") status?: string
  ) {
    return this.usersService.findAll(search, role, status)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id)
  }

  @Post()
  create(@Body() body: any) {
    return this.usersService.create(body)
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() body: any) {
    return this.usersService.update(id, body)
  }

  @Delete(":id")
  softDelete(@Param("id") id: string) {
    return this.usersService.softDelete(id)
  }

  @Post(":id/reset-password")
  resetPassword(
    @Param("id") id: string, 
    @Body() body: { passwordNew: string }
  ) {
    return this.usersService.resetPassword(id, body.passwordNew)
  }
}
