export class CreateTransactionDto {
  type: "REVENUE" | "EXPENSE"
  amount: number
  description: string
  dueDate: Date
  
  customerId?: string
  supplierId?: string
  serviceOrderId?: string
  
  // Propriedades para pagamento à vista / baixa imediata
  paymentMethod?: "CASH" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_SLIP" | "OTHER"
  isPaid?: boolean
  
  // Propriedades para parcelamento
  installmentsCount?: number
}
