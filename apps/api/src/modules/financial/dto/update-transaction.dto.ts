import { CreateTransactionDto } from "./create-transaction.dto"

export class UpdateTransactionDto implements Partial<CreateTransactionDto> {
  type?: "REVENUE" | "EXPENSE"
  amount?: number
  description?: string
  dueDate?: Date
  customerId?: string
  supplierId?: string
  serviceOrderId?: string
  
  // Alteração de status (ex: conciliação ou liquidação)
  status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
  paymentDate?: Date
}
