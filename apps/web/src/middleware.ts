import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  
  // Ignora requisições de recursos estáticos, imagens e arquivos de desenvolvimento do Next.js
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".") ||
    url.pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const host = request.headers.get("host") || ""
  // Verifica se o tráfego está vindo por meio do túnel público do localhost.run (lhr.life)
  const isExternal = host.includes("lhr.life") || host.includes("localhost.run")

  if (isExternal) {
    const ip = request.headers.get("x-forwarded-for") || "IP Local/VPN"
    const userAgent = request.headers.get("user-agent") || "Navegador Desconhecido"
    const time = new Date().toLocaleTimeString("pt-BR")

    // Identificação amigável de dispositivo
    let device = "Computador/Desktop"
    if (/iphone/i.test(userAgent)) {
      device = "📱 iPhone"
    } else if (/android/i.test(userAgent)) {
      device = "📱 Android"
    } else if (/ipad/i.test(userAgent)) {
      device = "📱 iPad"
    }

    // Imprime um log chamativo no console do terminal de desenvolvimento do usuário
    console.log(`\n\x1b[33m🔔 [TÚNEL EXTERNO] Acesso às ${time} - IP: ${ip} (${device}) abriu a rota: \x1b[36m${url.pathname}\x1b[0m`)
  }

  return NextResponse.next()
}
