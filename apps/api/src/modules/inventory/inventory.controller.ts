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
import { InventoryService } from "./inventory.service"
import { CreatePartDto } from "./dto/create-part.dto"
import { UpdatePartDto } from "./dto/update-part.dto"
import { StockMovementDto } from "./dto/stock-movement.dto"

@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post("parts")
  createPart(
    @Headers("x-tenant-id") tenantId: string,
    @Body() createPartDto: CreatePartDto
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.inventoryService.createPart(activeTenantId, createPartDto)
  }

  @Get("parts")
  findAllParts(
    @Headers("x-tenant-id") tenantId: string,
    @Query("search") search?: string,
    @Query("lowStock") lowStock?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    const hasLowStock = lowStock === "true"
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 10
    
    return this.inventoryService.findAllParts(
      activeTenantId, 
      search, 
      hasLowStock, 
      pageNum, 
      limitNum
    )
  }

  @Get("parts/:id")
  findOnePart(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.inventoryService.findOnePart(activeTenantId, id)
  }

  @Patch("parts/:id")
  updatePart(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string,
    @Body() updatePartDto: UpdatePartDto
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.inventoryService.updatePart(activeTenantId, id, updatePartDto)
  }

  @Delete("parts/:id")
  removePart(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.inventoryService.removePart(activeTenantId, id)
  }

  @Post("movements")
  registerMovement(
    @Headers("x-tenant-id") tenantId: string,
    @Headers("x-user-id") userId: string,
    @Body() stockMovementDto: StockMovementDto
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    const activeUserId = userId || "default-user-uuid"
    return this.inventoryService.registerMovement(activeTenantId, activeUserId, stockMovementDto)
  }

  @Post("consume")
  consumePart(
    @Headers("x-tenant-id") tenantId: string,
    @Headers("x-user-id") userId: string,
    @Body() body: { serviceOrderId: string; partId: string; quantity: number }
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    const activeUserId = userId || "default-user-uuid"
    return this.inventoryService.consumePartForOS(
      activeTenantId,
      activeUserId,
      body.serviceOrderId,
      body.partId,
      body.quantity
    )
  }
}
