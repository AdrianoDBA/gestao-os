import { CreateDeviceDto } from "./create-device.dto"

export class UpdateDeviceDto implements Partial<CreateDeviceDto> {
  customerId?: string
  brandId?: string
  deviceModelId?: string
  serialNumber?: string
  imei?: string
  password?: string
  color?: string
  physicalState?: string
  accessories?: string
  observations?: string
}
