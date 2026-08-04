export class StockMovementDto {
  partId: string
  type: "INPUT" | "OUTPUT" | "ADJUSTMENT"
  quantity: number
  reason: string
}
