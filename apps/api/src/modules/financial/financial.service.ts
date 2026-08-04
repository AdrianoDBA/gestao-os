import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { CreateTransactionDto } from "./dto/create-transaction.dto"
import { UpdateTransactionDto } from "./dto/update-transaction.dto"

@Injectable()
export class FinancialService {
  private prisma: any // Injeção do Prisma Client

  constructor() {
    this.prisma = {}
  }

  async createTransaction(tenantId: string, dto: CreateTransactionDto) {
    const { installmentsCount, isPaid, paymentMethod, ...transactionData } = dto

    // No Prisma real seria uma transação ($transaction)
    // Se installmentsCount > 1, criaria multiplas transacoes ou parcelas vinculadas.
    // Se isPaid for true, criaria o Payment e alteraria o status para PAID.
    
    return {
      id: "trans_" + Math.random().toString(36).substr(2, 9),
      tenantId,
      ...transactionData,
      status: isPaid ? "PAID" : "PENDING",
      paymentDate: isPaid ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async findAll(
    tenantId: string,
    search?: string,
    type?: "REVENUE" | "EXPENSE",
    status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED",
    page = 1,
    limit = 10
  ) {
    // No Prisma real seria:
    // const skip = (page - 1) * limit;
    // const where: any = { tenantId };
    // if (type) where.type = type;
    // if (status) where.status = status;
    // if (search) where.description = { contains: search, mode: 'insensitive' };
    
    return {
      items: [],
      total: 0,
      page,
      limit
    }
  }

  async findOne(tenantId: string, id: string) {
    return {
      id,
      tenantId,
      type: "REVENUE",
      status: "PENDING",
      amount: 650.00,
      description: "Recebimento OS #1042 - Samsung S23",
      dueDate: new Date(),
      paymentDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: { name: "João Pedro Santos" },
      payments: []
    }
  }

  async update(tenantId: string, id: string, dto: UpdateTransactionDto) {
    return {
      id,
      tenantId,
      ...dto,
      updatedAt: new Date()
    }
  }

  // Baixa manual de título (Recebimento ou Pagamento)
  async payTransaction(
    tenantId: string, 
    id: string, 
    method: "CASH" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_SLIP" | "OTHER"
  ) {
    // No Prisma real seria:
    // const trans = await this.findOne(tenantId, id);
    // if (trans.status === 'PAID') throw new BadRequestException('Transação já liquidada');
    //
    // await this.prisma.transaction.update({
    //   where: { id },
    //   data: { status: 'PAID', paymentDate: new Date() }
    // });
    // await this.prisma.payment.create({
    //   data: {
    //     transactionId: id,
    //     amount: trans.amount,
    //     method
    //   }
    // });

    return {
      id,
      status: "PAID",
      paymentDate: new Date(),
      method
    }
  }

  async remove(tenantId: string, id: string) {
    return {
      id,
      success: true,
      message: `Lançamento ${id} excluído com sucesso`
    }
  }

  // Estatísticas consolidativas para o dashboard financeiro
  async getSummary(tenantId: string, startDate?: string, endDate?: string) {
    // Simulação consolidativa de fluxo de caixa
    return {
      revenuePaid: 15450.00,  // Recebido
      revenuePending: 4200.00, // A receber
      expensePaid: 5800.00,   // Pago
      expensePending: 1500.00, // A pagar
      cashBalance: 9650.00,    // Saldo Consolidado de Caixa (revenuePaid - expensePaid)
      
      // Histórico dos últimos 7 dias para desenhar o gráfico
      dailyFlow: [
        { date: "22/07", revenue: 1200, expense: 300 },
        { date: "23/07", revenue: 800, expense: 450 },
        { date: "24/07", revenue: 2100, expense: 900 },
        { date: "25/07", revenue: 1500, expense: 1200 },
        { date: "26/07", revenue: 3200, expense: 800 },
        { date: "27/07", revenue: 900, expense: 200 },
        { date: "28/07", revenue: 4500, expense: 1500 }
      ]
    }
  }
}
