"use client"

export interface Technician {
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

const initialTechniciansList: Technician[] = [
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

export const getTechnicians = (): Technician[] => {
  if (typeof window === "undefined") return initialTechniciansList
  const saved = localStorage.getItem("technicians_list")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("technicians_list", JSON.stringify(initialTechniciansList))
  return initialTechniciansList
}

export const saveTechnicians = (techs: Technician[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("technicians_list", JSON.stringify(techs))
}
