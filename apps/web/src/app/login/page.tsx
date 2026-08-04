"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { getUsers, setCurrentUser, getCurrentUser } from "@/lib/auth-store"
import { Shield, Lock, Mail, ArrowRight, Sparkles } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  React.useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      window.location.href = "/"
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos.")
      return
    }

    const usersList = getUsers()
    const foundUser = usersList.find(
      u => u.email.toLowerCase() === email.toLowerCase() && (u as any).password === password && u.isActive
    )

    if (foundUser) {
      setCurrentUser(foundUser)
      // Recarrega para aplicar o estado logado
      window.location.href = "/"
    } else {
      setError("Credenciais inválidas ou conta desativada.")
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 text-xs">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      
      <div className="w-full max-w-[420px] bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-zinc-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-4 flex items-center justify-center gap-1.5">
            Gestão OS <Sparkles className="w-4 h-4 text-blue-400" />
          </h2>
          <p className="text-[11px] text-zinc-400">Insira suas credenciais de bancada para autenticar.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/20 border border-red-800/40 text-red-400 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="nome@empresa.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-black border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" variant="default" className="w-full h-9 bg-blue-500 hover:bg-blue-600 font-bold text-xs gap-1.5 mt-2">
            Entrar no Laboratório <ArrowRight className="w-4 h-4" />
          </Button>
        </form>





      </div>
    </div>
  )
}
