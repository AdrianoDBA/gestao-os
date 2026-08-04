"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Calculator, Info } from "lucide-react"
import { getStoredFinanceCategories, getStoredPaymentMethods, getStoredCustomers } from "@/lib/db-store"
import { Transaction } from "@/types"

export interface TransactionFormData {
  id?: string
  description: string
  type: "REVENUE" | "EXPENSE"
  amount: number
  discount?: number
  interest?: number
  fine?: number
  dueDate: string
  entityName: string
  isPaid: boolean
  paymentMethod?: string
  notes?: string
  category: string
  origin?: "OS" | "SALE" | "OTHER"
  originId?: string
  installmentsCount?: number
  entryValue?: number
}

interface TransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: TransactionFormData) => void
  transaction?: Transaction | null
  type?: "REVENUE" | "EXPENSE"
}

export function TransactionDialog({ isOpen, onClose, onSave, transaction, type: forceType }: TransactionDialogProps) {
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"REVENUE" | "EXPENSE">("REVENUE")
  const [amount, setAmount] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [interest, setInterest] = useState(0)
  const [fine, setFine] = useState(0)
  const [dueDate, setDueDate] = useState("")
  const [entityName, setEntityName] = useState("")
  const [isPaid, setIsPaid] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [category, setCategory] = useState("")
  const [notes, setNotes] = useState("")
  const [origin, setOrigin] = useState<"OS" | "SALE" | "OTHER">("OTHER")
  const [originId, setOriginId] = useState("")

  // Parcelamento
  const [installmentsCount, setInstallmentsCount] = useState(1)
  const [entryValue, setEntryValue] = useState(0)

  const [categories, setCategories] = useState<string[]>([])
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (isOpen) {
      setCategories(getStoredFinanceCategories())
      setPaymentMethods(getStoredPaymentMethods())
      setCustomers(getStoredCustomers())
    }
  }, [isOpen])

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description)
      setType(transaction.type)
      setAmount(transaction.amount)
      setDiscount(transaction.discount || 0)
      setInterest(transaction.interest || 0)
      setFine(transaction.fine || 0)
      setDueDate(transaction.dueDate)
      setEntityName(transaction.entityName)
      setIsPaid(transaction.isPaid)
      setPaymentMethod(transaction.paymentMethod || "")
      setCategory(transaction.category || "")
      setNotes(transaction.notes || "")
      setOrigin(transaction.origin || "OTHER")
      setOriginId(transaction.originId || "")
      setInstallmentsCount(1)
      setEntryValue(0)
    } else {
      setDescription("")
      setType(forceType || "REVENUE")
      setAmount(0)
      setDiscount(0)
      setInterest(0)
      setFine(0)
      setDueDate(new Date().toISOString().split("T")[0])
      setEntityName("")
      setIsPaid(false)
      setPaymentMethod("")
      setCategory("")
      setNotes("")
      setOrigin("OTHER")
      setOriginId("")
      setInstallmentsCount(1)
      setEntryValue(0)
    }
    setErrors({})
  }, [transaction, isOpen, forceType])

  // Valor Líquido Calculado
  const netAmount = amount - discount + interest + fine

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}

    if (!description.trim()) newErrors.description = "Descrição é obrigatória"
    if (amount <= 0) newErrors.amount = "O valor deve ser maior que zero"
    if (!dueDate) newErrors.dueDate = "Data de vencimento é obrigatória"
    if (!entityName.trim()) newErrors.entityName = type === "REVENUE" ? "Cliente é obrigatório" : "Fornecedor é obrigatório"
    if (!category) newErrors.category = "Categoria financeira é obrigatória"
    if (isPaid && !paymentMethod) newErrors.paymentMethod = "Selecione a forma de pagamento"
    if (installmentsCount > 1 && entryValue >= amount) {
      newErrors.entryValue = "Valor da entrada deve ser menor que o valor total"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      id: transaction?.id,
      description,
      type,
      amount,
      discount,
      interest,
      fine,
      dueDate,
      entityName,
      isPaid,
      paymentMethod: isPaid ? paymentMethod : undefined,
      category,
      notes,
      origin,
      originId: originId || undefined,
      installmentsCount: installmentsCount > 1 ? installmentsCount : undefined,
      entryValue: entryValue > 0 ? entryValue : undefined
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {transaction ? "Editar Lançamento" : `Registrar Novo(a) ${type === "REVENUE" ? "Conta a Receber" : "Conta a Pagar"}`}
            </h3>
            <p className="text-[10px] text-muted-foreground">Preencha os dados e gerencie descontos, juros e parcelamento.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário com Rolagem */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[500px]">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Tipo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Tipo de Lançamento</label>
              <select
                value={type}
                onChange={e => {
                  setType(e.target.value as any)
                  setEntityName("")
                }}
                disabled={!!transaction || !!forceType}
                className="w-full h-8 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="REVENUE">Receita (Contas a Receber)</option>
                <option value="EXPENSE">Despesa (Contas a Pagar)</option>
              </select>
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Categoria Financeira</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={`w-full h-8 px-2 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                  errors.category ? "border-destructive/60" : "border-border"
                }`}
              >
                <option value="">Selecione...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-[9px] text-destructive font-semibold">{errors.category}</p>}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Pagamento mensal de Internet, Faturamento de Peças"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                errors.description ? "border-destructive/60" : "border-border"
              }`}
            />
            {errors.description && <p className="text-[9px] text-destructive font-semibold">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cliente ou Fornecedor */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {type === "REVENUE" ? "Cliente (Destinatário)" : "Fornecedor / Credor"}
              </label>
              {type === "REVENUE" ? (
                <select
                  value={entityName}
                  onChange={e => setEntityName(e.target.value)}
                  className={`w-full h-8 px-2 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                    errors.entityName ? "border-destructive/60" : "border-border"
                  }`}
                >
                  <option value="">Selecione um cliente...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  <option value="Outros / Consumidor Final">Outros / Consumidor Final</option>
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Ex: Fornecedor de Peças SA"
                  value={entityName}
                  onChange={e => setEntityName(e.target.value)}
                  className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                    errors.entityName ? "border-destructive/60" : "border-border"
                  }`}
                />
              )}
              {errors.entityName && <p className="text-[9px] text-destructive font-semibold">{errors.entityName}</p>}
            </div>

            {/* Origem */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Origem do Lançamento</label>
              <div className="flex gap-2">
                <select
                  value={origin}
                  onChange={e => setOrigin(e.target.value as any)}
                  className="w-1/2 h-8 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="OTHER">Outros</option>
                  <option value="OS">Ordem Serviço</option>
                  <option value="SALE">Venda</option>
                </select>
                <input
                  type="text"
                  placeholder="Código/ID"
                  value={originId}
                  onChange={e => setOriginId(e.target.value)}
                  disabled={origin === "OTHER"}
                  className="w-1/2 h-8 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Valor */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Valor Base (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount || ""}
                onChange={e => setAmount(Number(e.target.value))}
                className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                  errors.amount ? "border-destructive/60" : "border-border"
                }`}
              />
              {errors.amount && <p className="text-[9px] text-destructive font-semibold">{errors.amount}</p>}
            </div>

            {/* Vencimento */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Vencimento</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                  errors.dueDate ? "border-destructive/60" : "border-border"
                }`}
              />
              {errors.dueDate && <p className="text-[9px] text-destructive font-semibold">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Acréscimos e Descontos */}
          <div className="bg-zinc-950/20 border border-border/30 p-3 rounded-md space-y-3">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-zinc-400" />
              Ajustes Financeiros (Descontos & Encargos)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Desconto (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={discount || ""}
                  onChange={e => setDiscount(Number(e.target.value))}
                  className="w-full h-7 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Juros (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={interest || ""}
                  onChange={e => setInterest(Number(e.target.value))}
                  className="w-full h-7 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground">Multa (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fine || ""}
                  onChange={e => setFine(Number(e.target.value))}
                  className="w-full h-7 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
            
            <div className="border-t border-border/30 pt-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Valor Líquido:</span>
              <span className="font-mono font-bold text-foreground">
                {netAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>

          {/* Situação e Pagamento */}
          <div className="border border-border/40 p-3 rounded-md space-y-3 bg-muted/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">Este lançamento já foi liquidado (Pago/Recebido)?</label>
              <input
                type="checkbox"
                checked={isPaid}
                onChange={e => setIsPaid(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background cursor-pointer focus:ring-0"
              />
            </div>

            {isPaid && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={e => {
                    setPaymentMethod(e.target.value)
                    if (errors.paymentMethod) setErrors(prev => ({ ...prev, paymentMethod: "" }))
                  }}
                  className={`w-full h-8 px-2 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                    errors.paymentMethod ? "border-destructive/60" : "border-border"
                  }`}
                >
                  <option value="">Selecione...</option>
                  {paymentMethods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.paymentMethod && <p className="text-[9px] text-destructive font-semibold">{errors.paymentMethod}</p>}
              </div>
            )}
          </div>

          {/* Se não for liquidado, permitir parcelamento */}
          {!isPaid && !transaction && (
            <div className="bg-zinc-950/20 border border-border/30 p-3 rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">Deseja parcelar este lançamento?</label>
                <select
                  value={installmentsCount}
                  onChange={e => setInstallmentsCount(Number(e.target.value))}
                  className="h-7 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 10, 12, 24].map(n => (
                    <option key={n} value={n}>{n === 1 ? "À vista (Sem parcelar)" : `${n}x`}</option>
                  ))}
                </select>
              </div>

              {installmentsCount > 1 && (
                <div className="grid grid-cols-2 gap-3 text-xs border-t border-border/20 pt-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">Valor de Entrada (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={entryValue || ""}
                      onChange={e => setEntryValue(Number(e.target.value))}
                      className="w-full h-7 px-2 rounded bg-background border border-border focus:outline-none"
                    />
                    {errors.entryValue && <p className="text-[9px] text-destructive font-semibold">{errors.entryValue}</p>}
                  </div>
                  <div className="space-y-1 flex flex-col justify-end text-right">
                    <span className="text-[10px] text-muted-foreground">Parcelas Restantes:</span>
                    <span className="font-mono font-bold text-foreground">
                      {installmentsCount - 1}x de {((netAmount - entryValue) / (installmentsCount - 1)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Observações / Detalhes</label>
            <textarea
              placeholder="Descreva observações importantes sobre este vencimento ou forma acordada..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full h-16 p-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none resize-none"
            />
          </div>

        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 bg-card/25">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="default" size="sm" onClick={handleSubmit}>
            {transaction ? "Salvar Alterações" : "Salvar Lançamento"}
          </Button>
        </div>
      </div>
    </div>
  )
}
