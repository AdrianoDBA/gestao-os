import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  Headers 
} from "@nestjs/common"
import { DevicesService } from "./devices.service"
import { CreateDeviceDto } from "./dto/create-device.dto"
import { UpdateDeviceDto } from "./dto/update-device.dto"

@Controller("devices")
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  create(
    @Headers("x-tenant-id") tenantId: string, 
    @Body() createDeviceDto: CreateDeviceDto
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.devicesService.create(activeTenantId, createDeviceDto)
  }

  @Get()
  findAll(
    @Headers("x-tenant-id") tenantId: string,
    @Query("customerId") customerId?: string,
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 10
    
    return this.devicesService.findAll(
      activeTenantId, 
      customerId, 
      category, 
      search, 
      pageNum, 
      limitNum
    )
  }

  @Get(":id")
  findOne(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.devicesService.findOne(activeTenantId, id)
  }

  @Patch(":id")
  update(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string,
    @Body() updateDeviceDto: UpdateDeviceDto
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.devicesService.update(activeTenantId, id, updateDeviceDto)
  }

  @Delete(":id")
  remove(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.devicesService.remove(activeTenantId, id)
  }
}
