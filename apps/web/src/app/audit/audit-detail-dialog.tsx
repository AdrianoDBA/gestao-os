"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, Activity, Calendar, Shield } from "lucide-react"

interface AuditLog {
  id: string
  action: string
  entityName: string
  entityId: string
  oldValues?: Record<string, any> | null
  newValues?: Record<string, any> | null
  createdAt: string
  user: { name: string }
  ipAddress?: string
  userAgent?: string
}

interface AuditDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  log: AuditLog | null
}

export function AuditDetailDialog({ isOpen, onClose, log }: AuditDetailDialogProps) {
  if (!isOpen || !log) return null

  // Processa as chaves alteradas e faz o Diffing
  const getDiffItems = () => {
    const oldObj = log.oldValues || {}
    const newObj = log.newValues || {}
    
    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]))
    
    // Ignora metadados irrelevantes de comparação de banco
    const ignoreKeys = ["id", "createdAt", "updatedAt", "tenantId"]

    return allKeys
      .filter(key => !ignoreKeys.includes(key))
      .map(key => {
        const oldVal = oldObj[key]
        const newVal = newObj[key]

        const hasChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal)

        return {
          key,
          oldVal,
          newVal,
          hasChanged
        }
      })
      .filter(item => item.hasChanged || log.action === "CREATE" || log.action === "DELETE")
  }

  const diffItems = getDiffItems()

  const getActionBadge = (action: string) => {
    if (action.includes("CREATE")) return <Badge variant="success">Criar</Badge>
    if (action.includes("UPDATE")) return <Badge variant="info">Alterar</Badge>
    if (action.includes("DELETE")) return <Badge variant="destructive">Excluir</Badge>
    return <Badge variant="secondary">{action}</Badge>
  }

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return "vazio"
    if (typeof val === "object") return JSON.stringify(val)
    if (typeof val === "boolean") return val ? "Sim" : "Não"
    return String(val)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-zinc-400" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Trilha de Auditoria</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">ID Registro: {log.entityId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {/* Metadados Básicos */}
          <div className="grid grid-cols-2 gap-4 bg-muted/10 border border-border/20 p-3.5 rounded text-[11px] text-muted-foreground">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Ação: <span className="font-semibold text-foreground">{getActionBadge(log.action)}</span></p>
              <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Modificado em: <span className="font-semibold text-foreground font-mono">{new Date(log.createdAt).toLocaleString("pt-BR")}</span></p>
            </div>
            <div className="space-y-1">
              <p>Tabela: <span className="font-semibold text-foreground">{log.entityName}</span></p>
              <p>Autor: <span className="font-semibold text-foreground">{log.user.name}</span></p>
            </div>
            {(log.ipAddress || log.userAgent) && (
              <div className="col-span-2 border-t border-border/10 pt-2 mt-1 text-[10px] space-y-0.5">
                {log.ipAddress && <p>IP: <span className="font-mono">{log.ipAddress}</span></p>}
                {log.userAgent && <p className="truncate" title={log.userAgent}>User-Agent: <span className="font-mono">{log.userAgent}</span></p>}
              </div>
            )}
          </div>

          {/* Visualização de Diffs */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Campos Modificados (Diffing)</h4>
            
            {diffItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-6 border border-dashed border-border rounded">
                Sem alterações de atributos detectadas nos campos transacionais.
              </p>
            ) : (
              <div className="border border-border/80 rounded overflow-hidden divide-y divide-border/40">
                {diffItems.map(item => (
                  <div key={item.key} className="p-3 bg-card/25 space-y-2">
                    <span className="font-mono font-semibold text-[10px] text-zinc-400 uppercase tracking-wider block bg-muted/30 px-1.5 py-0.5 rounded inline-block">
                      {item.key}
                    </span>
                    
                    <div className="space-y-1 font-mono text-[10px]">
                      {/* Linha Antiga (Vermelho/Removido) */}
                      {(log.action !== "CREATE" && item.oldVal !== undefined) && (
                        <div className="flex items-start gap-1.5 bg-destructive/10 text-destructive border border-destructive/20 p-2 rounded">
                          <span className="font-bold select-none shrink-0">-</span>
                          <span className="break-all">{formatValue(item.oldVal)}</span>
                        </div>
                      )}
                      
                      {/* Linha Nova (Verde/Adicionado) */}
                      {(log.action !== "DELETE" && item.newVal !== undefined) && (
                        <div className="flex items-start gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-2 rounded">
                          <span className="font-bold select-none shrink-0">+</span>
                          <span className="break-all">{formatValue(item.newVal)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-border/40 bg-card/25">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar Auditoria
          </Button>
        </div>
      </div>
    </div>
  )
}
