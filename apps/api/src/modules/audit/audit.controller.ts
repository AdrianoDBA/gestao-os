import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Headers 
} from "@nestjs/common"
import { AuditService } from "./audit.service"

@Controller("audit-logs")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(
    @Headers("x-tenant-id") tenantId: string,
    @Query("search") search?: string,
    @Query("entityName") entityName?: string,
    @Query("userId") userId?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 15

    return this.auditService.findAll(
      activeTenantId,
      search,
      entityName,
      userId,
      pageNum,
      limitNum
    )
  }

  @Post()
  createTestLog(
    @Headers("x-tenant-id") tenantId: string,
    @Headers("x-user-id") userId: string,
    @Body() body: { 
      action: string; 
      entityName: string; 
      entityId: string; 
      oldValues?: Record<string, any>; 
      newValues?: Record<string, any> 
    }
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    const activeUserId = userId || "default-user-uuid"

    return this.auditService.createLog(
      activeTenantId,
      activeUserId,
      body.action,
      body.entityName,
      body.entityId,
      body.oldValues,
      body.newValues
    )
  }
}
