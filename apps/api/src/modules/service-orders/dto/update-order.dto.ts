import { CreateOrderDto } from "./create-order.dto"

export class UpdateOrderDto implements Partial<CreateOrderDto> {
  customerId?: string
  deviceId?: string
  reportedDefect?: string
  accessories?: string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  checklist?: Record<string, boolean>
  notes?: string
  
  // Campos específicos de atualização do ciclo de vida
  status?: "PENDING" | "UNDER_ANALYSIS" | "BUDGETED" | "APPROVED" | "REJECTED" | "IN_REPAIR" | "READY" | "DELIVERED" | "CANCELLED"
  technicianId?: string
  laborAmount?: number
  partsAmount?: number
  totalAmount?: number
}
