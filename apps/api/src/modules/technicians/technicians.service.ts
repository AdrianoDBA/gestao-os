import { Injectable, NotFoundException } from "@nestjs/common"

export interface TechnicianEntity {
  id: string
  userId: string
  name: string
  email: string
  specialty: string
  commission: number
  color: string
  workload: string
  avgRepairTime: string
  completedOrdersCount: number
  returnedWarrantiesCount: number
  status: "ACTIVE" | "INACTIVE" | "ON_VACATION"
}

@Injectable()
export class TechniciansService {
  // Técnicos mocados de alta fidelidade
  private technicians: TechnicianEntity[] = [
    {
      id: "tech_1",
      userId: "usr_3", // Vinculado a Carlos Técnico
      name: "Carlos Técnico",
      email: "carlos@empresa.com",
      specialty: "Dispositivos Móveis & Micro-soldagem",
      commission: 10, // 10%
      color: "#3b82f6", // Azul
      workload: "44h semanais",
      avgRepairTime: "1.2 horas",
      completedOrdersCount: 142,
      returnedWarrantiesCount: 3,
      status: "ACTIVE"
    },
    {
      id: "tech_2",
      userId: "usr_new_tech",
      name: "Julia Eletrônica",
      email: "julia@empresa.com",
      specialty: "MacBooks & Consoles de Vídeo",
      commission: 15, // 15%
      color: "#ec4899", // Rosa
      workload: "40h semanais",
      avgRepairTime: "2.5 horas",
      completedOrdersCount: 96,
      returnedWarrantiesCount: 1,
      status: "ACTIVE"
    }
  ]

  async findAll(search?: string, statusFilter?: string) {
    let filtered = [...this.technicians]

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchLower) || 
        t.specialty.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    return filtered
  }

  async findOne(id: string) {
    const tech = this.technicians.find(t => t.id === id)
    if (!tech) throw new NotFoundException("Técnico não encontrado")
    return tech
  }

  async create(data: any) {
    const newTech: TechnicianEntity = {
      id: `tech_${this.technicians.length + 1}`,
      userId: data.userId || `usr_temp_${Date.now()}`,
      name: data.name,
      email: data.email || "",
      specialty: data.specialty || "Geral",
      commission: Number(data.commission) || 0,
      color: data.color || "#10b981",
      workload: data.workload || "44h semanais",
      avgRepairTime: "0.0 horas",
      completedOrdersCount: 0,
      returnedWarrantiesCount: 0,
      status: data.status || "ACTIVE"
    }
    this.technicians.push(newTech)
    return newTech
  }

  async update(id: string, data: any) {
    const techIndex = this.technicians.findIndex(t => t.id === id)
    if (techIndex === -1) throw new NotFoundException("Técnico não encontrado")

    this.technicians[techIndex] = {
      ...this.technicians[techIndex],
      name: data.name !== undefined ? data.name : this.technicians[techIndex].name,
      email: data.email !== undefined ? data.email : this.technicians[techIndex].email,
      specialty: data.specialty !== undefined ? data.specialty : this.technicians[techIndex].specialty,
      commission: data.commission !== undefined ? Number(data.commission) : this.technicians[techIndex].commission,
      color: data.color !== undefined ? data.color : this.technicians[techIndex].color,
      workload: data.workload !== undefined ? data.workload : this.technicians[techIndex].workload,
      status: data.status !== undefined ? data.status : this.technicians[techIndex].status
    }

    return this.technicians[techIndex]
  }

  async remove(id: string) {
    const techIndex = this.technicians.findIndex(t => t.id === id)
    if (techIndex === -1) throw new NotFoundException("Técnico não encontrado")

    const removed = this.technicians[techIndex]
    this.technicians.splice(techIndex, 1)
    return removed
  }
}
