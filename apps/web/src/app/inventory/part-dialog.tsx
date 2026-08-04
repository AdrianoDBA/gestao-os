"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export interface PartData {
  id?: string
  name: string
  sku?: string
  barcode?: string
  description?: string
  costPrice: number
  salePrice: number
  minStock: number
  location?: string
  initialQty?: number
}

interface PartDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: PartData) => void
  part?: PartData | null
}

export function PartDialog({ isOpen, onClose, onSave, part }: PartDialogProps) {
  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [description, setDescription] = useState("")
  const [costPrice, setCostPrice] = useState(0)
  const [salePrice, setSalePrice] = useState(0)
  const [minStock, setMinStock] = useState(0)
  const [location, setLocation] = useState("")
  const [initialQty, setInitialQty] = useState(0)

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (part) {
      setName(part.name)
      setSku(part.sku || "")
      setBarcode(part.barcode || "")
      setDescription(part.description || "")
      setCostPrice(part.costPrice)
      setSalePrice(part.salePrice)
      setMinStock(part.minStock)
      setLocation(part.location || "")
      setInitialQty(0)
    } else {
      setName("")
      setSku("")
      setBarcode("")
      setDescription("")
      setCostPrice(0)
      setSalePrice(0)
      setMinStock(2) // Padrão
      setLocation("")
      setInitialQty(0)
    }
    setErrors({})
  }, [part, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}

    if (!name.trim()) newErrors.name = "Nome da peça é obrigatório"
    if (costPrice <= 0) newErrors.costPrice = "Preço de custo deve ser maior que zero"
    if (salePrice <= 0) newErrors.salePrice = "Preço de venda deve ser maior que zero"
    if (salePrice < costPrice) newErrors.salePrice = "Preço de venda deve cobrir o custo"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      id: part?.id,
      name,
      sku,
      barcode,
      description,
      costPrice,
      salePrice,
      minStock,
      location,
      initialQty
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Container */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h3 className="text-base font-semibold text-foreground">
            {part ? "Editar Informações da Peça" : "Cadastrar Nova Peça no Estoque"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Nome da Peça */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nome da Peça / Produto</label>
            <input
              type="text"
              className={`w-full h-9 px-3 rounded-md bg-background border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors ${
                errors.name ? "border-destructive/60" : "border-border"
              }`}
              placeholder="Ex: Conector de Carga iPhone 13, Bateria S23 Ultra"
              value={name}
              onChange={e => {
                setName(e.target.value)
                if (errors.name) setErrors(prev => ({ ...prev, name: "" }))
              }}
            />
            {errors.name && <p className="text-[10px] text-destructive font-medium">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">SKU (Código Interno)</label>
              <input
                type="text"
                className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                placeholder="Ex: SKU-CON-IP13"
                value={sku}
                onChange={e => setSku(e.target.value)}
              />
            </div>

            {/* Código de Barras */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Código de Barras (EAN)</label>
              <input
                type="text"
                className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                placeholder="Ex: 7891234567890"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Descrição Opcional</label>
            <textarea
              className="w-full h-16 px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none"
              placeholder="Compatibilidades ou especificações técnicas adicionais..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Preço de Custo */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Preço de Custo (R$)</label>
              <input
                type="number"
                step="0.01"
                className={`w-full h-9 px-3 rounded-md bg-background border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors ${
                  errors.costPrice ? "border-destructive/60" : "border-border"
                }`}
                placeholder="0.00"
                value={costPrice || ""}
                onChange={e => {
                  setCostPrice(parseFloat(e.target.value) || 0)
                  if (errors.costPrice) setErrors(prev => ({ ...prev, costPrice: "" }))
                }}
              />
              {errors.costPrice && <p className="text-[10px] text-destructive font-medium">{errors.costPrice}</p>}
            </div>

            {/* Preço de Venda */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Preço de Venda (R$)</label>
              <input
                type="number"
                step="0.01"
                className={`w-full h-9 px-3 rounded-md bg-background border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors ${
                  errors.salePrice ? "border-destructive/60" : "border-border"
                }`}
                placeholder="0.00"
                value={salePrice || ""}
                onChange={e => {
                  setSalePrice(parseFloat(e.target.value) || 0)
                  if (errors.salePrice) setErrors(prev => ({ ...prev, salePrice: "" }))
                }}
              />
              {errors.salePrice && <p className="text-[10px] text-destructive font-medium">{errors.salePrice}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Localização */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Localização Física</label>
              <input
                type="text"
                className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                placeholder="Ex: Gaveteiro A-2, Prateleira C"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>

            {/* Estoque Mínimo */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Estoque Mínimo (Alerta)</label>
              <input
                type="number"
                className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                value={minStock}
                onChange={e => setMinStock(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Saldo Inicial (Apenas na criação) */}
          {!part && (
            <div className="space-y-1.5 p-3.5 rounded-md border border-dashed border-border bg-muted/10">
              <label className="text-xs font-semibold text-foreground">Saldo de Estoque Inicial</label>
              <p className="text-[10px] text-muted-foreground mt-0.5 mb-2 leading-relaxed">
                Informe a quantidade física atual da peça para lançamento automático do estoque de check-in.
              </p>
              <input
                type="number"
                className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                value={initialQty || ""}
                placeholder="0"
                onChange={e => setInitialQty(parseInt(e.target.value) || 0)}
              />
            </div>
          )}

        </form>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 bg-card/25">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="default" size="sm" onClick={handleSubmit}>
            {part ? "Salvar Alterações" : "Adicionar Peça"}
          </Button>
        </div>
      </div>
    </div>
  )
}
