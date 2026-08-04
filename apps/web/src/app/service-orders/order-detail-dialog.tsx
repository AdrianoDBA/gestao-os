"use client"

import React, { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AttachmentGallery } from "./attachment-gallery"
import { 
  X, 
  Wrench, 
  User, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Sparkles,
  Scan,
  ShieldCheck,
  Lock
} from "lucide-react"
import { AIService, AIDiagnosisResult, AIOCRResult } from "@/lib/ai-service"
import { getStoredBlockchainLogs, saveStoredBlockchainLogs, getStoredInventory, getStoredCustomers } from "@/lib/db-store"
import { sendWhatsAppMessage } from "@/lib/whatsapp-service"

interface AssociatedPart {
  id: string
  quantity: number
  priceCharged: number
  partId?: string
  part: { name: string }
}

interface AssociatedService {
  id: string
  description: string
  amount: number
}

interface OSDetail {
  id: string
  number: number
  customerId?: string
  status: "PENDING" | "UNDER_ANALYSIS" | "BUDGETED" | "APPROVED" | "REJECTED" | "IN_REPAIR" | "READY" | "DELIVERED" | "CANCELLED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  reportedDefect: string
  accessories?: string
  checklist?: Record<string, any>
  laborAmount: number
  partsAmount: number
  totalAmount: number
  notes?: string
  entryDate: string
  exitDate?: string | null
  customer: { name: string; document?: string; phone?: string }
  device: { brandName: string; modelName: string; serialNumber: string; password?: string; color?: string; physicalState?: string }
  technician?: { name: string } | null
  diagnostics: {
    id: string
    technicalReport: string
    solutionProposed?: string | null
    isApproved?: boolean | null
    createdAt: string
  }[]
  histories: {
    id: string
    fromStatus: string
    toStatus: string
    changedAt: string
    user: { name: string }
    observation?: string
  }[]
  warranties: {
    id: string
    termDays: number
    startDate: string
    endDate: string
    conditions?: string
  }[]
  partsUsed: AssociatedPart[]
  servicesUsed: AssociatedService[]
  attachments?: any[]
}

interface OrderDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  order: OSDetail | null
  onChangeStatus?: (orderId: string, newStatus: OSDetail["status"]) => void
  onSaveBudget?: (orderId: string, technicalReport: string, laborAmount: number, partsAmount: number, partsUsed?: any[]) => void
  onUpdateAttachments?: (orderId: string, attachments: any[]) => void
}

export function OrderDetailDialog({ isOpen, onClose, order, onChangeStatus, onSaveBudget, onUpdateAttachments }: OrderDetailDialogProps) {
  const [attachments, setAttachments] = useState<any[]>([])

  const customerPhone = React.useMemo(() => {
    if (!order) return ""
    if (typeof window === "undefined") return ""
    const allCusts = getStoredCustomers()
    const found = allCusts.find((c: any) => c.id === order.customerId || c.name === order.customer.name)
    return found?.phone || order.customer.phone || ""
  }, [order])

  const [techReport, setTechReport] = useState("")
  const [laborVal, setLaborVal] = useState(0)
  const [partsVal, setPartsVal] = useState(0)

  const [aiResult, setAiResult] = useState<AIDiagnosisResult | null>(null)
  const [isAnalyzingIA, setIsAnalyzingIA] = useState(false)
  const [ocrResult, setOcrResult] = useState<AIOCRResult | null>(null)
  const [isScanningOCR, setIsScanningOCR] = useState(false)

  const [blockchainLog, setBlockchainLog] = useState<any | null>(null)
  const [verificationResult, setVerificationResult] = useState<string | null>(null)

  // Estados de Estoque / Inventário de Peças para Orçamento
  const [inventory, setInventory] = useState<any[]>([])
  const [selectedParts, setSelectedParts] = useState<{ partId: string; name: string; quantity: number; salePrice: number }[]>([])
  const [currentSelectedPartId, setCurrentSelectedPartId] = useState("")
  const [currentSelectedPartQty, setCurrentSelectedPartQty] = useState(1)

  const handleAnchorOS = () => {
    if (!order) return
    const dummyHash = "sha256_" + Math.random().toString(36).substring(2, 15)
    const dummyTx = "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 10)
    
    const newLog = {
      id: `blog_${Date.now()}`,
      entityName: "ServiceOrder",
      entityId: order.id,
      dataHash: dummyHash,
      blockchainTx: dummyTx,
      createdAt: new Date().toISOString()
    }

    const logs = getStoredBlockchainLogs()
    saveStoredBlockchainLogs([newLog, ...logs])
    setBlockchainLog(newLog)
    alert(`OS #${order.number} ancorada com sucesso na Blockchain L2!\nTxHash: ${dummyTx}`)
  }

  const handleVerifyIntegrity = () => {
    if (!blockchainLog) return
    setVerificationResult("SUCCESS")
  }

  const handleRunAI = async () => {
    if (!order) return
    setIsAnalyzingIA(true)
    try {
      const res = await AIService.generateDiagnosis(
        order.device.brandName,
        order.device.modelName,
        order.reportedDefect
      )
      setAiResult(res)
    } catch (e) {
      console.error(e)
    } finally {
      setIsAnalyzingIA(false)
    }
  }

  const handleRunOCR = async () => {
    setIsScanningOCR(true)
    try {
      const dummyFile = new File(["dummy"], `${order?.device.brandName.toLowerCase()}_label.jpg`)
      const res = await AIService.performOCR(dummyFile)
      setOcrResult(res)
    } catch (e) {
      console.error(e)
    } finally {
      setIsScanningOCR(false)
    }
  }

  useEffect(() => {
    if (order) {
      const defaultAttachments = [
        { id: "att1", name: "frontal_tela_quebrada.jpg", mimeType: "image/jpeg", size: 245000, isPhoto: true, url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=200&auto=format&fit=crop" },
        { id: "att2", name: "laudo_recebimento_assinado.pdf", mimeType: "application/pdf", size: 1048, isPhoto: false, url: "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9Db250ZW50cyA0IDAgUgogID4+CmVuZG9iago0IDAgb2JqCiAgPDwgL0xlbmd0aCA2MCA+PgpzdHJlYW0KQlQKICAvRjEgMjQgVGYKICA3MCA3MDAgVGQKICAoTGF1ZG8gVGVjbmljbyBkZSBSZWNlYmltZW50bykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OSAwMDAwMCBuIAowMDAwMDAwMTIyIDAwMDAwIGYgCjAwMDAwMDAyMTkgMDAwMDAgbiAKdHJhaWxlcgogIDw8IC9TaXplIDUKICAgICAvUm9vdCAxIDAgUgogID4+CnN0YXJ0eHJlZgogIDI4OAolJUVPRg==" }
      ]
      setAttachments(order.attachments && order.attachments.length > 0 ? order.attachments : defaultAttachments)
      setTechReport(order.diagnostics?.[0]?.technicalReport || "")
      setLaborVal(order.laborAmount || 0)
      setPartsVal(order.partsAmount || 0)
      setAiResult(null)
      setOcrResult(null)

      // Busca logs de blockchain para a OS aberta
      const logs = getStoredBlockchainLogs()
      const found = logs.find((l: any) => l.entityName === "ServiceOrder" && l.entityId === order.id)
      setBlockchainLog(found || null)
      setVerificationResult(null)

      // Carrega o inventário real
      const inv = getStoredInventory()
      setInventory(inv)

      // Carrega as peças já usadas na OS
      if (order.partsUsed && order.partsUsed.length > 0) {
        setSelectedParts(order.partsUsed.map((pu: any) => ({
          partId: pu.partId || pu.id,
          name: pu.part?.name || pu.name,
          quantity: pu.quantity,
          salePrice: pu.priceCharged || 0
        })))
      } else {
        setSelectedParts([])
      }
      setCurrentSelectedPartId("")
      setCurrentSelectedPartQty(1)
    }
  }, [order, isOpen])

  // Recalcula o partsVal reativamente com base nas peças selecionadas
  useEffect(() => {
    const total = selectedParts.reduce((sum, p) => sum + (p.quantity * p.salePrice), 0)
    setPartsVal(total)
  }, [selectedParts])

  const handleAddPart = () => {
    if (!currentSelectedPartId) return
    const part = inventory.find(p => p.id === currentSelectedPartId)
    if (!part) return

    // Adiciona ou incrementa no array local de peças usadas no orçamento
    const existingIndex = selectedParts.findIndex(sp => sp.partId === part.id)
    if (existingIndex > -1) {
      setSelectedParts(prev =>
        prev.map((sp, idx) =>
          idx === existingIndex
            ? { ...sp, quantity: sp.quantity + currentSelectedPartQty }
            : sp
        )
      )
    } else {
      setSelectedParts(prev => [
        ...prev,
        {
          partId: part.id,
          name: part.name,
          quantity: currentSelectedPartQty,
          salePrice: part.salePrice
        }
      ])
    }
    setCurrentSelectedPartId("")
    setCurrentSelectedPartQty(1)
  }

  const handleRemovePart = (partId: string) => {
    setSelectedParts(prev => prev.filter(sp => sp.partId !== partId))
  }

  const handleUploadAttachment = (fileData: any) => {
    const newAttachment = {
      id: `att_${Date.now()}`,
      ...fileData
    }
    const updated = [...attachments, newAttachment]
    setAttachments(updated)
    if (onUpdateAttachments && order) {
      onUpdateAttachments(order.id, updated)
    }
  }

  const handleDeleteAttachment = (id: string) => {
    if (confirm("Deseja realmente remover este anexo do MinIO?")) {
      const updated = attachments.filter(att => att.id !== id)
      setAttachments(updated)
      if (onUpdateAttachments && order) {
        onUpdateAttachments(order.id, updated)
      }
    }
  }

  if (!isOpen || !order) return null

  const getStatusBadge = (status: OSDetail["status"]) => {
    switch (status) {
      case "PENDING": return <Badge variant="outline">Pendente</Badge>
      case "UNDER_ANALYSIS": return <Badge variant="info">Em Análise</Badge>
      case "BUDGETED": return <Badge variant="secondary">Orçado</Badge>
      case "APPROVED": return <Badge variant="default">Orçamento Aprovado</Badge>
      case "REJECTED": return <Badge variant="destructive">Orçamento Rejeitado</Badge>
      case "IN_REPAIR": return <Badge variant="info">Em Conserto</Badge>
      case "READY": return <Badge variant="success">Pronto (Retirada)</Badge>
      case "DELIVERED": return <Badge variant="success">Entregue</Badge>
      case "CANCELLED": return <Badge variant="destructive">Cancelado</Badge>
      default: return <Badge variant="secondary">Status</Badge>
    }
  }

  const getPriorityBadge = (priority: OSDetail["priority"]) => {
    switch (priority) {
      case "LOW": return <Badge variant="outline" className="text-zinc-400">Baixa</Badge>
      case "MEDIUM": return <Badge variant="outline" className="text-blue-400">Média</Badge>
      case "HIGH": return <Badge variant="outline" className="text-amber-400">Alta</Badge>
      case "URGENT": return <Badge variant="outline" className="text-red-400 font-bold animate-pulse">Urgente</Badge>
    }
  }

  // Lógica da Máquina de Estados Operacional (Botoes de Ação Rápida)
  const renderWorkflowActions = () => {
    if (!onChangeStatus) return null

    switch (order.status) {
      case "PENDING":
        return (
          <Button variant="default" size="sm" onClick={() => onChangeStatus(order.id, "UNDER_ANALYSIS")} className="gap-1.5 text-xs bg-blue-500 hover:bg-blue-600">
            Iniciar Diagnóstico
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )
      case "UNDER_ANALYSIS":
        return (
          <Button variant="default" size="sm" onClick={() => onChangeStatus(order.id, "BUDGETED")} className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-600">
            Salvar Orçamento
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )
      case "BUDGETED":
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onChangeStatus(order.id, "REJECTED")} className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs">
              Recusar Orçamento
            </Button>
            <Button variant="default" size="sm" onClick={() => onChangeStatus(order.id, "APPROVED")} className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600">
              Aprovar e Iniciar Reparo
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )
      case "APPROVED":
      case "IN_REPAIR":
        return (
          <Button variant="default" size="sm" onClick={() => onChangeStatus(order.id, "READY")} className="gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600">
            Finalizar Reparo (Pronto)
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )
      case "READY":
        return (
          <Button variant="default" size="sm" onClick={() => onChangeStatus(order.id, "DELIVERED")} className="gap-1.5 text-xs bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
            Entregar Equipamento
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/45">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-foreground">Ordem de Serviço #{order.number}</h3>
            {getStatusBadge(order.status)}
            {getPriorityBadge(order.priority)}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Informações Resumidas do Cliente e Aparelho */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-muted/10 p-4 rounded-md border border-border/30">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><User className="w-3 h-3" /> Cliente</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{order.customer.name}</p>
              {customerPhone && (
                <div className="mt-1 flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const text = `Olá *${order.customer.name}*!\n\nEstamos acompanhando o andamento do seu equipamento *${order.device.brandName} ${order.device.modelName}* (OS #${order.number}) em nossa assistência.\n\nQualquer dúvida, estamos à disposição!`
                      sendWhatsAppMessage(customerPhone, text)
                    }}
                    className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold px-1.5 py-0.5 rounded border border-emerald-500/20 transition-colors flex items-center gap-1"
                    title="Notificar por WhatsApp"
                  >
                    💬 WhatsApp ({customerPhone})
                  </button>
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Wrench className="w-3 h-3" /> Aparelho</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{order.device.brandName} {order.device.modelName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Calendar className="w-3 h-3" /> Data de Entrada</p>
              <p className="text-sm text-foreground mt-0.5">{new Date(order.entryDate).toLocaleDateString("pt-BR")}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Wrench className="w-3 h-3" /> Técnico</p>
              <p className="text-sm text-foreground mt-0.5">{order.technician?.name || "Aguardando Alocação"}</p>
            </div>
          </div>

          {/* Blockchain Audit Block */}
          <div className="bg-zinc-950/40 border border-zinc-800/80 p-4 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Segurança Blockchain Ativa
              </p>
              {blockchainLog ? (
                <p className="text-zinc-400 font-mono text-[10px]">
                  TxHash: <span className="text-zinc-300 font-bold">{blockchainLog.blockchainTx}</span> | Data: {new Date(blockchainLog.createdAt).toLocaleString("pt-BR")}
                </p>
              ) : (
                <p className="text-zinc-500 italic">Esta OS ainda não foi ancorada criptograficamente na rede de blocos.</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {blockchainLog ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleVerifyIntegrity} 
                    className="h-8 text-[10px] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 font-semibold"
                  >
                    Validar Integridade
                  </Button>
                  {verificationResult === "SUCCESS" && (
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded">
                      ✓ Íntegro
                    </span>
                  )}
                </>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleAnchorOS}
                  className="h-8 text-[10px] bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold"
                >
                  Ancorar na Blockchain
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Esquerda: Detalhes, Laudos e Checklist (Ocupa 2 Colunas) */}
            <div className="md:col-span-2 space-y-5">
              
              {/* Defeito Relatado */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Defeito Relatado
                </h5>
                <p className="text-xs bg-muted/20 border border-border/40 p-3 rounded text-foreground leading-relaxed">
                  {order.reportedDefect}
                </p>
              </div>

              {/* Checklist de Testes */}
              {order.checklist && (
                <div className="space-y-1.5">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" /> Checklist de Entrada
                  </h5>
                  <div className="grid grid-cols-3 gap-2 bg-muted/10 border border-border/20 p-3 rounded">
                    {Object.entries(order.checklist).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-1.5 text-[10px]">
                        <span className={`w-2 h-2 rounded-full ${value ? "bg-emerald-500" : "bg-destructive"}`}></span>
                        <span className="font-mono uppercase text-foreground">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Laudo Técnico / Diagnóstico */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Diagnóstico do Técnico
                </h5>
                {(!order.diagnostics || order.diagnostics.length === 0) ? (
                  <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded">
                    Nenhum diagnóstico elaborado até o momento.
                  </p>
                ) : (
                  (order.diagnostics || []).map(diag => (
                    <div key={diag.id} className="bg-muted/15 border border-border/30 p-4 rounded space-y-3">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Laudo Técnico</p>
                        <p className="text-xs text-foreground leading-relaxed mt-0.5">{diag.technicalReport}</p>
                      </div>
                      {diag.solutionProposed && (
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Solução Proposta</p>
                          <p className="text-xs text-foreground leading-relaxed mt-0.5">{diag.solutionProposed}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Detalhes Financeiros: Peças e Serviços */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Demonstrativo de Custos
                </h5>
                <div className="border border-border/80 rounded bg-card/25 overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="py-2 px-3 text-muted-foreground font-medium">Descrição</th>
                        <th className="py-2 px-3 text-muted-foreground font-medium text-center">Qtd</th>
                        <th className="py-2 px-3 text-muted-foreground font-medium text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {(order.servicesUsed || []).map(s => (
                        <tr key={s.id}>
                          <td className="py-2.5 px-3 text-foreground font-medium">{s.description} (Mão de Obra)</td>
                          <td className="py-2.5 px-3 text-center text-muted-foreground">1</td>
                          <td className="py-2.5 px-3 text-right font-mono text-foreground">
                            {s.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                        </tr>
                      ))}
                      {(order.partsUsed || []).map(p => (
                        <tr key={p.id}>
                          <td className="py-2.5 px-3 text-foreground font-medium">{p.part.name} (Peça)</td>
                          <td className="py-2.5 px-3 text-center text-muted-foreground">{p.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-foreground">
                            {p.priceCharged.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-border/80 bg-muted/10 font-semibold">
                        <td colSpan={2} className="py-3 px-3 text-foreground">Soma Total</td>
                        <td className="py-3 px-3 text-right font-mono text-foreground text-sm">
                          {order.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Form de Orçamento / Laudo para o Técnico */}
              {(order.status === "PENDING" || order.status === "UNDER_ANALYSIS" || order.status === "BUDGETED") && onSaveBudget && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-md space-y-3.5 mt-4">
                  <h6 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <Wrench className="w-3.5 h-3.5" /> Registrar Laudo & Orçamento (Técnico)
                  </h6>
                  
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground font-semibold text-[10px] uppercase">Laudo Técnico / Diagnóstico</label>
                    <textarea
                      value={techReport}
                      onChange={e => setTechReport(e.target.value)}
                      placeholder="Ex: Identificado curto na linha de alimentação principal do circuito integrado de carga (U2). Necessário refazer trilha e trocar CI."
                      className="w-full h-20 p-2.5 rounded bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-muted-foreground font-semibold text-[10px] uppercase">Mão de Obra / Serviço (R$)</label>
                      <input
                        type="number"
                        value={laborVal}
                        onChange={e => setLaborVal(Number(e.target.value))}
                        className="w-full h-9 px-3 rounded bg-background border border-border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-muted-foreground font-semibold text-[10px] uppercase">Peças / Componentes (R$)</label>
                      <input
                        type="number"
                        value={partsVal}
                        readOnly
                        className="w-full h-9 px-3 rounded bg-zinc-800 border border-border text-xs text-muted-foreground font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Seletor de Peças do Estoque Real */}
                  <div className="space-y-2 border-t border-border/20 pt-2.5">
                    <label className="text-muted-foreground font-semibold text-[10px] uppercase block">Escolher Peças do Estoque</label>
                    <div className="flex gap-2">
                      <select
                        value={currentSelectedPartId}
                        onChange={e => setCurrentSelectedPartId(e.target.value)}
                        className="flex-1 h-9 px-2 rounded bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-foreground"
                      >
                        <option value="">-- Selecione uma peça do inventário --</option>
                        {inventory.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Saldo: {p.quantity}) - R$ {p.salePrice.toFixed(2)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={currentSelectedPartQty}
                        onChange={e => setCurrentSelectedPartQty(Math.max(1, Number(e.target.value)))}
                        className="w-14 h-9 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
                      />
                      <Button
                        type="button"
                        onClick={handleAddPart}
                        variant="outline"
                        size="sm"
                        className="text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 h-9"
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  {selectedParts.length > 0 && (
                    <div className="space-y-1 bg-background/50 p-2 rounded border border-border/10">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Peças Vinculadas ao Orçamento:</span>
                      {selectedParts.map(sp => (
                        <div key={sp.partId} className="flex justify-between items-center text-xs text-foreground bg-zinc-900/40 p-1.5 rounded mb-1">
                          <div className="truncate pr-2">
                            <span className="font-semibold block truncate">{sp.name}</span>
                            <span className="text-zinc-500 text-[10px]">({sp.quantity}x R$ {sp.salePrice.toFixed(2)})</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-amber-500 font-mono">R$ {(sp.quantity * sp.salePrice).toFixed(2)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePart(sp.partId)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      if (!techReport.trim()) {
                        alert("Por favor, preencha o laudo técnico do diagnóstico.")
                        return
                      }
                      onSaveBudget(order.id, techReport, laborVal, partsVal, selectedParts)
                    }}
                    variant="default"
                    size="sm"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-xs text-zinc-950 font-bold"
                  >
                    Salvar e Enviar Orçamento
                  </Button>
                </div>
              )}
              {/* Galeria de Fotos e Anexos de Bancada */}
              <div className="space-y-2.5 pt-4 border-t border-border/30">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Fotos e Anexos de Bancada (MinIO S3)
                </h5>
                <AttachmentGallery
                  attachments={attachments}
                  onUpload={handleUploadAttachment}
                  onDelete={handleDeleteAttachment}
                />
              </div>

            </div>

            {/* Direita: Timeline de Atividades e Garantias (Ocupa 1 Coluna) */}
            <div className="space-y-6">
              
              {/* Timeline de Histórico */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Linha do Tempo
                </h5>
                <div className="relative pl-4 border-l border-border/60 ml-2 space-y-4 py-2">
                  {order.histories.map(h => (
                    <div key={h.id} className="relative text-xs">
                      {/* Círculo indicador */}
                      <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-card flex items-center justify-center"></span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-foreground uppercase text-[9px] bg-muted/40 px-1 py-0.2 rounded">
                            {h.toStatus}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(h.changedAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Responsável: {h.user.name}</p>
                        {h.observation && (
                          <p className="text-[10px] text-zinc-400 italic">&quot;{h.observation}&quot;</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Garantia Ativa */}
              {order.warranties.length > 0 && (
                <div className="space-y-2 bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-md">
                  <h6 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Garantia Vigente
                  </h6>
                  {order.warranties.map(w => (
                    <div key={w.id} className="text-[11px] space-y-1 text-emerald-300">
                      <p>Prazo: <span className="font-semibold">{w.termDays} dias</span></p>
                      <p>Expira em: <span className="font-semibold font-mono">{new Date(w.endDate).toLocaleDateString("pt-BR")}</span></p>
                      {w.conditions && <p className="italic text-[10px] text-emerald-400 mt-1 leading-snug">&quot;{w.conditions}&quot;</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Portal do Cliente & QR Code */}
              <div className="space-y-3 bg-zinc-950/20 border border-border/40 p-4 rounded-md text-xs">
                <h6 className="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-zinc-400" /> Acesso ao Portal (Cliente)
                </h6>
                <div className="flex gap-3 items-center">
                  <svg className="w-14 h-14 bg-white p-1 rounded shrink-0" viewBox="0 0 29 29">
                    <path d="M0,0 h7 v7 h-7 z M2,2 h3 v3 h-3 z M0,22 h7 v7 h-7 z M2,24 h3 v3 h-3 z M22,0 h7 v7 h-7 z M24,2 h3 v3 h-3 z M8,1 h1 v1 h-1 z M11,1 h1 v1 h-1 z M13,2 h2 v2 h-2 z M19,4 h1 v1 h-1 z M10,8 h3 v3 h-3 z M16,10 h2 v2 h-2 z M24,12 h2 v2 h-2 z M12,18 h2 v2 h-2 z M20,20 h3 v3 h-3 z M26,22 h2 v2 h-2 z" fill="black" />
                  </svg>
                  <div>
                    <p className="font-semibold text-foreground">QR Code da OS</p>
                    <a
                      href={`/portal-cliente?os=${order.number}`}
                      target="_blank"
                      className="text-[10px] text-blue-400 hover:underline block mt-0.5 font-bold"
                    >
                      Acessar Portal do Cliente &rarr;
                    </a>
                  </div>
                </div>
              </div>

              {/* Assistente de IA & OCR */}
              <div className="space-y-3 p-4 border border-border/40 rounded-md bg-zinc-950/20 text-xs">
                <h6 className="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" /> Assistente de IA (Gemini)
                </h6>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRunAI} disabled={isAnalyzingIA} className="flex-1 text-[10px] h-7">
                    {isAnalyzingIA ? "Analisando..." : "Diagnóstico IA"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRunOCR} disabled={isScanningOCR} className="flex-1 text-[10px] h-7">
                    {isScanningOCR ? "Lendo..." : "OCR Etiqueta"}
                  </Button>
                </div>

                {/* Resultado IA */}
                {aiResult && (
                  <div className="space-y-2 pt-2 border-t border-border/30 text-[10px] leading-relaxed text-zinc-300">
                    <div>
                      <span className="font-bold text-foreground block">Possíveis Defeitos:</span>
                      <ul className="list-disc pl-3.5 space-y-0.5">
                        {aiResult.possibleDefects.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">Laudo Sugerido:</span>
                      <p className="italic bg-background/45 p-1.5 rounded">{aiResult.technicalReport}</p>
                    </div>
                  </div>
                )}

                {/* Resultado OCR */}
                {ocrResult && (
                  <div className="space-y-1.5 pt-2 border-t border-border/30 text-[10px] font-mono text-zinc-400 leading-normal bg-background/30 p-2 rounded">
                    <p className="font-bold text-foreground uppercase tracking-wider text-[8px] font-sans">Resultado OCR:</p>
                    {ocrResult.imei && <p>IMEI: {ocrResult.imei}</p>}
                    {ocrResult.serialNumber && <p>SERIAL: {ocrResult.serialNumber}</p>}
                    <p className="text-[9px] text-zinc-500 mt-1">Confiança: {ocrResult.confidence * 100}%</p>
                  </div>
                )}
              </div>
            </div>

          {/* Ações de Impressão de PDFs */}
          <div className="pt-5 border-t border-border/30">
            <h6 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-3">Imprimir Documentos Relacionados (PDF)</h6>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/print/entry/${order.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-zinc-900 border border-border text-foreground hover:bg-zinc-800 transition-colors"
              >
                Ficha de Entrada
              </a>
              <a
                href={`/print/budget/${order.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-zinc-900 border border-border text-foreground hover:bg-zinc-800 transition-colors"
              >
                Orçamento
              </a>
              <a
                href={`/print/warranty/${order.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-zinc-900 border border-border text-foreground hover:bg-zinc-800 transition-colors"
              >
                Termo de Garantia
              </a>
              <a
                href={`/print/receipt/${order.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-zinc-900 border border-border text-foreground hover:bg-zinc-800 transition-colors"
              >
                Recibo Quitação
              </a>
              <a
                href={`/print/report/${order.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-zinc-900 border border-border text-foreground hover:bg-zinc-800 transition-colors"
              >
                Laudo Técnico
              </a>
              <a
                href={`/print/label/${order.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/40 transition-colors"
              >
                Etiqueta de Bancada
              </a>
            </div>
          </div>

          </div>
        </div>

        {/* Footer com Transições Automáticas de Status */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-card/25">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar Painel
          </Button>
          {renderWorkflowActions()}
        </div>

      </div>
    </div>
  )
}
