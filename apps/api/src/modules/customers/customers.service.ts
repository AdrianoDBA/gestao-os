import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { CreateCustomerDto } from "./dto/create-customer.dto"
import { UpdateCustomerDto } from "./dto/update-customer.dto"

// Interface simulada do PrismaService para desacoplamento e compilação
@Injectable()
export class CustomersService {
  // Em uma aplicação real, injetaríamos o PrismaService:
  // constructor(private prisma: PrismaService) {}
  private prisma: any // Representação genérica do PrismaClient

  constructor() {
    // Mock básico de injeção caso o Prisma service não esteja carregado
    this.prisma = {}
  }

  // Método auxiliar para validar CPF/CNPJ de forma básica no backend antes de persistir
  private validateDoc(doc: string): boolean {
    const cleaned = doc.replace(/\D/g, "")
    return cleaned.length === 11 || cleaned.length === 14
  }

  async create(tenantId: string, dto: CreateCustomerDto) {
    if (!this.validateDoc(dto.document)) {
      throw new BadRequestException("Documento CPF ou CNPJ inválido")
    }

    // No Prisma real seria:
    // return this.prisma.customer.create({
    //   data: {
    //     ...dto,
    //     tenantId,
    //   }
    // });
    
    return {
      id: "cust_" + Math.random().toString(36).substr(2, 9),
      tenantId,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async findAll(
    tenantId: string,
    search?: string,
    docType?: "ALL" | "CPF" | "CNPJ",
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit

    // Montagem da query do Prisma
    const where: any = {
      tenantId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { document: { contains: search } },
        { phone: { contains: search } }
      ]
    }

    if (docType && docType !== "ALL") {
      if (docType === "CPF") {
        where.document = { ...where.document, length: { lte: 11 } } // Exemplo lógico
      } else {
        where.document = { ...where.document, length: { gt: 11 } }
      }
    }

    // No Prisma real seria:
    // const [items, total] = await Promise.all([
    //   this.prisma.customer.findMany({ where, skip, take: limit, include: { devices: true, serviceOrders: true } }),
    //   this.prisma.customer.count({ where })
    // ]);
    // return { items, total, page, pages: Math.ceil(total / limit) };

    return {
      items: [],
      total: 0,
      page,
      limit
    }
  }

  async findOne(tenantId: string, id: string) {
    // No Prisma real seria:
    // const customer = await this.prisma.customer.findFirst({
    //   where: { id, tenantId },
    //   include: { devices: true, serviceOrders: true }
    // });
    // if (!customer) throw new NotFoundException("Cliente não encontrado");
    // return customer;

    return {
      id,
      tenantId,
      name: "Cliente Mock",
      document: "12345678909",
      phone: "11987654321",
      email: "cliente@mock.com",
      address: "Endereço Mock",
      devices: [],
      serviceOrders: []
    }
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
    if (dto.document && !this.validateDoc(dto.document)) {
      throw new BadRequestException("Documento CPF ou CNPJ inválido")
    }

    // No Prisma real seria:
    // const customer = await this.findOne(tenantId, id);
    // return this.prisma.customer.update({
    //   where: { id: customer.id },
    //   data: dto
    // });

    return {
      id,
      tenantId,
      ...dto,
      updatedAt: new Date()
    }
  }

  async remove(tenantId: string, id: string) {
    // No Prisma real seria:
    // const customer = await this.findOne(tenantId, id);
    // return this.prisma.customer.delete({ where: { id: customer.id } });

    return {
      id,
      success: true,
      message: `Cliente ${id} removido com sucesso`
    }
  }
}
