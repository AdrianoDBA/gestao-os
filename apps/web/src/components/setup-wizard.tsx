"use client"

import React, { useState } from "react"
import { Shield, Sparkles, Building2, User, Settings2, ArrowRight, CheckCircle2, Key } from "lucide-react"
import { activateLicense, generateLicenseKey, validateLicenseKey } from "@/lib/license-service"

interface SetupWizardProps {
  onComplete: () => void
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1)

  // Etapa 1: Empresa
  const [companyName, setCompanyName] = useState("")
  const [tradeName, setTradeName] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")

  // Etapa 2: Administrador
  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("")

  // Etapa 3: Configurações & Licença
  const [language, setLanguage] = useState("pt-BR")
  const [currency, setCurrency] = useState("BRL")
  const [timezone, setTimezone] = useState("GMT-3")
  const [warrantyDays, setWarrantyDays] = useState("90")
  const [osStartNumber, setOsStartNumber] = useState("1000")
  const [licenseKey, setLicenseKey] = useState("")

  const [error, setError] = useState("")

  const handleNextStep = () => {
    setError("")

    if (step === 1) {
      if (!companyName.trim()) return setError("O nome da empresa é obrigatório.")
      if (!phone.trim()) return setError("O telefone da empresa é obrigatório.")
      if (!whatsapp.trim()) return setError("O WhatsApp da empresa é obrigatório.")
      if (!email.trim()) return setError("O e-mail principal é obrigatório.")
      if (!email.includes("@")) return setError("Insira um e-mail de empresa válido.")
      setStep(2)
    } else if (step === 2) {
      if (!adminName.trim()) return setError("O nome do administrador é obrigatório.")
      if (!adminEmail.trim()) return setError("O e-mail do administrador é obrigatório.")
      if (!adminEmail.includes("@")) return setError("Insira um e-mail do administrador válido.")
      if (!adminPassword) return setError("A senha é obrigatória.")
      if (adminPassword.length < 6) return setError("A senha deve possuir no mínimo 6 caracteres.")
      if (adminPassword !== adminConfirmPassword) return setError("As senhas não coincidem.")
      setStep(3)
    }
  }

  const handleCompleteSetup = () => {
    setError("")
    const osNum = parseInt(osStartNumber)
    const warDays = parseInt(warrantyDays)

    if (isNaN(osNum) || osNum < 1) return setError("A numeração inicial da OS deve ser um número maior que zero.")
    if (isNaN(warDays) || warDays < 0) return setError("A garantia padrão deve ser zero ou um número positivo de dias.")

    // 0. Validação ou Ativação de Licença Comercial
    if (licenseKey.trim()) {
      const val = validateLicenseKey(licenseKey.trim())
      if (!val.isValid) {
        return setError("Chave de ativação inválida. Verifique o código digitado ou deixe o campo em branco para iniciar com 15 dias de teste grátis.")
      }
      activateLicense(licenseKey.trim(), companyName)
    } else {
      const trial = generateLicenseKey(companyName, "TRIAL", 15)
      localStorage.setItem("gestao_os_license_key", trial.key)
      localStorage.setItem("gestao_os_license_client", companyName)
      localStorage.setItem("gestao_os_license_issued", new Date().toISOString())
      localStorage.setItem("gestao_os_last_clock", String(Date.now()))
    }

    // 1. Salvar configurações do sistema
    const sysConfig = {
      company: {
        name: companyName,
        tradeName: tradeName || companyName,
        cnpj: cnpj || "",
        phone: phone,
        whatsapp: whatsapp,
        email: email,
        address: address || "",
        ie: "",
        cep: "",
        city: "",
        state: "",
        country: "Brasil",
        website: ""
      },
      visual: {
        theme: "DARK" as const,
        primaryColor: "#09090b",
        secondaryColor: "#27272a",
        accentColor: "#3b82f6"
      },
      os: {
        prefix: "OS",
        nextNumber: osNum,
        defaultWarrantyDays: warDays,
        requiredFields: ["customerId", "deviceId", "reportedDefect"]
      },
      financial: {
        currency: currency,
        decimals: 2,
        interestDefault: 1.0,
        fineDefault: 2.0,
        maxDiscountPercent: 15.0
      },
      inventory: {
        minStockDefault: 5,
        allowNegativeStock: false,
        alertOnLowStock: true
      },
      smtp: {
        host: "smtp.mailtrap.io",
        port: 2525,
        user: "user_smtp_123",
        from: "noreply@empresa.com",
        encryption: "TLS"
      },
      whatsapp: {
        number: whatsapp.replace(/\D/g, ""),
        token: "",
        webhook: "",
        autoMessageReady: "Olá {cliente}, seu equipamento {modelo} (OS #{numero}) está pronto para retirada!"
      },
      templates: {
        receiptHeader: `${companyName.toUpperCase()} - RECIBO DE ORDEM DE SERVIÇO`,
        receiptFooter: "Obrigado pela confiança! Equipamento reparado e testado com sucesso.",
        warrantyTerms: `Garantia de ${warDays} dias a partir da data de retirada para o serviço executado.`,
        technicalReportTerms: "Laudo técnico detalhado elaborado pelo especialista responsável."
      },
      security: {
        sessionTimeoutMinutes: 30,
        passwordMinLength: 6,
        maxLoginAttempts: 5,
        twoFactorEnabled: false
      }
    }

    // 2. Salvar administrador
    const adminUser = {
      id: `usr_admin_${Date.now()}`,
      name: adminName,
      email: adminEmail,
      phone: phone,
      role: "Administrador",
      isActive: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60",
      createdAt: new Date().toISOString(),
      password: adminPassword // para autenticação local
    }

    // Grava tudo no localStorage
    localStorage.setItem("system_config", JSON.stringify(sysConfig))
    localStorage.setItem("users_list", JSON.stringify([adminUser]))
    localStorage.setItem("current_user", JSON.stringify(adminUser))
    localStorage.setItem("system_configured", "true")

    // Grava log de auditoria
    const auditLogs = [
      {
        id: `log_setup_${Date.now()}`,
        action: "SYSTEM_SETUP",
        entityName: "System",
        entityId: "setup",
        createdAt: new Date().toISOString(),
        ipAddress: "127.0.0.1",
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "SetupWizard",
        user: { name: adminName },
        oldValues: {},
        newValues: { companyName, adminEmail }
      }
    ]
    localStorage.setItem("audit_logs", JSON.stringify(auditLogs))

    // Limpa mocks de dados se existirem para evitar poluição no primeiro run real
    localStorage.removeItem("customers_list")
    localStorage.removeItem("devices_list")
    localStorage.removeItem("orders_list")
    localStorage.removeItem("inventory_list")
    localStorage.removeItem("transactions_list")
    localStorage.removeItem("cash_sessions")

    onComplete()
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 text-xs">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))]" />
      
      <div className="w-full max-w-[550px] bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-zinc-300 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-4 flex items-center justify-center gap-1.5">
            Configuração Inicial <Sparkles className="w-4 h-4 text-blue-400" />
          </h2>
          <p className="text-[11px] text-zinc-400">Configure seu laboratório de assistência em apenas 3 passos simples.</p>
        </div>

        {/* Steps Progress Indicator */}
        <div className="flex justify-between items-center px-4 py-2 bg-zinc-950/40 border border-zinc-800/40 rounded-xl">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step >= 1 ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
              {step > 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : "1"}
            </span>
            <span className={`font-semibold ${step === 1 ? "text-white" : "text-zinc-500"}`}>Empresa</span>
          </div>
          <div className="h-px flex-1 bg-zinc-800 mx-3" />
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step >= 2 ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
              {step > 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : "2"}
            </span>
            <span className={`font-semibold ${step === 2 ? "text-white" : "text-zinc-500"}`}>Admin</span>
          </div>
          <div className="h-px flex-1 bg-zinc-800 mx-3" />
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step >= 3 ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
              3
            </span>
            <span className={`font-semibold ${step === 3 ? "text-white" : "text-zinc-500"}`}>Configurações</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/20 border border-red-800/40 text-red-400 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Content Stages */}
        <div className="space-y-4">
          
          {/* STEP 1: EMPRESA */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-300 font-bold border-b border-zinc-800 pb-2 mb-3">
                <Building2 className="w-4 h-4 text-blue-400" /> Informações do Estabelecimento
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nome da Empresa / Assistência *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Assistência Técnica Central"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nome Fantasia</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={e => setTradeName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Central Cell"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">CNPJ (Opcional)</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: 00.000.000/0001-00"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Telefone Principal *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: (11) 4002-8922"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">WhatsApp de Notificações *</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: (11) 98888-7777"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">E-mail Principal de Contato *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: contato@suaempresa.com"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Endereço Completo</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Av. Principal, 100 - Centro"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADMINISTRADOR */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-300 font-bold border-b border-zinc-800 pb-2 mb-3">
                <User className="w-4 h-4 text-blue-400" /> Cadastro do Administrador do System
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nome do Administrador *</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: Adriano Medeiros"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">E-mail do Administrador *</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Ex: adriano@empresa.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Senha de Acesso *</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Confirmar Senha *</label>
                    <input
                      type="password"
                      value={adminConfirmPassword}
                      onChange={e => setAdminConfirmPassword(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIGURAÇÕES */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-300 font-bold border-b border-zinc-800 pb-2 mb-3">
                <Settings2 className="w-4 h-4 text-blue-400" /> Preferências e Numeração Inicial
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Idioma Principal</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (United States)</option>
                    <option value="es-ES">Español (España)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Moeda Corrente</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="BRL">Real (R$ - BRL)</option>
                    <option value="USD">Dólar ($ - USD)</option>
                    <option value="EUR">Euro (€ - EUR)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Fuso Horário</label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="GMT-3">Brasília (GMT-3)</option>
                    <option value="GMT-4">Manaus (GMT-4)</option>
                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Garantia Padrão (Dias)</label>
                  <input
                    type="number"
                    value={warrantyDays}
                    onChange={e => setWarrantyDays(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="90"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Número Inicial das OSs</label>
                  <input
                    type="number"
                    value={osStartNumber}
                    onChange={e => setOsStartNumber(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="1000"
                  />
                  <p className="text-[9px] text-zinc-500 mt-1">A numeração de novas Ordens de Serviço iniciará a partir deste número sequencial.</p>
                </div>

                <div className="space-y-1.5 col-span-2 pt-2 border-t border-zinc-800/80">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> Chave de Licença Comercial (Opcional)
                  </label>
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={e => setLicenseKey(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-black border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                    placeholder="GOS-PRO-XXXXXXXX-XXXX-XXXXXXXX (Deixe vazio para 15 dias grátis)"
                  />
                  <p className="text-[9px] text-zinc-500 mt-1">
                    Se você já adquiriu sua licença, cole-a aqui. Caso contrário, você terá 15 dias de teste grátis automático.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t border-zinc-800/80 pt-4 flex justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 h-9 border border-zinc-800 bg-zinc-950 text-zinc-400 rounded-lg hover:text-white hover:border-zinc-700 transition-colors"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg gap-1.5 flex items-center transition-colors"
            >
              Avançar Passo <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCompleteSetup}
              className="px-4 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg gap-1.5 flex items-center transition-colors animate-pulse"
            >
              Concluir & Finalizar Instalação
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
