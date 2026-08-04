"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  getRoles, 
  saveRoles, 
  RoleConfig, 
  RolePermissions, 
  checkPermission 
} from "@/lib/auth-store"
import { 
  Shield, 
  ShieldCheck, 
  Save, 
  Undo2, 
  AlertCircle,
  HelpCircle,
  Wrench,
  Users,
  FileText,
  Package,
  DollarSign,
  Settings
} from "lucide-react"

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleConfig[]>(getRoles())
  const [selectedRoleName, setSelectedRoleName] = useState<string>("Técnico")
  const [successMsg, setSuccessMsg] = useState("")

  const canEdit = checkPermission("settings", "edit")

  const selectedRole = roles.find(r => r.name === selectedRoleName) || roles[0]

  const handleCheckboxChange = (module: string, action: string) => {
    if (!canEdit) return

    const updatedRoles = roles.map(r => {
      if (r.name === selectedRoleName) {
        const modulePerm = { ...r.permissions[module] }
        // Inverte o estado da permissão correspondente
        const currentVal = (modulePerm as any)[action]
        ;(modulePerm as any)[action] = !currentVal

        return {
          ...r,
          permissions: {
            ...r.permissions,
            [module]: modulePerm
          }
        }
      }
      return r
    })

    setRoles(updatedRoles)
  }

  const handleSave = () => {
    saveRoles(roles)
    setSuccessMsg(`Configurações de segurança do perfil "${selectedRoleName}" salvas com sucesso!`)
    setTimeout(() => {
      setSuccessMsg("")
    }, 2500)
  }

  const handleResetDefault = () => {
    if (!window.confirm("Deseja realmente restaurar os perfis e permissões para o padrão de fábrica?")) return
    localStorage.removeItem("roles_config")
    const defaults = getRoles()
    setRoles(defaults)
    setSuccessMsg("Perfis restaurados para o padrão do sistema!")
    setTimeout(() => {
      setSuccessMsg("")
    }, 2500)
  }

  const moduleNames: { id: string; label: string; icon: any }[] = [
    { id: "customers", label: "Clientes", icon: Users },
    { id: "devices", label: "Equipamentos", icon: Wrench },
    { id: "orders", label: "Ordens de Serviço (OS)", icon: FileText },
    { id: "inventory", label: "Estoque de Peças", icon: Package },
    { id: "financial", label: "Financeiro", icon: DollarSign },
    { id: "settings", label: "Configurações & Auditoria", icon: Settings }
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-zinc-300" /> Perfis & Permissões (RBAC)
          </h2>
          <p className="text-xs text-muted-foreground">Customize as regras de acesso e governança de dados por cargo operacional.</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleResetDefault} className="gap-1 font-semibold text-zinc-400 border-zinc-800">
              <Undo2 className="w-3.5 h-3.5" /> Restaurar Padrões
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 gap-1 font-bold">
              <Save className="w-3.5 h-3.5" /> Salvar Alterações
            </Button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 text-emerald-400 rounded-lg text-center font-semibold">
          {successMsg}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid gap-6 md:grid-cols-4">
        
        {/* Coluna Esquerda: Lista de Perfis */}
        <div className="space-y-3 md:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 pl-1">Cargos Disponíveis</span>
          <div className="bg-card/25 border border-border/80 rounded-lg p-2 flex flex-col gap-1">
            {roles.map(r => (
              <button
                key={r.name}
                onClick={() => setSelectedRoleName(r.name)}
                className={`w-full text-left px-3 py-2.5 rounded-md font-semibold text-xs transition-colors flex items-center justify-between group ${
                  selectedRoleName === r.name 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                }`}
              >
                <span>{r.name}</span>
                <ShieldCheck className={`w-3.5 h-3.5 transition-opacity ${
                  selectedRoleName === r.name ? "opacity-100 text-blue-400" : "opacity-0 group-hover:opacity-60"
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Matriz de Permissões */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center gap-2 pl-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Matriz de Autorizações do Cargo</span>
            <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-wider text-zinc-300 border-zinc-700/60">{selectedRoleName}</Badge>
          </div>

          <div className="border border-border/80 rounded-lg overflow-hidden bg-card/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-card/30 text-muted-foreground font-semibold uppercase tracking-wider text-[9px]">
                  <th className="p-4 w-48">Módulo Operacional</th>
                  <th className="p-4 text-center">Visualizar</th>
                  <th className="p-4 text-center">Criar / Novo</th>
                  <th className="p-4 text-center">Editar / Salvar</th>
                  <th className="p-4 text-center">Excluir / Deletar</th>
                  <th className="p-4 text-center">Recursos Extra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-xs">
                {moduleNames.map(mod => {
                  const Icon = mod.icon
                  const permissions = selectedRole.permissions[mod.id] || { view: false, create: false, edit: false, delete: false }

                  // Mapeamento de recursos extras por módulo
                  let extraText = "N/A"
                  let extraKey = ""
                  if (mod.id === "orders") {
                    extraText = "Entregar / Cancelar"
                    extraKey = "deliver" // representará as duas
                  } else if (mod.id === "inventory") {
                    extraText = "Movimentar / Comprar"
                    extraKey = "move" // representará as duas
                  } else if (mod.id === "financial") {
                    extraText = "Receber / Pagar"
                    extraKey = "receive"
                  }

                  return (
                    <tr key={mod.id} className="hover:bg-card/25 transition-colors">
                      <td className="p-4 font-semibold text-foreground flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-zinc-400" />
                        <span>{mod.label}</span>
                      </td>
                      
                      {/* Visualizar */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded bg-background border border-border text-blue-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                          checked={!!permissions.view}
                          onChange={() => handleCheckboxChange(mod.id, "view")}
                          disabled={!canEdit}
                        />
                      </td>

                      {/* Criar */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded bg-background border border-border text-blue-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                          checked={!!permissions.create}
                          onChange={() => handleCheckboxChange(mod.id, "create")}
                          disabled={!canEdit || mod.id === "settings"}
                        />
                      </td>

                      {/* Editar */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded bg-background border border-border text-blue-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                          checked={!!permissions.edit}
                          onChange={() => handleCheckboxChange(mod.id, "edit")}
                          disabled={!canEdit}
                        />
                      </td>

                      {/* Excluir */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded bg-background border border-border text-blue-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                          checked={!!permissions.delete}
                          onChange={() => handleCheckboxChange(mod.id, "delete")}
                          disabled={!canEdit || mod.id === "settings"}
                        />
                      </td>

                      {/* Recursos Extra */}
                      <td className="p-4 text-center">
                        {extraKey ? (
                          <div className="flex flex-col items-center gap-1">
                            <input
                              type="checkbox"
                              className="rounded bg-background border border-border text-blue-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer disabled:opacity-50"
                              checked={!!(permissions as any)[extraKey]}
                              onChange={() => handleCheckboxChange(mod.id, extraKey)}
                              disabled={!canEdit}
                            />
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">{extraText}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-600 font-semibold">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Dica de Segurança */}
          <div className="flex items-start gap-2.5 p-3.5 bg-zinc-950/40 border border-zinc-800/80 rounded-lg text-muted-foreground text-[10px] leading-relaxed">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">Governança Multi-tenancy SaaS</span>
              <p>As configurações salvas nesta matriz afetam apenas os usuários cadastrados na sua empresa (Tenant). Proprietários e Administradores possuem chaves de chancelamento permanentes que sobrepõem limites.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
