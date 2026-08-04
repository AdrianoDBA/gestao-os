"use client"

import React, { useState, useMemo, useEffect } from "react"
import { getStoredCustomers, saveStoredCustomers } from "@/lib/db-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CustomerDialog, CustomerData } from "./customer-dialog"
import { CustomerDetailDialog } from "./customer-detail-dialog"
import { formatDocument, formatPhone } from "@/lib/validation"
import { Search, UserPlus, Eye, Edit, Trash2, Filter, ArrowUpDown } from "lucide-react"
import { Customer } from "@/types"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [mounted, setMounted] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [search, setSearch] = useState("")
  const [documentFilter, setDocumentFilter] = useState<"ALL" | "PF" | "PJ">("ALL")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ACTIVE")
  const [sortBy, setSortBy] = useState<"name" | "createdAt">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Modais
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    setCustomers(getStoredCustomers())
    setMounted(true)
    setHasLoaded(true)
  }, [])

  useEffect(() => {
    if (mounted && hasLoaded) {
      saveStoredCustomers(customers)
    }
  }, [customers, mounted, hasLoaded])

  // Busca e Filtros Combinados
  const filteredCustomers = useMemo(() => {
    return customers
      .filter(client => {
        // Busca inteligente (nome, documento, telefone, whatsapp, email)
        const query = search.toLowerCase()
        const matchSearch =
          client.name.toLowerCase().includes(query) ||
          client.document.includes(query) ||
          client.phone.includes(query) ||
          client.whatsapp.includes(query) ||
          client.email.toLowerCase().includes(query)

        // Filtro de CPF/CNPJ
        const matchDocType =
          documentFilter === "ALL" || client.documentType === documentFilter

        // Filtro de Status (Ativo/Inativo)
        const matchStatus =
          statusFilter === "ALL" ||
          (statusFilter === "ACTIVE" && client.isActive) ||
          (statusFilter === "INACTIVE" && !client.isActive)

        return matchSearch && matchDocType && matchStatus
      })
      .sort((a, b) => {
        let valA: any = a[sortBy] || ""
        let valB: any = b[sortBy] || ""

        if (sortBy === "createdAt") {
          valA = new Date(valA).getTime()
          valB = new Date(valB).getTime()
        } else {
          valA = valA.toString().toLowerCase()
          valB = valB.toString().toLowerCase()
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1
        if (valA > valB) return sortOrder === "asc" ? 1 : -1
        return 0
      })
  }, [customers, search, documentFilter, statusFilter, sortBy, sortOrder])

  // Paginação lógica
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCustomers.slice(start, start + itemsPerPage)
  }, [filteredCustomers, currentPage])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 font-medium">Carregando clientes...</span>
        </div>
      </div>
    )
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleDocFilterChange = (filter: "ALL" | "PF" | "PJ") => {
    setDocumentFilter(filter)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (filter: "ALL" | "ACTIVE" | "INACTIVE") => {
    setStatusFilter(filter)
    setCurrentPage(1)
  }

  const toggleSort = (field: "name" | "createdAt") => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  // Ações de CRUD
  const handleOpenCreate = () => {
    setSelectedCustomer(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsFormOpen(true)
  }

  const handleOpenDetail = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailOpen(true)
  }

  // Exclusão Lógica (Soft Delete)
  const handleDelete = (id: string) => {
    if (confirm("Deseja inativar logicamente este cliente? (O registro permanecerá arquivado)")) {
      setCustomers(prev =>
        prev.map(c => {
          if (c.id === id) {
            const newHistory = [
              ...(c.history || []),
              {
                id: `log_${Date.now()}`,
                date: new Date().toISOString(),
                action: "Inativação lógica do cliente",
                user: "Adriano Medeiros"
              }
            ]
            return {
              ...c,
              isActive: false,
              history: newHistory
            }
          }
          return c
        })
      )
    }
  }

  const handleSaveCustomer = (data: CustomerData) => {
    if (data.id) {
      // Editar
      setCustomers(prev =>
        prev.map(c => {
          if (c.id === data.id) {
            // Compara alterações para auditoria
            const changes: string[] = []
            if (c.name !== data.name) changes.push(`Nome alterado de "${c.name}" para "${data.name}"`)
            if (c.phone !== data.phone) changes.push(`Telefone alterado para ${formatPhone(data.phone)}`)
            if (c.isActive !== data.isActive) changes.push(`Status alterado para ${data.isActive ? "Ativo" : "Inativo"}`)
            
            const auditAction = changes.length > 0 ? changes.join(" | ") : "Dados salvos sem modificações críticas"

            const newHistory = [
              ...(c.history || []),
              {
                id: `log_${Date.now()}`,
                date: new Date().toISOString(),
                action: auditAction,
                user: "Adriano Medeiros"
              }
            ]

            return {
              ...c,
              name: data.name,
              document: data.document,
              documentType: data.documentType,
              birthDate: data.birthDate,
              phone: data.phone,
              whatsapp: data.whatsapp,
              whatsappSameAsPhone: data.whatsappSameAsPhone,
              email: data.email,
              cep: data.cep,
              address: data.address,
              addressNumber: data.addressNumber,
              complement: data.complement,
              bairro: data.bairro,
              city: data.city,
              state: data.state,
              notes: data.notes,
              isActive: data.isActive,
              history: newHistory
            }
          }
          return c
        })
      )
    } else {
      // Criar
      const newCustomer: Customer = {
        id: `c_${Date.now()}`,
        name: data.name,
        document: data.document,
        documentType: data.documentType,
        birthDate: data.birthDate,
        phone: data.phone,
        whatsapp: data.whatsapp,
        whatsappSameAsPhone: data.whatsappSameAsPhone,
        email: data.email,
        cep: data.cep,
        address: data.address,
        addressNumber: data.addressNumber,
        complement: data.complement,
        bairro: data.bairro,
        city: data.city,
        state: data.state,
        notes: data.notes,
        isActive: data.isActive,
        createdAt: new Date().toISOString(),
        history: [
          {
            id: `log_${Date.now()}`,
            date: new Date().toISOString(),
            action: "Cadastro inicial do cliente",
            user: "Adriano Medeiros"
          }
        ],
        devices: [],
        serviceOrders: []
      }
      setCustomers(prev => [newCustomer, ...prev])
    }
    setIsFormOpen(false)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Clientes</h2>
          <p className="text-sm text-muted-foreground">Gerencie o cadastro de clientes, histórico de aparelhos e laudos.</p>
        </div>
        <Button variant="default" size="sm" onClick={handleOpenCreate} className="gap-2 shrink-0">
          <UserPlus className="w-4 h-4" />
          Cadastrar Cliente
        </Button>
      </div>

      {/* Caixa de Pesquisa e Filtros */}
      <div className="flex flex-col gap-4 bg-card/25 border border-border p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Input de Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              className="w-full h-9 pl-9 pr-4 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              placeholder="Buscar por Nome, CPF, Telefone, WhatsApp, E-mail..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("name")}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Ordenar por Nome
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("createdAt")}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Ordenar por Data
            </Button>
          </div>
        </div>

        {/* Filtros de Tipo e Status */}
        <div className="flex flex-wrap items-center gap-4 border-t border-border/20 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-semibold">Perfil:</span>
            <div className="inline-flex rounded-md border border-border bg-background p-0.5">
              <button
                onClick={() => handleDocFilterChange("ALL")}
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                  documentFilter === "ALL" ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => handleDocFilterChange("PF")}
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                  documentFilter === "PF" ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                PF
              </button>
              <button
                onClick={() => handleDocFilterChange("PJ")}
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                  documentFilter === "PJ" ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                PJ
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-semibold">Status:</span>
            <div className="inline-flex rounded-md border border-border bg-background p-0.5">
              <button
                onClick={() => handleStatusFilterChange("ALL")}
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                  statusFilter === "ALL" ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => handleStatusFilterChange("ACTIVE")}
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                  statusFilter === "ACTIVE" ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                Ativos
              </button>
              <button
                onClick={() => handleStatusFilterChange("INACTIVE")}
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                  statusFilter === "INACTIVE" ? "bg-secondary text-foreground" : "text-muted-foreground"
                }`}
              >
                Inativos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Nome</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold font-mono text-[10px] uppercase">Documento</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Contato</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Status</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Aparelhos</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      Nenhum cliente encontrado para os critérios de busca.
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map(client => (
                    <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-foreground">{client.name}</td>
                      <td className="py-3.5 px-6 font-mono text-muted-foreground">
                        {formatDocument(client.document)}
                      </td>
                      <td className="py-3.5 px-6 text-foreground space-y-0.5">
                        <p>{formatPhone(client.phone)}</p>
                        {client.email && <p className="text-[10px] text-muted-foreground">{client.email}</p>}
                      </td>
                      <td className="py-3.5 px-6">
                        <Badge variant={client.isActive ? "success" : "secondary"}>
                          {client.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6">
                        <Badge variant="outline" className="font-semibold">
                          {(client.devices || []).length} {(client.devices || []).length === 1 ? "aparelho" : "aparelhos"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-foreground"
                          onClick={() => handleOpenDetail(client)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-foreground"
                          onClick={() => handleOpenEdit(client)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!client.isActive}
                          className="h-8 w-8 text-zinc-400 hover:text-destructive disabled:opacity-30"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal de Criar / Editar */}
      <CustomerDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />

      {/* Modal de Detalhes Completo */}
      <CustomerDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        customer={selectedCustomer}
        onNewOS={(customerId) => {
          alert(`Redirecionando para abertura de OS para o cliente ${customerId}`);
          setIsDetailOpen(false);
        }}
      />
    </div>
  )
}
