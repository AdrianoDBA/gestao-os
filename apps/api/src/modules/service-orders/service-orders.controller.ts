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
import { ServiceOrdersService } from "./service-orders.service"
import { CreateOrderDto } from "./dto/create-order.dto"
import { UpdateOrderDto } from "./dto/update-order.dto"

@Controller("service-orders")
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  create(
    @Headers("x-tenant-id") tenantId: string,
    @Headers("x-user-id") userId: string,
    @Body() createOrderDto: CreateOrderDto
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    const activeUserId = userId || "default-user-uuid"
    return this.serviceOrdersService.create(activeTenantId, activeUserId, createOrderDto)
  }

  @Get()
  findAll(
    @Headers("x-tenant-id") tenantId: string,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("priority") priority?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 10
    
    return this.serviceOrdersService.findAll(
      activeTenantId, 
      search, 
      status, 
      priority, 
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
    return this.serviceOrdersService.findOne(activeTenantId, id)
  }

  @Patch(":id")
  update(
    @Headers("x-tenant-id") tenantId: string,
    @Headers("x-user-id") userId: string,
    @Param("id") id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    const activeUserId = userId || "default-user-uuid"
    return this.serviceOrdersService.update(activeTenantId, activeUserId, id, updateOrderDto)
  }

  @Delete(":id")
  remove(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.serviceOrdersService.remove(activeTenantId, id)
  }

  @Post(":id/attachments")
  uploadAttachment(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string,
    @Body() body: { name: string; size: number; mimeType: string }
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    // No backend real usaria FileInterceptor para capturar o Buffer de arquivo físico:
    // const s3Result = await this.storageService.uploadFile(activeTenantId, file.originalname, file.buffer, file.mimetype);
    // return this.prisma.attachment.create({
    //   data: {
    //     serviceOrderId: id,
    //     name: file.originalname,
    //     key: s3Result.key,
    //     mimeType: file.mimetype,
    //     size: file.size,
    //     isPhoto: file.mimetype.startsWith('image/')
    //   }
    // });

    const isPhoto = body.mimeType.startsWith("image/")
    return {
      id: "attach_" + Math.random().toString(36).substr(2, 9),
      serviceOrderId: id,
      name: body.name,
      key: `${activeTenantId}/mock-key-${Date.now()}-${body.name}`,
      mimeType: body.mimeType,
      size: body.size,
      isPhoto,
      uploadedAt: new Date()
    }
  }

  @Delete(":id/attachments/:attachmentId")
  removeAttachment(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string,
    @Param("attachmentId") attachmentId: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    // No backend real:
    // const attach = await this.prisma.attachment.findUnique({ where: { id: attachmentId } });
    // await this.storageService.deleteFile(attach.key);
    // return this.prisma.attachment.delete({ where: { id: attachmentId } });

    return {
      success: true,
      attachmentId,
      message: "Anexo removido física e logicamente do laboratório"
    }
  }
}
