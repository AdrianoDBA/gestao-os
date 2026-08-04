import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Gestão OS - Assistência Técnica",
  description: "Sistema completo de gestão para assistência técnica de eletrônicos",
}

import { AuthWrapper } from "@/components/auth-wrapper"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  )
}
