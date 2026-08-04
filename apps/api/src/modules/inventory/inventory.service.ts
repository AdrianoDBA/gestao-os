import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { CreatePartDto } from "./dto/create-part.dto"
import { UpdatePartDto } from "./dto/update-part.dto"
import { StockMovementDto } from "./dto/stock-movement.dto"

@Injectable()
export class InventoryService {
  private prisma: any // Injeção do Prisma Client

  constructor() {
    this.prisma = {}
  }

  async createPart(tenantId: string, dto: CreatePartDto) {
    const { initialQty, location, ...partData } = dto
    
    // No Prisma real seria uma transação atômica ($transaction):
    // const part = await this.prisma.part.create({ data: { ...partData, tenantId } });
    // await this.prisma.inventory.create({
    //   data: {
    //     partId: part.id,
    //     quantity: initialQty || 0,
    //     location: location || null
    //   }
    // });
    // if (initialQty && initialQty > 0) {
    //   await this.prisma.inventoryMovement.create({
    //     data: {
    //       partId: part.id,
    //       type: 'INPUT',
    //       quantity: initialQty,
    //       reason: 'Ajuste inicial de estoque',
    //       userId: 'system'
    //     }
    //   });
    // }
    // return part;

    return {
      id: "part_" + Math.random().toString(36).substr(2, 9),
      tenantId,
      ...partData,
      createdAt: new Date(),
      updatedAt: new Date(),
      inventory: {
        quantity: initialQty || 0,
        location: location || null
      }
    }
  }

  async findAllParts(
    tenantId: string,
    search?: string,
    hasLowStock?: boolean,
    page = 1,
    limit = 10
  ) {
    // No Prisma real seria:
    // const skip = (page - 1) * limit;
    // const where: any = { tenantId };
    // if (search) {
    //   where.OR = [
    //     { name: { contains: search, mode: 'insensitive' } },
    //     { sku: { contains: search } },
    //     { barcode: { contains: search } }
    //   ];
    // }
    // if (hasLowStock) {
    //   where.inventory = {
    //     quantity: { lte: this.prisma.part.fields.minStock } // Prisma Expression
    //   };
    // }
    // ...
    return {
      items: [],
      total: 0,
      page,
      limit
    }
  }

  async findOnePart(tenantId: string, id: string) {
    return {
      id,
      tenantId,
      name: "Tela OLED iPhone 13 Pro",
      sku: "TEL-IPH13P-OLED",
      barcode: "7891234567890",
      description: "Tela frontal homologada EAN-13",
      salePrice: 650.00,
      costPrice: 300.00,
      minStock: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      inventory: { quantity: 5, location: "Gaveteiro A - Linha 2" },
      movements: [
        { id: "m1", type: "INPUT", quantity: 5, reason: "Compra com Fornecedor Alpha", createdAt: new Date() }
      ]
    }
  }

  async updatePart(tenantId: string, id: string, dto: UpdatePartDto) {
    return {
      id,
      tenantId,
      ...dto,
      updatedAt: new Date()
    }
  }

  async removePart(tenantId: string, id: string) {
    return {
      id,
      success: true,
      message: `Peça ${id} excluída do catálogo`
    }
  }

  // Registra movimentação de estoque manual (entrada ou saída de ajuste)
  async registerMovement(tenantId: string, userId: string, dto: StockMovementDto) {
    // No Prisma real seria executado em transação ($transaction):
    // const inventory = await this.prisma.inventory.findUnique({ where: { partId: dto.partId } });
    // if (!inventory) throw new NotFoundException('Estoque da peça não cadastrado');
    //
    // let newQty = Number(inventory.quantity);
    // if (dto.type === 'INPUT') {
    //   newQty += dto.quantity;
    // } else {
    //   if (newQty < dto.quantity) throw new BadRequestException('Estoque insuficiente para a movimentação');
    //   newQty -= dto.quantity;
    // }
    //
    // await this.prisma.inventory.update({ where: { partId: dto.partId }, data: { quantity: newQty } });
    // return this.prisma.inventoryMovement.create({
    //   data: {
    //     partId: dto.partId,
    //     userId,
    //     type: dto.type,
    //     quantity: dto.quantity,
    //     reason: dto.reason
    //   }
    // });

    return {
      success: true,
      partId: dto.partId,
      type: dto.type,
      quantity: dto.quantity,
      reason: dto.reason,
      createdAt: new Date()
    }
  }

  // Consumo Automático de Peças atrelado à Ordem de Serviço
  async consumePartForOS(
    tenantId: string, 
    userId: string, 
    serviceOrderId: string, 
    partId: string, 
    quantity: number
  ) {
    // No Prisma real seria transação:
    // 1. Decrementar o saldo na tabela Inventory.
    // 2. Registrar o InventoryMovement com tipo OUTPUT vinculando o motivo (Consumo na OS #12).
    // 3. Cadastrar a associação ServiceOrderPart.
    
    // Simulação lógica de consumo automático:
    return {
      success: true,
      serviceOrderId,
      partId,
      quantityConsumed: quantity,
      reason: `Consumo automático na Ordem de Serviço ${serviceOrderId}`,
      timestamp: new Date()
    }
  }
}
