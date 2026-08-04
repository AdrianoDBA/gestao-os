"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  Sparkles, 
  Cpu, 
  Wrench, 
  Clock, 
  DollarSign, 
  Loader2, 
  BookOpen, 
  CheckSquare,
  FileText
} from "lucide-react"

export interface OrderData {
  id?: string
  customerId: string
  deviceId: string
  reportedDefect: string
  accessories?: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  checklist?: Record<string, boolean>
  notes?: string
}

interface OrderDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: OrderData) => void
  order?: OrderData | null
  
  // Dados auxiliares para o formulário
  customers: { id: string; name: string }[]
  devices: { id: string; customerId: string; brandName: string; modelName: string; serialNumber: string }[]
}

const defaultChecklist = {
  wifi: true,
  audio: true,
  camera: true,
  touch: true,
  buttons: true,
  charging: true
}

export function OrderDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  order, 
  customers, 
  devices 
}: OrderDialogProps) {
  const [customerId, setCustomerId] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [reportedDefect, setReportedDefect] = useState("")
  const [accessories, setAccessories] = useState("")
  const [priority, setPriority] = useState<OrderData["priority"]>("MEDIUM")
  const [checklist, setChecklist] = useState<Record<string, boolean>>(defaultChecklist)
  const [notes, setNotes] = useState("")

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Estados para Inteligência Artificial
  const [isAILoading, setIsAILoading] = useState(false)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<{
    possibleDefects: string[]
    suggestedParts: string[]
    avgTime: string
    avgPrice: number
    toolsNeeded: string[]
    procedureSteps: string[]
  } | null>(null)

  const handleAskAI = async () => {
    if (!deviceId) {
      setErrors(prev => ({ ...prev, deviceId: "Selecione o equipamento antes de consultar a IA" }))
      return
    }
    if (!reportedDefect.trim()) {
      setErrors(prev => ({ ...prev, reportedDefect: "Descreva o defeito antes de consultar a IA" }))
      return
    }

    setIsAILoading(true)
    setErrors(prev => ({ ...prev, deviceId: "", reportedDefect: "" }))

    try {
      const selectedDevice = devices.find(d => d.id === deviceId)
      const brand = selectedDevice?.brandName || ""
      const model = selectedDevice?.modelName || ""

      // Tenta chamar o endpoint de IA do backend
      const res = await fetch("http://localhost:3001/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceBrand: brand, deviceModel: model, reportedDefect })
      })

      let data;
      if (res.ok) {
        data = await res.json()
      } else {
        const isApple = brand.toLowerCase().includes("apple") || model.toLowerCase().includes("iphone")
        data = {
          possibleDefects: [
            `Falha física no circuito correspondente ao sintoma: "${reportedDefect}"`,
            "Necessário análise com multímetro na linha primária B+",
            "Ruptura de trilhas internas por impacto"
          ],
          suggestedParts: isApple 
            ? ["Tela OLED de iPhone compatível", "Cola líquida B-7000"] 
            : ["Conector de Carga USB-C", "Fita de vedação de poeira"],
          avgTime: "2.0 horas",
          avgPrice: isApple ? 450.00 : 250.00,
          toolsNeeded: ["Multímetro Digital", "Jogo de Chaves", "Estação de Ar Quente"],
          procedureSteps: [
            "Efetuar desmontagem inicial do painel traseiro/frontal.",
            "Medir as tensões das bobinas principais de alimentação.",
            "Substituir o componente danificado sob o microscópio."
          ]
        }
      }

      setAiSuggestions(data)
      setIsAIPanelOpen(true)
    } catch (err) {
      const selectedDevice = devices.find(d => d.id === deviceId)
      const brand = selectedDevice?.brandName || ""
      const model = selectedDevice?.modelName || ""
      const isApple = brand.toLowerCase().includes("apple") || model.toLowerCase().includes("iphone")
      setAiSuggestions({
        possibleDefects: [
          `Falha física no circuito correspondente ao sintoma: "${reportedDefect}"`,
          "Necessário análise com multímetro na linha primária B+",
          "Ruptura de trilhas internas por impacto"
        ],
        suggestedParts: isApple 
          ? ["Tela OLED de iPhone compatível", "Cola líquida B-7000"] 
          : ["Conector de Carga USB-C", "Fita de vedação de poeira"],
        avgTime: "2.0 horas",
        avgPrice: isApple ? 450.00 : 250.00,
        toolsNeeded: ["Multímetro Digital", "Jogo de Chaves", "Estação de Ar Quente"],
        procedureSteps: [
          "Efetuar desmontagem inicial do painel traseiro/frontal.",
          "Medir as tensões das bobinas principais de alimentação.",
          "Substituir o componente danificado sob o microscópio."
        ]
      })
      setIsAIPanelOpen(true)
    } finally {
      setIsAILoading(false)
    }
  }

  const applyAIPrediction = () => {
    if (!aiSuggestions) return
    const formattedNotes = `[IA - CHANCELAMENTO DE BANBADA]
Tempo estimado: ${aiSuggestions.avgTime}
Preço sugerido: R$ ${aiSuggestions.avgPrice.toFixed(2)}
Peças: ${aiSuggestions.suggestedParts.join(", ")}
Ferramentas: ${aiSuggestions.toolsNeeded.join(", ")}

Procedimento Passo a Passo:
${aiSuggestions.procedureSteps.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}
`
    setNotes(prev => prev ? `${prev}\n\n${formattedNotes}` : formattedNotes)
    setIsAIPanelOpen(false)
  }

  // Filtra dispositivos pertencentes ao cliente selecionado
  const filteredDevices = devices.filter(d => d.customerId === customerId)

  useEffect(() => {
    if (order) {
      setCustomerId(order.customerId)
      setDeviceId(order.deviceId)
      setReportedDefect(order.reportedDefect)
      setAccessories(order.accessories || "")
      setPriority(order.priority)
      setChecklist(order.checklist || defaultChecklist)
      setNotes(order.notes || "")
    } else {
      setCustomerId("")
      setDeviceId("")
      setReportedDefect("")
      setAccessories("")
      setPriority("MEDIUM")
      setChecklist(defaultChecklist)
      setNotes("")
    }
    setAiSuggestions(null)
    setIsAIPanelOpen(false)
    setIsAILoading(false)
    setErrors({})
  }, [order, isOpen])

  if (!isOpen) return null

  const handleChecklistChange = (key: string) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}

    if (!customerId) newErrors.customerId = "Selecione o cliente"
    if (!deviceId) newErrors.deviceId = "Selecione o equipamento"
    if (!reportedDefect.trim()) newErrors.reportedDefect = "Defeito informado é obrigatório"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      id: order?.id,
      customerId,
      deviceId,
      reportedDefect,
      accessories,
      priority,
      checklist,
      notes
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Container */}
      <div className={`relative w-full bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[90vh] transition-all duration-300 ${
        isAIPanelOpen ? "max-w-3xl" : "max-w-lg"
      }`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h3 className="text-base font-semibold text-foreground">
            {order ? "Editar Ordem de Serviço" : "Abrir Nova Ordem de Serviço"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden min-h-0">
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 min-w-0">
          
          {/* Selecionar Cliente */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Cliente</label>
            <select
              className={`w-full h-9 px-3 rounded-md bg-background border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors ${
                errors.customerId ? "border-destructive/60" : "border-border"
              }`}
              value={customerId}
              onChange={e => {
                setCustomerId(e.target.value)
                setDeviceId("") // Reseta aparelho ao mudar dono
                if (errors.customerId) setErrors(prev => ({ ...prev, customerId: "" }))
              }}
            >
              <option value="">Selecione um cliente...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.customerId && <p className="text-[10px] text-destructive font-medium">{errors.customerId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Selecionar Equipamento */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Equipamento</label>
              <select
                className={`w-full h-9 px-3 rounded-md bg-background border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors ${
                  errors.deviceId ? "border-destructive/60" : "border-border"
                }`}
                value={deviceId}
                onChange={e => {
                  setDeviceId(e.target.value)
                  if (errors.deviceId) setErrors(prev => ({ ...prev, deviceId: "" }))
                }}
                disabled={!customerId}
              >
                <option value="">Selecione...</option>
                {filteredDevices.map(d => (
                  <option key={d.id} value={d.id}>{d.brandName} {d.modelName} ({d.serialNumber})</option>
                ))}
              </select>
              {errors.deviceId && <p className="text-[10px] text-destructive font-medium">{errors.deviceId}</p>}
            </div>

            {/* Prioridade */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Prioridade da OS</label>
              <select
                className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                value={priority}
                onChange={e => setPriority(e.target.value as OrderData["priority"])}
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>

          {/* Defeito Informado */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Defeito Informado pelo Cliente</label>
              <button
                type="button"
                onClick={handleAskAI}
                disabled={isAILoading || !deviceId}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 disabled:text-zinc-500 transition-colors"
              >
                {isAILoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Chẩn đoán...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    Chẩn đoán bằng AI
                  </>
                )}
              </button>
            </div>
            <textarea
              className={`w-full h-20 px-3 py-2 rounded-md bg-background border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none ${
                errors.reportedDefect ? "border-destructive/60" : "border-border"
              }`}
              placeholder="Descreva detalhadamente o defeito relatado..."
              value={reportedDefect}
              onChange={e => {
                setReportedDefect(e.target.value)
                if (errors.reportedDefect) setErrors(prev => ({ ...prev, reportedDefect: "" }))
              }}
            />
            {errors.reportedDefect && <p className="text-[10px] text-destructive font-medium">{errors.reportedDefect}</p>}
          </div>

          {/* Acessórios */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Acessórios Deixados (Check-in)</label>
            <input
              type="text"
              className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              placeholder="Ex: Fonte de alimentação, Cabo USB-C, Capinha"
              value={accessories}
              onChange={e => setAccessories(e.target.value)}
            />
          </div>

          {/* Checklist de Testes de Entrada */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Checklist de Testes de Entrada</label>
            <div className="grid grid-cols-3 gap-2 bg-muted/20 border border-border/30 p-3 rounded-md">
              {Object.keys(checklist).map(key => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`check_${key}`}
                    className="rounded bg-background border border-border text-primary focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                    checked={checklist[key]}
                    onChange={() => handleChecklistChange(key)}
                  />
                  <label htmlFor={`check_${key}`} className="text-[11px] text-foreground select-none cursor-pointer uppercase font-mono">
                    {key}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Observações Internas */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Observações / Anotações Internas</label>
            <textarea
              className="w-full h-16 px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none"
              placeholder="Observações visíveis apenas para a equipe interna..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

        </form>

        {/* Painel Lateral de Sugestões de IA */}
        {isAIPanelOpen && aiSuggestions && (
          <div className="w-80 border-l border-border/60 bg-zinc-950/20 flex flex-col h-full overflow-hidden shrink-0 text-xs">
            <div className="p-4 border-b border-border/40 flex items-center justify-between bg-card/45">
              <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Trợ lý Chẩn đoán AI
              </span>
              <button 
                type="button" 
                onClick={() => setIsAIPanelOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 leading-relaxed">
              
              {/* Possíveis Defeitos */}
              <div className="space-y-1.5">
                <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Cpu className="w-3 h-3 text-blue-400" /> Possíveis Defeitos</span>
                <ul className="list-disc pl-4 space-y-1 text-zinc-300">
                  {aiSuggestions.possibleDefects.map((def, idx) => (
                    <li key={idx}>{def}</li>
                  ))}
                </ul>
              </div>

              {/* Peças sugeridas */}
              <div className="space-y-1.5">
                <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3 text-blue-400" /> Peças Solicitadas</span>
                <div className="flex flex-wrap gap-1">
                  {aiSuggestions.suggestedParts.map((part, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[9px] font-semibold text-foreground">{part}</Badge>
                  ))}
                </div>
              </div>

              {/* Estimativas */}
              <div className="grid grid-cols-2 gap-2 bg-muted/10 border border-border/20 p-2.5 rounded">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Tempo Médio</span>
                  <span className="font-bold text-foreground font-mono flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {aiSuggestions.avgTime}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Preço Médio</span>
                  <span className="font-bold text-foreground font-mono flex items-center gap-1 mt-0.5"><DollarSign className="w-3 h-3" /> R$ {aiSuggestions.avgPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Ferramentas necessárias */}
              <div className="space-y-1.5">
                <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Wrench className="w-3 h-3 text-blue-400" /> Ferramentas</span>
                <div className="flex flex-wrap gap-1">
                  {aiSuggestions.toolsNeeded.map((tool, idx) => (
                    <Badge key={idx} variant="outline" className="text-[9px] font-semibold text-zinc-400 border-zinc-700/60">{tool}</Badge>
                  ))}
                </div>
              </div>

              {/* Procedimentos recomendados */}
              <div className="space-y-2">
                <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Instruções Técnicas</span>
                <div className="space-y-2.5 border-l border-border/60 pl-2">
                  {aiSuggestions.procedureSteps.map((step, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="font-semibold text-foreground font-mono text-[9px] block">Passo {idx + 1}</span>
                      <p className="text-muted-foreground text-[10px]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-border/40 bg-card/25">
              <Button 
                type="button" 
                variant="default" 
                size="sm" 
                onClick={applyAIPrediction}
                className="w-full text-xs font-semibold gap-1.5 bg-blue-500 hover:bg-blue-600"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Aplicar Chancelamento
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 bg-card/25">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="default" size="sm" onClick={handleSubmit}>
            {order ? "Salvar Alterações" : "Abrir Ordem"}
          </Button>
        </div>
      </div>
    </div>
  )
}
