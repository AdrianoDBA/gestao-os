"use client"

import React, { useState, useMemo, useEffect } from "react"
import { getStoredDevices, saveStoredDevices, getStoredCustomers, saveStoredCustomers, getStoredOrders } from "@/lib/db-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeviceDialog, DeviceFormData } from "./device-dialog"
import { DeviceDetailDialog } from "./device-detail-dialog"
import { Search, Plus, Eye, Edit, Trash2, Filter, Laptop, Smartphone, Tv, Gamepad2, Hammer, Printer, Monitor, Cpu } from "lucide-react"
import { Device, Customer } from "@/types"

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [mounted, setMounted] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | Device["category"]>("ALL")

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Modais
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  useEffect(() => {
    setDevices(getStoredDevices())
    setCustomers(getStoredCustomers())
    setMounted(true)
    setHasLoaded(true)
  }, [])

  useEffect(() => {
    if (mounted && hasLoaded) {
      saveStoredDevices(devices)
    }
  }, [devices, mounted, hasLoaded])

  const allOrders = useMemo(() => getStoredOrders(), [])

  // Busca Global Inteligente (Busca por serial, IMEI, marca, modelo, nome do cliente, CPF, telefone ou número da OS)
  const filteredDevices = useMemo(() => {
    return devices.filter(dev => {
      const client = customers.find(c => c.id === dev.customerId)
      const deviceOrders = allOrders.filter(o => o.deviceId === dev.id || o.deviceId === `dev${dev.id.replace("dev", "")}`)

      const query = search.toLowerCase()

      const matchSearch =
        dev.modelName.toLowerCase().includes(query) ||
        dev.brandName.toLowerCase().includes(query) ||
        dev.serialNumber.toLowerCase().includes(query) ||
        (dev.imei && dev.imei.toLowerCase().includes(query)) ||
        (client && (
          client.name.toLowerCase().includes(query) ||
          client.phone.includes(query) ||
          client.document.includes(query)
        )) ||
        deviceOrders.some(o => o.number.toString().includes(query))

      const matchCategory =
        categoryFilter === "ALL" || dev.category === categoryFilter

      return matchSearch && matchCategory
    })
  }, [devices, search, categoryFilter, customers, allOrders])

  // Paginação lógica
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage)
  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredDevices.slice(start, start + itemsPerPage)
  }, [filteredDevices, currentPage])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 font-medium">Carregando dispositivos...</span>
        </div>
      </div>
    )
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleFilterChange = (filter: typeof categoryFilter) => {
    setCategoryFilter(filter)
    setCurrentPage(1)
  }

  const handleOpenCreate = () => {
    setSelectedDevice(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (device: Device) => {
    setSelectedDevice(device)
    setIsFormOpen(true)
  }

  const handleOpenDetail = (device: Device) => {
    setSelectedDevice(device)
    setIsDetailOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente remover este equipamento do sistema?")) {
      setDevices(prev => prev.filter(d => d.id !== id))
    }
  }

  const handleSaveDevice = (data: DeviceFormData) => {
    const customer = customers.find(c => c.id === data.customerId)
    const customerName = customer ? customer.name : "Cliente Desconhecido"

    if (data.id) {
      // Editar
      setDevices(prev =>
        prev.map(d => {
          if (d.id === data.id) {
            // Histórico de Alterações do Equipamento
            const changes: string[] = []
            if (d.brandName !== data.brandName || d.modelName !== data.modelName) {
              changes.push(`Aparelho atualizado de "${d.brandName} ${d.modelName}" para "${data.brandName} ${data.modelName}"`)
            }
            if (d.status !== data.status) {
              changes.push(`Status alterado de "${d.status}" para "${data.status}"`)
            }
            
            const auditAction = changes.length > 0 ? changes.join(" | ") : "Especificações técnicas salvas"

            const newHistory = [
              ...(d.history || []),
              {
                id: `dh_${Date.now()}`,
                date: new Date().toISOString(),
                action: "Equipamento editado",
                details: auditAction
              }
            ]

            return {
              ...d,
              customerId: data.customerId,
              customerName,
              category: data.category,
              brandName: data.brandName,
              modelName: data.modelName,
              serialNumber: data.serialNumber,
              imei: data.imei,
              password: data.password,
              color: data.color,
              physicalState: data.physicalState,
              reportedDefect: data.reportedDefect,
              accessories: data.accessories,
              observations: data.observations,
              status: data.status,
              photos: data.photos,
              checklist: data.checklist,
              history: newHistory
            }
          }
          return d
        })
      )
    } else {
      // Criar
      const newDeviceId = `dev_${Date.now()}`
      const newDevice: Device = {
        id: newDeviceId,
        customerId: data.customerId,
        customerName,
        category: data.category,
        brandName: data.brandName,
        modelName: data.modelName,
        serialNumber: data.serialNumber,
        imei: data.imei,
        password: data.password,
        color: data.color,
        physicalState: data.physicalState,
        reportedDefect: data.reportedDefect,
        accessories: data.accessories,
        observations: data.observations,
        createdAt: new Date().toISOString(),
        status: data.status,
        photos: data.photos,
        checklist: data.checklist,
        history: [
          {
            id: `dh_${Date.now()}`,
            date: new Date().toISOString(),
            action: "Cadastro do Equipamento",
            details: `Registrado sob o perfil do cliente ${customerName}. Defeito informado: "${data.reportedDefect || "Nenhum"}"`
          }
        ],
        serviceOrders: []
      }

      setDevices(prev => [newDevice, ...prev])

      // Vincula reativamente o equipamento ao cliente correspondente no localStorage
      setCustomers(prev =>
        prev.map(c => {
          if (c.id === data.customerId) {
            const currentDevices = c.devices || []
            return {
              ...c,
              devices: [
                ...currentDevices,
                {
                  id: newDeviceId,
                  brandName: data.brandName,
                  modelName: data.modelName,
                  serialNumber: data.serialNumber,
                  category: data.category
                }
              ]
            }
          }
          return c
        })
      )
    }
    setIsFormOpen(false)
  }

  // Mapeia ícones para todas as categorias do Épico 2
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Celular":
        return <Smartphone className="w-3.5 h-3.5" />
      case "Notebook":
        return <Laptop className="w-3.5 h-3.5" />
      case "Desktop":
        return <Laptop className="w-3.5 h-3.5" />
      case "TV":
        return <Tv className="w-3.5 h-3.5" />
      case "Monitor":
        return <Monitor className="w-3.5 h-3.5" />
      case "Videogame":
        return <Gamepad2 className="w-3.5 h-3.5" />
      case "Impressora":
        return <Printer className="w-3.5 h-3.5" />
      case "Placa eletrônica":
        return <Cpu className="w-3.5 h-3.5" />
      default:
        return <Hammer className="w-3.5 h-3.5" />
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Equipamentos</h2>
          <p className="text-sm text-muted-foreground">Monitore marcas, modelos, senhas e estado estético dos aparelhos.</p>
        </div>
        <Button variant="default" size="sm" onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Cadastrar Equipamento
        </Button>
      </div>

      {/* Busca e Filtro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/25 border border-border p-4 rounded-lg">
        {/* Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-4 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            placeholder="Buscar por Marca, Modelo, Nº Série, Dono ou OS..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Categoria */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <span className="text-xs text-muted-foreground hidden sm:block">Categoria:</span>
          <select
            value={categoryFilter}
            onChange={e => handleFilterChange(e.target.value as any)}
            className="h-9 px-2 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">Todas Categorias</option>
            <option value="Celular">Celulares</option>
            <option value="Notebook">Notebooks</option>
            <option value="Desktop">Desktops</option>
            <option value="Tablet">Tablets</option>
            <option value="Videogame">Videogames</option>
            <option value="TV">TVs</option>
            <option value="Monitor">Monitores</option>
            <option value="Impressora">Impressoras</option>
            <option value="Placa eletrônica">Placas Eletrônicas</option>
            <option value="Outro">Outros</option>
          </select>
        </div>
      </div>

      {/* Tabela de Dispositivos */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Equipamento</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Categoria</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold font-mono text-[10px] uppercase">Número de Série</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Proprietário</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Status</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedDevices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      Nenhum equipamento encontrado.
                    </td>
                  </tr>
                ) : (
                  paginatedDevices.map(dev => (
                    <tr key={dev.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-foreground">
                        {dev.brandName} {dev.modelName}
                        {dev.color && <span className="text-[10px] text-muted-foreground ml-1.5">({dev.color})</span>}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="flex items-center gap-1.5 text-foreground font-medium">
                          {getCategoryIcon(dev.category)}
                          {dev.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-muted-foreground">
                        {dev.serialNumber}
                      </td>
                      <td className="py-3.5 px-6 text-foreground font-semibold">
                        {dev.customerName}
                      </td>
                      <td className="py-3.5 px-6">
                        <Badge variant={dev.status === "ACTIVE" ? "success" : "secondary"}>
                          {dev.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-foreground"
                          onClick={() => handleOpenDetail(dev)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-foreground"
                          onClick={() => handleOpenEdit(dev)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-destructive"
                          onClick={() => handleDelete(dev.id)}
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
      <DeviceDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveDevice}
        device={selectedDevice}
        customers={customers}
        existingDevices={devices}
      />

      {/* Modal de Detalhe */}
      <DeviceDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        device={selectedDevice}
      />
    </div>
  )
}
