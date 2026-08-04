"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface MovementDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { type: "INPUT" | "OUTPUT"; quantity: number; reason: string }) => void
  partName: string
  currentQty: number
}

export function MovementDialog({ isOpen, onClose, onSave, partName, currentQty }: MovementDialogProps) {
  const [type, setType] = useState<"INPUT" | "OUTPUT">("INPUT")
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState("")

  const [error, setError] = useState("")

  useEffect(() => {
    setType("INPUT")
    setQuantity(1)
    setReason("")
    setError("")
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (quantity <= 0) {
      setError("A quantidade deve ser maior que zero")
      return
    }

    if (type === "OUTPUT" && quantity > currentQty) {
      setError(`Estoque insuficiente. Saldo atual: ${currentQty}`)
      return
    }

    if (!reason.trim()) {
      setError("Informe o motivo/justificativa da movimentação")
      return
    }

    onSave({ type, quantity, reason })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Container */}
      <div className="relative w-full max-w-sm bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Ajuste Manual de Estoque</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[280px]">Peça: {partName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Tipo de Movimentação */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground">Tipo de Movimentação</label>
            <div className="grid grid-cols-2 gap-2 p-0.5 rounded border border-border bg-background">
              <button
                type="button"
                className={`py-1 rounded font-semibold text-center transition-colors ${
                  type === "INPUT" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setType("INPUT")}
              >
                Entrada (Compra)
              </button>
              <button
                type="button"
                className={`py-1 rounded font-semibold text-center transition-colors ${
                  type === "OUTPUT" ? "bg-destructive/10 text-destructive border border-destructive/25" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setType("OUTPUT")}
              >
                Saída (Dano/Ajuste)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantidade */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Quantidade</label>
              <input
                type="number"
                className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Saldo Atual */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-semibold text-muted-foreground">Saldo Atual</label>
              <div className="w-full h-9 px-3 rounded-md border border-border/40 bg-muted/10 flex items-center text-sm font-semibold font-mono text-foreground select-none">
                {currentQty} unidades
              </div>
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground">Motivo / Justificativa</label>
            <input
              type="text"
              className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              placeholder="Ex: Compra de lote, Peça trincada na montagem"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          {error && <p className="text-[10px] text-destructive font-semibold text-center bg-destructive/10 border border-destructive/20 p-2 rounded">{error}</p>}

        </form>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 bg-card/25 text-xs">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="default" size="sm" onClick={handleSubmit}>
            Lançar Movimentação
          </Button>
        </div>
      </div>
    </div>
  )
}
