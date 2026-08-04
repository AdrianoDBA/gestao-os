"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import LoginPage from "@/app/login/page"
import { Button } from "@/components/ui/button"
import { getCurrentUser, checkPermission, setCurrentUser } from "@/lib/auth-store"
import { 
  Shield, 
  Sparkles, 
  X, 
  LogOut,
  Users,
  ShieldCheck,
  Wrench,
  BookOpen,
  History,
  LayoutDashboard,
  FileText,
  Package,
  DollarSign,
  UserCheck,
  Settings,
  Bell,
  Cpu
} from "lucide-react"

import { SetupWizard } from "./setup-wizard"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [currentUser, setUser] = useState<any>(null)
  const [systemConfigured, setSystemConfigured] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentPath, setCurrentPath] = useState("")
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([
    { id: "n1", title: "Estoque Crítico", desc: "Peça Tela Frontal iPhone 13 abaixo do mínimo (1 un.)", date: "Hoje" },
    { id: "n2", title: "Ordem de Serviço Atrasada", desc: "OS #1041 está há mais de 48h sem alteração de status", date: "Ontem" },
    { id: "n3", title: "Garantia expirando", desc: "Garantia do conserto OS #1032 expira em 3 dias", date: "Há 2 dias" },
    { id: "n4", title: "Faturamento pendente", desc: "Parcela do cliente Carlos está em atraso há 5 dias", date: "Há 5 dias" }
  ])

  useEffect(() => {
    // Limpeza de Service Workers e Caches legados (silenciosa e sem recarga forçada que trava o menu)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister()
        }
        if ("caches" in window) {
          caches.keys().then(cacheKeys => {
            for (const key of cacheKeys) {
              caches.delete(key)
            }
          })
        }
      })
    }

    const configured = localStorage.getItem("system_configured") === "true"
    setSystemConfigured(configured)

    const user = getCurrentUser()
    if (user && window.location.pathname === "/login") {
      (window as any).location.href = "/"
      return
    }

    setMounted(true)
    setUser(user)
    setLoading(false)
    setCurrentPath(window.location.pathname)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 font-medium">Carregando laboratório...</span>
        </div>
      </div>
    )
  }

  // Se o sistema não estiver configurado, exibe apenas o Setup Wizard, bloqueando todo o restante
  if (!systemConfigured) {
    return (
      <SetupWizard
        onComplete={() => {
          setSystemConfigured(true)
          setUser(getCurrentUser())
        }}
      />
    )
  }

  // Se não logado, renderiza apenas a tela de login
  if (!currentUser) {
    return <LoginPage />
  }

  // Mapeamento de rotas para módulos de permissão
  const routeModuleMap: Record<string, string> = {
    "/": "dashboard",
    "/service-orders": "orders",
    "/inventory": "inventory",
    "/financial": "financial",
    "/customers": "customers",
    "/devices": "devices",
    "/audit": "audit",
    "/users": "settings",
    "/roles": "settings",
    "/settings": "settings",
    "/technicians": "orders"
  }

  // Verifica permissão da rota atual
  const activeModule = routeModuleMap[currentPath] || "dashboard"
  const hasAccess = activeModule === "dashboard" || checkPermission(activeModule === "orders" ? "orders" : activeModule, "view")

  const handleLogout = () => {
    setCurrentUser(null)
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans flex overflow-hidden w-full text-xs">
      
      {/* Barra Lateral Minimalista Dinâmica (RBAC) */}
      <aside className="w-64 border-r border-border bg-card/40 flex flex-col h-screen shrink-0 hidden md:flex">
        <div className="h-14 border-b border-border flex items-center px-6 gap-2 shrink-0">
          <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-black font-bold text-xs">
            G
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">Gestão OS</span>
          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-mono">
            SaaS Ready
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Dashboard (Sempre acessível) */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
              currentPath === "/" 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          {/* Ordens de Serviço */}
          {checkPermission("orders", "view") && (
            <Link
              href="/service-orders"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                currentPath === "/service-orders" 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              <FileText className="w-4 h-4" />
              Ordens de Serviço
            </Link>
          )}

          {/* Técnicos (Perfis e Produtividade) */}
          {checkPermission("orders", "view") && (
            <Link
              href="/technicians"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                currentPath === "/technicians" 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Técnicos de OS
            </Link>
          )}

          {/* Rede de Especialistas (Fase 3/4) */}
          <Link
            href="/partners"
            className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
              currentPath === "/partners" 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-500" />
            Rede de Especialistas
          </Link>

          {/* Estoque de Peças */}
          {checkPermission("inventory", "view") && (
            <Link
              href="/inventory"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                currentPath === "/inventory" 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              <Package className="w-4 h-4" />
              Estoque de Peças
            </Link>
          )}

          {/* Financeiro */}
          {checkPermission("financial", "view") && (
            <Link
              href="/financial"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                currentPath === "/financial" 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Financeiro
            </Link>
          )}

          {/* Clientes */}
          {checkPermission("customers", "view") && (
            <Link
              href="/customers"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                currentPath === "/customers" 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              <Users className="w-4 h-4" />
              Clientes
            </Link>
          )}

          {/* Equipamentos */}
          {checkPermission("devices", "view") && (
            <Link
              href="/devices"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                currentPath === "/devices" 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              <Wrench className="w-4 h-4" />
              Equipamentos
            </Link>
          )}

          {/* Auditoria */}
          {checkPermission("audit", "view") && (
            <Link
              href="/audit"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                currentPath === "/audit" 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              <History className="w-4 h-4" />
              Auditoria
            </Link>
          )}

          {/* Base de Conhecimento */}
          <Link
            href="/knowledge-base"
            className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
              currentPath === "/knowledge-base" 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Base de Conhecimento
          </Link>

          {/* Controle de Acesso e Perfis (Configurações) */}
          {checkPermission("settings", "view") && (
            <div className="pt-4 border-t border-border/20 space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest pl-3 block mb-1">Acesso & Segurança</span>
              
              <Link
                href="/users"
                className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                  currentPath === "/users" 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                <Users className="w-4 h-4 text-zinc-400" />
                Usuários
              </Link>

              <Link
                href="/roles"
                className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                  currentPath === "/roles" 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                Perfis & Permissões
              </Link>

              <Link
                href="/settings"
                className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                  currentPath === "/settings" 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                Configurações
              </Link>
            </div>
          )}
        </nav>

        {/* Rodapé Usuário Logado */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-card/25 shrink-0 gap-1.5">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              className="w-8 h-8 rounded-full border border-border"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-foreground truncate">{currentUser.name}</p>
              <p className="text-[9px] text-muted-foreground truncate">{currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-muted-foreground hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Top Header */}
        <header className="h-14 border-b border-border bg-card/20 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-sm font-semibold text-foreground">
            {currentPath === "/" 
              ? "Dashboard Geral" 
              : currentPath === "/users" 
              ? "Usuários do Sistema" 
              : currentPath === "/roles" 
              ? "Perfis e Permissões"
              : currentPath === "/technicians"
              ? "Fidelidade e Produtividade de Técnicos"
              : "Assistência de Bancada"}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-1.5 rounded-md hover:bg-muted/15 text-muted-foreground hover:text-foreground transition-colors"
              title="Notificações Globais"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              )}
            </button>

            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SaaS Central: Online
            </span>
          </div>
        </header>

        {/* Exibição condicional de Acesso */}
        <main className="flex-1 overflow-y-auto p-8 min-w-0">
          {hasAccess ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-800/40 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Acesso Negado</h3>
                <p className="text-xs text-muted-foreground">
                  Seu perfil de <span className="font-semibold text-foreground">&quot;{currentUser.role}&quot;</span> não possui permissão para visualizar este módulo. Contate o administrador.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/"}>
                Voltar ao Dashboard
              </Button>
            </div>
          )}
        </main>
      {/* DRAWER FLUTUANTE DE NOTIFICAÇÕES CRÍTICAS (Sino) */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNotifOpen(false)} />
          
          <div className="relative w-80 bg-zinc-900 border-l border-zinc-800 h-full shadow-2xl z-10 flex flex-col p-5">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-zinc-400" /> Central de Pendências
              </h3>
              <button onClick={() => setIsNotifOpen(false)} className="text-zinc-500 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {notifications.length === 0 ? (
                <p className="text-[10px] text-zinc-500 text-center py-10 italic">Nenhuma pendência crítica.</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-3 border border-zinc-800/80 rounded bg-zinc-950/20 text-[10px] space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-zinc-200">{n.title}</span>
                      <span className="text-zinc-500 text-[9px]">{n.date}</span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">{n.desc}</p>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setNotifications(prev => prev.filter(item => item.id !== n.id))
                        }}
                        className="text-[9px] text-zinc-500 hover:text-zinc-300 font-bold"
                      >
                        Dispensar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    </div>
  )
}
