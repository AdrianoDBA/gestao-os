export class CreateOrderDto {
  customerId: string
  deviceId: string
  reportedDefect: string
  accessories?: string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  checklist?: Record<string, boolean>
  notes?: string
}
