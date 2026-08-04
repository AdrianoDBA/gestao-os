"use client"

import React, { useState, useMemo, useEffect } from "react"
import { getStoredAuditLogs } from "@/lib/db-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuditDetailDialog } from "./audit-detail-dialog"
import { 
  Search, 
  Eye, 
  ShieldAlert, 
  ShieldCheck, 
  Filter, 
  Activity,
  User as UserIcon,
  Database
} from "lucide-react"

// Lista inicial de Logs de Auditoria mockados de alta fidelidade
const initialAuditLogs = [
  {
    id: "log1",
    action: "UPDATE_OS_STATUS",
    entityName: "ServiceOrder",
    entityId: "os_1042",
    createdAt: "2026-07-28T15:30:00.000Z",
    ipAddress: "192.168.1.15",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    user: { name: "Claudio Técnico" },
    oldValues: { status: "IN_REPAIR", exitDate: null },
    newValues: { status: "READY", exitDate: null }
  },
  {
    id: "log2",
    action: "CREATE_CUSTOMER",
    entityName: "Customer",
    entityId: "cust_982",
    createdAt: "2026-07-28T10:15:00.000Z",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)",
    user: { name: "Adriano (Você)" },
    oldValues: null,
    newValues: { name: "Mariana Costa Neves", document: "456.789.123-00", email: "mariana@email.com", phone: "(11) 97777-6666" }
  },
  {
    id: "log3",
    action: "UPDATE_CUSTOMER_CONTACT",
    entityName: "Customer",
    entityId: "cust_221",
    createdAt: "2026-07-27T18:22:00.000Z",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    user: { name: "Adriano (Você)" },
    oldValues: { phone: "(11) 98765-4321", email: "joao.antigo@email.com" },
    newValues: { phone: "(11) 99999-8888", email: "joao.pedro@email.com" }
  },
  {
    id: "log4",
    action: "CONSUME_PART_STOCK",
    entityName: "Inventory",
    entityId: "part_s23u_usb",
    createdAt: "2026-07-28T15:31:00.000Z",
    ipAddress: "192.168.1.15",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    user: { name: "Claudio Técnico" },
    oldValues: { quantity: 3 },
    newValues: { quantity: 1 }
  },
  {
    id: "log5",
    action: "FINALIZE_TRANSACTION",
    entityName: "Transaction",
    entityId: "trans_9238",
    createdAt: "2026-07-28T16:02:00.000Z",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    user: { name: "Adriano (Você)" },
    oldValues: { status: "PENDING", paymentDate: null },
    newValues: { status: "PAID", paymentDate: "2026-07-28" }
  }
]

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [search, setSearch] = useState("")
  const [entityFilter, setEntityFilter] = useState<string>("ALL")
  const [userFilter, setUserFilter] = useState<string>("ALL")

  useEffect(() => {
    setLogs(getStoredAuditLogs())
    setMounted(true)
    setHasLoaded(true)
  }, [])

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  // Modal de Detalhe
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<typeof initialAuditLogs[0] | null>(null)

  // Filtros combinados
  const filteredLogs = useMemo(() => {
    if (!mounted || !hasLoaded) return []
    return logs.filter(log => {
      const matchSearch =
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.entityId.toLowerCase().includes(search.toLowerCase()) ||
        log.user.name.toLowerCase().includes(search.toLowerCase())

      const matchEntity = entityFilter === "ALL" || log.entityName === entityFilter
      const matchUser = userFilter === "ALL" || log.user.name === userFilter

      return matchSearch && matchEntity && matchUser
    })
  }, [logs, search, entityFilter, userFilter, mounted, hasLoaded])

  // Paginação lógica
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredLogs.slice(start, start + itemsPerPage)
  }, [filteredLogs, currentPage])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleOpenDetail = (log: typeof initialAuditLogs[0]) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  const getActionBadge = (action: string) => {
    if (action.includes("CREATE")) return <Badge variant="success">Criar</Badge>
    if (action.includes("UPDATE") || action.includes("STATUS") || action.includes("CONTACT")) return <Badge variant="info">Alterar</Badge>
    if (action.includes("DELETE") || action.includes("CONSUME")) return <Badge variant="destructive">Excluir</Badge>
    return <Badge variant="secondary">{action}</Badge>
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-zinc-300" /> Trilha de Auditoria
          </h2>
          <p className="text-sm text-muted-foreground">Monitore quem criou, quem editou e o histórico completo de valores modificados por registro.</p>
        </div>
      </div>

      {/* Grid de estatísticas rápidas da auditoria */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border/80">
          <CardContent className="p-4 flex items-center gap-3 text-xs">
            <Activity className="w-8 h-8 text-zinc-400" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Total de Atividades</p>
              <h4 className="text-base font-bold text-foreground mt-0.5">{logs.length} ações salvas</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/80">
          <CardContent className="p-4 flex items-center gap-3 text-xs">
            <UserIcon className="w-8 h-8 text-zinc-400" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Autores Ativos</p>
              <h4 className="text-base font-bold text-foreground mt-0.5">2 usuários logados</h4>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/80">
          <CardContent className="p-4 flex items-center gap-3 text-xs">
            <Database className="w-8 h-8 text-zinc-400" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Entidades Monitoradas</p>
              <h4 className="text-base font-bold text-foreground mt-0.5">4 tabelas ativas</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca e Filtros */}
      <div className="grid gap-4 md:grid-cols-4 bg-card/25 border border-border p-4 rounded-lg items-center">
        {/* Busca */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-4 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            placeholder="Buscar por Ação, ID do Registro ou Usuário..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filtro Tabela */}
        <div className="space-y-1">
          <select
            className="w-full h-9 px-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
          >
            <option value="ALL">Todas as Tabelas</option>
            <option value="ServiceOrder">Ordens de Serviço</option>
            <option value="Customer">Clientes</option>
            <option value="Inventory">Estoque / Peças</option>
            <option value="Transaction">Financeiro</option>
          </select>
        </div>

        {/* Filtro Usuário */}
        <div className="space-y-1">
          <select
            className="w-full h-9 px-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
          >
            <option value="ALL">Todos os Autores</option>
            <option value="Adriano (Você)">Adriano (Você)</option>
            <option value="Claudio Técnico">Claudio Técnico</option>
          </select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Autor</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Ação / Operação</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Tabela Afetada</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold font-mono text-[10px] uppercase">Registro ID</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Data / Hora</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold text-right">Auditoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      Nenhum log de auditoria encontrado.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      {/* Autor */}
                      <td className="py-3.5 px-6 font-semibold text-foreground">{log.user.name}</td>
                      
                      {/* Ação */}
                      <td className="py-3.5 px-6">{getActionBadge(log.action)}</td>
                      
                      {/* Tabela */}
                      <td className="py-3.5 px-6 text-foreground font-medium">{log.entityName}</td>
                      
                      {/* Registro ID */}
                      <td className="py-3.5 px-6 font-mono text-muted-foreground">{log.entityId}</td>
                      
                      {/* Data / Hora */}
                      <td className="py-3.5 px-6 text-muted-foreground font-mono">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-foreground"
                          onClick={() => handleOpenDetail(log)}
                          title="Ver Diferenças de Valores"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Detalhe com visualizador de Git Diff */}
      <AuditDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        log={selectedLog}
      />
    </div>
  )
}
