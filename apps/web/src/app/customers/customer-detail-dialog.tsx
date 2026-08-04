"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDocument, formatPhone } from "@/lib/validation"
import { X, Laptop, ShieldCheck, FileSpreadsheet, Plus, Calendar, DollarSign, Clock, FileText, ArrowRight, Shield } from "lucide-react"
import { Customer, Device, ServiceOrder } from "@/types"

interface CustomerDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onNewOS?: (customerId: string) => void
}

export function CustomerDetailDialog({ isOpen, onClose, customer, onNewOS }: CustomerDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<"devices" | "orders" | "warranties" | "timeline">("devices")

  if (!isOpen || !customer) return null

  // Mapeamento dos badges de status de OS
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READY":
      case "DELIVERED":
        return <Badge variant="success">Pronto</Badge>
      case "PENDING":
        return <Badge variant="outline">Pendente</Badge>
      case "UNDER_ANALYSIS":
      case "IN_REPAIR":
        return <Badge variant="info">Em Conserto</Badge>
      case "APPROVED":
      case "BUDGETED":
        return <Badge variant="default">Aprovado</Badge>
      case "REJECTED":
      case "CANCELLED":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Cálculos dinâmicos de resumo do cliente
  const serviceOrders = customer.serviceOrders || []
  const completedOrders = serviceOrders.filter((os: any) => os.status === "READY" || os.status === "DELIVERED")
  
  // Total Gasto
  const totalSpent = completedOrders.reduce((sum: number, os: any) => sum + (os.totalAmount || 0), 0)

  // Último Atendimento (OS mais recente)
  const lastAttendanceDate = serviceOrders.length > 0
    ? new Date(Math.max(...serviceOrders.map((os: any) => new Date(os.entryDate).getTime())))
        .toLocaleDateString("pt-BR")
    : "Nenhum atendimento"

  // Filtra as garantias ativas
  const activeWarranties = serviceOrders
    .flatMap((os: any) => os.warranties || [])
    .filter((w: any) => new Date(w.endDate).getTime() >= Date.now())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Ficha do Cliente</h3>
              <Badge variant={customer.isActive ? "success" : "secondary"}>
                {customer.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">Visão 360º de equipamentos, histórico financeiro e garantias.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informações Básicas */}
        <div className="p-6 bg-card/40 border-b border-border/30 grid grid-cols-3 gap-4 text-xs">
          <div className="col-span-1">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Nome Completo</p>
            <p className="text-xs font-bold text-foreground mt-0.5">{customer.name}</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{formatDocument(customer.document)} ({customer.documentType})</p>
          </div>
          
          <div className="col-span-1">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Contato</p>
            <p className="text-xs text-foreground mt-0.5">{formatPhone(customer.phone)}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{customer.email || "Sem e-mail"}</p>
          </div>

          <div className="col-span-1">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Endereço</p>
            <p className="text-xs text-foreground mt-0.5 truncate">{customer.address}, {customer.addressNumber || "S/N"}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{customer.bairro} - {customer.city}/{customer.state}</p>
          </div>

          {customer.birthDate && (
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Nascimento</p>
              <p className="text-xs text-foreground mt-0.5">{new Date(customer.birthDate + "T00:00:00").toLocaleDateString("pt-BR")}</p>
            </div>
          )}
          
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Data de Cadastro</p>
            <p className="text-xs text-foreground mt-0.5">{new Date(customer.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>

          {customer.notes && (
            <div className="col-span-2">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Observações</p>
              <p className="text-[10px] text-zinc-400 italic mt-0.5 leading-relaxed">&quot;{customer.notes}&quot;</p>
            </div>
          )}
        </div>

        {/* Painel Resumo Financeiro / Atendimento */}
        <div className="px-6 py-3 bg-zinc-950/20 border-b border-border/30 grid grid-cols-3 gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground font-medium">Total Gasto</p>
              <p className="text-xs font-bold text-foreground font-mono">{totalSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground font-medium">Último Atendimento</p>
              <p className="text-xs font-bold text-foreground">{lastAttendanceDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground font-medium">Garantias Ativas</p>
              <p className="text-xs font-bold text-foreground">{activeWarranties.length} vigentes</p>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex items-center justify-between px-6 border-b border-border/40 bg-zinc-950/5">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("devices")}
              className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "devices"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Aparelhos ({customer.devices?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "orders"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              OSs ({serviceOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("warranties")}
              className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "warranties"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Garantias ({activeWarranties.length})
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === "timeline"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Auditoria / Linha do Tempo
            </button>
          </div>

          {onNewOS && customer.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNewOS(customer.id)}
              className="h-7 gap-1 text-[10px] uppercase font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova OS
            </Button>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[220px] max-h-[350px]">
          {activeTab === "devices" && (
            <div className="space-y-3">
              {(customer.devices || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Laptop className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhum equipamento cadastrado para este cliente.</p>
                </div>
              ) : (
                (customer.devices || []).map((dev: any) => (
                  <div
                    key={dev.id}
                    className="p-3 border border-border/60 rounded-md bg-card/25 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground">
                        {dev.brandName} - {dev.modelName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        N/S ou IMEI: {dev.serialNumber}
                      </p>
                    </div>
                    {dev.category && <Badge variant="outline">{dev.category}</Badge>}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-3">
              {serviceOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FileSpreadsheet className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhuma ordem de serviço no histórico.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border/40 rounded-md">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="py-2 px-3 font-mono text-[9px] text-muted-foreground uppercase">OS</th>
                        <th className="py-2 px-3 text-muted-foreground">Defeito Relatado</th>
                        <th className="py-2 px-3 text-muted-foreground">Status</th>
                        <th className="py-2 px-3 text-muted-foreground text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {serviceOrders.map((os: any) => (
                        <tr key={os.id} className="hover:bg-muted/5 transition-colors">
                          <td className="py-2 px-3 font-mono font-semibold text-foreground">#{os.number}</td>
                          <td className="py-2 px-3 text-muted-foreground truncate max-w-[200px]">
                            {os.reportedDefect}
                          </td>
                          <td className="py-2 px-3">{getStatusBadge(os.status)}</td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-foreground">
                            {os.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "warranties" && (
            <div className="space-y-3">
              {activeWarranties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Shield className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhuma garantia ativa vigente neste momento.</p>
                </div>
              ) : (
                activeWarranties.map((w: any) => (
                  <div
                    key={w.id}
                    className="p-3 bg-emerald-950/10 border border-emerald-800/30 rounded-md flex items-center justify-between text-xs text-emerald-400"
                  >
                    <div>
                      <p className="font-semibold">Garantia Vigente: {w.termDays} dias</p>
                      <p className="text-[10px] text-emerald-500 font-mono mt-0.5">Expira em: {new Date(w.endDate).toLocaleDateString("pt-BR")}</p>
                      {w.conditions && <p className="text-[10px] text-emerald-600 mt-1 italic">&quot;{w.conditions}&quot;</p>}
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="relative pl-6 border-l border-border/60 ml-2 space-y-4">
              {(!customer.history || customer.history.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-10 text-center -ml-8">
                  <FileText className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhum registro de auditoria disponível.</p>
                </div>
              ) : (
                customer.history.map((log: any) => (
                  <div key={log.id} className="relative text-xs">
                    <span className="absolute -left-[28px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-card flex items-center justify-center"></span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{log.action}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {new Date(log.date).toLocaleDateString("pt-BR")} {new Date(log.date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Operador: {log.user}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-border/40 bg-card/25">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar Painel
          </Button>
        </div>
      </div>
    </div>
  )
}
