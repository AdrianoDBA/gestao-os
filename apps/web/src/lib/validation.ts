/**
 * Utilitários de Validação e Formatação (Máscaras) para Clientes
 */

// Remove todos os caracteres não numéricos de uma string
export function cleanNonDigits(value: string): string {
  return value.replace(/\D/g, "")
}

// Aplica máscara de CPF: 000.000.000-00
export function formatCPF(value: string): string {
  const digits = cleanNonDigits(value).slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

// Aplica máscara de CNPJ: 00.000.000/0000-00
export function formatCNPJ(value: string): string {
  const digits = cleanNonDigits(value).slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

// Aplica máscara automática para documentos de tamanho dinâmico (CPF ou CNPJ)
export function formatDocument(value: string): string {
  const cleaned = cleanNonDigits(value)
  if (cleaned.length <= 11) {
    return formatCPF(value)
  }
  return formatCNPJ(value)
}

// Aplica máscara de Telefone/WhatsApp: (00) 00000-0000 ou (00) 0000-0000
export function formatPhone(value: string): string {
  const digits = cleanNonDigits(value).slice(0, 11)
  if (digits.length === 0) return ""
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  
  // 10 dígitos (fixo): (XX) XXXX-XXXX
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  
  // 11 dígitos (celular): (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// Valida formato de e-mail
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Valida CPF (Algoritmo oficial de dígitos verificadores)
export function validateCPF(cpf: string): boolean {
  const cleaned = cleanNonDigits(cpf)
  
  if (cleaned.length !== 11) return false
  
  // Impede CPFs conhecidos inválidos
  if (/^(\d)\1{10}$/.test(cleaned)) return false
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(cleaned.charAt(9))) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(cleaned.charAt(10))) return false
  
  return true
}

// Valida CNPJ (Algoritmo oficial de dígitos verificadores)
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cleanNonDigits(cnpj)
  
  if (cleaned.length !== 14) return false
  
  // Impede CNPJs conhecidos inválidos
  if (/^(\d)\1{13}$/.test(cleaned)) return false
  
  // Validação do primeiro dígito verificador
  let size = cleaned.length - 2
  let numbers = cleaned.substring(0, size)
  const digits = cleaned.substring(size)
  let sum = 0
  let pos = size - 7
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false
  
  // Validação do segundo dígito verificador
  size = size + 1
  numbers = cleaned.substring(0, size)
  sum = 0
  pos = size - 7
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false
  
  return true
}

// Validação geral do documento
export function validateDocument(doc: string): boolean {
  const cleaned = cleanNonDigits(doc)
  if (cleaned.length === 11) {
    return validateCPF(cleaned)
  }
  if (cleaned.length === 14) {
    return validateCNPJ(cleaned)
  }
  return false
}
