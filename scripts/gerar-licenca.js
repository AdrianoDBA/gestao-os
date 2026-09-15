#!/usr/bin/env node

/**
 * =========================================================
 * GERADOR OFICIAL DE LICENÇAS - GESTÃO OS
 * Uso exclusivo do administrador/vendedor (Adriano)
 * =========================================================
 * 
 * Exemplo de uso no terminal:
 *   node scripts/gerar-licenca.js "Tech Cell" PRO 365
 *   node scripts/gerar-licenca.js "Oficina do Silva" TRIAL 15
 *   node scripts/gerar-licenca.js "Infotech" LIFETIME 36500
 */

const MASTER_SECRET = "GOS_MASTER_SECURE_KEY_2026_ADRIANO_DBA_ASSISTENCIA"

function simpleHash(str) {
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

function generateLicenseKey(clientName, plan, daysValid) {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + parseInt(daysValid, 10))

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
    clientName,
    plan,
    expiresAt: targetDate.toLocaleDateString("pt-BR"),
    daysValid
  }
}

const args = process.argv.slice(2)

if (args.length < 3) {
  console.log("\n=======================================================")
  console.log("🔑 GERADOR DE LICENÇAS - GESTÃO OS")
  console.log("=======================================================")
  console.log("Uso: node scripts/gerar-licenca.js \"[CLIENTE]\" [PLANO] [DIAS]\n")
  console.log("Planos disponíveis: TRIAL | PRO | ENTERPRISE | LIFETIME")
  console.log("Exemplos:")
  console.log("  node scripts/gerar-licenca.js \"Tech Cell Assistência\" PRO 30    (Mensal)")
  console.log("  node scripts/gerar-licenca.js \"Oficina do Silva\" PRO 365         (Anual)")
  console.log("  node scripts/gerar-licenca.js \"Smart Repair\" LIFETIME 36500     (Vitalício)\n")
  
  console.log("--- Gerando amostras agora para você testar ---")
  const sampleTrial = generateLicenseKey("Cliente Amostra", "TRIAL", 15)
  const sampleMensal = generateLicenseKey("Oficina Modelo", "PRO", 30)
  const sampleAnual = generateLicenseKey("Central Assistencia", "PRO", 365)
  const sampleVitalicio = generateLicenseKey("Eletronica Alfa", "LIFETIME", 36500)

  console.log(`[TRIAL 15 DIAS]:   ${sampleTrial.key} (Válido até ${sampleTrial.expiresAt})`)
  console.log(`[MENSAL 30 DIAS]:  ${sampleMensal.key} (Válido até ${sampleMensal.expiresAt})`)
  console.log(`[ANUAL 365 DIAS]:  ${sampleAnual.key} (Válido até ${sampleAnual.expiresAt})`)
  console.log(`[VITALÍCIO]:       ${sampleVitalicio.key} (Válido até ${sampleVitalicio.expiresAt})`)
  console.log("=======================================================\n")
  process.exit(0)
}

const clientName = args[0]
const plan = args[1].toUpperCase()
const daysValid = parseInt(args[2], 10)

const license = generateLicenseKey(clientName, plan, daysValid)

console.log("\n=======================================================")
console.log("✅ LICENÇA GERADA COM SUCESSO!")
console.log("=======================================================")
console.log(`Oficina/Cliente: ${license.clientName}`)
console.log(`Plano:           ${license.plan}`)
console.log(`Validade:        ${license.daysValid} dias (Até ${license.expiresAt})`)
console.log("-------------------------------------------------------")
console.log(`CHAVE:           ${license.key}`)
console.log("-------------------------------------------------------")
console.log("Envie a chave acima para o cliente ativar no Gestão OS.")
console.log("=======================================================\n")
