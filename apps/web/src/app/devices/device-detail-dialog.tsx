"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Key, ClipboardList, Camera, CheckCircle2, AlertTriangle, HelpCircle, User, ShieldAlert, FileText } from "lucide-react"
import { Device } from "@/types"

interface DeviceDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  device: Device | null
}

export function DeviceDetailDialog({ isOpen, onClose, device }: DeviceDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<"general" | "checklist" | "photos" | "timeline">("general")

  if (!isOpen || !device) return null

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

  const serviceOrders = device.serviceOrders || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Ficha do Equipamento</h3>
              <Badge variant="outline" className="font-semibold uppercase text-[9px]">
                {device.category}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">Laudos, senhas, checklist físico e galeria de fotos.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-border/40 bg-zinc-950/10 px-6 gap-4">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Especificações
          </button>
          <button
            onClick={() => setActiveTab("checklist")}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "checklist"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Checklist
          </button>
          <button
            onClick={() => setActiveTab("photos")}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "photos"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Vistoria Fotográfica
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "timeline"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Histórico & OSs ({serviceOrders.length})
          </button>
        </div>

        {/* Conteúdo com Rolagem */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[220px] max-h-[380px]">
          
          {/* ABA 1: Especificações */}
          {activeTab === "general" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    {device.brandName} {device.modelName}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Data de Cadastro: <span className="font-mono">{new Date(device.createdAt).toLocaleDateString("pt-BR")}</span>
                  </p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <User className="w-3 h-3" /> Dono: {device.customerName || "Não informado"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Número de Série / Serial</p>
                  <p className="text-sm font-mono text-foreground mt-0.5">{device.serialNumber}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">IMEI (Smartphone)</p>
                  <p className="text-sm font-mono text-foreground mt-0.5">{device.imei || "Não se aplica"}</p>
                </div>
                
                <div className="flex items-start gap-2 bg-zinc-950/20 p-2.5 rounded-md border border-border/30 col-span-2">
                  <Key className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Senha / Padrão do Dispositivo</p>
                    <p className="text-xs font-mono font-semibold text-foreground mt-0.5">{device.password || "Sem senha cadastrada"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Cor do Aparelho</p>
                  <p className="text-xs text-foreground mt-0.5">{device.color || "Não informada"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Acessórios Deixados</p>
                  <p className="text-xs text-foreground mt-0.5">{device.accessories || "Nenhum acessório"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Defeito Informado</p>
                  <p className="text-xs text-foreground mt-0.5 font-semibold text-destructive/90">{device.reportedDefect || "Nenhum defeito registrado"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Estado Estético (Check-in)</p>
                  <p className="text-xs text-foreground mt-0.5">{device.physicalState || "Sem avarias declaradas"}</p>
                </div>
                {device.observations && (
                  <div className="col-span-2">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Observações Técnicas</p>
                    <p className="text-xs text-muted-foreground mt-0.5 italic leading-relaxed">&quot;{device.observations}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA 2: Checklist */}
          {activeTab === "checklist" && (
            <div className="space-y-4">
              {(!device.checklist || Object.keys(device.checklist).length === 0) ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <HelpCircle className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhum checklist registrado para este equipamento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(device.checklist).map(([item, state]) => {
                    return (
                      <div key={item} className="flex items-center justify-between p-2 border border-border/40 rounded bg-card/20 text-xs">
                        <span className="font-semibold text-foreground">{item}</span>
                        {state === "OK" && (
                          <Badge variant="success" className="gap-1 text-[9px] font-bold py-0.5"><CheckCircle2 className="w-3 h-3" /> OK</Badge>
                        )}
                        {state === "DEFECT" && (
                          <Badge variant="destructive" className="gap-1 text-[9px] font-bold py-0.5"><AlertTriangle className="w-3 h-3" /> Defeito</Badge>
                        )}
                        {state === "NOT_TESTED" && (
                          <Badge variant="secondary" className="gap-1 text-[9px] font-bold py-0.5"><HelpCircle className="w-3 h-3" /> N/T</Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ABA 3: Vistoria Fotográfica */}
          {activeTab === "photos" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Foto Frontal */}
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Vista Frontal</p>
                  {device.photos?.front ? (
                    <div className="border border-border rounded overflow-hidden aspect-video bg-muted flex items-center justify-center">
                      <img src={device.photos.front} alt="Foto frontal" className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="border border-dashed border-border rounded aspect-video flex flex-col items-center justify-center text-muted-foreground/45 text-[10px] font-bold">
                      Sem foto frontal
                    </div>
                  )}
                </div>

                {/* Foto Traseira */}
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Vista Traseira</p>
                  {device.photos?.back ? (
                    <div className="border border-border rounded overflow-hidden aspect-video bg-muted flex items-center justify-center">
                      <img src={device.photos.back} alt="Foto traseira" className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="border border-dashed border-border rounded aspect-video flex flex-col items-center justify-center text-muted-foreground/45 text-[10px] font-bold">
                      Sem foto traseira
                    </div>
                  )}
                </div>
              </div>

              {/* Fotos Adicionais */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Imagens de Avarias / Adicionais</p>
                {(!device.photos?.others || device.photos.others.length === 0) ? (
                  <p className="text-xs text-muted-foreground italic py-3 text-center border border-dashed border-border rounded">Nenhuma imagem adicional anexada.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {device.photos.others.map((url, idx) => (
                      <div key={idx} className="border border-border rounded overflow-hidden aspect-square bg-muted flex items-center justify-center">
                        <img src={url} alt={`Anexo ${idx + 1}`} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA 4: Histórico & OSs */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              {/* Linha do tempo independente do equipamento */}
              <div className="space-y-3">
                <h5 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground pb-1 border-b border-border/20">Linha do Tempo / Auditoria do Equipamento</h5>
                <div className="relative pl-6 border-l border-border/60 ml-2 space-y-4">
                  {(!device.history || device.history.length === 0) ? (
                    <p className="text-xs text-muted-foreground py-2 -ml-8 text-center">Nenhum evento registrado.</p>
                  ) : (
                    device.history.map((log: any) => (
                      <div key={log.id} className="relative text-xs">
                        <span className="absolute -left-[28px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-card flex items-center justify-center"></span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">{log.action}</span>
                            <span className="text-[9px] text-muted-foreground font-mono">
                              {new Date(log.date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          {log.details && <p className="text-[10px] text-muted-foreground">{log.details}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Ordens de Serviço Associadas */}
              <div className="space-y-3 pt-2">
                <h5 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground pb-1 border-b border-border/20">Histórico de Ordens de Serviço</h5>
                {serviceOrders.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center border border-dashed border-border rounded-md">
                    Nenhuma ordem de serviço vinculada a este equipamento.
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-border/40 rounded-md">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/20">
                          <th className="py-2 px-3 font-mono text-[9px] text-muted-foreground uppercase">OS</th>
                          <th className="py-2 px-3 text-muted-foreground">Defeito Relatado</th>
                          <th className="py-2 px-3 text-muted-foreground">Status</th>
                          <th className="py-2 px-3 text-muted-foreground text-right">Faturamento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {serviceOrders.map((os: any) => (
                          <tr key={os.id} className="hover:bg-muted/5 transition-colors">
                            <td className="py-2 px-3 font-mono font-semibold text-foreground">#{os.number}</td>
                            <td className="py-2 px-3 text-muted-foreground truncate max-w-[180px]">
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
