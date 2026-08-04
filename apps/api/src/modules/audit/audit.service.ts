import { Injectable } from "@nestjs/common"

@Injectable()
export class AuditService {
  private prisma: any // Injeção do Prisma Client

  constructor() {
    this.prisma = {}
  }

  async createLog(
    tenantId: string,
    userId: string,
    action: string,
    entityName: string,
    entityId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ) {
    // No Prisma real seria:
    // return this.prisma.auditLog.create({
    //   data: {
    //     tenantId,
    //     userId,
    //     action,
    //     entityName,
    //     entityId,
    //     oldValues: oldValues ? JSON.stringify(oldValues) : null,
    //     newValues: newValues ? JSON.stringify(newValues) : null,
    //     ipAddress: ipAddress || null,
    //     userAgent: userAgent || null
    //   }
    // });

    return {
      id: "log_" + Math.random().toString(36).substr(2, 9),
      tenantId,
      userId,
      action,
      entityName,
      entityId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      createdAt: new Date()
    }
  }

  async findAll(
    tenantId: string,
    search?: string,
    entityName?: string,
    userId?: string,
    page = 1,
    limit = 15
  ) {
    const skip = (page - 1) * limit
    const where: any = { tenantId }

    if (entityName) {
      where.entityName = entityName
    }

    if (userId) {
      where.userId = userId
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { entityId: { contains: search } }
      ]
    }

    // No Prisma real seria:
    // const [items, total] = await Promise.all([
    //   this.prisma.auditLog.findMany({
    //     where,
    //     skip,
    //     take: limit,
    //     orderBy: { createdAt: 'desc' },
    //     include: { user: { select: { name: true } } }
    //   }),
    //   this.prisma.auditLog.count({ where })
    // ]);
    // return { items, total, page, pages: Math.ceil(total / limit) };

    return {
      items: [],
      total: 0,
      page,
      limit
    }
  }
}
