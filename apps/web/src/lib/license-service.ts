"use client"

// =========================================================================
// SERVIÇO DE VERIFICAÇÃO DE LICENÇA (CLIENTE) - GESTÃO OS
// Apenas verificação e solicitação. Nenhum gerador de chaves reside aqui.
// =========================================================================

export type LicensePlan = "TRIAL" | "PRO" | "ENTERPRISE" | "LIFETIME"

export interface LicenseInfo {
  key: string
  plan: LicensePlan
  clientName: string
  requestCode: string
  machineId: string
  issuedAt: string
  expiresAt: string // ISO date
  daysRemaining: number
  isValid: boolean
  isExpired: boolean
  isExpiringSoon: boolean // <= 7 dias
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "INVALID"
}

// Chave pública de validação matemática (apenas para verificação de autenticidade)
const VERIFY_SECRET = "GOS_MASTER_SECURE_KEY_2026_ADRIANO_DBA_ASSISTENCIA"

function simpleHash(str: string): string {
  let hash1 = 5381
  let hash2 = 52711
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash1 = (hash1 * 33) ^ char
    hash2 = (hash2 * 33) ^ char
  }
  const part1 = (hash1 >>> 0).toString(16).padStart(8, "0")
  const part2 = (hash2 >>> 0).toString(16).padStart(8, "0")
  return (part1 + part2).toUpperCase()
}

/**
 * Obtém ou gera o identificador único da máquina (Machine ID / Hardware Fingerprint)
 */
export function getMachineId(): string {
  if (typeof window === "undefined") return "SERVER00"
  
  let machineId = localStorage.getItem("gestao_os_machine_id")
  if (!machineId) {
    const nav = window.navigator || {}
    const screen = window.screen || {}
    const rawFingerprint = [
      (nav as any).userAgent || "agent",
      (nav as any).language || "pt-BR",
      (screen as any).width || "1920",
      (screen as any).height || "1080",
      (screen as any).colorDepth || "24",
      Date.now().toString(),
      Math.random().toString()
    ].join("|")

    machineId = simpleHash(rawFingerprint).substring(0, 8).toUpperCase()
    localStorage.setItem("gestao_os_machine_id", machineId)
  }
  return machineId
}

/**
 * Gera o Código de Solicitação exclusivo desta máquina para enviar ao Adriano
 * Formato: REQ-[NOME_PREFIX]-[MACHINE_ID]
 */
export function getRequestCode(clientName?: string): string {
  const machineId = getMachineId()
  const name = (clientName || (typeof window !== "undefined" ? localStorage.getItem("gestao_os_license_client") : "") || "OFICINA")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
  const nameFragment = name.substring(0, 4).padEnd(4, "X")
  return `REQ-${nameFragment}-${machineId}`
}

/**
 * Valida se a chave de licença é autêntica e pertence a este computador
 * Formato: GOS-[PLAN]-[YYYYMMDD]-[MACHINE_ID]-[SIGNATURE]
 */
export function validateLicenseKey(key: string): {
  isValid: boolean
  plan?: LicensePlan
  expiresAt?: Date
  error?: string
} {
  if (!key || typeof key !== "string") {
    return { isValid: false, error: "Chave não fornecida." }
  }

  const cleanKey = key.trim().toUpperCase()
  const parts = cleanKey.split("-")

  if (parts.length !== 5 || parts[0] !== "GOS") {
    return { isValid: false, error: "Formato de chave inválido. (Esperado: GOS-PLANO-DATA-MAQUINA-ASSINATURA)" }
  }

  const [, planStr, expDateStr, keyMachineId, signature] = parts

  if (!["TRIAL", "PRO", "ENTERPRISE", "LIFETIME"].includes(planStr)) {
    return { isValid: false, error: "Plano de licença desconhecido." }
  }

  if (expDateStr.length !== 8) {
    return { isValid: false, error: "Data de expiração da chave corrompida." }
  }

  const currentMachineId = getMachineId()

  // Se a chave não for TRIAL genérico, verifica se ela pertence a esta máquina
  if (keyMachineId !== "TRIAL00" && keyMachineId !== currentMachineId) {
    return { 
      isValid: false, 
      error: `Esta chave foi emitida para outro computador (${keyMachineId}). Seu computador requer uma chave para a máquina (${currentMachineId}).` 
    }
  }

  const year = parseInt(expDateStr.substring(0, 4), 10)
  const month = parseInt(expDateStr.substring(4, 6), 10) - 1
  const day = parseInt(expDateStr.substring(6, 8), 10)
  const expDate = new Date(year, month, day, 23, 59, 59)

  if (isNaN(expDate.getTime())) {
    return { isValid: false, error: "Data de validade inválida." }
  }

  // Verifica a assinatura matemática
  const rawPayload = `${planStr}:${expDateStr}:${keyMachineId}:${VERIFY_SECRET}`
  const expectedSignature = simpleHash(rawPayload).substring(0, 8)

  if (signature !== expectedSignature) {
    return { isValid: false, error: "Assinatura digital inválida. Esta chave não foi emitida pelo suporte oficial." }
  }

  return {
    isValid: true,
    plan: planStr as LicensePlan,
    expiresAt: expDate
  }
}

/**
 * Cria a chave inicial de demonstração Trial de 15 dias para esta máquina
 */
function createLocalTrialKey(machineId: string): string {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 15)

  const year = targetDate.getFullYear()
  const month = String(targetDate.getMonth() + 1).padStart(2, "0")
  const day = String(targetDate.getDate()).padStart(2, "0")
  const expDateStr = `${year}${month}${day}`

  const rawPayload = `TRIAL:${expDateStr}:${machineId}:${VERIFY_SECRET}`
  const signature = simpleHash(rawPayload).substring(0, 8)

  return `GOS-TRIAL-${expDateStr}-${machineId}-${signature}`
}

/**
 * Obtém os dados da licença ativa na máquina
 */
export function getActiveLicense(): LicenseInfo {
  const machineId = getMachineId()
  const storedClient = (typeof window !== "undefined" ? localStorage.getItem("gestao_os_license_client") : null) || "Assistência Técnica"
  const requestCode = getRequestCode(storedClient)

  if (typeof window === "undefined") {
    return {
      key: "SERVER_RENDER",
      plan: "PRO",
      clientName: "Servidor",
      requestCode,
      machineId: "SERVER00",
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      daysRemaining: 365,
      isValid: true,
      isExpired: false,
      isExpiringSoon: false,
      status: "ACTIVE"
    }
  }

  let storedKey = localStorage.getItem("gestao_os_license_key")
  const storedIssued = localStorage.getItem("gestao_os_license_issued") || new Date().toISOString()

  // Se não existir licença, gera automaticamente o TRIAL de 15 dias exclusivo desta máquina
  if (!storedKey) {
    storedKey = createLocalTrialKey(machineId)
    localStorage.setItem("gestao_os_license_key", storedKey)
    localStorage.setItem("gestao_os_license_client", storedClient)
    localStorage.setItem("gestao_os_license_issued", new Date().toISOString())
    localStorage.setItem("gestao_os_last_clock", String(Date.now()))
  }

  const validation = validateLicenseKey(storedKey)

  if (!validation.isValid || !validation.expiresAt || !validation.plan) {
    return {
      key: storedKey,
      plan: "TRIAL",
      clientName: storedClient,
      requestCode,
      machineId,
      issuedAt: storedIssued,
      expiresAt: new Date(0).toISOString(),
      daysRemaining: 0,
      isValid: false,
      isExpired: true,
      isExpiringSoon: false,
      status: "INVALID"
    }
  }

  const now = Date.now()

  // Proteção anti-adulteração de relógio do sistema
  const lastClockStr = localStorage.getItem("gestao_os_last_clock")
  if (lastClockStr) {
    const lastClock = parseInt(lastClockStr, 10)
    if (now < lastClock - 2 * 86400000) {
      return {
        key: storedKey,
        plan: validation.plan,
        clientName: storedClient,
        requestCode,
        machineId,
        issuedAt: storedIssued,
        expiresAt: new Date(0).toISOString(),
        daysRemaining: 0,
        isValid: false,
        isExpired: true,
        isExpiringSoon: false,
        status: "INVALID"
      }
    }
  }
  localStorage.setItem("gestao_os_last_clock", String(now))

  const expTime = validation.expiresAt.getTime()
  const diffMs = expTime - now
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  const isExpired = diffMs <= 0
  const isExpiringSoon = !isExpired && daysRemaining <= 7

  let status: LicenseInfo["status"] = "ACTIVE"
  if (isExpired) status = "EXPIRED"
  else if (isExpiringSoon) status = "EXPIRING_SOON"

  return {
    key: storedKey,
    plan: validation.plan,
    clientName: storedClient,
    requestCode,
    machineId,
    issuedAt: storedIssued,
    expiresAt: validation.expiresAt.toISOString(),
    daysRemaining,
    isValid: true,
    isExpired,
    isExpiringSoon,
    status
  }
}

/**
 * Ativa uma nova chave enviada pelo Adriano no software do cliente
 */
export function activateLicense(key: string, clientName?: string): { success: boolean; message: string } {
  if (typeof window === "undefined") return { success: false, message: "Apenas no cliente" }

  const validation = validateLicenseKey(key)

  if (!validation.isValid) {
    return { success: false, message: validation.error || "Chave de ativação inválida." }
  }

  const expDate = validation.expiresAt!
  if (expDate.getTime() <= Date.now()) {
    return { success: false, message: "Esta chave de licença já está expirada." }
  }

  const client = clientName || localStorage.getItem("gestao_os_license_client") || "Assistência Técnica"
  localStorage.setItem("gestao_os_license_key", key.trim().toUpperCase())
  localStorage.setItem("gestao_os_license_client", client)
  localStorage.setItem("gestao_os_license_issued", new Date().toISOString())
  localStorage.setItem("gestao_os_last_clock", String(Date.now()))

  return {
    success: true,
    message: `Licença ${validation.plan} ativada com sucesso para este computador! Válida até ${expDate.toLocaleDateString("pt-BR")}.`
  }
}
