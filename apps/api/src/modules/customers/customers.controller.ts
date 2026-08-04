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
import { CustomersService } from "./customers.service"
import { CreateCustomerDto } from "./dto/create-customer.dto"
import { UpdateCustomerDto } from "./dto/update-customer.dto"

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // Em ambiente de produção SaaS, extrairemos o tenantId usando um Custom Decorator do JWT token
  // Ex: @RequestTenant() tenantId: string
  // Para testes e demonstração flexível, utilizaremos uma header "x-tenant-id"
  
  @Post()
  create(
    @Headers("x-tenant-id") tenantId: string, 
    @Body() createCustomerDto: CreateCustomerDto
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.customersService.create(activeTenantId, createCustomerDto)
  }

  @Get()
  findAll(
    @Headers("x-tenant-id") tenantId: string,
    @Query("search") search?: string,
    @Query("docType") docType?: "ALL" | "CPF" | "CNPJ",
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    const pageNum = page ? parseInt(page, 10) : 1
    const limitNum = limit ? parseInt(limit, 10) : 10
    
    return this.customersService.findAll(activeTenantId, search, docType, pageNum, limitNum)
  }

  @Get(":id")
  findOne(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.customersService.findOne(activeTenantId, id)
  }

  @Patch(":id")
  update(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.customersService.update(activeTenantId, id, updateCustomerDto)
  }

  @Delete(":id")
  remove(
    @Headers("x-tenant-id") tenantId: string,
    @Param("id") id: string
  ) {
    const activeTenantId = tenantId || "default-tenant-uuid"
    return this.customersService.remove(activeTenantId, id)
  }
}
