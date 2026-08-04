"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTechnicians, saveTechnicians, Technician } from "@/lib/technician-store"
import { getUsers, checkPermission } from "@/lib/auth-store"
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Edit, 
  Wrench, 
  Percent, 
  Clock, 
  Calendar,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RotateCcw
} from "lucide-react"

export default function TechniciansPage() {
  const [techs, setTechs] = useState<Technician[]>(getTechnicians())
  const [users] = useState(getUsers())
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Modais
  const [isTechModalOpen, setIsTechModalOpen] = useState(false)
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null)

  // Campos do Form
  const [userId, setUserId] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [commission, setCommission] = useState(10)
  const [color, setColor] = useState("#3b82f6")
  const [workload, setWorkload] = useState("44h semanais")
  const [status, setStatus] = useState<Technician["status"]>("ACTIVE")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const canEdit = checkPermission("orders", "edit")
  const canCreate = checkPermission("orders", "create")
  const canDelete = checkPermission("orders", "delete")

  // Filtros de busca
  const filteredTechs = useMemo(() => {
    return techs.filter(t => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.specialty.toLowerCase().includes(search.toLowerCase())
      
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [techs, search, statusFilter])

  // Lista de usuários que não são administradores e podem ser vinculados
  const technicianUsers = useMemo(() => {
    return users.filter(u => u.role === "Técnico" || u.role === "Administrador")
  }, [users])

  const handleOpenCreate = () => {
    setSelectedTech(null)
    setUserId("")
    setSpecialty("")
    setCommission(10)
    setColor("#3b82f6")
    setWorkload("44h semanais")
    setStatus("ACTIVE")
    setErrors({})
    setIsTechModalOpen(true)
  }

  const handleOpenEdit = (tech: Technician) => {
    setSelectedTech(tech)
    setUserId(tech.userId)
    setSpecialty(tech.specialty)
    setCommission(tech.commission)
    setColor(tech.color)
    setWorkload(tech.workload)
    setStatus(tech.status)
    setErrors({})
    setIsTechModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!userId) newErrors.userId = "Selecione o usuário vinculado"
    if (!specialty.trim()) newErrors.specialty = "Especialidade é obrigatória"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const linkedUser = users.find(u => u.id === userId)
    const name = linkedUser?.name || "Técnico Avulso"
    const email = linkedUser?.email || ""

    let updatedList: Technician[] = []
    if (selectedTech) {
      // Edição
      updatedList = techs.map(t => 
        t.id === selectedTech.id 
          ? { ...t, userId, name, email, specialty, commission, color, workload, status }
          : t
      )
    } else {
      // Criação
      const newTech: Technician = {
        id: `tech_${Date.now()}`,
        userId,
        name,
        email,
        specialty,
        commission,
        color,
        workload,
        avgRepairTime: "1.5 horas",
        completedOrdersCount: 0,
        returnedWarrantiesCount: 0,
        status
      }
      updatedList = [...techs, newTech]
    }

    setTechs(updatedList)
    saveTechnicians(updatedList)
    setIsTechModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm("Deseja realmente excluir este técnico do laboratório?")) return
    const updated = techs.filter(t => t.id !== id)
    setTechs(updated)
    saveTechnicians(updated)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-zinc-300" /> Corpo Técnico
          </h2>
          <p className="text-xs text-muted-foreground">Monitore o rendimento individual dos técnicos de bancada, comissões e garantias retornadas.</p>
        </div>
        {canCreate && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleOpenCreate}
            className="bg-blue-500 hover:bg-blue-600 gap-1.5 font-bold"
          >
            <UserPlus className="w-4 h-4" /> Configurar Técnico
          </Button>
        )}
      </div>

      {/* Grid de Estatísticas Gerais */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border/80 p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5"><FileCheck className="w-4 h-4 text-emerald-400" /> Total de OS Concluídas</span>
          <p className="text-2xl font-bold text-foreground font-mono">238</p>
          <span className="text-[10px] text-zinc-500">Média de 119 reparos por técnico ativo</span>
        </Card>
        
        <Card className="bg-card border-border/80 p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-red-400" /> Garantias Retornadas</span>
          <p className="text-2xl font-bold text-foreground font-mono">4</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Taxa de retorno de 1.6% (Excelente)</span>
        </Card>

        <Card className="bg-card border-border/80 p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-400" /> Média de SLA Geral</span>
          <p className="text-2xl font-bold text-foreground font-mono">1.8 horas</p>
          <span className="text-[10px] text-zinc-500">Dentro do prazo regulamentar do laboratório</span>
        </Card>
      </div>

      {/* Filtros */}
      <div className="grid gap-4 md:grid-cols-4 bg-card/20 border border-border p-4 rounded-lg items-center">
        <div className="relative md:col-span-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-4 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Buscar técnico por nome ou especialidade (Ex: placa, tela)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select
            className="w-full h-9 px-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Em atividade</option>
            <option value="ON_VACATION">Férias</option>
            <option value="INACTIVE">Inativo</option>
          </select>
        </div>
      </div>

      {/* Grid de Técnicos */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTechs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed border-border rounded-lg bg-card/10">
            Nenhum técnico cadastrado com estes filtros.
          </div>
        ) : (
          filteredTechs.map(tech => (
            <Card key={tech.id} className="bg-card border-border/80 hover:border-zinc-800 transition-colors flex flex-col justify-between overflow-hidden">
              {/* Top Banner Cor de Identidade */}
              <div className="h-1.5 w-full" style={{ backgroundColor: tech.color }} />
              
              <div className="p-6 space-y-4">
                {/* Header Técnico */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tech.color }} />
                      {tech.name}
                    </h3>
                    <p className="text-xs text-zinc-400 font-semibold">{tech.specialty}</p>
                  </div>
                  
                  {tech.status === "ACTIVE" ? (
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider text-emerald-400 border-emerald-500/20 bg-emerald-500/5">Ativo</Badge>
                  ) : tech.status === "ON_VACATION" ? (
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider text-yellow-400 border-yellow-500/20 bg-yellow-500/5">Férias</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider text-zinc-500 border-zinc-700/20 bg-zinc-700/5">Inativo</Badge>
                  )}
                </div>

                {/* Info Geral */}
                <div className="grid grid-cols-2 gap-3 text-[10px] border-t border-border/20 pt-4 text-muted-foreground leading-relaxed">
                  <p className="flex items-center gap-1.5"><Percent className="w-3.5 h-3.5 text-blue-400" /> Comissão: <span className="font-semibold text-foreground">{tech.commission}% por OS</span></p>
                  <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" /> Escala: <span className="font-semibold text-foreground">{tech.workload}</span></p>
                </div>

                {/* Indicadores de Nível (Notion-style bars) */}
                <div className="space-y-3 pt-2">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Métricas de Bancada</span>
                  
                  {/* Eficiência OS */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-semibold">
                      <span className="flex items-center gap-1"><FileCheck className="w-3 h-3 text-zinc-400" /> Ordens Concluídas</span>
                      <span className="text-white">{tech.completedOrdersCount} OS</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min(100, (tech.completedOrdersCount / 150) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Garantias */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-semibold">
                      <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3 text-zinc-400" /> Retorno de Garantia</span>
                      <span className={`${tech.returnedWarrantiesCount > 2 ? "text-red-400" : "text-emerald-400"}`}>{tech.returnedWarrantiesCount} OS</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${tech.returnedWarrantiesCount > 2 ? "bg-red-500" : "bg-emerald-500"}`} 
                        style={{ width: `${Math.min(100, (tech.returnedWarrantiesCount / 5) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* SLA */}
                  <div className="flex items-center justify-between text-[9px] font-semibold pt-1 text-muted-foreground border-t border-border/10">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-400" /> Tempo Médio de Reparo (SLA)</span>
                    <span className="font-bold text-foreground font-mono">{tech.avgRepairTime}</span>
                  </div>
                </div>

              </div>

              {/* Botões Ação */}
              <div className="px-6 py-4 border-t border-border/40 bg-card/25 text-right space-x-1.5 shrink-0">
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(tech)} className="font-semibold text-zinc-400 border-zinc-800">
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </Button>
                )}
                {canDelete && (
                  <Button variant="outline" size="sm" onClick={() => handleDelete(tech.id)} className="font-semibold text-red-400 border-red-950/20 bg-red-950/5">
                    <Trash2 className="w-3.5 h-3.5" /> Remover
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal CRUD Técnico */}
      {isTechModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/45">
              <h3 className="text-sm font-bold text-foreground">
                {selectedTech ? "Editar Técnico" : "Configurar Novo Técnico"}
              </h3>
              <button onClick={() => setIsTechModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Vincular a Usuário Existente</label>
                <select
                  className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                >
                  <option value="">Selecione um usuário...</option>
                  {technicianUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
                {errors.userId && <p className="text-[10px] text-destructive">{errors.userId}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Especialidade / Foco Técnico</label>
                <input
                  type="text"
                  className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none"
                  placeholder="Ex: Soldagem BGA, iPhones, Placa-Mãe de Notebooks"
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                />
                {errors.specialty && <p className="text-[10px] text-destructive">{errors.specialty}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Comissão de Bancada (%)</label>
                  <input
                    type="number"
                    className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none"
                    value={commission}
                    onChange={e => setCommission(Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Carga Horária / Escala</label>
                  <input
                    type="text"
                    className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none"
                    value={workload}
                    onChange={e => setWorkload(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Cor de Identificação (Painel)</label>
                  <input
                    type="color"
                    className="w-full h-9 p-1 rounded-md bg-background border border-border cursor-pointer"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Status Atual</label>
                  <select
                    className="w-full h-9 px-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none"
                    value={status}
                    onChange={e => setStatus(e.target.value as Technician["status"])}
                  >
                    <option value="ACTIVE">Em Atividade</option>
                    <option value="ON_VACATION">Em Férias</option>
                    <option value="INACTIVE">Inativo / Afastado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsTechModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 font-bold">
                  Salvar Técnico
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
