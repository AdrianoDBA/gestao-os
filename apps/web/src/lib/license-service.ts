"use client"

// =========================================================
// SISTEMA DE LICENCIAMENTO CRIPTOGRÁFICO - GESTÃO OS
// =========================================================

export type LicensePlan = "TRIAL" | "PRO" | "ENTERPRISE" | "LIFETIME"

export interface LicenseInfo {
  key: string
  plan: LicensePlan
  clientName: string
  issuedAt: string
  expiresAt: string // ISO date
  daysRemaining: number
  isValid: boolean
  isExpired: boolean
  isExpiringSoon: boolean // <= 7 dias
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "INVALID"
}

// Chave mestra interna para assinatura das licenças (não exposta no frontend público)
const MASTER_SECRET = "GOS_MASTER_SECURE_KEY_2026_ADRIANO_DBA_ASSISTENCIA"

// Função hash SHA-256 rápida em JavaScript para navegador
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
 * Gera uma chave de licença válida.
 * Pode ser usada tanto no frontend quanto no script de gerador para o Adriano.
 */
export function generateLicenseKey(
  clientName: string,
  plan: LicensePlan,
  daysValid: number
): { key: string; expiresAt: string } {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + daysValid)

  const year = targetDate.getFullYear()
  const month = String(targetDate.getMonth() + 1).padStart(2, "0")
  const day = String(targetDate.getDate()).padStart(2, "0")
  const expDateStr = `${year}${month}${day}`

  const salt = Math.random().toString(36).substring(2, 6).toUpperCase().padStart(4, "X")
  const cleanName = clientName.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "CLIENTE"
  const nameFragment = cleanName.substring(0, 4).padEnd(4, "X")

  const rawPayload = `${plan}:${expDateStr}:${nameFragment}:${salt}:${MASTER_SECRET}`
  const signature = simpleHash(rawPayload).substring(0, 8)

  const key = `GOS-${plan}-${expDateStr}-${nameFragment}${salt}-${signature}`

  return {
    key,
    expiresAt: targetDate.toISOString()
  }
}

/**
 * Valida uma chave de licença no formato:
 * GOS-[PLAN]-[YYYYMMDD]-[NAME_SALT]-[SIGNATURE]
 */
export function validateLicenseKey(key: string): {
  isValid: boolean
  plan?: LicensePlan
  expiresAt?: Date
  error?: string
} {
  if (!key || typeof key !== "string") {
    return { isValid: false, error: "Chave não fornecida" }
  }

  const cleanKey = key.trim().toUpperCase()
  const parts = cleanKey.split("-")

  if (parts.length !== 5 || parts[0] !== "GOS") {
    return { isValid: false, error: "Formato de chave inválido (esperado: GOS-PLANO-DATA-CODIGO-HASH)" }
  }

  const [, planStr, expDateStr, nameSalt, signature] = parts

  if (!["TRIAL", "PRO", "ENTERPRISE", "LIFETIME"].includes(planStr)) {
    return { isValid: false, error: "Plano de licença desconhecido" }
  }

  if (expDateStr.length !== 8) {
    return { isValid: false, error: "Data de expiração corrompida" }
  }

  const year = parseInt(expDateStr.substring(0, 4), 10)
  const month = parseInt(expDateStr.substring(4, 6), 10) - 1
  const day = parseInt(expDateStr.substring(6, 8), 10)
  const expDate = new Date(year, month, day, 23, 59, 59)

  if (isNaN(expDate.getTime())) {
    return { isValid: false, error: "Data de expiração inválida" }
  }

  if (nameSalt.length !== 8) {
    return { isValid: false, error: "Código do cliente corrompido" }
  }

  const nameFragment = nameSalt.substring(0, 4)
  const salt = nameSalt.substring(4, 8)

  const rawPayload = `${planStr}:${expDateStr}:${nameFragment}:${salt}:${MASTER_SECRET}`
  const expectedSignature = simpleHash(rawPayload).substring(0, 8)

  if (signature !== expectedSignature) {
    return { isValid: false, error: "Assinatura digital da licença inválida ou falsificada" }
  }

  return {
    isValid: true,
    plan: planStr as LicensePlan,
    expiresAt: expDate
  }
}

/**
 * Obtém os dados da licença ativa no sistema.
 * Se não houver licença, cria automaticamente um Trial de 15 dias no primeiro uso.
 */
export function getActiveLicense(): LicenseInfo {
  if (typeof window === "undefined") {
    return {
      key: "SERVER_RENDER",
      plan: "PRO",
      clientName: "Servidor",
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      daysRemaining: 365,
      isValid: true,
      isExpired: false,
      isExpiringSoon: false,
      status: "ACTIVE"
    }
  }

  const storedKey = localStorage.getItem("gestao_os_license_key")
  const storedClient = localStorage.getItem("gestao_os_license_client") || "Assistência Técnica"
  const storedIssued = localStorage.getItem("gestao_os_license_issued") || new Date().toISOString()

  // Se não existir licença cadastrada, inicializa automaticamente com TRIAL de 15 dias
  if (!storedKey) {
    const trial = generateLicenseKey(storedClient, "TRIAL", 15)
    localStorage.setItem("gestao_os_license_key", trial.key)
    localStorage.setItem("gestao_os_license_client", storedClient)
    localStorage.setItem("gestao_os_license_issued", new Date().toISOString())
    localStorage.setItem("gestao_os_last_clock", String(Date.now()))

    return {
      key: trial.key,
      plan: "TRIAL",
      clientName: storedClient,
      issuedAt: new Date().toISOString(),
      expiresAt: trial.expiresAt,
      daysRemaining: 15,
      isValid: true,
      isExpired: false,
      isExpiringSoon: false,
      status: "ACTIVE"
    }
  }

  const validation = validateLicenseKey(storedKey)

  if (!validation.isValid || !validation.expiresAt || !validation.plan) {
    return {
      key: storedKey,
      plan: "TRIAL",
      clientName: storedClient,
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

  // Verificação anti-fraude de relógio (impede voltar o relógio do PC)
  const lastClockStr = localStorage.getItem("gestao_os_last_clock")
  if (lastClockStr) {
    const lastClock = parseInt(lastClockStr, 10)
    // Se o relógio do PC estiver mais de 2 dias no passado em relação à última gravação:
    if (now < lastClock - 2 * 86400000) {
      return {
        key: storedKey,
        plan: validation.plan,
        clientName: storedClient,
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
 * Ativa uma nova chave de licença no sistema
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
    message: `Licença ${validation.plan} ativada com sucesso! Válida até ${expDate.toLocaleDateString("pt-BR")}.`
  }
}
