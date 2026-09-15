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
  Cpu,
  Key,
  AlertTriangle,
  Download,
  HardDrive,
  ShieldAlert,
  CheckCircle2,
  MessageSquare,
  Smartphone
} from "lucide-react"

import { SetupWizard } from "./setup-wizard"
import { getActiveLicense, activateLicense, LicenseInfo } from "@/lib/license-service"
import { performAutoBackup, getBackupSettings, getIntervalMs } from "@/lib/backup-service"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [currentUser, setUser] = useState<any>(null)
  const [systemConfigured, setSystemConfigured] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentPath, setCurrentPath] = useState("")
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  // Estados de Licenciamento
  const [license, setLicense] = useState<LicenseInfo | null>(null)
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false)
  const [licenseInputKey, setLicenseInputKey] = useState("")
  const [licenseMsg, setLicenseMsg] = useState<{ text: string; isError: boolean } | null>(null)

  // Estados de PWA
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstallPwa, setCanInstallPwa] = useState(false)

  const [notifications, setNotifications] = useState<any[]>([
    { id: "n1", title: "Estoque Crítico", desc: "Peça Tela Frontal iPhone 13 abaixo do mínimo (1 un.)", date: "Hoje" },
    { id: "n2", title: "Ordem de Serviço Atrasada", desc: "OS #1041 está há mais de 48h sem alteração de status", date: "Ontem" },
    { id: "n3", title: "Garantia expirando", desc: "Garantia do conserto OS #1032 expira em 3 dias", date: "Há 2 dias" },
    { id: "n4", title: "Faturamento pendente", desc: "Parcela do cliente Carlos está em atraso há 5 dias", date: "Há 5 dias" }
  ])

  useEffect(() => {
    // 1. Captura prompt nativo de instalação do PWA
    const handleBeforeInstall = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstallPwa(true)
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // 2. Verifica se o sistema foi configurado
    const configured = localStorage.getItem("system_configured") === "true"
    setSystemConfigured(configured)

    // 3. Inicializa e valida licença
    const activeLic = getActiveLicense()
    setLicense(activeLic)

    // 4. Usuário logado
    const user = getCurrentUser()
    if (user && window.location.pathname === "/login") {
      (window as any).location.href = "/"
      return
    }

    setMounted(true)
    setUser(user)
    setLoading(false)
    setCurrentPath(window.location.pathname)

    // 5. Timer de Segundo Plano (Checagem de Licença e Backup Automático Horário)
    const backgroundInterval = setInterval(() => {
      // Atualiza licença
      const currentLic = getActiveLicense()
      setLicense(currentLic)

      // Executa Backup Automático conforme intervalo configurado
      const bkpSettings = getBackupSettings()
      if (bkpSettings.interval !== "manual") {
        const intervalMs = getIntervalMs(bkpSettings.interval)
        const lastTime = bkpSettings.lastBackupAt ? new Date(bkpSettings.lastBackupAt).getTime() : 0
        if (Date.now() - lastTime >= intervalMs) {
          performAutoBackup(`Backup Automático (${bkpSettings.interval})`)
        }
      }
    }, 45000) // roda a cada 45 segundos

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      clearInterval(backgroundInterval)
    }
  }, [])

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setCanInstallPwa(false)
    }
    setDeferredPrompt(null)
  }

  const handleActivateNewLicense = () => {
    setLicenseMsg(null)
    if (!licenseInputKey.trim()) {
      setLicenseMsg({ text: "Insira a chave de ativação completa.", isError: true })
      return
    }

    const res = activateLicense(licenseInputKey)
    if (res.success) {
      setLicenseMsg({ text: res.message, isError: false })
      setLicense(getActiveLicense())
      setLicenseInputKey("")
      setTimeout(() => {
        setIsLicenseModalOpen(false)
        setLicenseMsg(null)
      }, 1800)
    } else {
      setLicenseMsg({ text: res.message, isError: true })
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 font-medium">Iniciando laboratório local...</span>
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
          setLicense(getActiveLicense())
        }}
      />
    )
  }

  // Se não logado, renderiza apenas a tela de login
  if (!currentUser) {
    return <LoginPage />
  }

  // =========================================================================
  // BLOQUEIO TOTAL POR LICENÇA EXPIRADA OU INVÁLIDA
  // =========================================================================
  if (license && (license.isExpired || license.status === "INVALID")) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 text-xs select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]" />
        
        <div className="w-full max-w-[500px] bg-zinc-900/90 border border-red-800/80 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-8 h-8 text-red-500 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              Licença Expirada <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800">Bloqueado</span>
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              O período de validade da sua licença do <strong>Gestão OS</strong> expirou em{" "}
              <span className="text-white font-semibold">{new Date(license.expiresAt).toLocaleDateString("pt-BR")}</span>.
              Para desbloquear sua bancada e continuar emitindo ordens de serviço, ative uma nova chave.
            </p>
          </div>

          {/* Formulário de Ativação de Chave */}
          <div className="space-y-3 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60 text-left">
            <label className="text-[11px] font-bold text-zinc-300 block">
              Inserir Nova Chave de Ativação:
            </label>
            <input
              type="text"
              placeholder="Ex: GOS-PRO-20270915-XXXX-XXXXXXXX"
              value={licenseInputKey}
              onChange={(e) => setLicenseInputKey(e.target.value)}
              className="w-full h-10 px-3 rounded bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500 uppercase"
            />

            {licenseMsg && (
              <div className={`p-2 rounded text-[11px] flex items-center gap-1.5 ${licenseMsg.isError ? 'bg-red-950/40 text-red-400 border border-red-900' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900'}`}>
                {licenseMsg.isError ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                <span>{licenseMsg.text}</span>
              </div>
            )}

            <Button
              onClick={handleActivateNewLicense}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-9 gap-1.5"
            >
              <Key className="w-4 h-4" /> Desbloquear Sistema Agora
            </Button>
          </div>

          {/* Botão de Suporte WhatsApp Direto */}
          <div className="pt-2 border-t border-zinc-800/60 flex flex-col gap-2">
            <a
              href="https://wa.me/5581999999999?text=Ol%C3%A1%2C+preciso+renovar+a+minha+licen%C3%A7a+do+Gest%C3%A3o+OS"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-400 font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Solicitar Renovação Imediata no WhatsApp
            </a>
            <p className="text-[10px] text-zinc-500">
              Seus dados, clientes e ordens de serviço estão 100% seguros no computador local.
            </p>
          </div>
        </div>
      </div>
    )
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
        <div className="h-14 border-b border-border flex items-center px-6 gap-2 shrink-0 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              G
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">Gestão OS</span>
          </div>

          <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
            v2.0 PRO
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
              currentPath === "/" 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
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
              <FileText className="w-4 h-4 text-indigo-400" />
              Ordens de Serviço
            </Link>
          )}

          {/* Técnicos */}
          {checkPermission("orders", "view") && (
            <Link
              href="/technicians"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                currentPath === "/technicians" 
                  ? "bg-secondary text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              Técnicos de OS
            </Link>
          )}

          {/* Rede de Especialistas */}
          <Link
            href="/partners"
            className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
              currentPath === "/partners" 
                ? "bg-secondary text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
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
              <Package className="w-4 h-4 text-amber-400" />
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
              <DollarSign className="w-4 h-4 text-green-400" />
              Financeiro & Caixa
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
              <Users className="w-4 h-4 text-purple-400" />
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
              <Wrench className="w-4 h-4 text-orange-400" />
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
              <History className="w-4 h-4 text-zinc-400" />
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
            <BookOpen className="w-4 h-4 text-teal-400" />
            Base de Conhecimento
          </Link>

          {/* Configurações & Segurança */}
          {checkPermission("settings", "view") && (
            <div className="pt-4 border-t border-border/20 space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest pl-3 block mb-1">Acesso & Configurações</span>
              
              <Link
                href="/users"
                className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                  currentPath === "/users" 
                    ? "bg-secondary text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                <Users className="w-4 h-4 text-zinc-400" />
                Usuários da Bancada
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
                Configurações & Backup
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
        
        {/* BANNER DE AVISO DE EXPIRAÇÃO PRÓXIMA (<= 7 DIAS) */}
        {license && license.isExpiringSoon && (
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
              <span>
                <strong>Atenção:</strong> Sua licença do Gestão OS expira em <strong>{license.daysRemaining} dias</strong> ({new Date(license.expiresAt).toLocaleDateString("pt-BR")}). Renove agora para evitar o bloqueio da sua assistência.
              </span>
            </div>
            <button
              onClick={() => setIsLicenseModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1 rounded text-[11px] transition-colors shrink-0"
            >
              Renovar Chave
            </button>
          </div>
        )}

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
              : currentPath === "/settings"
              ? "Configurações, Licença & Backup"
              : "Assistência de Bancada"}
          </h1>
          
          <div className="flex items-center gap-3">
            {/* Botão de Instalar Aplicativo no Computador (PWA) */}
            {canInstallPwa && (
              <button
                onClick={handleInstallPwa}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600/30 text-[11px] font-bold transition-all"
                title="Instalar Gestão OS como aplicativo nativo no computador"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Instalar App Desktop
              </button>
            )}

            {/* Badge de Licença Clicável */}
            {license && (
              <button
                onClick={() => setIsLicenseModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                  license.isExpiringSoon
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                }`}
                title="Clique para gerenciar sua licença"
              >
                <Key className="w-3 h-3" />
                <span>
                  {license.plan === "LIFETIME" 
                    ? "Vitalício" 
                    : license.plan === "TRIAL"
                    ? `Trial (${license.daysRemaining}d)`
                    : `Licença ${license.plan} (${license.daysRemaining}d)`}
                </span>
              </button>
            )}

            {/* Notificações Globais */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-1.5 rounded-md hover:bg-muted/15 text-muted-foreground hover:text-foreground transition-colors"
              title="Central de Pendências"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Status do Servidor Local */}
            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 border-l border-border pl-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Bancada Local: Online
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
      </div>

      {/* MODAL DE GERENCIAMENTO DE LICENÇA */}
      {isLicenseModalOpen && license && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsLicenseModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl z-10 space-y-5 text-xs">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Licenciamento do Software</h3>
                  <p className="text-[10px] text-muted-foreground">Status e renovação de chave comercial</p>
                </div>
              </div>
              <button onClick={() => setIsLicenseModalOpen(false)} className="text-zinc-500 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Informações da Licença Atual */}
            <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Oficina / Cliente:</span>
                <span className="font-bold text-foreground">{license.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plano Ativo:</span>
                <span className="font-bold text-blue-400 uppercase">{license.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dias Restantes:</span>
                <span className={`font-bold ${license.isExpiringSoon ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {license.daysRemaining} dias
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Validade Até:</span>
                <span className="font-bold text-foreground">
                  {new Date(license.expiresAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800/60 flex flex-col gap-1">
                <span className="text-[9px] uppercase font-bold text-zinc-500">Chave Registrada:</span>
                <code className="text-[10px] text-zinc-400 font-mono break-all select-all bg-zinc-900 p-1.5 rounded">
                  {license.key}
                </code>
              </div>
            </div>

            {/* Formulário para Inserir Nova Chave */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-foreground block">
                Ativar Nova Chave de Renovação:
              </label>
              <input
                type="text"
                placeholder="Cole sua nova chave aqui..."
                value={licenseInputKey}
                onChange={(e) => setLicenseInputKey(e.target.value)}
                className="w-full h-9 px-3 rounded bg-zinc-950 border border-zinc-800 text-foreground font-mono text-xs focus:outline-none focus:border-blue-500 uppercase"
              />

              {licenseMsg && (
                <div className={`p-2 rounded text-[11px] flex items-center gap-1.5 ${licenseMsg.isError ? 'bg-red-950/40 text-red-400 border border-red-900' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900'}`}>
                  {licenseMsg.isError ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  <span>{licenseMsg.text}</span>
                </div>
              )}

              <Button
                onClick={handleActivateNewLicense}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-9 gap-1.5"
              >
                <Key className="w-4 h-4" /> Aplicar Chave de Licença
              </Button>
            </div>

            {/* Suporte WhatsApp */}
            <div className="pt-2 border-t border-zinc-800/60">
              <a
                href="https://wa.me/5581999999999?text=Ol%C3%A1%2C+preciso+de+suporte+ou+renova%C3%A7%C3%A3o+no+Gest%C3%A3o+OS"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-400 font-medium flex items-center justify-center gap-2 transition-colors text-[11px]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Falar com Suporte no WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

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
  )
}
