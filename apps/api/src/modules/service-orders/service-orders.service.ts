import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { CreateOrderDto } from "./dto/create-order.dto"
import { UpdateOrderDto } from "./dto/update-order.dto"

@Injectable()
export class ServiceOrdersService {
  private prisma: any // Injeção do Prisma Client

  constructor() {
    this.prisma = {}
  }

  async create(tenantId: string, userId: string, dto: CreateOrderDto) {
    // No Prisma real seria:
    // const order = await this.prisma.serviceOrder.create({
    //   data: {
    //     ...dto,
    //     tenantId,
    //     createdById: userId,
    //     status: 'PENDING'
    //   }
    // });
    // await this.prisma.serviceOrderHistory.create({
    //   data: {
    //     serviceOrderId: order.id,
    //     userId,
    //     fromStatus: 'PENDING',
    //     toStatus: 'PENDING',
    //     observation: 'Abertura de Ordem de Serviço'
    //   }
    // });
    // return order;

    return {
      id: "os_" + Math.random().toString(36).substr(2, 9),
      number: 1043,
      tenantId,
      createdById: userId,
      status: "PENDING",
      priority: dto.priority || "MEDIUM",
      ...dto,
      laborAmount: 0.0,
      partsAmount: 0.0,
      totalAmount: 0.0,
      entryDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async findAll(
    tenantId: string,
    search?: string,
    status?: string,
    priority?: string,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit
    const where: any = {
      tenantId,
    }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    if (search) {
      where.OR = [
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { device: { modelName: { contains: search, mode: "insensitive" } } },
        { reportedDefect: { contains: search, mode: "insensitive" } }
      ]
    }

    // No Prisma real seria:
    // const [items, total] = await Promise.all([
    //   this.prisma.serviceOrder.findMany({
    //     where,
    //     skip,
    //     take: limit,
    //     include: { customer: true, device: true, technician: true }
    //   }),
    //   this.prisma.serviceOrder.count({ where })
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
    // const order = await this.prisma.serviceOrder.findFirst({
    //   where: { id, tenantId },
    //   include: { 
    //     customer: true, 
    //     device: true, 
    //     technician: true, 
    //     diagnostics: { include: { attachments: true } },
    //     histories: { include: { user: true } },
    //     warranties: true,
    //     partsUsed: { include: { part: true } },
    //     servicesUsed: true
    //   }
    // });
    // if (!order) throw new NotFoundException("Ordem de serviço não encontrada");
    // return order;

    return {
      id,
      number: 1042,
      tenantId,
      customerId: "cust-mock",
      deviceId: "dev-mock",
      technicianId: "tech-mock",
      status: "READY",
      priority: "HIGH",
      reportedDefect: "Substituição de Conector e limpeza",
      accessories: "Carregador e capa protetora",
      checklist: { wifi: true, audio: true, camera: false, touch: true },
      laborAmount: 450.0,
      partsAmount: 200.0,
      totalAmount: 650.0,
      notes: "Aparelho pronto para retirada",
      entryDate: new Date(),
      exitDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: { name: "João Pedro Santos" },
      device: { brandName: "Samsung", modelName: "Galaxy S23 Ultra", serialNumber: "9876543210123" },
      technician: { name: "Claudio Técnico" },
      diagnostics: [
        {
          id: "diag-1",
          technicalReport: "Conector USB-C com pinos rompidos e muita oxidação interna.",
          solutionProposed: "Troca da subplaca de carga e desoxidação química dos componentes periféricos.",
          isApproved: true,
          createdAt: new Date()
        }
      ],
      histories: [
        { id: "h1", fromStatus: "PENDING", toStatus: "UNDER_ANALYSIS", changedAt: new Date(), user: { name: "Adriano" } },
        { id: "h2", fromStatus: "UNDER_ANALYSIS", toStatus: "BUDGETED", changedAt: new Date(), user: { name: "Claudio Técnico" } },
        { id: "h3", fromStatus: "BUDGETED", toStatus: "APPROVED", changedAt: new Date(), user: { name: "Adriano" } },
        { id: "h4", fromStatus: "APPROVED", toStatus: "IN_REPAIR", changedAt: new Date(), user: { name: "Claudio Técnico" } },
        { id: "h5", fromStatus: "IN_REPAIR", toStatus: "READY", changedAt: new Date(), user: { name: "Claudio Técnico" } }
      ],
      warranties: [
        { id: "w1", termDays: 90, startDate: new Date(), endDate: new Date(), conditions: "Garantia cobrindo defeito no conector substituído." }
      ],
      partsUsed: [
        { id: "p1", quantity: 1, priceCharged: 200.0, part: { name: "Subplaca de Carga S23 Ultra" } }
      ],
      servicesUsed: [
        { id: "s1", description: "Substituição de Conector e limpeza", amount: 450.0 }
      ]
    }
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateOrderDto) {
    // Simulação de máquina de estados
    // No Prisma real seria:
    // const order = await this.findOne(tenantId, id);
    //
    // const data: any = { ...dto };
    // if (dto.laborAmount !== undefined || dto.partsAmount !== undefined) {
    //   const labor = dto.laborAmount !== undefined ? dto.laborAmount : Number(order.laborAmount);
    //   const parts = dto.partsAmount !== undefined ? dto.partsAmount : Number(order.partsAmount);
    //   data.totalAmount = labor + parts;
    // }
    //
    // if (dto.status && dto.status !== order.status) {
    //   // Salvar histórico de mudança
    //   await this.prisma.serviceOrderHistory.create({
    //     data: {
    //       serviceOrderId: id,
    //       userId,
    //       fromStatus: order.status,
    //       toStatus: dto.status,
    //       observation: dto.notes || 'Alteração manual de status'
    //     }
    //   });
    //   
    //   if (dto.status === 'DELIVERED') {
    //     data.exitDate = new Date();
    //     // Lógica automática: gerar receita financeira correspondente
    //     await this.prisma.transaction.create({
    //       data: {
    //         tenantId,
    //         serviceOrderId: id,
    //         type: 'REVENUE',
    //         status: 'PAID',
    //         amount: data.totalAmount || order.totalAmount,
    //         description: `Recebimento OS #${order.number}`,
    //         dueDate: new Date(),
    //         paymentDate: new Date()
    //       }
    //     });
    //   }
    // }
    //
    // return this.prisma.serviceOrder.update({ where: { id }, data });

    return {
      id,
      tenantId,
      ...dto,
      updatedAt: new Date()
    }
  }

  async remove(tenantId: string, id: string) {
    // No Prisma real seria:
    // const order = await this.findOne(tenantId, id);
    // return this.prisma.serviceOrder.delete({ where: { id: order.id } });

    return {
      id,
      success: true,
      message: `Ordem de serviço ${id} excluída com sucesso`
    }
  }
}
