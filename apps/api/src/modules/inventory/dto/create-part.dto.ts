export class CreatePartDto {
  name: string
  sku?: string
  barcode?: string
  description?: string
  salePrice: number
  costPrice: number
  minStock?: number
  deviceModelId?: string
  
  // Propriedades para inicialização rápida do estoque físico
  location?: string
  initialQty?: number
}
