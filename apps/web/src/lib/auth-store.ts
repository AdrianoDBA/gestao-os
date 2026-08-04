"use client"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  avatarUrl: string
  lastAccess?: string
  createdAt: string
}

export interface Permission {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
  // específicas de OS
  cancel?: boolean
  deliver?: boolean
  // específicas de Estoque
  move?: boolean
  buy?: boolean
  adjust?: boolean
  // específicas de Financeiro
  receive?: boolean
  pay?: boolean
}

export interface RolePermissions {
  [module: string]: Permission
}

export interface RoleConfig {
  name: string
  permissions: RolePermissions
}

const defaultRoles: RoleConfig[] = [
  {
    name: "Administrador",
    permissions: {
      customers: { view: true, create: true, edit: true, delete: true },
      devices: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: true, edit: true, delete: true, cancel: true, deliver: true },
      inventory: { view: true, create: true, edit: true, delete: true, move: true, buy: true, adjust: true },
      financial: { view: true, create: true, edit: true, delete: true, receive: true, pay: true },
      settings: { view: true, create: true, edit: true, delete: true }
    }
  },
  {
    name: "Proprietário",
    permissions: {
      customers: { view: true, create: true, edit: true, delete: true },
      devices: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: true, edit: true, delete: true, cancel: true, deliver: true },
      inventory: { view: true, create: true, edit: true, delete: true, move: true, buy: true, adjust: true },
      financial: { view: true, create: true, edit: true, delete: true, receive: true, pay: true },
      settings: { view: true, create: true, edit: true, delete: true }
    }
  },
  {
    name: "Recepção",
    permissions: {
      customers: { view: true, create: true, edit: true, delete: false },
      devices: { view: true, create: true, edit: true, delete: false },
      orders: { view: true, create: true, edit: false, delete: false, cancel: false, deliver: false },
      inventory: { view: true, create: false, edit: false, delete: false, move: false, buy: false, adjust: false },
      financial: { view: true, create: false, edit: false, delete: false, receive: true, pay: false },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  },
  {
    name: "Técnico",
    permissions: {
      customers: { view: true, create: false, edit: false, delete: false },
      devices: { view: true, create: true, edit: true, delete: false },
      orders: { view: true, create: true, edit: true, delete: false, cancel: false, deliver: true },
      inventory: { view: true, create: false, edit: false, delete: false, move: true, buy: false, adjust: false },
      financial: { view: false, create: false, edit: false, delete: false, receive: false, pay: false },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  },
  {
    name: "Financeiro",
    permissions: {
      customers: { view: true, create: false, edit: false, delete: false },
      devices: { view: false, create: false, edit: false, delete: false },
      orders: { view: true, create: false, edit: false, delete: false, cancel: false, deliver: false },
      inventory: { view: true, create: false, edit: false, delete: false, move: false, buy: false, adjust: false },
      financial: { view: true, create: true, edit: true, delete: true, receive: true, pay: true },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  },
  {
    name: "Estoque",
    permissions: {
      customers: { view: false, create: false, edit: false, delete: false },
      devices: { view: false, create: false, edit: false, delete: false },
      orders: { view: false, create: false, edit: false, delete: false },
      inventory: { view: true, create: true, edit: true, delete: true, move: true, buy: true, adjust: true },
      financial: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  },
  {
    name: "Supervisor",
    permissions: {
      customers: { view: true, create: true, edit: true, delete: true },
      devices: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: true, edit: true, delete: true, cancel: true, deliver: true },
      inventory: { view: true, create: true, edit: true, delete: true, move: true, buy: true, adjust: true },
      financial: { view: true, create: true, edit: true, delete: false, receive: true, pay: true },
      settings: { view: true, create: false, edit: false, delete: false }
    }
  },
  {
    name: "Somente leitura",
    permissions: {
      customers: { view: true, create: false, edit: false, delete: false },
      devices: { view: true, create: false, edit: false, delete: false },
      orders: { view: true, create: false, edit: false, delete: false, cancel: false, deliver: false },
      inventory: { view: true, create: false, edit: false, delete: false, move: false, buy: false, adjust: false },
      financial: { view: true, create: false, edit: false, delete: false, receive: false, pay: false },
      settings: { view: true, create: false, edit: false, delete: false }
    }
  }
]

const initialUsersList: User[] = []

export const getRoles = (): RoleConfig[] => {
  if (typeof window === "undefined") return defaultRoles
  const saved = localStorage.getItem("roles_config")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("roles_config", JSON.stringify(defaultRoles))
  return defaultRoles
}

export const saveRoles = (roles: RoleConfig[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("roles_config", JSON.stringify(roles))
}

export const getUsers = (): User[] => {
  if (typeof window === "undefined") return initialUsersList
  const saved = localStorage.getItem("users_list")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("users_list", JSON.stringify(initialUsersList))
  return initialUsersList
}

export const saveUsers = (users: User[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("users_list", JSON.stringify(users))
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const saved = localStorage.getItem("current_user")
  if (saved) return JSON.parse(saved)
  return null
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("current_user", JSON.stringify(user))
  } else {
    localStorage.removeItem("current_user")
  }
}

export const checkPermission = (module: string, action: keyof Permission): boolean => {
  const currentUser = getCurrentUser()
  if (!currentUser) return false

  const roles = getRoles()
  const userRole = roles.find(r => r.name === currentUser.role)
  if (!userRole) return false

  const modulePermissions = userRole.permissions[module]
  if (!modulePermissions) return false

  return !!modulePermissions[action]
}
