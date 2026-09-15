"use client"

// =========================================================
// SERVIÇO DE BACKUP AUTOMÁTICO E INTEGRAÇÃO NUVEM (GOOGLE DRIVE)
// =========================================================

export type BackupInterval = "1h" | "3h" | "6h" | "12h" | "24h" | "manual"

export interface AutoBackupSnapshot {
  id: string
  timestamp: string
  label: string
  sizeBytes: number
  recordCounts: {
    orders: number
    customers: number
    inventory: number
    transactions: number
  }
  data: any
}

export interface BackupSettings {
  interval: BackupInterval
  lastBackupAt: string | null
  nextBackupAt: string | null
  cloudFolderHint: string // Ex: "C:\Users\Nome\Google Drive\Backups_GestaoOS"
  autoDownloadOnSchedule: boolean
}

const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  interval: "1h",
  lastBackupAt: null,
  nextBackupAt: null,
  cloudFolderHint: "Google Drive/Backups_GestaoOS",
  autoDownloadOnSchedule: false
}

/**
 * Coleta todos os dados das tabelas locais do laboratório
 */
export function generateSystemSnapshot(): any {
  if (typeof window === "undefined") return {}

  const tables = [
    "system_config",
    "customers_list",
    "devices_list",
    "orders_list",
    "inventory_list",
    "transactions_list",
    "users_list",
    "roles_list",
    "partners_list",
    "audit_logs",
    "gestao_os_license_key",
    "gestao_os_license_client"
  ]

  const dump: Record<string, any> = {
    app: "Gestão OS",
    version: "2.0.0-commercial",
    createdAt: new Date().toISOString(),
    tables: {}
  }

  tables.forEach(table => {
    const raw = localStorage.getItem(table)
    if (raw) {
      try {
        dump.tables[table] = JSON.parse(raw)
      } catch {
        dump.tables[table] = raw
      }
    }
  })

  return dump
}

/**
 * Obtém as configurações de agendamento de backup
 */
export function getBackupSettings(): BackupSettings {
  if (typeof window === "undefined") return DEFAULT_BACKUP_SETTINGS
  const stored = localStorage.getItem("gestao_os_backup_settings")
  if (!stored) return DEFAULT_BACKUP_SETTINGS
  try {
    return { ...DEFAULT_BACKUP_SETTINGS, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_BACKUP_SETTINGS
  }
}

/**
 * Salva as configurações de agendamento de backup
 */
export function saveBackupSettings(settings: BackupSettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem("gestao_os_backup_settings", JSON.stringify(settings))
}

/**
 * Obtém os snapshots de backup automático armazenados localmente (mantém os últimos 10)
 */
export function getStoredAutoBackups(): AutoBackupSnapshot[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem("gestao_os_auto_backups")
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

/**
 * Cria e armazena um snapshot de backup automático
 */
export function performAutoBackup(triggerName: string = "Automático (Agendado)"): AutoBackupSnapshot {
  const dump = generateSystemSnapshot()
  const ordersCount = Array.isArray(dump.tables?.orders_list) ? dump.tables.orders_list.length : 0
  const customersCount = Array.isArray(dump.tables?.customers_list) ? dump.tables.customers_list.length : 0
  const inventoryCount = Array.isArray(dump.tables?.inventory_list) ? dump.tables.inventory_list.length : 0
  const transactionsCount = Array.isArray(dump.tables?.transactions_list) ? dump.tables.transactions_list.length : 0

  const jsonStr = JSON.stringify(dump)
  const snapshot: AutoBackupSnapshot = {
    id: `bkp_${Date.now()}`,
    timestamp: new Date().toISOString(),
    label: triggerName,
    sizeBytes: new Blob([jsonStr]).size,
    recordCounts: {
      orders: ordersCount,
      customers: customersCount,
      inventory: inventoryCount,
      transactions: transactionsCount
    },
    data: dump
  }

  if (typeof window !== "undefined") {
    // Mantém os últimos 10 backups automáticos
    const history = getStoredAutoBackups()
    const updated = [snapshot, ...history.slice(0, 9)]
    localStorage.setItem("gestao_os_auto_backups", JSON.stringify(updated))

    // Atualiza o settings com a data do último backup
    const settings = getBackupSettings()
    const intervalMs = getIntervalMs(settings.interval)
    const nextDate = intervalMs > 0 ? new Date(Date.now() + intervalMs).toISOString() : null

    saveBackupSettings({
      ...settings,
      lastBackupAt: snapshot.timestamp,
      nextBackupAt: nextDate
    })
  }

  return snapshot
}

/**
 * Converte intervalo para milissegundos
 */
export function getIntervalMs(interval: BackupInterval): number {
  switch (interval) {
    case "1h": return 1 * 60 * 60 * 1000
    case "3h": return 3 * 60 * 60 * 1000
    case "6h": return 6 * 60 * 60 * 1000
    case "12h": return 12 * 60 * 60 * 1000
    case "24h": return 24 * 60 * 60 * 1000
    case "manual": return 0
    default: return 1 * 60 * 60 * 1000
  }
}

/**
 * Faz download de um arquivo de backup para o computador
 */
export function downloadBackupFile(dump?: any): void {
  if (typeof window === "undefined") return
  const data = dump || generateSystemSnapshot()
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, "-").substring(0, 19)
  const filename = `gestao_os_backup_${timestamp}.json`

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Restaura o sistema a partir de um dump de dados
 */
export function restoreSystemSnapshot(dump: any): { success: boolean; message: string } {
  if (!dump || typeof dump !== "object" || !dump.tables) {
    return { success: false, message: "Arquivo de backup inválido ou formato não reconhecido." }
  }

  if (typeof window === "undefined") return { success: false, message: "Apenas no cliente" }

  try {
    Object.keys(dump.tables).forEach(key => {
      const val = dump.tables[key]
      if (typeof val === "object") {
        localStorage.setItem(key, JSON.stringify(val))
      } else if (typeof val === "string") {
        localStorage.setItem(key, val)
      }
    })

    return {
      success: true,
      message: `Restauração concluída com sucesso! Recarregando sistema...`
    }
  } catch (err: any) {
    return { success: false, message: `Erro ao restaurar: ${err.message}` }
  }
}
