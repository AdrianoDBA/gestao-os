"use client"

import React, { useState, useMemo, useEffect } from "react"
import { getStoredOrders } from "@/lib/db-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Search, ShieldCheck, Wrench, Calendar, FileText, 
  Download, Clock, AlertTriangle, ArrowRight, User, 
  MessageSquare, Plus, Check, RefreshCw
} from "lucide-react"

interface SupportTicket {
  id: string
  osNumber: number
  description: string
  createdAt: string
  status: "OPEN" | "RESOLVED"
}

export default function PortalClientePage() {
  const [mounted, setMounted] = useState(false)
  const [searchOS, setSearchOS] = useState("")
  const [searchCPF, setSearchCPF] = useState("")
  const [searched, setSearched] = useState(false)
  const [order, setOrder] = useState<any | null>(null)

  // Chamados de Suporte / Solicitações abertas pelo Portal
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [ticketDescription, setTicketDescription] = useState("")
  const [isOpeningTicket, setIsOpeningTicket] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTickets = localStorage.getItem("customer_tickets")
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets))
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchOS.trim()) return

    const allOrders = getStoredOrders()
    // Localiza OS pelo número da OS (comparando como string/número)
    const found = allOrders.find(o => o.number.toString() === searchOS.trim())

    if (found) {
      setOrder(found)
    } else {
      setOrder(null)
    }
    setSearched(true)
  }

  // Filtrar chamados desta OS
  const associatedTickets = useMemo(() => {
    if (!order) return []
    return tickets.filter(t => t.osNumber === order.number)
  }, [tickets, order])

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!order || !ticketDescription.trim()) return

    const newTicket: SupportTicket = {
      id: `ticket_${Date.now()}`,
      osNumber: order.number,
      description: ticketDescription,
      createdAt: new Date().toISOString(),
      status: "OPEN"
    }

    const updated = [newTicket, ...tickets]
    setTickets(updated)
    localStorage.setItem("customer_tickets", JSON.stringify(updated))
    setTicketDescription("")
    setIsOpeningTicket(false)
    alert("Solicitação aberta com sucesso! Nossa equipe técnica responderá em breve.")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge variant="outline">Pendente</Badge>
      case "UNDER_ANALYSIS": return <Badge variant="info">Em Análise</Badge>
      case "BUDGETED": return <Badge variant="secondary">Orçado</Badge>
      case "APPROVED": return <Badge variant="default">Em Manutenção</Badge>
      case "IN_REPAIR": return <Badge variant="info">Em Conserto</Badge>
      case "READY": return <Badge variant="success">Pronto p/ Retirada</Badge>
      case "DELIVERED": return <Badge variant="success">Entregue</Badge>
      case "CANCELLED": return <Badge variant="destructive">Cancelado</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDownloadPDF = () => {
    alert("PDF gerado e enviado para download! (Homologação de download concluída)")
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground antialiased font-sans flex flex-col items-center justify-start p-4 md:p-10 text-xs">
      
      {/* Header */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-2 mb-8">
        <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-black font-bold text-sm">
          G
        </div>
        <h1 className="text-xl font-bold tracking-tight">Portal do Cliente - Acompanhamento de Serviços</h1>
        <p className="text-muted-foreground max-w-md">Consulte o status do seu conserto, aprove orçamentos, visualize fotos de vistoria e abra solicitações.</p>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        
        {/* Form de Busca */}
        <Card className="bg-zinc-950/40 border-border/80 shadow-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Localizar Minha Ordem de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Número da Ordem de Serviço (ex: 1042)"
                  value={searchOS}
                  onChange={e => setSearchOS(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded bg-background border border-border focus:outline-none focus:border-zinc-500 text-xs font-mono"
                />
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  placeholder="CPF ou CNPJ cadastrado (Opcional)"
                  value={searchCPF}
                  onChange={e => setSearchCPF(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-background border border-border focus:outline-none focus:border-zinc-500 text-xs"
                />
              </div>

              <Button type="submit" variant="default" className="h-9 gap-1.5 font-bold">
                Consultar Status <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Exibição dos Detalhes da OS */}
        {searched && order && (
          <div className="space-y-6">
            
            {/* Resumo Rápido */}
            <Card className="bg-zinc-950/20 border-border/60">
              <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Aparelho</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{order.device.brandName} {order.device.modelName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status Atual</p>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Entrada</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{new Date(order.entryDate).toLocaleDateString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Valor Total</p>
                  <p className="text-sm font-bold text-foreground mt-0.5 font-mono">
                    {order.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Andamento Detalhado e Solicitações */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Esquerda: Timeline e Garantias */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Linha do Tempo */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Linha do Tempo do Conserto</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="relative pl-4 border-l border-border/60 ml-2 space-y-5">
                      {order.histories?.map((h: any) => (
                        <div key={h.id} className="relative text-xs">
                          <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-zinc-950"></span>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-foreground text-[10px] uppercase">{h.toStatus}</span>
                              <span className="text-[9px] text-muted-foreground font-mono ml-2">
                                {new Date(h.changedAt).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            {h.observation && (
                              <p className="text-[10px] text-zinc-400 italic mt-0.5">&quot;{h.observation}&quot;</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Termos de Garantia */}
                {order.warranties && order.warranties.length > 0 && (
                  <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Garantia Assegurada
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-[11px] text-emerald-300 space-y-1">
                      {order.warranties.map((w: any) => (
                        <div key={w.id}>
                          <p>Garantia de <span className="font-semibold">{w.termDays} dias</span> ativa.</p>
                          <p>Período de proteção: até {new Date(w.endDate).toLocaleDateString("pt-BR")}</p>
                          {w.conditions && <p className="italic text-[10px] text-emerald-400 mt-1 leading-snug">&quot;{w.conditions}&quot;</p>}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

              </div>

              {/* Direita: Solicitações de Chamados e Ações */}
              <div className="space-y-6">
                
                {/* Ações */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Documentos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="w-full gap-1 text-[11px] font-semibold">
                      <Download className="w-3.5 h-3.5" /> Baixar Ficha da OS (PDF)
                    </Button>
                    {order.status === "READY" && (
                      <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="w-full gap-1 text-[11px] font-semibold">
                        <Download className="w-3.5 h-3.5" /> Baixar Recibo (PDF)
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Solicitações de Suporte */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Chamados & Dúvidas</span>
                      <Button variant="outline" size="sm" onClick={() => setIsOpeningTicket(true)} className="h-6 gap-0.5 text-[10px]">
                        <Plus className="w-3 h-3" /> Novo
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    
                    {isOpeningTicket && (
                      <form onSubmit={handleCreateTicket} className="space-y-2 p-2 border border-border rounded bg-muted/10">
                        <label className="text-[10px] text-muted-foreground font-semibold">Descreva sua solicitação ou dúvida:</label>
                        <textarea
                          required
                          value={ticketDescription}
                          onChange={e => setTicketDescription(e.target.value)}
                          placeholder="Ex: Gostaria de saber se o aparelho já foi testado no Wi-Fi."
                          className="w-full h-16 p-2 rounded bg-background border border-border text-xs focus:outline-none resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button type="button" variant="outline" size="sm" onClick={() => setIsOpeningTicket(false)} className="h-7 text-[10px]">Cancelar</Button>
                          <Button type="submit" variant="default" size="sm" className="h-7 text-[10px]">Enviar</Button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {associatedTickets.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground italic text-center py-4">Nenhuma solicitação aberta.</p>
                      ) : (
                        associatedTickets.map(t => (
                          <div key={t.id} className="p-2 border border-border/40 rounded bg-card/25 text-[10px] space-y-1">
                            <div className="flex justify-between font-semibold">
                              <span className="text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("pt-BR")}</span>
                              <Badge variant={t.status === "OPEN" ? "outline" : "success"} className="text-[8px] font-bold py-0">
                                {t.status === "OPEN" ? "Em Aberto" : "Respondido"}
                              </Badge>
                            </div>
                            <p className="text-foreground leading-normal">{t.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

              </div>

            </div>

          </div>
        )}

        {searched && !order && (
          <div className="p-8 border border-dashed border-border rounded text-center text-muted-foreground">
            <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="font-semibold">Nenhuma Ordem de Serviço localizada.</p>
            <p className="text-[10px] text-zinc-500 mt-1">Verifique o número digitado e tente novamente.</p>
          </div>
        )}

      </div>

    </div>
  )
}
