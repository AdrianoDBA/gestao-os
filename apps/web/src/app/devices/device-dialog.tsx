"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload, Trash2, Camera, ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react"
import { Device, Customer } from "@/types"
import { formatDocument } from "@/lib/validation"

export interface DeviceFormData {
  id?: string
  customerId: string
  category: "Celular" | "Notebook" | "Desktop" | "Tablet" | "Videogame" | "TV" | "Monitor" | "Impressora" | "Placa eletrônica" | "Outro"
  brandName: string
  modelName: string
  serialNumber: string
  imei?: string
  password?: string
  color: string
  physicalState?: string
  reportedDefect?: string
  accessories?: string
  observations?: string
  status: "ACTIVE" | "INACTIVE"
  photos: {
    front?: string
    back?: string
    others: string[]
  }
  checklist: {
    [key: string]: "OK" | "DEFECT" | "NOT_TESTED"
  }
}

interface DeviceDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: DeviceFormData) => void
  device?: Device | null
  customers: Customer[]
  existingDevices: Device[]
}

const CHECKLIST_ITEMS = [
  "Tela", "Touch", "Botões", "Microfone", "Alto-falante", "Câmera", 
  "FaceID", "TouchID", "Wi-Fi", "Bluetooth", "Carcaça", "Bateria", "Conector"
]

export function DeviceDialog({ isOpen, onClose, onSave, device, customers, existingDevices }: DeviceDialogProps) {
  const [activeTab, setActiveTab] = useState<"general" | "checklist" | "photos">("general")
  
  // Dados Gerais
  const [customerId, setCustomerId] = useState("")
  const [category, setCategory] = useState<DeviceFormData["category"]>("Celular")
  const [brandName, setBrandName] = useState("")
  const [modelName, setModelName] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [imei, setImei] = useState("")
  const [password, setPassword] = useState("")
  const [color, setColor] = useState("")
  const [physicalState, setPhysicalState] = useState("")
  const [reportedDefect, setReportedDefect] = useState("")
  const [accessories, setAccessories] = useState("")
  const [observations, setObservations] = useState("")
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")

  // Fotos
  const [photos, setPhotos] = useState<{ front?: string; back?: string; others: string[] }>({ others: [] })

  // Checklist
  const [checklist, setChecklist] = useState<{ [key: string]: "OK" | "DEFECT" | "NOT_TESTED" }>({})

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (device) {
      setCustomerId(device.customerId)
      setCategory(device.category)
      setBrandName(device.brandName)
      setModelName(device.modelName)
      setSerialNumber(device.serialNumber)
      setImei(device.imei || "")
      setPassword(device.password || "")
      setColor(device.color || "")
      setPhysicalState(device.physicalState || "")
      setReportedDefect(device.reportedDefect || "")
      setAccessories(device.accessories || "")
      setObservations(device.observations || "")
      setStatus(device.status || "ACTIVE")
      setPhotos(device.photos || { others: [] })
      
      // Reconstrói checklist
      const initialChecklist: { [key: string]: "OK" | "DEFECT" | "NOT_TESTED" } = {}
      CHECKLIST_ITEMS.forEach(item => {
        initialChecklist[item] = device.checklist?.[item] || "NOT_TESTED"
      })
      setChecklist(initialChecklist)
    } else {
      setCustomerId("")
      setCategory("Celular")
      setBrandName("")
      setModelName("")
      setSerialNumber("")
      setImei("")
      setPassword("")
      setColor("")
      setPhysicalState("")
      setReportedDefect("")
      setAccessories("")
      setObservations("")
      setStatus("ACTIVE")
      setPhotos({ others: [] })
      
      const initialChecklist: { [key: string]: "OK" | "DEFECT" | "NOT_TESTED" } = {}
      CHECKLIST_ITEMS.forEach(item => {
        initialChecklist[item] = "NOT_TESTED"
      })
      setChecklist(initialChecklist)
    }
    setErrors({})
    setActiveTab("general")
  }, [device, isOpen])

  if (!isOpen) return null

  // Simulação de Drag & Drop de Imagem
  const handlePhotoUploadSimulated = (type: "front" | "back" | "other") => {
    // Retorna uma imagem mockada realista baseada no tipo para preview
    let dummyUrl = ""
    if (type === "front") {
      dummyUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=60"
      setPhotos(prev => ({ ...prev, front: dummyUrl }))
    } else if (type === "back") {
      dummyUrl = "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&auto=format&fit=crop&q=60"
      setPhotos(prev => ({ ...prev, back: dummyUrl }))
    } else {
      dummyUrl = "https://images.unsplash.com/photo-1565849511593-ed34f7af0472?w=200&auto=format&fit=crop&q=60"
      setPhotos(prev => ({ ...prev, others: [...prev.others, dummyUrl] }))
    }
  }

  const removePhoto = (type: "front" | "back" | number) => {
    if (type === "front") {
      setPhotos(prev => ({ ...prev, front: undefined }))
    } else if (type === "back") {
      setPhotos(prev => ({ ...prev, back: undefined }))
    } else {
      setPhotos(prev => ({ ...prev, others: prev.others.filter((_, idx) => idx !== type) }))
    }
  }

  const handleChecklistChange = (item: string, state: "OK" | "DEFECT" | "NOT_TESTED") => {
    setChecklist(prev => ({ ...prev, [item]: state }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}

    if (!customerId) newErrors.customerId = "Cliente proprietário é obrigatório"
    if (!brandName.trim()) newErrors.brandName = "Marca é obrigatória"
    if (!modelName.trim()) newErrors.modelName = "Modelo é obrigatório"
    if (!serialNumber.trim()) newErrors.serialNumber = "Número de Série é obrigatório"
    if (!color.trim()) newErrors.color = "Cor é obrigatória"

    // Validação de Duplicidade de Serial e IMEI
    const serialDup = existingDevices.some(
      d => d.id !== device?.id && d.serialNumber.toLowerCase() === serialNumber.trim().toLowerCase()
    )
    if (serialDup) {
      newErrors.serialNumber = "Este número de série já está cadastrado em outro equipamento!"
    }

    if (imei.trim()) {
      const imeiDup = existingDevices.some(
        d => d.id !== device?.id && d.imei === imei.trim()
      )
      if (imeiDup) {
        newErrors.imei = "Este IMEI já está cadastrado em outro equipamento!"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setActiveTab("general") // Volta para a primeira aba se tiver erro
      return
    }

    onSave({
      id: device?.id,
      customerId,
      category,
      brandName,
      modelName,
      serialNumber,
      imei: imei || undefined,
      password: password || undefined,
      color,
      physicalState: physicalState || undefined,
      reportedDefect: reportedDefect || undefined,
      accessories: accessories || undefined,
      observations: observations || undefined,
      status,
      photos,
      checklist
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {device ? "Editar Dados do Equipamento" : "Cadastrar Novo Equipamento"}
            </h3>
            <p className="text-[10px] text-muted-foreground">Registre laudo de check-in, fotos físicas e checklist.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-border/40 bg-zinc-950/10 px-6 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Dados Gerais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("checklist")}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "checklist"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Checklist ({CHECKLIST_ITEMS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "photos"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Laudo Fotográfico
          </button>
        </div>

        {/* Formulário com Rolagem */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 min-h-[300px] max-h-[450px]">
          
          {/* ABA 1: Dados Gerais */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Cliente Proprietário</label>
                <select
                  value={customerId}
                  onChange={e => {
                    setCustomerId(e.target.value)
                    if (errors.customerId) setErrors(prev => ({ ...prev, customerId: "" }))
                  }}
                  className={`w-full h-8 px-2 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                    errors.customerId ? "border-destructive/60" : "border-border"
                  }`}
                >
                  <option value="">Selecione um cliente proprietário...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({formatDocument(c.document)})</option>
                  ))}
                </select>
                {errors.customerId && <p className="text-[9px] text-destructive font-semibold">{errors.customerId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full h-8 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Celular">Celular</option>
                    <option value="Notebook">Notebook</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Videogame">Videogame</option>
                    <option value="TV">TV</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Impressora">Impressora</option>
                    <option value="Placa eletrônica">Placa eletrônica</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Status do Equipamento</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full h-8 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="ACTIVE">Ativo (Permite vincular OS)</option>
                    <option value="INACTIVE">Inativo (Histórico)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Marca</label>
                  <input
                    type="text"
                    placeholder="Ex: Apple, Samsung, Dell"
                    value={brandName}
                    onChange={e => {
                      setBrandName(e.target.value)
                      if (errors.brandName) setErrors(prev => ({ ...prev, brandName: "" }))
                    }}
                    className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                      errors.brandName ? "border-destructive/60" : "border-border"
                    }`}
                  />
                  {errors.brandName && <p className="text-[9px] text-destructive font-semibold">{errors.brandName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Modelo</label>
                  <input
                    type="text"
                    placeholder="Ex: iPhone 14 Pro, G15"
                    value={modelName}
                    onChange={e => {
                      setModelName(e.target.value)
                      if (errors.modelName) setErrors(prev => ({ ...prev, modelName: "" }))
                    }}
                    className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                      errors.modelName ? "border-destructive/60" : "border-border"
                    }`}
                  />
                  {errors.modelName && <p className="text-[9px] text-destructive font-semibold">{errors.modelName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Número de Série / Serial</label>
                  <input
                    type="text"
                    placeholder="Ex: C39GL8P9N70D"
                    value={serialNumber}
                    onChange={e => {
                      setSerialNumber(e.target.value)
                      if (errors.serialNumber) setErrors(prev => ({ ...prev, serialNumber: "" }))
                    }}
                    className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                      errors.serialNumber ? "border-destructive/60" : "border-border"
                    }`}
                  />
                  {errors.serialNumber && <p className="text-[9px] text-destructive font-semibold">{errors.serialNumber}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">IMEI (Smartphones)</label>
                  <input
                    type="text"
                    placeholder="Ex: 351234567890123"
                    value={imei}
                    onChange={e => {
                      setImei(e.target.value)
                      if (errors.imei) setErrors(prev => ({ ...prev, imei: "" }))
                    }}
                    className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                      errors.imei ? "border-destructive/60" : "border-border"
                    }`}
                  />
                  {errors.imei && <p className="text-[9px] text-destructive font-semibold">{errors.imei}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Senha do Equipamento (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Padrão L, Pin 1234"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-8 px-3 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Cor</label>
                  <input
                    type="text"
                    placeholder="Ex: Cinza Espacial, Vermelho"
                    value={color}
                    onChange={e => {
                      setColor(e.target.value)
                      if (errors.color) setErrors(prev => ({ ...prev, color: "" }))
                    }}
                    className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                      errors.color ? "border-destructive/60" : "border-border"
                    }`}
                  />
                  {errors.color && <p className="text-[9px] text-destructive font-semibold">{errors.color}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Defeito Informado pelo Cliente</label>
                <input
                  type="text"
                  placeholder="Ex: Tela piscando, Não carrega bateria"
                  value={reportedDefect}
                  onChange={e => setReportedDefect(e.target.value)}
                  className="w-full h-8 px-3 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Estado Estético (Check-in)</label>
                  <input
                    type="text"
                    placeholder="Ex: Riscos leves na tela, tampa amassada"
                    value={physicalState}
                    onChange={e => setPhysicalState(e.target.value)}
                    className="w-full h-8 px-3 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Acessórios Deixados</label>
                  <input
                    type="text"
                    placeholder="Ex: Apenas aparelho, Com cabo, capa"
                    value={accessories}
                    onChange={e => setAccessories(e.target.value)}
                    className="w-full h-8 px-3 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Observações Técnicas Adicionais</label>
                <textarea
                  placeholder="Outras anotações pertinentes..."
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  className="w-full h-16 p-2.5 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
            </div>
          )}

          {/* ABA 2: Checklist */}
          {activeTab === "checklist" && (
            <div className="space-y-3.5">
              <p className="text-[10px] text-muted-foreground leading-normal italic bg-zinc-950/20 border border-border/30 p-2.5 rounded-md">
                Marque o estado de funcionamento de cada sensor e periférico avaliado durante o check-in do aparelho na bancada de atendimento.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CHECKLIST_ITEMS.map(item => {
                  const state = checklist[item] || "NOT_TESTED"
                  return (
                    <div key={item} className="flex items-center justify-between p-2 border border-border/50 rounded bg-card/10 text-xs">
                      <span className="font-semibold text-foreground">{item}</span>
                      
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleChecklistChange(item, "OK")}
                          className={`p-1 px-2 text-[9px] font-bold rounded border transition-colors flex items-center gap-1 ${
                            state === "OK"
                              ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                              : "bg-transparent border-border text-muted-foreground hover:bg-muted/10"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" /> OK
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChecklistChange(item, "DEFECT")}
                          className={`p-1 px-2 text-[9px] font-bold rounded border transition-colors flex items-center gap-1 ${
                            state === "DEFECT"
                              ? "bg-destructive/15 border-destructive/30 text-destructive"
                              : "bg-transparent border-border text-muted-foreground hover:bg-muted/10"
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" /> Defeito
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChecklistChange(item, "NOT_TESTED")}
                          className={`p-1 px-2 text-[9px] font-bold rounded border transition-colors flex items-center gap-1 ${
                            state === "NOT_TESTED"
                              ? "bg-zinc-800 border-zinc-700 text-foreground"
                              : "bg-transparent border-border text-muted-foreground hover:bg-muted/10"
                          }`}
                        >
                          <HelpCircle className="w-3 h-3" /> N/T
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ABA 3: Laudo Fotográfico */}
          {activeTab === "photos" && (
            <div className="space-y-5">
              <p className="text-[10px] text-muted-foreground leading-normal italic bg-zinc-950/20 border border-border/30 p-2.5 rounded-md">
                Arraste as fotos da vistoria física do aparelho para anexar ao laudo. O sistema organiza e armazena de forma automática.
              </p>

              {/* Drag and Drop Simulado */}
              <div className="grid grid-cols-2 gap-4">
                {/* Foto Frontal */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> Foto Frontal</label>
                  {photos.front ? (
                    <div className="relative border border-border rounded-md overflow-hidden aspect-video bg-muted flex items-center justify-center group">
                      <img src={photos.front} alt="Foto frontal" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => removePhoto("front")}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-destructive"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => handlePhotoUploadSimulated("front")}
                      className="border border-dashed border-border/80 hover:border-foreground/45 hover:bg-muted/5 transition-all rounded-md aspect-video flex flex-col items-center justify-center p-4 cursor-pointer text-center text-muted-foreground"
                    >
                      <Upload className="w-5 h-5 mb-1.5 text-zinc-500" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Carregar Frontal</span>
                    </div>
                  )}
                </div>

                {/* Foto Traseira */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> Foto Traseira</label>
                  {photos.back ? (
                    <div className="relative border border-border rounded-md overflow-hidden aspect-video bg-muted flex items-center justify-center group">
                      <img src={photos.back} alt="Foto traseira" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => removePhoto("back")}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-destructive"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => handlePhotoUploadSimulated("back")}
                      className="border border-dashed border-border/80 hover:border-foreground/45 hover:bg-muted/5 transition-all rounded-md aspect-video flex flex-col items-center justify-center p-4 cursor-pointer text-center text-muted-foreground"
                    >
                      <Upload className="w-5 h-5 mb-1.5 text-zinc-500" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Carregar Traseira</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fotos Adicionais */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Fotos Adicionais / Detalhes de Avarias</label>
                
                <div className="grid grid-cols-4 gap-3">
                  {photos.others.map((url, idx) => (
                    <div key={idx} className="relative border border-border rounded overflow-hidden aspect-square bg-muted flex items-center justify-center group">
                      <img src={url} alt={`Anexo ${idx + 1}`} className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {photos.others.length < 4 && (
                    <div
                      onClick={() => handlePhotoUploadSimulated("other")}
                      className="border border-dashed border-border/80 hover:border-foreground/45 hover:bg-muted/5 transition-all rounded aspect-square flex flex-col items-center justify-center p-2 cursor-pointer text-center text-muted-foreground"
                    >
                      <Upload className="w-4 h-4 text-zinc-500 mb-1" />
                      <span className="text-[8px] font-bold uppercase">Adicionar</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 bg-card/25">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="default" size="sm" onClick={handleSubmit}>
            {device ? "Salvar Alterações" : "Cadastrar Equipamento"}
          </Button>
        </div>
      </div>
    </div>
  )
}
