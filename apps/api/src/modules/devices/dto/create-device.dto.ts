export class CreateDeviceDto {
  customerId: string
  brandId: string
  deviceModelId: string
  serialNumber?: string
  imei?: string
  password?: string
  color?: string
  physicalState?: string
  accessories?: string
  observations?: string
}
