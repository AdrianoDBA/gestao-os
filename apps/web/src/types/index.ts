export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  avatarUrl?: string
  lastAccess?: string
  createdAt: string
  updatedAt: string
}

export interface PermissionMatrix {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  cancel?: boolean
  deliver?: boolean
}

export interface RoleConfig {
  id: string
  name: string
  description: string
  isSystem: boolean
  permissions: {
    dashboard: PermissionMatrix
    "service-orders": PermissionMatrix
    customers: PermissionMatrix
    devices: PermissionMatrix
    inventory: PermissionMatrix
    financial: PermissionMatrix
    technicians: PermissionMatrix
    users: PermissionMatrix
    audit: PermissionMatrix
    "knowledge-base": PermissionMatrix
  }
}

export interface CustomerHistoryLog {
  id: string
  date: string
  action: string
  user: string
}

export interface Customer {
  id: string
  name: string
  document: string
  documentType: "PF" | "PJ"
  birthDate?: string
  phone: string
  whatsapp: string
  whatsappSameAsPhone: boolean
  email: string
  cep?: string
  address: string
  addressNumber?: string
  complement?: string
  bairro?: string
  city?: string
  state?: string
  notes?: string
  isActive: boolean
  createdAt: string
  history?: CustomerHistoryLog[]
  devices?: any[]
  serviceOrders?: any[]
}

export interface DeviceHistoryLog {
  id: string
  date: string
  action: string
  details?: string
}

export interface Device {
  id: string
  customerId: string
  customerName?: string
  category: "Celular" | "Notebook" | "Desktop" | "Tablet" | "Videogame" | "TV" | "Monitor" | "Impressora" | "Placa eletrônica" | "Outro"
  brandName: string
  modelName: string
  serialNumber: string
  imei?: string
  password?: string
  color?: string
  physicalState?: string
  reportedDefect?: string
  accessories?: string
  observations?: string
  createdAt: string
  status: "ACTIVE" | "INACTIVE"
  photos?: {
    front?: string
    back?: string
    others: string[]
  }
  checklist?: {
    [key: string]: "OK" | "DEFECT" | "NOT_TESTED"
  }
  history?: DeviceHistoryLog[]
  serviceOrders?: any[]
}

export interface StockMovement {
  id: string
  type: "INPUT" | "OUTPUT"
  quantity: number
  reason: string
  createdAt: string
}

export interface Part {
  id: string
  name: string
  sku: string
  barcode: string
  description: string
  costPrice: number
  salePrice: number
  minStock: number
  location: string
  quantity: number
  movements: StockMovement[]
}

export interface TransactionInstallment {
  id: string
  installmentNumber: number
  totalInstallments: number
  amount: number
  dueDate: string
  isPaid: boolean
  paymentDate?: string | null
}

export interface TransactionRefund {
  type: "PARTIAL" | "TOTAL"
  amount: number
  date: string
  reason: string
}

export interface TransactionAuditLog {
  date: string
  user: string
  action: string
  oldValue?: string
  newValue?: string
}

export interface Transaction {
  id: string
  description: string
  type: "REVENUE" | "EXPENSE"
  amount: number
  discount?: number
  interest?: number
  fine?: number
  dueDate: string
  entityName: string
  isPaid: boolean
  paymentMethod?: string
  paymentDate?: string | null
  category: string
  origin?: "OS" | "SALE" | "OTHER"
  originId?: string
  notes?: string
  installments?: TransactionInstallment[]
  refund?: TransactionRefund
  createdByUser: string
  createdAt: string
  updatedByUser?: string
  updatedAt?: string
  history?: TransactionAuditLog[]
}

export interface CashMovement {
  id: string
  type: "INPUT" | "OUTPUT"
  amount: number
  reason: string
  date: string
  user: string
  observation?: string
}

export interface CashSession {
  id: string
  isOpen: boolean
  openedBy: string
  openedAt: string
  closedBy?: string
  closedAt?: string
  initialBalance: number
  finalBalance?: number
  movements: CashMovement[]
  notes?: string
}

export interface ServiceOrderHistory {
  id: string
  fromStatus: string
  toStatus: string
  changedAt: string
  user: { name: string }
  observation?: string
}

export interface ServiceOrderWarranty {
  id: string
  termDays: number
  startDate: string
  endDate: string
  conditions?: string
}

export interface ServiceOrderPart {
  id: string
  quantity: number
  priceCharged: number
  part: { name: string }
}

export interface ServiceOrderService {
  id: string
  description: string
  amount: number
}

export interface ServiceOrder {
  id: string
  number: number
  customerId: string
  deviceId: string
  technicianId?: string | null
  status: "PENDING" | "UNDER_ANALYSIS" | "BUDGETED" | "APPROVED" | "IN_REPAIR" | "READY" | "DELIVERED" | "CANCELLED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  reportedDefect: string
  accessories?: string
  checklist?: {
    wifi: boolean
    audio: boolean
    camera: boolean
    touch: boolean
    buttons: boolean
    charging: boolean
  }
  laborAmount: number
  partsAmount: number
  totalAmount: number
  notes?: string
  entryDate: string
  exitDate?: string | null
  customer: { name: string }
  device: { brandName: string; modelName: string; serialNumber: string }
  technician?: { name: string } | null
  diagnostics?: any[]
  histories?: ServiceOrderHistory[]
  warranties?: ServiceOrderWarranty[]
  partsUsed?: ServiceOrderPart[]
  servicesUsed?: ServiceOrderService[]
}

export interface CompanyConfig {
  name: string
  tradeName?: string
  cnpj: string
  ie?: string
  address: string
  cep: string
  city: string
  state: string
  country: string
  phone: string
  whatsapp?: string
  email: string
  website?: string
  logo?: string
  favicon?: string
  notes?: string
}

export interface SystemConfig {
  company: CompanyConfig
  visual: {
    theme: "DARK" | "LIGHT"
    primaryColor: string
    secondaryColor: string
    accentColor: string
  }
  os: {
    prefix: string
    nextNumber: number
    defaultWarrantyDays: number
    requiredFields: string[]
  }
  financial: {
    currency: string
    decimals: number
    interestDefault: number
    fineDefault: number
    maxDiscountPercent: number
  }
  inventory: {
    minStockDefault: number
    allowNegativeStock: boolean
    alertOnLowStock: boolean
  }
  smtp: {
    host: string
    port: number
    user: string
    from: string
    encryption: "SSL" | "TLS" | "NONE"
  }
  whatsapp: {
    number: string
    token: string
    webhook: string
    autoMessageReady: string
  }
  templates: {
    receiptHeader: string
    receiptFooter: string
    warrantyTerms: string
    technicalReportTerms: string
  }
  security: {
    sessionTimeoutMinutes: number
    passwordMinLength: number
    maxLoginAttempts: number
    twoFactorEnabled: boolean
  }
}

export interface SystemLog {
  id: string
  date: string
  user: string
  ip: string
  action: string
  oldValue?: string
  newValue?: string
  type: "LOGIN" | "CREATE" | "EDIT" | "DELETE" | "ERROR" | "SYSTEM"
}
