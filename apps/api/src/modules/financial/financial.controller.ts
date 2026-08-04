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
import { FinancialService } from "./financial.service"
import { CreateTransactionDto } from "./dto/create-transaction.dto"
import { UpdateTransactionDto } from "./dto/update-transaction.dto"

@Controller("financial")
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Post("transactions")
  createTransaction(
    @Headers("x-tenant-id") tenantId: string,
    @Body() createTransactionDto: CreateTransactionDto
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.financialService.createTransaction(activeTenantId, createTransactionDto)
  }

  @Get("transactions")
  findAll(
    @Headers("x-tenant-id") tenantId: string,
    @Query("search") search?: string,
    @Query("type") type?: "REVENUE" | "EXPENSE",
    @Query("status") status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED",
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 10
    
    return this.financialService.findAll(
      activeTenantId, 
      search, 
      type, 
      status, 
      pageNum, 
      limitNum
    )
  }

  @Get("summary")
  getSummary(
    @Headers("x-tenant-id") tenantId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.financialService.getSummary(activeTenantId, startDate, endDate)
  }

  @Get("transactions/:id")
  findOne(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.financialService.findOne(activeTenantId, id)
  }

  @Patch("transactions/:id")
  update(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string,
    @Body() updateTransactionDto: UpdateTransactionDto
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.financialService.update(activeTenantId, id, updateTransactionDto)
  }

  @Post("transactions/:id/pay")
  payTransaction(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string,
    @Body("method") method: "CASH" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_SLIP" | "OTHER"
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.financialService.payTransaction(activeTenantId, id, method)
  }

  @Delete("transactions/:id")
  remove(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.financialService.remove(activeTenantId, id)
  }
}
