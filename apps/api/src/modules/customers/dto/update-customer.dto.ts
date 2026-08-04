import { CreateCustomerDto } from "./create-customer.dto"

export class UpdateCustomerDto implements Partial<CreateCustomerDto> {
  name?: string
  document?: string
  phone?: string
  email?: string
  address?: string
}
