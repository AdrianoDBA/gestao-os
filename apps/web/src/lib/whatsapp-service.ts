import { getStoredSystemConfig } from "./db-store"

/**
 * Envia uma mensagem para o WhatsApp do cliente.
 * Se houver credenciais de API configuradas e ativas (diferentes do mock), simula o envio via API e exibe aviso.
 * Caso contrário, abre o link direto do WhatsApp Web com a mensagem preenchida para envio manual.
 */
export const sendWhatsAppMessage = (phone: string | undefined, text: string) => {
  if (!phone) {
    alert("⚠️ Não foi possível enviar a mensagem: O telefone do cliente não está cadastrado!")
    return
  }

  // Limpa o número de telefone (mantém apenas dígitos)
  const cleanedPhone = phone.replace(/\D/g, "")
  if (!cleanedPhone) {
    alert("⚠️ Não foi possível enviar a mensagem: Telefone do cliente em formato inválido!")
    return
  }

  // Ajusta número do Brasil para DDI 55
  let finalPhone = cleanedPhone
  if (cleanedPhone.length === 10 || cleanedPhone.length === 11) {
    if (!cleanedPhone.startsWith("55")) {
      finalPhone = "55" + cleanedPhone
    }
  }

  const config = getStoredSystemConfig()
  const isApiConfigured = 
    config.whatsapp?.number && 
    config.whatsapp?.number !== "5511987654321" && 
    config.whatsapp?.token && 
    config.whatsapp?.token !== "token_whatsapp_example_982348923"

  if (isApiConfigured) {
    // Simula disparo automático via API (Z-API / Evolution API)
    console.log(`[WhatsApp API] Enviando mensagem para ${finalPhone}:`, text)
    alert(`💬 Mensagem automática enviada via API do WhatsApp!\n\nDestinatário: +${finalPhone}\nConteúdo: "${text.substring(0, 80)}..."`)
  } else {
    // Redirecionamento clássico para WhatsApp Web/App
    const encodedText = encodeURIComponent(text)
    const url = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodedText}`
    
    if (typeof window !== "undefined") {
      window.open(url, "_blank")
    }
  }
}
