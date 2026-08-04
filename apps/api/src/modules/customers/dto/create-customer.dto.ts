export class CreateCustomerDto {
  name: string
  document: string // Apenas números
  phone: string // Apenas números
  email?: string
  address?: string
}
