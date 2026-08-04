"use client"

import React, { useState, useMemo, useEffect } from "react"
import { getStoredInventory, saveStoredInventory } from "@/lib/db-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PartDialog, PartData } from "./part-dialog"
import { MovementDialog } from "./movement-dialog"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  History,
  Barcode
} from "lucide-react"

// Lista inicial de peças mockadas de alta fidelidade
const initialParts = [
  {
    id: "p1",
    name: "Tela OLED iPhone 13 Pro",
    sku: "TEL-IPH13P-OLED",
    barcode: "7891234567890",
    description: "Tela frontal homologada EAN-13, excelente brilho e resposta táctil",
    costPrice: 300.00,
    salePrice: 650.00,
    minStock: 2,
    location: "Gaveteiro A - Linha 2",
    quantity: 5,
    movements: [
      { id: "m1", type: "INPUT" as const, quantity: 5, reason: "Lote inicial de compra", createdAt: "2026-07-20" }
    ]
  },
  {
    id: "p2",
    name: "Conector de Carga USB-C S23 Ultra",
    sku: "CON-S23U-USBC",
    barcode: "7899876543210",
    description: "Subplaca de carga contendo conector USB tipo C e microfone secundário",
    costPrice: 80.00,
    salePrice: 200.00,
    minStock: 3,
    location: "Caixa Plástica Azul 1",
    quantity: 1, // ALERTA: Abaixo do estoque mínimo!
    movements: [
      { id: "m2", type: "INPUT" as const, quantity: 3, reason: "Fornecedor Tech Parts", createdAt: "2026-07-22" },
      { id: "m3", type: "OUTPUT" as const, quantity: 2, reason: "Consumo automático na OS #1042", createdAt: "2026-07-28" }
    ]
  },
  {
    id: "p3",
    name: "Bateria iPhone 13 Pro Premium",
    sku: "BAT-IPH13P-PREM",
    barcode: "7894561230789",
    description: "Bateria de polímero de lítio com chip controlador de carga",
    costPrice: 90.00,
    salePrice: 200.00,
    minStock: 2,
    location: "Gaveteiro A - Linha 5",
    quantity: 3,
    movements: [
      { id: "m4", type: "INPUT" as const, quantity: 4, reason: "Lote importação direta", createdAt: "2026-07-24" },
      { id: "m5", type: "OUTPUT" as const, quantity: 1, reason: "Consumo automático na OS #1041", createdAt: "2026-07-28" }
    ]
  },
  {
    id: "p4",
    name: "Mosfet de Entrada 19V Notebook Dell",
    sku: "MOS-DELL-19V",
    barcode: "",
    description: "Mosfet canal N para reparo avançado de circuitos integrados de notebooks",
    costPrice: 5.00,
    salePrice: 15.00,
    minStock: 10,
    location: "Gaveta Organizadora 04",
    quantity: 8, // ALERTA: Estoque mínimo!
    movements: [
      { id: "m6", type: "INPUT" as const, quantity: 10, reason: "Compra Mercado Livre", createdAt: "2026-07-15" },
      { id: "m7", type: "OUTPUT" as const, quantity: 2, reason: "Consumo automático na OS #1040", createdAt: "2026-07-27" }
    ]
  }
]

export default function InventoryPage() {
  const [parts, setParts] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [search, setSearch] = useState("")
  const [lowStockFilter, setLowStockFilter] = useState(false)
  const [selectedPartForHistory, setSelectedPartForHistory] = useState<any | null>(null)

  useEffect(() => {
    const list = getStoredInventory()
    setParts(list)
    if (list.length > 0) {
      setSelectedPartForHistory(list[0])
    }
    setMounted(true)
    setHasLoaded(true)
  }, [])

  useEffect(() => {
    if (mounted && hasLoaded) {
      saveStoredInventory(parts)
    }
  }, [parts, mounted, hasLoaded])

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  // Modais de Controle
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isMovementOpen, setIsMovementOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<typeof initialParts[0] | null>(null)

  // Filtros combinados
  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const matchSearch =
        part.name.toLowerCase().includes(search.toLowerCase()) ||
        (part.sku && part.sku.toLowerCase().includes(search.toLowerCase())) ||
        (part.barcode && part.barcode.includes(search))

      const matchLowStock = !lowStockFilter || part.quantity <= part.minStock

      return matchSearch && matchLowStock
    })
  }, [parts, search, lowStockFilter])

  // Paginação lógica
  const totalPages = Math.ceil(filteredParts.length / itemsPerPage)
  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredParts.slice(start, start + itemsPerPage)
  }, [filteredParts, currentPage])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 font-medium">Carregando estoque...</span>
        </div>
      </div>
    )
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleOpenCreate = () => {
    setSelectedPart(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (part: typeof initialParts[0]) => {
    setSelectedPart(part)
    setIsFormOpen(true)
  }

  const handleOpenMovement = (part: typeof initialParts[0]) => {
    setSelectedPart(part)
    setIsMovementOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente remover esta peça do catálogo?")) {
      setParts(prev => prev.filter(p => p.id !== id))
      if (selectedPartForHistory?.id === id) {
        setSelectedPartForHistory(null)
      }
    }
  }

  const handleSavePart = (data: PartData) => {
    if (data.id) {
      // Editar
      setParts(prev =>
        prev.map(p =>
          p.id === data.id
            ? {
                ...p,
                name: data.name,
                sku: data.sku,
                barcode: data.barcode,
                description: data.description,
                costPrice: data.costPrice,
                salePrice: data.salePrice,
                minStock: data.minStock,
                location: data.location
              }
            : p
        )
      )
    } else {
      // Criar
      const newPart = {
        id: `part_${Date.now()}`,
        name: data.name,
        sku: data.sku,
        barcode: data.barcode,
        description: data.description,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        minStock: data.minStock,
        location: data.location,
        quantity: data.initialQty || 0,
        movements: data.initialQty && data.initialQty > 0 ? [
          { id: `m_${Date.now()}`, type: "INPUT" as const, quantity: data.initialQty, reason: "Ajuste inicial de estoque", createdAt: new Date().toISOString().split("T")[0] }
        ] : []
      }
      setParts(prev => [newPart, ...prev])
    }
    setIsFormOpen(false)
  }

  // Registrar Entrada ou Saída Manual
  const handleSaveMovement = (movement: { type: "INPUT" | "OUTPUT"; quantity: number; reason: string }) => {
    if (!selectedPart) return

    setParts(prev =>
      prev.map(p => {
        if (p.id === selectedPart.id) {
          const newQty = movement.type === "INPUT" ? p.quantity + movement.quantity : p.quantity - movement.quantity
          const newMov = {
            id: `m_${Date.now()}`,
            type: movement.type,
            quantity: movement.quantity,
            reason: movement.reason,
            createdAt: new Date().toISOString().split("T")[0]
          }
          const updated = {
            ...p,
            quantity: newQty,
            movements: [newMov, ...p.movements]
          }

          // Mantém o painel de auditoria sincronizado
          if (selectedPartForHistory?.id === p.id) {
            setSelectedPartForHistory(updated)
          }

          return updated
        }
        return p
      })
    )
    setIsMovementOpen(false)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Estoque de Peças</h2>
          <p className="text-sm text-muted-foreground">Monitore o saldo, localize peças nas gavetas e ative alertas de estoque mínimo.</p>
        </div>
        <Button variant="default" size="sm" onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Cadastrar Peça
        </Button>
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/25 border border-border p-4 rounded-lg">
        {/* Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-4 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            placeholder="Buscar por Nome, SKU ou Cód. Barras..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Alerta de Estoque Baixo */}
        <button
          onClick={() => setLowStockFilter(prev => !prev)}
          className={`flex items-center gap-2 h-9 px-4 rounded-md border text-xs font-semibold transition-colors ${
            lowStockFilter
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Apenas Baixo Estoque
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Esquerda: Catálogo de Peças (Ocupa 2 Colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20">
                      <th className="py-3 px-6 text-muted-foreground font-semibold">Peça</th>
                      <th className="py-3 px-6 text-muted-foreground font-semibold">Localização</th>
                      <th className="py-3 px-6 text-muted-foreground font-semibold font-mono text-[10px] uppercase">SKU / Cód. Barras</th>
                      <th className="py-3 px-6 text-muted-foreground font-semibold text-right">Saldo</th>
                      <th className="py-3 px-6 text-muted-foreground font-semibold text-right">Preço Venda</th>
                      <th className="py-3 px-6 text-muted-foreground font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {paginatedParts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          Nenhuma peça encontrada.
                        </td>
                      </tr>
                    ) : (
                      paginatedParts.map(part => {
                        const isLowStock = part.quantity <= part.minStock
                        return (
                          <tr
                            key={part.id}
                            className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                              selectedPartForHistory?.id === part.id ? "bg-muted/20" : ""
                            }`}
                            onClick={() => setSelectedPartForHistory(part)}
                          >
                            {/* Peça */}
                            <td className="py-3.5 px-6">
                              <span className="font-semibold text-foreground block">{part.name}</span>
                              {isLowStock && (
                                <span className="inline-flex items-center gap-1 text-[9px] text-amber-400 font-bold mt-1 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Baixo Estoque
                                </span>
                              )}
                            </td>

                            {/* Localização */}
                            <td className="py-3.5 px-6 text-muted-foreground">
                              {part.location || "Sem localização"}
                            </td>

                            {/* SKU / Barcode */}
                            <td className="py-3.5 px-6 font-mono text-muted-foreground">
                              <span className="block">{part.sku || "-"}</span>
                              {part.barcode && (
                                <span className="flex items-center gap-1 text-[9px] text-zinc-400 mt-0.5">
                                  <Barcode className="w-3 h-3" /> {part.barcode}
                                </span>
                              )}
                            </td>

                            {/* Saldo */}
                            <td className="py-3.5 px-6 text-right font-mono font-bold">
                              <span className={isLowStock ? "text-amber-400" : "text-foreground"}>
                                {part.quantity}
                              </span>
                              <span className="text-[10px] text-muted-foreground ml-1">un</span>
                            </td>

                            {/* Preço */}
                            <td className="py-3.5 px-6 text-right font-mono font-semibold text-foreground">
                              {part.salePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </td>

                            {/* Ações */}
                            <td className="py-3.5 px-6 text-right space-x-1" onClick={e => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-foreground"
                                onClick={() => handleOpenMovement(part)}
                                title="Movimentar Estoque"
                              >
                                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-foreground"
                                onClick={() => handleOpenEdit(part)}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-destructive"
                                onClick={() => handleDelete(part.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })
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
        </div>

        {/* Direita: Painel de Histórico de Movimentações da Peça (Auditoria) */}
        <div>
          {selectedPartForHistory ? (
            <Card className="border border-border">
              <CardContent className="p-5 space-y-4">
                <div className="border-b border-border/40 pb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
                    <History className="w-4 h-4" /> Audit de Movimentações
                  </h4>
                  <span className="text-sm font-bold text-foreground block truncate">{selectedPartForHistory.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">SKU: {selectedPartForHistory.sku || "Não informado"}</span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {selectedPartForHistory.movements.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-6">Sem movimentações cadastradas.</p>
                  ) : (
                    selectedPartForHistory.movements.map(mov => (
                      <div key={mov.id} className="text-xs flex items-start gap-2.5 p-2 rounded-md bg-muted/10 border border-border/20">
                        {mov.type === "INPUT" ? (
                          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className="font-semibold text-foreground">
                            {mov.type === "INPUT" ? "Entrada" : "Saída"}{" "}
                            <span className="font-mono text-[10px]">({mov.quantity} un)</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-normal italic">&quot;{mov.reason}&quot;</p>
                          <p className="text-[9px] text-zinc-500 font-mono mt-1">{new Date(mov.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-dashed border-border py-12 text-center">
              <CardContent className="text-xs text-muted-foreground">
                Selecione uma peça na tabela para auditar o histórico de movimentações.
              </CardContent>
            </Card>
          )}
        </div>

      </div>

      {/* Modais */}
      <PartDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSavePart}
        part={selectedPart}
      />

      <MovementDialog
        isOpen={isMovementOpen}
        onClose={() => setIsMovementOpen(false)}
        onSave={handleSaveMovement}
        partName={selectedPart?.name || ""}
        currentQty={selectedPart?.quantity || 0}
      />
    </div>
  )
}
