import { Injectable, NotFoundException } from "@nestjs/common"
import { CreateDeviceDto } from "./dto/create-device.dto"
import { UpdateDeviceDto } from "./dto/update-device.dto"

@Injectable()
export class DevicesService {
  private prisma: any // Injeção lógica do Prisma Client

  constructor() {
    this.prisma = {}
  }

  async create(tenantId: string, dto: CreateDeviceDto) {
    // No Prisma real seria:
    // return this.prisma.device.create({
    //   data: {
    //     ...dto,
    //     tenantId
    //   }
    // });
    
    return {
      id: "dev_" + Math.random().toString(36).substr(2, 9),
      tenantId,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async findAll(
    tenantId: string,
    customerId?: string,
    category?: string,
    search?: string,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit
    const where: any = {
      tenantId,
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (category) {
      where.deviceModel = {
        category,
      }
    }

    if (search) {
      where.OR = [
        { serialNumber: { contains: search, mode: "insensitive" } },
        { imei: { contains: search } },
        { observations: { contains: search, mode: "insensitive" } }
      ]
    }

    // No Prisma real seria:
    // const [items, total] = await Promise.all([
    //   this.prisma.device.findMany({
    //     where,
    //     skip,
    //     take: limit,
    //     include: { customer: true, brand: true, deviceModel: true, serviceOrders: true }
    //   }),
    //   this.prisma.device.count({ where })
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
    // const device = await this.prisma.device.findFirst({
    //   where: { id, tenantId },
    //   include: { customer: true, brand: true, deviceModel: true, serviceOrders: true }
    // });
    // if (!device) throw new NotFoundException("Equipamento não encontrado");
    // return device;

    return {
      id,
      tenantId,
      customerId: "cust-mock",
      brandId: "brand-mock",
      deviceModelId: "model-mock",
      serialNumber: "SN123456",
      imei: "351234567890123",
      password: "1234-pattern",
      color: "Preto",
      physicalState: "Riscos leves na tela traseira",
      accessories: "Carregador e Cabo USB-C",
      observations: "Bateria estufada",
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: { name: "Cliente Mock" },
      brand: { name: "Samsung" },
      deviceModel: { name: "Galaxy S23", category: "Celular" },
      serviceOrders: []
    }
  }

  async update(tenantId: string, id: string, dto: UpdateDeviceDto) {
    // No Prisma real seria:
    // const device = await this.findOne(tenantId, id);
    // return this.prisma.device.update({
    //   where: { id: device.id },
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
    // const device = await this.findOne(tenantId, id);
    // return this.prisma.device.delete({ where: { id: device.id } });

    return {
      id,
      success: true,
      message: `Equipamento ${id} removido com sucesso`
    }
  }
}
