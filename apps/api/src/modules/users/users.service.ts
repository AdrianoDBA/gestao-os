import { Injectable, NotFoundException } from "@nestjs/common"
import * as crypto from "crypto"

export interface UserEntity {
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

@Injectable()
export class UsersService {
  // Usuários mocados de alta fidelidade
  private users: any[] = [
    {
      id: "usr_1",
      name: "Adriano Medeiros",
      email: "adriano@empresa.com",
      phone: "(11) 98888-7777",
      role: "Administrador",
      isActive: true,
      passwordHash: this.hashPassword("senha123"),
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60",
      lastAccess: "2026-07-29T15:30:00Z",
      createdAt: "2026-01-10T10:00:00Z",
      updatedAt: "2026-07-29T15:30:00Z"
    },
    {
      id: "usr_2",
      name: "Mariana Silva",
      email: "mariana@empresa.com",
      phone: "(11) 97777-6666",
      role: "Recepção",
      isActive: true,
      passwordHash: this.hashPassword("senha123"),
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60",
      lastAccess: "2026-07-29T14:15:00Z",
      createdAt: "2026-02-15T09:00:00Z",
      updatedAt: "2026-07-29T14:15:00Z"
    },
    {
      id: "usr_3",
      name: "Carlos Técnico",
      email: "carlos@empresa.com",
      phone: "(11) 96666-5555",
      role: "Técnico",
      isActive: true,
      passwordHash: this.hashPassword("senha123"),
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60",
      lastAccess: "2026-07-29T16:00:00Z",
      createdAt: "2026-03-01T11:00:00Z",
      updatedAt: "2026-07-29T16:00:00Z"
    }
  ]

  hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex")
  }

  async findAll(search?: string, roleFilter?: string, statusFilter?: string) {
    let filtered = [...this.users]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchLower) || 
        u.email.toLowerCase().includes(searchLower)
      )
    }

    if (roleFilter && roleFilter !== "ALL") {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    if (statusFilter && statusFilter !== "ALL") {
      const activeBool = statusFilter === "ACTIVE"
      filtered = filtered.filter(u => u.isActive === activeBool)
    }

    // Retorna sem o hash da senha por segurança
    return filtered.map(({ passwordHash, ...rest }) => rest)
  }

  async findOne(id: string) {
    const user = this.users.find(u => u.id === id)
    if (!user) throw new NotFoundException("Usuário não encontrado")
    const { passwordHash, ...rest } = user
    return rest
  }

  async findByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  }

  async create(data: any) {
    const newUser = {
      id: `usr_${this.users.length + 1}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role || "Somente leitura",
      isActive: true,
      passwordHash: this.hashPassword(data.password || "123456"),
      avatarUrl: data.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.users.push(newUser)
    const { passwordHash, ...rest } = newUser
    return rest
  }

  async update(id: string, data: any) {
    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) throw new NotFoundException("Usuário não encontrado")

    const updatedUser = {
      ...this.users[userIndex],
      name: data.name !== undefined ? data.name : this.users[userIndex].name,
      email: data.email !== undefined ? data.email : this.users[userIndex].email,
      phone: data.phone !== undefined ? data.phone : this.users[userIndex].phone,
      role: data.role !== undefined ? data.role : this.users[userIndex].role,
      isActive: data.isActive !== undefined ? data.isActive : this.users[userIndex].isActive,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : this.users[userIndex].avatarUrl,
      updatedAt: new Date().toISOString()
    }

    if (data.password) {
      updatedUser.passwordHash = this.hashPassword(data.password)
    }

    this.users[userIndex] = updatedUser
    const { passwordHash, ...rest } = updatedUser
    return rest
  }

  async softDelete(id: string) {
    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) throw new NotFoundException("Usuário não encontrado")
    
    // Soft delete: muda status para inativo
    this.users[userIndex].isActive = false
    this.users[userIndex].updatedAt = new Date().toISOString()
    
    const { passwordHash, ...rest } = this.users[userIndex]
    return rest
  }

  async resetPassword(id: string, passwordNew: string) {
    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) throw new NotFoundException("Usuário não encontrado")

    this.users[userIndex].passwordHash = this.hashPassword(passwordNew)
    this.users[userIndex].updatedAt = new Date().toISOString()

    return { success: true }
  }
}
