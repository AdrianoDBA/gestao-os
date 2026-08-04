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
  Key, RefreshCw, Download, Upload, Check, AlertTriangle, Eye, Search
} from "lucide-react"
import { SystemConfig, SystemLog } from "@/types"

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
          { id: "backup", label: "Backup & BD", icon: Database },
          { id: "logs", label: "Auditoria & Logs", icon: History },
          { id: "automations", label: "Automações", icon: RefreshCw },
          { id: "apikeys_webhooks", label: "API & Webhooks", icon: Key },
          { id: "saas_plan", label: "Plano & SaaS", icon: HardDrive }
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

        {/* ABA 6: Backup & BD */}
        {activeTab === "backup" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gestão de Backup & Integridade de Dados</CardTitle>
              <CardDescription>Exporte a base de dados do laboratório para segurança ou restaure um backup existente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Exportar */}
                <div className="p-4 border border-border/40 rounded bg-card/25 space-y-3">
                  <h5 className="font-bold text-foreground flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-zinc-400" /> Exportação de Backup
                  </h5>
                  <p className="text-muted-foreground">Gera um arquivo contendo todas as tabelas (clientes, OS, estoque, transações e configurações).</p>
                  <Button variant="outline" size="sm" onClick={handleExportBackup} className="w-full gap-1">
                    Baixar Arquivo .JSON
                  </Button>
                </div>

                {/* Importar */}
                <div className="p-4 border border-border/40 rounded bg-card/25 space-y-3">
                  <h5 className="font-bold text-foreground flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-zinc-400" /> Restauração de Banco
                  </h5>
                  <p className="text-muted-foreground">Suba um arquivo de backup em formato JSON para sobrescrever a base inteira.</p>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreBackup}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" size="sm" className="w-full gap-1 border-dashed border-border hover:border-zinc-500">
                      Selecionar e Importar
                    </Button>
                  </div>
                </div>

              </div>

            </CardContent>
          </Card>
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

        {/* ABA 10: Plano & SaaS */}
        {activeTab === "saas_plan" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plano, Assinatura & Limites (Preparação SaaS)</CardTitle>
              <CardDescription>Gerencie o licenciamento multi-tenant da sua empresa e o limite de uso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 border border-border/40 rounded bg-card/25 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Plano Atual</p>
                  <p className="text-base font-bold text-foreground">{saasPlan}</p>
                </div>
                <div className="p-4 border border-border/40 rounded bg-card/25 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Clientes Cadastrados</p>
                  <p className="text-base font-bold text-foreground">12 / {saasClientLimit}</p>
                </div>
                <div className="p-4 border border-border/40 rounded bg-card/25 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Fila Offline local</p>
                  <p className="text-base font-bold text-zinc-400 font-mono">{offlineSyncQueue} pendentes</p>
                </div>
              </div>

              <div className="border-t border-border/20 pt-4 flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded bg-zinc-950/20">
                <div>
                  <p className="font-bold text-foreground">Deseja migrar para o Plano Ouro SaaS?</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">O Plano Ouro estende o limite para 500 clientes cadastrados e desbloqueia multi-usuários ilimitados.</p>
                </div>
                <Button
                  onClick={() => {
                    setSaasPlan("Ouro (Platinum)")
                    setSaasClientLimit(500)
                    alert("Upgrade realizado com sucesso! Seus limites corporativos foram redefinidos.")
                  }}
                  variant="default"
                  size="sm"
                  className="gap-1 font-bold shrink-0"
                >
                  Fazer Upgrade p/ Ouro
                </Button>
              </div>

              <div className="border-t border-border/20 pt-4 space-y-3">
                <p className="font-bold text-foreground">Sincronização de Dados & Health Check</p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setOfflineSyncQueue(3)
                      setTimeout(() => {
                        setOfflineSyncQueue(0)
                        alert("Sincronização com o cluster principal SaaS finalizada com sucesso!")
                      }, 1000)
                    }}
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    Simular Modo Offline & Sync
                  </Button>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Servidores operacionais (Ping: 14ms)
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        )}


      </div>

    </div>
  )
}
