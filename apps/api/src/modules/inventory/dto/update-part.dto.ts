import { CreatePartDto } from "./create-part.dto"

export class UpdatePartDto implements Partial<CreatePartDto> {
  name?: string
  sku?: string
  barcode?: string
  description?: string
  salePrice?: number
  costPrice?: number
  minStock?: number
  deviceModelId?: string
  location?: string
}
