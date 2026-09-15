"use client"

import React, { useState, useEffect, useMemo } from "react"
import { 
  getStoredSystemConfig, saveStoredSystemConfig, 
  getStoredSystemLogs, saveStoredSystemLogs,
  getStoredPartners, saveStoredPartners
} from "@/lib/db-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, Building2, Paintbrush, FileText, Mail, 
  Database, ShieldAlert, History, User, HardDrive, 
  Key, RefreshCw, Download, Upload, Check, AlertTriangle, Eye, Search,
  Cloud, Clock, CheckCircle2, ShieldCheck, Smartphone, Sparkles
} from "lucide-react"
import { SystemConfig, SystemLog } from "@/types"
import { 
  getActiveLicense, activateLicense, generateLicenseKey, LicenseInfo, LicensePlan 
} from "@/lib/license-service"
import { 
  getBackupSettings, saveBackupSettings, getStoredAutoBackups, performAutoBackup, 
  downloadBackupFile, restoreSystemSnapshot, BackupInterval, AutoBackupSnapshot, getIntervalMs 
} from "@/lib/backup-service"

export default function SettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"company" | "visual" | "os_financial" | "notifications" | "documents" | "backup" | "logs" | "automations" | "apikeys_webhooks" | "saas_plan" | "specialist">("company")

  // Formulário Empresa
  const [companyName, setCompanyName] = useState("")
  const [companyTrade, setCompanyTrade] = useState("")
  const [companyCNPJ, setCompanyCNPJ] = useState("")
  const [companyIE, setCompanyIE] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyCEP, setCompanyCEP] = useState("")
  const [companyCity, setCompanyCity] = useState("")
  const [companyState, setCompanyState] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")

  // Identidade Visual
  const [visualTheme, setVisualTheme] = useState<"DARK" | "LIGHT">("DARK")
  const [primaryColor, setPrimaryColor] = useState("")
  const [accentColor, setAccentColor] = useState("")

  // OS e Financeiro
  const [osPrefix, setOsPrefix] = useState("")
  const [osNextNumber, setOsNextNumber] = useState(1000)
  const [defaultWarranty, setDefaultWarranty] = useState(90)
  const [financialCurrency, setFinancialCurrency] = useState("BRL")
  const [financialInterest, setFinancialInterest] = useState(1.0)
  const [financialFine, setFinancialFine] = useState(2.0)
  const [inventoryNegative, setInventoryNegative] = useState(false)

  // SMTP & Notificações
  const [smtpHost, setSmtpHost] = useState("")
  const [smtpPort, setSmtpPort] = useState(25)
  const [smtpUser, setSmtpUser] = useState("")
  const [smtpFrom, setSmtpFrom] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [whatsappToken, setWhatsappToken] = useState("")

  // Modelos de Documentos
  const [receiptHeader, setReceiptHeader] = useState("")
  const [receiptFooter, setReceiptFooter] = useState("")
  const [warrantyTerms, setWarrantyTerms] = useState("")

  // Segurança
  const [sessionTimeout, setSessionTimeout] = useState(30)
  const [passwordLength, setPasswordLength] = useState(6)
  const [twoFactor, setTwoFactor] = useState(false)

  // Filtros de Logs
  const [logSearch, setLogSearch] = useState("")
  const [logTypeFilter, setLogTypeFilter] = useState("ALL")

  // Estado de envio de e-mail de teste
  const [testEmailInput, setTestEmailInput] = useState("")
  const [isSendingTest, setIsSendingTest] = useState(false)
  
  // Backup upload ref
  const [backupFile, setBackupFile] = useState<File | null>(null)

  // --- Estados do Épico 8 (SaaS, Automações, API & Webhooks) ---
  const [automations, setAutomations] = useState<any[]>([
    { id: "aut1", trigger: "STATUS_CHANGE_READY", action: "SEND_WHATSAPP", name: "Aviso de Pronto no WhatsApp", active: true },
    { id: "aut2", trigger: "INVENTORY_LOW", action: "CREATE_ALERT", name: "Alerta de Estoque Crítico", active: true },
    { id: "aut3", trigger: "WARRANTY_EXPIRED", action: "SEND_EMAIL", name: "Pesquisa de Satisfação pós-Garantia", active: false }
  ])

  const [apiKeys, setApiKeys] = useState<any[]>([
    { id: "key1", name: "Integração Hubspot ERP", token: "pk_live_8390238492834092384023", limit: "100 req/min", active: true }
  ])
  const [newKeyName, setNewKeyName] = useState("")

  const [webhooks, setWebhooks] = useState<any[]>([
    { id: "web1", url: "https://api.meuerp.com.br/webhooks/os", events: ["OS_CREATED", "OS_UPDATED"], active: true }
  ])
  const [webhookUrl, setWebhookUrl] = useState("")

  const [saasPlan, setSaasPlan] = useState<string>("Prata (Bronze)")
  const [saasClientLimit, setSaasClientLimit] = useState<number>(50)
  const [offlineSyncQueue, setOfflineSyncQueue] = useState<number>(0)

  // Estados de Licença e Backup Comercial
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null)
  const [licenseKeyInput, setLicenseKeyInput] = useState("")
  const [licenseFeedback, setLicenseFeedback] = useState<{ text: string; isError: boolean } | null>(null)

  // Gerador de Licenças Embutido para o Administrador (Adriano)
  const [adminGenClient, setAdminGenClient] = useState("")
  const [adminGenPlan, setAdminGenPlan] = useState<LicensePlan>("PRO")
  const [adminGenDays, setAdminGenDays] = useState(365)
  const [adminGenOutput, setAdminGenOutput] = useState("")
  const [showAdminKeyGenerator, setShowAdminKeyGenerator] = useState(false)

  // Estados de Backup
  const [backupSettingsState, setBackupSettingsState] = useState(getBackupSettings())
  const [autoBackupsList, setAutoBackupsList] = useState<AutoBackupSnapshot[]>([])
  const [backupSuccessMsg, setBackupSuccessMsg] = useState("")

  // Especialista da Rede (Fase 3/4)
  const [specialistBio, setSpecialistBio] = useState("")
  const [specialistSpecialties, setSpecialistSpecialties] = useState("")
  const [specialistTechnologies, setSpecialistTechnologies] = useState("")
  const [specialistBrands, setSpecialistBrands] = useState("")
  const [specialistDevices, setSpecialistDevices] = useState("")
  const [specialistServiceType, setSpecialistServiceType] = useState<"PRESENTIAL" | "REMOTE" | "HYBRID">("HYBRID")
  const [specialistCity, setSpecialistCity] = useState("")
  const [specialistState, setSpecialistState] = useState("")

  useEffect(() => {
    setLicenseInfo(getActiveLicense())
    setBackupSettingsState(getBackupSettings())
    setAutoBackupsList(getStoredAutoBackups())
    const loadedConfig = getStoredSystemConfig()
    setConfig(loadedConfig)
    setLogs(getStoredSystemLogs())
    
    // Sincroniza formulários
    setCompanyName(loadedConfig.company.name)
    setCompanyTrade(loadedConfig.company.tradeName || "")
    setCompanyCNPJ(loadedConfig.company.cnpj)
    setCompanyIE(loadedConfig.company.ie || "")
    setCompanyAddress(loadedConfig.company.address)
    setCompanyCEP(loadedConfig.company.cep)
    setCompanyCity(loadedConfig.company.city)
    setCompanyState(loadedConfig.company.state)
    setCompanyPhone(loadedConfig.company.phone)
    setCompanyEmail(loadedConfig.company.email)
    
    setVisualTheme(loadedConfig.visual.theme)
    setPrimaryColor(loadedConfig.visual.primaryColor)
    setAccentColor(loadedConfig.visual.accentColor)

    setOsPrefix(loadedConfig.os.prefix)
    setOsNextNumber(loadedConfig.os.nextNumber)
    setDefaultWarranty(loadedConfig.os.defaultWarrantyDays)
    
    setFinancialCurrency(loadedConfig.financial.currency)
    setFinancialInterest(loadedConfig.financial.interestDefault)
    setFinancialFine(loadedConfig.financial.fineDefault)
    setInventoryNegative(loadedConfig.inventory.allowNegativeStock)

    setSmtpHost(loadedConfig.smtp.host)
    setSmtpPort(loadedConfig.smtp.port)
    setSmtpUser(loadedConfig.smtp.user)
    setSmtpFrom(loadedConfig.smtp.from)

    setWhatsappNumber(loadedConfig.whatsapp.number)
    setWhatsappToken(loadedConfig.whatsapp.token)

    setReceiptHeader(loadedConfig.templates.receiptHeader)
    setReceiptFooter(loadedConfig.templates.receiptFooter)
    setWarrantyTerms(loadedConfig.templates.warrantyTerms)

    setSessionTimeout(loadedConfig.security.sessionTimeoutMinutes)
    setPasswordLength(loadedConfig.security.passwordMinLength)
    setTwoFactor(loadedConfig.security.twoFactorEnabled)

    // Carrega dados do especialista se existirem
    const partnersList = getStoredPartners()
    const myProfile = partnersList.find((p: any) => p.id === "my_tenant_profile")
    if (myProfile) {
      setSpecialistBio(myProfile.bio || "")
      setSpecialistSpecialties(myProfile.specialties.join(", "))
      setSpecialistTechnologies(myProfile.technologies.join(", "))
      setSpecialistBrands(myProfile.brands.join(", "))
      setSpecialistDevices(myProfile.devices.join(", "))
      setSpecialistServiceType(myProfile.serviceType)
      setSpecialistCity(myProfile.city)
      setSpecialistState(myProfile.state)
    } else {
      setSpecialistCity(loadedConfig.company.city || "")
      setSpecialistState(loadedConfig.company.state || "")
    }

    setMounted(true)
  }, [])

  // Aplicação Dinâmica de Identidade Visual e Temas
  const handleApplyTheme = (theme: "LIGHT" | "DARK") => {
    setVisualTheme(theme)
    if (typeof window !== "undefined") {
      const html = document.documentElement
      if (theme === "LIGHT") {
        html.classList.remove("dark")
      } else {
        html.classList.add("dark")
      }
    }
  }

  // Lógica de Salvar Configurações
  const handleSave = () => {
    if (!config) return

    const updatedConfig: SystemConfig = {
      ...config,
      company: {
        ...config.company,
        name: companyName,
        tradeName: companyTrade,
        cnpj: companyCNPJ,
        ie: companyIE,
        address: companyAddress,
        cep: companyCEP,
        city: companyCity,
        state: companyState,
        phone: companyPhone,
        email: companyEmail
      },
      visual: {
        ...config.visual,
        theme: visualTheme,
        primaryColor,
        accentColor
      },
      os: {
        ...config.os,
        prefix: osPrefix,
        nextNumber: osNextNumber,
        defaultWarrantyDays: defaultWarranty
      },
      financial: {
        ...config.financial,
        currency: financialCurrency,
        interestDefault: financialInterest,
        fineDefault: financialFine
      },
      inventory: {
        ...config.inventory,
        allowNegativeStock: inventoryNegative
      },
      smtp: {
        ...config.smtp,
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        from: smtpFrom
      },
      whatsapp: {
        ...config.whatsapp,
        number: whatsappNumber,
        token: whatsappToken
      },
      templates: {
        ...config.templates,
        receiptHeader,
        receiptFooter,
        warrantyTerms
      },
      security: {
        ...config.security,
        sessionTimeoutMinutes: sessionTimeout,
        passwordMinLength: passwordLength,
        twoFactorEnabled: twoFactor
      }
    }

    setConfig(updatedConfig)
    saveStoredSystemConfig(updatedConfig)

    // Registra Log de Auditoria
    const newLog: SystemLog = {
      id: `log_settings_${Date.now()}`,
      date: new Date().toISOString(),
      user: "Adriano (Você)",
      ip: "127.0.0.1",
      action: "Parâmetros do sistema reconfigurados",
      type: "SYSTEM"
    }
    const updatedLogs = [newLog, ...logs]
    setLogs(updatedLogs)
    saveStoredSystemLogs(updatedLogs)

    alert("Configurações salvas e aplicadas com sucesso!")
  }

  // Lógica de Salvar Perfil de Especialista da Rede
  const handleSaveSpecialist = () => {
    if (!specialistBio.trim() || !specialistSpecialties.trim()) {
      alert("Por favor, preencha a Bio / Apresentação e as Especialidades para poder publicar na Rede de Especialistas.")
      return
    }
    const partnersList = getStoredPartners()
    const updated = partnersList.filter((p: any) => p.id !== "my_tenant_profile")
    
    const newProfile = {
      id: "my_tenant_profile",
      name: companyTrade || companyName || "Minha Assistência",
      email: companyEmail || "contato@empresa.com",
      bio: specialistBio,
      specialties: specialistSpecialties.split(",").map(s => s.trim()).filter(Boolean),
      technologies: specialistTechnologies.split(",").map(t => t.trim()).filter(Boolean),
      brands: specialistBrands.split(",").map(b => b.trim()).filter(Boolean),
      devices: specialistDevices.split(",").map(d => d.trim()).filter(Boolean),
      city: specialistCity || companyCity || "São Paulo",
      state: specialistState || companyState || "SP",
      serviceType: specialistServiceType,
      rating: 5.0,
      reviews: []
    }

    saveStoredPartners([newProfile, ...updated])

    // Registra Log de Auditoria
    const newLog: SystemLog = {
      id: `log_specialist_${Date.now()}`,
      date: new Date().toISOString(),
      user: "Adriano (Você)",
      ip: "127.0.0.1",
      action: "Perfil publicado na Rede de Especialistas",
      type: "SYSTEM"
    }
    const updatedLogs = [newLog, ...logs]
    setLogs(updatedLogs)
    saveStoredSystemLogs(updatedLogs)

    alert("Perfil de especialista publicado na Rede Nacional de Especialistas com sucesso!")
  }

  // Simular Envio de E-mail de Teste SMTP
  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEmailInput.trim()) return

    setIsSendingTest(true)
    setTimeout(() => {
      setIsSendingTest(false)
      alert(`SMTP SMTP-TEST: E-mail de homologação enviado com sucesso para ${testEmailInput}!`)
      setTestEmailInput("")
    }, 1500)
  }

  // Exportar Backup de Banco (JSON do localStorage)
  const handleExportBackup = () => {
    if (typeof window === "undefined") return

    const backupData: Record<string, any> = {}
    const keys = [
      "customers_list", "devices_list", "orders_list", 
      "inventory_list", "transactions_list", "system_config", "system_logs"
    ]

    keys.forEach(k => {
      const val = localStorage.getItem(k)
      if (val) backupData[k] = JSON.parse(val)
    })

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2))
    const dlAnchorElem = document.createElement("a")
    dlAnchorElem.setAttribute("href", dataStr)
    dlAnchorElem.setAttribute("download", `backup_gestao_os_${new Date().toISOString().split("T")[0]}.json`)
    dlAnchorElem.click()

    // Registra Log
    const newLog: SystemLog = {
      id: `log_backup_${Date.now()}`,
      date: new Date().toISOString(),
      user: "Adriano (Você)",
      ip: "127.0.0.1",
      action: "Backup manual do banco de dados exportado",
      type: "SYSTEM"
    }
    const updatedLogs = [newLog, ...logs]
    setLogs(updatedLogs)
    saveStoredSystemLogs(updatedLogs)
  }

  // Importar / Restaurar Backup
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        if (confirm("ATENÇÃO: A restauração irá sobrescrever todos os dados atuais do sistema! Deseja continuar?")) {
          Object.entries(json).forEach(([key, val]) => {
            localStorage.setItem(key, JSON.stringify(val))
          })
          alert("Banco de dados restaurado com sucesso! A página será reiniciada.")
          window.location.reload()
        }
      } catch (err) {
        alert("Erro ao ler o arquivo de backup. Verifique se o formato JSON é válido.")
      }
    }
    reader.readAsText(file)
  }

  // Filtro de logs de auditoria
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchSearch =
        l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.user.toLowerCase().includes(logSearch.toLowerCase())
      const matchType = logTypeFilter === "ALL" || l.type === logTypeFilter
      return matchSearch && matchType
    })
  }, [logs, logSearch, logTypeFilter])

  if (!mounted || !config) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 font-medium">Carregando painel administrativo...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-border/40 pb-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Administração & Configurações</h2>
          <p className="text-sm text-muted-foreground">Defina a identidade visual, parâmetros de faturamento, SMTP de e-mails e backups.</p>
        </div>
        <Button variant="default" size="sm" onClick={activeTab === "specialist" ? handleSaveSpecialist : handleSave} className="gap-2">
          <Check className="w-4 h-4" /> Salvar Configurações
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/30 gap-4 overflow-x-auto scrollbar-none">
        {([
          { id: "company", label: "Dados da Empresa", icon: Building2 },
          { id: "specialist", label: "Perfil de Especialista (Rede)", icon: Settings },
          { id: "visual", label: "Identidade Visual", icon: Paintbrush },
          { id: "os_financial", label: "OS & Financeiro", icon: FileText },
          { id: "notifications", label: "SMTP & Notificações", icon: Mail },
          { id: "documents", label: "Modelos de Documentos", icon: FileText },
          { id: "backup", label: "Backup & Google Drive", icon: Cloud },
          { id: "logs", label: "Auditoria & Logs", icon: History },
          { id: "automations", label: "Automações", icon: RefreshCw },
          { id: "apikeys_webhooks", label: "API & Webhooks", icon: Key },
          { id: "saas_plan", label: "Licenciamento Comercial", icon: ShieldCheck }
        ] as const).map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* RENDERIZAÇÃO DAS ABAS */}
      <div className="space-y-6">
        
        {/* ABA 1: Dados da Empresa */}
        {activeTab === "company" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dados Cadastrais da Empresa</CardTitle>
              <CardDescription>Estes dados serão exibidos no cabeçalho das ordens de serviço impressas e comprovantes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Nome da Empresa</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Nome Fantasia</label>
                  <input type="text" value={companyTrade} onChange={e => setCompanyTrade(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">CNPJ</label>
                  <input type="text" value={companyCNPJ} onChange={e => setCompanyCNPJ(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Inscrição Estadual (IE)</label>
                  <input type="text" value={companyIE} onChange={e => setCompanyIE(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Endereço Completo</label>
                <input type="text" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">CEP</label>
                  <input type="text" value={companyCEP} onChange={e => setCompanyCEP(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Cidade</label>
                  <input type="text" value={companyCity} onChange={e => setCompanyCity(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Estado</label>
                  <input type="text" value={companyState} onChange={e => setCompanyState(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Telefone Comercial / WhatsApp</label>
                  <input type="text" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">E-mail de Suporte/Contato</label>
                  <input type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ABA: Perfil de Especialista da Rede (Fase 3/4) */}
        {activeTab === "specialist" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-500">Perfil Profissional na Rede de Especialistas</CardTitle>
              <CardDescription>Publique as especialidades da sua assistência para ser localizado por clientes e pela IA de Match.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Bio / Apresentação da Assistência</label>
                <textarea 
                  value={specialistBio} 
                  onChange={e => setSpecialistBio(e.target.value)} 
                  placeholder="Ex: Laboratório especializado em microssoldagem eletrônica de alta precisão e reparos em placas..."
                  className="w-full h-20 p-2 rounded bg-background border border-border focus:outline-none resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Especialidades (separadas por vírgula)</label>
                  <input 
                    type="text" 
                    value={specialistSpecialties} 
                    onChange={e => setSpecialistSpecialties(e.target.value)} 
                    placeholder="Ex: Amplificador Valvulado, Reparo de Placa Mãe, Reballing BGA"
                    className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Tecnologias Dominadas (separadas por vírgula)</label>
                  <input 
                    type="text" 
                    value={specialistTechnologies} 
                    onChange={e => setSpecialistTechnologies(e.target.value)} 
                    placeholder="Ex: Valvulado, Analógico, SMD, BGA"
                    className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Marcas Atendidas (separadas por vírgula)</label>
                  <input 
                    type="text" 
                    value={specialistBrands} 
                    onChange={e => setSpecialistBrands(e.target.value)} 
                    placeholder="Ex: Marshall, Fender, Apple, Samsung"
                    className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Equipamentos Atendidos (separadas por vírgula)</label>
                  <input 
                    type="text" 
                    value={specialistDevices} 
                    onChange={e => setSpecialistDevices(e.target.value)} 
                    placeholder="Ex: Audio, Smartphone, Notebook, Videogame"
                    className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Tipo de Atendimento</label>
                  <select
                    value={specialistServiceType}
                    onChange={e => setSpecialistServiceType(e.target.value as any)}
                    className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none text-foreground"
                  >
                    <option value="PRESENTIAL">Presencial (Laboratório Físico)</option>
                    <option value="REMOTE">Remoto (Delivery / Correios)</option>
                    <option value="HYBRID">Híbrido (Ambos)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Cidade de Atuação</label>
                  <input 
                    type="text" 
                    value={specialistCity} 
                    onChange={e => setSpecialistCity(e.target.value)} 
                    placeholder="Ex: São Paulo"
                    className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Estado (UF)</label>
                  <input 
                    type="text" 
                    value={specialistState} 
                    onChange={e => setSpecialistState(e.target.value)} 
                    placeholder="Ex: SP"
                    className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" 
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleSaveSpecialist} 
                  type="button" 
                  className="bg-emerald-500 hover:bg-emerald-600 text-xs text-white font-bold h-9 w-full md:w-auto px-6"
                >
                  Salvar e Publicar Perfil na Rede
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ABA 2: Identidade Visual */}
        {activeTab === "visual" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Visual & Tema do Sistema</CardTitle>
              <CardDescription>Mude instantaneamente as cores da interface e o tema principal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold block mb-1.5">Selecione o Tema Principal</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApplyTheme("DARK")}
                    className={`px-4 py-2 border rounded font-semibold transition-all ${
                      visualTheme === "DARK" ? "bg-white text-black border-white" : "border-border text-muted-foreground hover:bg-muted/10"
                    }`}
                  >
                    Tema Dark (Fidelidade Agenciada)
                  </button>
                  <button
                    onClick={() => handleApplyTheme("LIGHT")}
                    className={`px-4 py-2 border rounded font-semibold transition-all ${
                      visualTheme === "LIGHT" ? "bg-zinc-950 text-white border-zinc-950" : "border-border text-muted-foreground hover:bg-muted/10"
                    }`}
                  >
                    Tema Light (Claro)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold block">Cor de Destaque da Marca (Primary Accent)</label>
                  <div className="flex gap-2">
                    <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-8 h-8 rounded border border-border bg-transparent p-0 cursor-pointer" />
                    <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="flex-1 h-8 px-2 rounded bg-background border border-border focus:outline-none font-mono" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold block">Cor do Fundo Principal</label>
                  <div className="flex gap-2">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded border border-border bg-transparent p-0 cursor-pointer" />
                    <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 h-8 px-2 rounded bg-background border border-border focus:outline-none font-mono" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ABA 3: OS & Financeiro */}
        {activeTab === "os_financial" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configurações Operacionais & Financeiras</CardTitle>
              <CardDescription>Parâmetros que determinam regras de numeração de OS, juros de atraso e controle de estoque.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Prefixo da OS</label>
                  <input type="text" value={osPrefix} onChange={e => setOsPrefix(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Próximo Número Sequencial</label>
                  <input type="number" value={osNextNumber} onChange={e => setOsNextNumber(Number(e.target.value))} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Garantia Padrão (Dias)</label>
                  <input type="number" value={defaultWarranty} onChange={e => setDefaultWarranty(Number(e.target.value))} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-border/20 pt-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Moeda do Sistema</label>
                  <select value={financialCurrency} onChange={e => setFinancialCurrency(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none">
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Juros Padrão p/ Atraso (% a.m.)</label>
                  <input type="number" step="0.1" value={financialInterest} onChange={e => setFinancialInterest(Number(e.target.value))} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Multa Padrão p/ Atraso (%)</label>
                  <input type="number" step="0.1" value={financialFine} onChange={e => setFinancialFine(Number(e.target.value))} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
              </div>

              <div className="border-t border-border/20 pt-4 flex items-center justify-between p-2 rounded bg-zinc-950/20">
                <div>
                  <p className="font-semibold text-foreground">Permitir Faturamento de Estoque Negativo</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Permite concluir Ordens de Serviço contendo peças cujo estoque está zerado.</p>
                </div>
                <input
                  type="checkbox"
                  checked={inventoryNegative}
                  onChange={e => setInventoryNegative(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-background cursor-pointer focus:ring-0"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ABA 4: SMTP & Notificações */}
        {activeTab === "notifications" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* E-mail / SMTP */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configurações de E-mail (SMTP)</CardTitle>
                <CardDescription>Defina as credenciais para o disparo automático de orçamentos e termos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Servidor SMTP (Host)</label>
                  <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Porta SMTP</label>
                    <input type="number" value={smtpPort} onChange={e => setSmtpPort(Number(e.target.value))} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Remetente (From)</label>
                    <input type="text" value={smtpFrom} onChange={e => setSmtpFrom(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Usuário de Autenticação</label>
                  <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>

                {/* Testador de Envio */}
                <form onSubmit={handleSendTestEmail} className="border-t border-border/20 pt-4 space-y-2">
                  <p className="font-semibold text-foreground">Testar Envio de E-mail</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Ex: tecnico@empresa.com"
                      value={testEmailInput}
                      onChange={e => setTestEmailInput(e.target.value)}
                      className="flex-1 h-8 px-2 rounded bg-background border border-border focus:outline-none"
                    />
                    <Button type="submit" variant="outline" size="sm" className="h-8 shrink-0" disabled={isSendingTest}>
                      {isSendingTest ? "Disparando..." : "Enviar Teste"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* WhatsApp Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configurações do WhatsApp API</CardTitle>
                <CardDescription>Integração de notificações automáticas via webhook.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Número do Dispositivo Vinculado</label>
                  <input type="text" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Token de Acesso API</label>
                  <input type="password" value={whatsappToken} onChange={e => setWhatsappToken(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Mensagem de Pronto Padrão</label>
                  <textarea
                    value={config.whatsapp.autoMessageReady}
                    onChange={e => {
                      if (config) {
                        setConfig({
                          ...config,
                          whatsapp: { ...config.whatsapp, autoMessageReady: e.target.value }
                        })
                      }
                    }}
                    className="w-full h-20 p-2.5 rounded bg-background border border-border focus:outline-none resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ABA 5: Modelos de Documentos */}
        {activeTab === "documents" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Modelos de Impressão & Cabeçalhos</CardTitle>
              <CardDescription>Customize os termos e cabeçalhos anexados aos documentos impressos de faturamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Título/Cabeçalho do Recibo de OS</label>
                <input type="text" value={receiptHeader} onChange={e => setReceiptHeader(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Rodapé do Recibo de Quitação</label>
                <input type="text" value={receiptFooter} onChange={e => setReceiptFooter(e.target.value)} className="w-full h-8 px-2 rounded bg-background border border-border focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Termos da Cláusula de Garantia</label>
                <textarea
                  value={warrantyTerms}
                  onChange={e => setWarrantyTerms(e.target.value)}
                  className="w-full h-20 p-2.5 rounded bg-background border border-border focus:outline-none resize-none animate-pulse-once"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ABA 6: Backup & Google Drive */}
        {activeTab === "backup" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-blue-400" /> Backup Automático & Sincronização em Nuvem
                    </CardTitle>
                    <CardDescription>Configure a rotina de backups de hora em hora e garanta que seus dados estejam protegidos no Google Drive.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-400 font-bold">Motor Ativo</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 text-xs">
                {backupSuccessMsg && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-900 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{backupSuccessMsg}</span>
                  </div>
                )}

                {/* Configuração de Frequência e Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-border/40 rounded-xl bg-card/25 space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" /> Frequência de Backup Automático
                    </label>
                    <select
                      value={backupSettingsState.interval}
                      onChange={e => {
                        const newInterval = e.target.value as BackupInterval
                        const updated = {
                          ...backupSettingsState,
                          interval: newInterval,
                          nextBackupAt: newInterval === "manual" ? null : new Date(Date.now() + getIntervalMs(newInterval)).toISOString()
                        }
                        setBackupSettingsState(updated)
                        saveBackupSettings(updated)
                        setBackupSuccessMsg(`Rotina alterada para: ${newInterval === '1h' ? 'A cada 1 hora' : newInterval === '3h' ? 'A cada 3 horas' : newInterval === '6h' ? 'A cada 6 horas' : newInterval === '12h' ? 'A cada 12 horas' : newInterval === '24h' ? 'Diário (24h)' : 'Manual'}`)
                      }}
                      className="w-full h-8 px-2 rounded bg-background border border-border text-xs focus:outline-none"
                    >
                      <option value="1h">⚡ A cada 1 hora (Recomendado)</option>
                      <option value="3h">A cada 3 horas</option>
                      <option value="6h">A cada 6 horas</option>
                      <option value="12h">A cada 12 horas</option>
                      <option value="24h">Diário (24 horas)</option>
                      <option value="manual">Apenas Manual</option>
                    </select>
                    <p className="text-[9px] text-muted-foreground">O sistema grava snapshots automaticamente em segundo plano enquanto você trabalha.</p>
                  </div>

                  <div className="p-4 border border-border/40 rounded-xl bg-card/25 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Último Backup Realizado</p>
                    <p className="text-sm font-bold text-foreground">
                      {backupSettingsState.lastBackupAt ? new Date(backupSettingsState.lastBackupAt).toLocaleString("pt-BR") : "Nenhum ainda"}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Snapshot íntegro armazenado localmente.</p>
                  </div>

                  <div className="p-4 border border-border/40 rounded-xl bg-card/25 space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Próximo Backup Agendado</p>
                    <p className="text-sm font-bold text-blue-400">
                      {backupSettingsState.nextBackupAt ? new Date(backupSettingsState.nextBackupAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }) : "Desativado (Manual)"}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Executará automaticamente em segundo plano.</p>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={() => {
                      const snap = performAutoBackup("Manual pelo Usuário")
                      setBackupSettingsState(getBackupSettings())
                      setAutoBackupsList(getStoredAutoBackups())
                      setBackupSuccessMsg(`Backup manual gerado com sucesso (${(snap.sizeBytes / 1024).toFixed(1)} KB) com ${snap.recordCounts.orders} OSs e ${snap.recordCounts.customers} clientes!`)
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold gap-1.5 h-8"
                  >
                    <Database className="w-3.5 h-3.5" /> Executar Backup Agora
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      downloadBackupFile()
                      setBackupSuccessMsg("Arquivo .JSON gerado e pronto para salvar na sua pasta do Google Drive!")
                    }}
                    className="gap-1.5 h-8 border-border hover:bg-muted/20"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" /> Exportar Arquivo para Google Drive (.JSON)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Como sincronizar com o Google Drive / Nuvem com Custo Zero */}
            <Card className="border-blue-900/30 bg-blue-950/10">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-400" /> Como Sincronizar com seu Google Drive Pessoal (Custo Zero)
                </CardTitle>
                <CardDescription>
                  Proteja sua assistência técnica contra queima do computador ou roubo sem pagar nada por servidores em nuvem.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs leading-relaxed text-zinc-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-1">
                    <span className="text-blue-400 font-bold text-[11px]">1. Instale o Google Drive</span>
                    <p className="text-[10px] text-zinc-400">Instale o aplicativo oficial gratuito <strong>Google Drive para Computador</strong> (ou OneDrive / Dropbox) no seu PC ou Mac.</p>
                  </div>
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-1">
                    <span className="text-blue-400 font-bold text-[11px]">2. Crie a Pasta de Backups</span>
                    <p className="text-[10px] text-zinc-400">Crie uma pasta chamada <code>Google Drive/Backups_GestaoOS</code> dentro do seu drive sincronizado.</p>
                  </div>
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-1">
                    <span className="text-blue-400 font-bold text-[11px]">3. Sincronização Instantânea</span>
                    <p className="text-[10px] text-zinc-400">Ao exportar ou direcionar os downloads para lá, o Google Drive envia seus dados para os servidores do Google na mesma hora.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico dos Últimos Backups Automáticos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <History className="w-4 h-4 text-zinc-400" /> Histórico dos Últimos Snapshots Automáticos
                </CardTitle>
                <CardDescription>Restaure o sistema para um ponto anterior no tempo com apenas 1 clique.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {autoBackupsList.length === 0 ? (
                  <p className="text-zinc-500 italic py-4 text-center">Nenhum snapshot automático gerado ainda. Clique em &quot;Executar Backup Agora&quot; acima para criar o primeiro.</p>
                ) : (
                  <div className="overflow-x-auto border border-border/40 rounded-xl">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-border bg-muted/20">
                          <th className="py-2.5 px-3 text-muted-foreground">Data/Hora</th>
                          <th className="py-2.5 px-3 text-muted-foreground">Origem</th>
                          <th className="py-2.5 px-3 text-muted-foreground">Ordens (OS)</th>
                          <th className="py-2.5 px-3 text-muted-foreground">Clientes</th>
                          <th className="py-2.5 px-3 text-muted-foreground">Tamanho</th>
                          <th className="py-2.5 px-3 text-right text-muted-foreground">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {autoBackupsList.map(snap => (
                          <tr key={snap.id} className="border-b border-border/20 hover:bg-muted/10">
                            <td className="py-2.5 px-3 font-semibold text-foreground">
                              {new Date(snap.timestamp).toLocaleString("pt-BR")}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-400">{snap.label}</td>
                            <td className="py-2.5 px-3 text-foreground">{snap.recordCounts?.orders || 0}</td>
                            <td className="py-2.5 px-3 text-foreground">{snap.recordCounts?.customers || 0}</td>
                            <td className="py-2.5 px-3 text-zinc-400 font-mono">{(snap.sizeBytes / 1024).toFixed(1)} KB</td>
                            <td className="py-2.5 px-3 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Deseja realmente restaurar o backup de ${new Date(snap.timestamp).toLocaleString("pt-BR")}? Os dados atuais serão substituídos.`)) {
                                    restoreSystemSnapshot(snap.data)
                                    window.location.reload()
                                  }
                                }}
                                className="h-7 text-[10px] text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                              >
                                Restaurar Snapshot
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Restauração por Arquivo Externo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Upload className="w-4 h-4 text-zinc-400" /> Restauração a Partir de Arquivo Externo (.JSON)
                </CardTitle>
                <CardDescription>Suba um arquivo de backup que você salvou no Google Drive ou pendrive para migrar ou restaurar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreBackup}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm" className="w-full gap-2 border-dashed border-border hover:border-zinc-500 h-12">
                    <Upload className="w-4 h-4 text-zinc-400" /> Clique aqui para selecionar o arquivo .JSON do seu computador ou Google Drive
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ABA 7: Auditoria & Logs */}
        {activeTab === "logs" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Logs de Atividades & Auditoria de Administração</CardTitle>
              <CardDescription>Auditoria completa contendo operador, IP, data e alterações de configurações.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filtrar logs por ação, usuário..."
                    value={logSearch}
                    onChange={e => setLogSearch(e.target.value)}
                    className="w-full h-8 pl-8 pr-4 bg-background border border-border rounded text-xs focus:outline-none"
                  />
                </div>
                <select
                  value={logTypeFilter}
                  onChange={e => setLogTypeFilter(e.target.value)}
                  className="h-8 px-2 rounded bg-background border border-border text-xs focus:outline-none"
                >
                  <option value="ALL">Todos os Eventos</option>
                  <option value="LOGIN">Logins</option>
                  <option value="SYSTEM">Sistema</option>
                  <option value="EDIT">Edições</option>
                </select>
              </div>

              <div className="overflow-x-auto border border-border/40 rounded">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="py-2 px-3 text-muted-foreground">Data/Hora</th>
                      <th className="py-2 px-3 text-muted-foreground">Operador</th>
                      <th className="py-2 px-3 text-muted-foreground font-mono text-[9px] uppercase">IP</th>
                      <th className="py-2 px-3 text-muted-foreground">Ação Realizada</th>
                      <th className="py-2 px-3 text-muted-foreground">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted-foreground text-xs">Nenhum evento localizado no histórico.</td>
                      </tr>
                    ) : (
                      filteredLogs.map(l => (
                        <tr key={l.id} className="hover:bg-muted/5 transition-colors">
                          <td className="py-2 px-3 font-mono text-muted-foreground">
                            {new Date(l.date).toLocaleString("pt-BR")}
                          </td>
                          <td className="py-2 px-3 text-foreground font-semibold">{l.user}</td>
                          <td className="py-2 px-3 font-mono text-zinc-500">{l.ip}</td>
                          <td className="py-2 px-3 text-foreground">{l.action}</td>
                          <td className="py-2 px-3">
                            <Badge variant={l.type === "LOGIN" ? "success" : l.type === "EDIT" ? "info" : "outline"} className="text-[8px] font-bold py-0.5">
                              {l.type}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </CardContent>
          </Card>
        )}

        {/* ABA 8: Automações */}
        {activeTab === "automations" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Automações de Status e Estoque (Workflows)</CardTitle>
              <CardDescription>Configure gatilhos automatizados para otimizar a comunicação e reposição.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-3">
                {automations.map(aut => (
                  <div key={aut.id} className="flex items-center justify-between p-3 border border-border/50 rounded bg-card/25">
                    <div>
                      <p className="font-bold text-foreground">{aut.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Gatilho: <span className="font-mono text-zinc-400">{aut.trigger}</span> &rarr; Ação: <span className="font-mono text-zinc-400">{aut.action}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setAutomations(prev => prev.map(a => a.id === aut.id ? { ...a, active: !a.active } : a))
                        }}
                        className={`px-3 py-1 border rounded font-semibold transition-all ${
                          aut.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-950 text-muted-foreground border-border"
                        }`}
                      >
                        {aut.active ? "Ativa" : "Inativa"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ABA 9: API Keys & Webhooks */}
        {activeTab === "apikeys_webhooks" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* API Keys */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chaves de API Públicas (Rate Limited)</CardTitle>
                <CardDescription>Gere credenciais para integração com sistemas externos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-2">
                  {apiKeys.map(key => (
                    <div key={key.id} className="p-3 border border-border/40 rounded bg-card/25 space-y-1">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>{key.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{key.limit}</span>
                      </div>
                      <p className="font-mono text-[10px] text-zinc-400 select-all truncate">{key.token}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/20 pt-4 space-y-2">
                  <p className="font-semibold text-foreground">Gerar Nova Chave de API</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Integração Bling"
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                      className="flex-1 h-8 px-2 rounded bg-background border border-border focus:outline-none"
                    />
                    <Button
                      onClick={() => {
                        if (!newKeyName.trim()) return
                        const newKey = {
                          id: `key_${Date.now()}`,
                          name: newKeyName,
                          token: `pk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
                          limit: "100 req/min",
                          active: true
                        }
                        setApiKeys([...apiKeys, newKey])
                        setNewKeyName("")
                      }}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      Gerar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Webhooks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Webhooks Ativos do Sistema</CardTitle>
                <CardDescription>URLs que receberão notificações push automáticas de eventos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-2">
                  {webhooks.map(web => (
                    <div key={web.id} className="p-3 border border-border/40 rounded bg-card/25 space-y-1">
                      <p className="font-semibold text-foreground truncate">{web.url}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {web.events.map(ev => (
                          <Badge key={ev} variant="outline" className="text-[8px] font-mono font-bold">{ev}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/20 pt-4 space-y-2">
                  <p className="font-semibold text-foreground">Adicionar Endpoint de Webhook</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: https://meusite.com/webhook"
                      value={webhookUrl}
                      onChange={e => setWebhookUrl(e.target.value)}
                      className="flex-1 h-8 px-2 rounded bg-background border border-border focus:outline-none"
                    />
                    <Button
                      onClick={() => {
                        if (!webhookUrl.trim()) return
                        const newWeb = {
                          id: `web_${Date.now()}`,
                          url: webhookUrl,
                          events: ["OS_CREATED", "OS_UPDATED", "PAYMENT_RECEIVED"],
                          active: true
                        }
                        setWebhooks([...webhooks, newWeb])
                        setWebhookUrl("")
                      }}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ABA 10: Licenciamento Comercial */}
        {activeTab === "saas_plan" && (
          <div className="space-y-6">
            {/* Status da Licença Atual */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" /> Licenciamento do Software & Validade
                    </CardTitle>
                    <CardDescription>Controle de ativação local, período de suporte e renovação de planos comerciais.</CardDescription>
                  </div>
                  {licenseInfo && (
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] font-bold ${
                        licenseInfo.isExpiringSoon 
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {licenseInfo.isExpired ? "EXPIRADA" : licenseInfo.isExpiringSoon ? "EXPIRANDO EM BREVE" : "LICENÇA ATIVA"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 text-xs">
                {licenseFeedback && (
                  <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${licenseFeedback.isError ? 'bg-red-950/40 border border-red-900 text-red-300' : 'bg-emerald-950/40 border border-emerald-900 text-emerald-300'}`}>
                    {licenseFeedback.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    <span>{licenseFeedback.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 border border-border/40 rounded-xl bg-card/25 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Plano Registrado</p>
                    <p className="text-base font-bold text-blue-400 uppercase">{licenseInfo?.plan || "TRIAL"}</p>
                    <p className="text-[9px] text-muted-foreground">Módulos ilimitados liberados</p>
                  </div>
                  <div className="p-4 border border-border/40 rounded-xl bg-card/25 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Titular / Oficina</p>
                    <p className="text-base font-bold text-foreground truncate">{licenseInfo?.clientName || "Bancada Local"}</p>
                    <p className="text-[9px] text-muted-foreground">Instalação local isolada</p>
                  </div>
                  <div className="p-4 border border-border/40 rounded-xl bg-card/25 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Dias Restantes</p>
                    <p className={`text-base font-bold ${licenseInfo?.isExpiringSoon ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {licenseInfo?.daysRemaining} dias
                    </p>
                    <p className="text-[9px] text-muted-foreground">Contagem regressiva automática</p>
                  </div>
                  <div className="p-4 border border-border/40 rounded-xl bg-card/25 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Validade Até</p>
                    <p className="text-base font-bold text-foreground">
                      {licenseInfo?.expiresAt ? new Date(licenseInfo.expiresAt).toLocaleDateString("pt-BR") : "Indeterminada"}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Data de vencimento oficial</p>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Chave Criptográfica Ativa:</span>
                  <code className="block text-[11px] font-mono text-zinc-300 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 break-all select-all">
                    {licenseInfo?.key || "Nenhuma chave registrada"}
                  </code>
                </div>

                {/* Ativação de Nova Chave */}
                <div className="border-t border-border/20 pt-4 space-y-3">
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-blue-400" /> Ativar ou Renovar Chave de Licença
                  </p>
                  <p className="text-muted-foreground">
                    Insira a nova chave fornecida pelo suporte comercial para renovar seu período ou migrar para o plano anual/vitalício.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: GOS-PRO-20270915-XXXX-XXXXXXXX"
                      value={licenseKeyInput}
                      onChange={e => setLicenseKeyInput(e.target.value)}
                      className="flex-1 h-9 px-3 rounded bg-background border border-border font-mono text-xs focus:outline-none focus:border-blue-500 uppercase"
                    />
                    <Button
                      onClick={() => {
                        setLicenseFeedback(null)
                        if (!licenseKeyInput.trim()) {
                          setLicenseFeedback({ text: "Digite ou cole a chave de licença.", isError: true })
                          return
                        }
                        const res = activateLicense(licenseKeyInput)
                        if (res.success) {
                          setLicenseFeedback({ text: res.message, isError: false })
                          setLicenseInfo(getActiveLicense())
                          setLicenseKeyInput("")
                        } else {
                          setLicenseFeedback({ text: res.message, isError: true })
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-9 gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" /> Aplicar Chave
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Painel do Administrador: Gerador de Licenças (Uso do Adriano) */}
            <Card className="border-zinc-800 bg-zinc-950/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" /> Ferramenta do Vendedor: Gerar Licença para Cliente
                    </CardTitle>
                    <CardDescription>
                      Área exclusiva para você (Adriano) gerar chaves criptográficas para vender aos seus clientes de oficinas.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdminKeyGenerator(!showAdminKeyGenerator)}
                    className="text-[10px] h-7 border-zinc-700"
                  >
                    {showAdminKeyGenerator ? "Ocultar Gerador" : "Abrir Gerador"}
                  </Button>
                </div>
              </CardHeader>

              {showAdminKeyGenerator && (
                <CardContent className="space-y-4 text-xs pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Nome da Oficina / Cliente</label>
                      <input
                        type="text"
                        placeholder="Ex: Tech Cell Assistência"
                        value={adminGenClient}
                        onChange={e => setAdminGenClient(e.target.value)}
                        className="w-full h-8 px-2 rounded bg-background border border-border text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Plano Comercial</label>
                      <select
                        value={adminGenPlan}
                        onChange={e => setAdminGenPlan(e.target.value as LicensePlan)}
                        className="w-full h-8 px-2 rounded bg-background border border-border text-xs focus:outline-none"
                      >
                        <option value="PRO">Plano PRO (Padrão)</option>
                        <option value="ENTERPRISE">Plano ENTERPRISE (Multi-Usuários)</option>
                        <option value="TRIAL">Plano TRIAL (Demonstração)</option>
                        <option value="LIFETIME">Plano VITALÍCIO (Sem Expiração)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Duração em Dias</label>
                      <select
                        value={adminGenDays}
                        onChange={e => setAdminGenDays(parseInt(e.target.value, 10))}
                        className="w-full h-8 px-2 rounded bg-background border border-border text-xs focus:outline-none"
                      >
                        <option value={15}>15 Dias (Demonstração)</option>
                        <option value={30}>30 Dias (Mensalidade)</option>
                        <option value={90}>90 Dias (Trimestral)</option>
                        <option value={180}>180 Dias (Semestral)</option>
                        <option value={365}>365 Dias (Anual - 1 Ano)</option>
                        <option value={36500}>Vitalício (99 Anos)</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (!adminGenClient.trim()) {
                        alert("Digite o nome da oficina ou do cliente para emitir a licença.")
                        return
                      }
                      const generated = generateLicenseKey(adminGenClient, adminGenPlan, adminGenDays)
                      setAdminGenOutput(generated.key)
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-8 gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" /> Gerar Chave do Cliente Agora
                  </Button>

                  {adminGenOutput && (
                    <div className="p-4 bg-zinc-900 border border-amber-500/40 rounded-xl space-y-2">
                      <span className="text-[10px] uppercase font-bold text-amber-400">Chave Pronta para Entrega ao Cliente:</span>
                      <div className="flex gap-2 items-center">
                        <code className="flex-1 text-[11px] font-mono text-white bg-black p-2.5 rounded border border-zinc-800 break-all select-all">
                          {adminGenOutput}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(adminGenOutput)
                            alert("Chave copiada para a área de transferência! Cole no WhatsApp do cliente.")
                          }}
                          className="h-9 font-bold shrink-0 gap-1 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                        >
                          Copiar Chave
                        </Button>
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        Envie essa chave para o cliente colar na tela de primeiro acesso ou na tela de renovação.
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}


      </div>

    </div>
  )
}
