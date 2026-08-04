"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { 
  getStoredPartners, saveStoredPartners, 
  getStoredBlockchainLogs, saveStoredBlockchainLogs 
} from "@/lib/db-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Shield, Star, MapPin, Send, 
  Plus, ShieldCheck, Heart 
} from "lucide-react"

export default function PublicPortalPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [partners, setPartners] = useState<any[]>([])
  
  // Filtros
  const [search, setSearch] = useState("")
  const [cityFilter, setCityFilter] = useState("ALL")
  const [serviceTypeFilter, setServiceTypeFilter] = useState("ALL")

  // Modais e Estados de Criação de Avaliação
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null)
  const [clientNameInput, setClientNameInput] = useState("")
  const [ratingInput, setRatingInput] = useState(5)
  const [commentInput, setCommentInput] = useState("")

  // Estados do Chatbot Match IA (Fase 4)
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: "m1",
      sender: "AI",
      text: "Olá! Sou o Assistente de Match IA. Relate o defeito do seu aparelho para eu localizar o laboratório ideal próximo a você."
    }
  ])
  const [chatInput, setChatInput] = useState("")
  const [isAISending, setIsAISending] = useState(false)

  // Especialistas correspondentes filtrados pela IA
  const [aiRecommendedIds, setAiRecommendedIds] = useState<string[]>([])

  useEffect(() => {
    setPartners(getStoredPartners())
    setMounted(true)
  }, [])

  // Cidades únicas na base
  const cities = useMemo(() => {
    const allCities = partners.map(p => p.city)
    return ["ALL", ...Array.from(new Set(allCities))]
  }, [partners])

  // Filtragem dinâmica
  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      // Se houver recomendações da IA ativas, foca apenas nelas
      if (aiRecommendedIds.length > 0 && !aiRecommendedIds.includes(p.id)) {
        return false
      }

      const q = search.toLowerCase()
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.specialties.some((s: string) => s.toLowerCase().includes(q)) ||
        p.technologies.some((t: string) => t.toLowerCase().includes(q)) ||
        p.brands.some((b: string) => b.toLowerCase().includes(q))

      const matchCity = cityFilter === "ALL" || p.city.toLowerCase() === cityFilter.toLowerCase()
      const matchService = serviceTypeFilter === "ALL" || p.serviceType === serviceTypeFilter

      return matchSearch && matchCity && matchService
    })
  }, [partners, search, cityFilter, serviceTypeFilter, aiRecommendedIds])

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAISending) return
    
    const userMsg = { id: `u_${Date.now()}`, sender: "USER", text: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    const prompt = chatInput
    setChatInput("")
    setIsAISending(true)

    // Simula IA de Match dinâmico baseado em tags em runtime
    setTimeout(() => {
      const q = prompt.toLowerCase()
      let replyText = ""
      
      const recommended = partners.filter(p => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          p.specialties.some((s: string) => q.includes(s.toLowerCase()) || s.toLowerCase().includes(q)) ||
          p.technologies.some((t: string) => q.includes(t.toLowerCase()) || t.toLowerCase().includes(q)) ||
          p.brands.some((b: string) => q.includes(b.toLowerCase()) || b.toLowerCase().includes(q)) ||
          p.devices.some((d: string) => q.includes(d.toLowerCase()) || d.toLowerCase().includes(q))
        )
      })

      if (recommended.length > 0) {
        const ids = recommended.map(p => p.id)
        setAiRecommendedIds(ids) // Filtra a grade de especialistas em tempo real!

        replyText = `Com base no sintoma relatado, identifiquei a tecnologia correspondente e localizei ${recommended.length} especialista(s) adequado(s) em nossa base:\n\n`
        recommended.forEach(p => {
          replyText += `• ${p.name} (${p.city}/${p.state}) - Especialidade: ${p.specialties.slice(0, 2).join(", ")}. Reputação: ⭐ ${p.rating} (Verificação em Blockchain L2 ativa).\n`
        })
        replyText += "\nQualquer um desses parceiros está qualificado para receber seu chamado!"
      } else {
        setAiRecommendedIds([]) // Reseta filtros se nada encontrado
        replyText = "Compreendi o sintoma relatado, mas não localizei nenhum laboratório com essa especialidade exata na rede. Tente buscar termos como 'valvulado', 'drone', 'BGA', 'tela', 'nobreak', ou 'câmera'."
      }

      setChatMessages(prev => [...prev, {
        id: `ai_${Date.now()}`,
        sender: "AI",
        text: replyText,
        matches: recommended
      }])
      setIsAISending(false)
    }, 1200)
  }

  const handleSaveReview = () => {
    if (!clientNameInput.trim() || !commentInput.trim()) {
      alert("Por favor, preencha todos os campos do feedback.")
      return
    }

    const txHash = "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 10)
    const newReview = {
      id: `rev_${Date.now()}`,
      clientName: clientNameInput,
      rating: ratingInput,
      comment: commentInput,
      blockchainTx: txHash,
      createdAt: new Date().toISOString()
    }

    const updatedPartners = partners.map(p => {
      if (p.id === selectedPartner.id) {
        const reviews = [newReview, ...p.reviews]
        const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0)
        return {
          ...p,
          reviews,
          rating: parseFloat((totalRating / reviews.length).toFixed(1))
        }
      }
      return p
    })

    const newBLog = {
      id: `blog_${Date.now()}`,
      entityName: "PartnerReview",
      entityId: selectedPartner.id,
      dataHash: "sha256_mock_hash_" + Math.random().toString(36).substring(4),
      blockchainTx: txHash,
      createdAt: new Date().toISOString()
    }

    const logs = getStoredBlockchainLogs()
    saveStoredBlockchainLogs([newBLog, ...logs])
    
    setPartners(updatedPartners)
    saveStoredPartners(updatedPartners)
    setIsReviewModalOpen(false)
    setClientNameInput("")
    setCommentInput("")
    alert("Avaliação registrada com recibo assinado na Blockchain!")
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground p-8 font-sans flex flex-col">
      
      {/* Header Público */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6 mb-6">
        <div className="space-y-1.5 flex-1">
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" /> REDE INTELIGENTE DE ESPECIALISTAS
          </h1>
          <p className="text-xs text-muted-foreground flex flex-col md:flex-row md:items-center gap-2">
            <span>Localize laboratórios chancelados em Blockchain por geolocalização e match cognitivo.</span>
            {aiRecommendedIds.length > 0 && (
              <button 
                onClick={() => setAiRecommendedIds([])} 
                className="text-amber-500 hover:underline font-bold"
              >
                (Limpar Filtro da IA)
              </button>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar especialidades..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-52 h-9 pl-8 pr-3 text-xs bg-card border border-border rounded-md focus:outline-none"
            />
          </div>
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-card border border-border rounded-md text-foreground focus:outline-none"
          >
            <option value="ALL">Todas as Cidades</option>
            {cities.filter(c => c !== "ALL").map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grade de Layout de 2 Colunas (Especialistas à Esquerda, Chatbot à Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Lado Esquerdo: Cards dos Especialistas (2/3 da largura) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {aiRecommendedIds.length > 0 ? "Resultados recomendados pela IA de Match" : "Especialistas Homologados na Rede"} ({filteredPartners.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPartners.map(p => (
              <Card key={p.id} className="bg-card/15 border-border/20 backdrop-blur-md overflow-hidden relative flex flex-col h-[280px]">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-100">{p.name}</h4>
                          <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            Verificado
                          </Badge>
                        </div>
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-600" /> {p.city} - {p.state}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {p.rating}
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">{p.bio}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.specialties.slice(0, 3).map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-[9px] bg-zinc-800 text-zinc-300">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Avaliações Verificadas */}
                    <div className="border-t border-border/10 pt-3 flex justify-between items-center text-[10px]">
                      <span className="text-[8px] font-mono text-zinc-500">
                        Polygon L2 Registrada
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedPartner(p)
                          setIsReviewModalOpen(true)
                        }}
                        className="text-[9px] h-6 px-2 hover:bg-zinc-800 text-emerald-500"
                      >
                        Avaliar Técnico
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Lado Direito: IA de Match de Triagem Pública (1/3 da largura) */}
        <div className="space-y-6">
          <Card className="bg-card/20 border-border/25 backdrop-blur-md h-[550px] flex flex-col overflow-hidden">
            <CardContent className="p-5 flex flex-col h-full space-y-4">
              <div className="border-b border-border/40 pb-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Match IA - Triagem do Aparelho</h4>
                  <p className="text-[9px] text-muted-foreground">Localize o profissional ideal na sua região</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
                {chatMessages.map((m: any) => (
                  <div key={m.id} className={`flex flex-col space-y-1 max-w-[85%] ${m.sender === "USER" ? "ml-auto items-end" : "mr-auto items-start"}`}>
                    <div className={`p-3 rounded-lg leading-relaxed ${m.sender === "USER" ? "bg-zinc-800 text-zinc-100 rounded-tr-none" : "bg-emerald-950/15 border border-emerald-900/20 text-zinc-300 rounded-tl-none"}`}>
                      <p className="text-[11px] whitespace-pre-line">{m.text}</p>
                    </div>
                  </div>
                ))}
                {isAISending && (
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] italic">
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    <span>Buscando na rede de especialistas...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                <input
                  type="text"
                  placeholder="Descreva o problema do aparelho..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSendChatMessage() }}
                  className="flex-1 h-9 px-3 text-xs bg-background border border-border rounded-md text-foreground placeholder-zinc-500"
                />
                <Button onClick={handleSendChatMessage} className="h-9 w-9 bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Modal de Avaliação Pública */}
      {isReviewModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" /> Registro Blockchain Verificado
              </h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">&times;</button>
            </div>
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold text-[10px] uppercase">Seu Nome</label>
                <input
                  type="text"
                  value={clientNameInput}
                  onChange={e => setClientNameInput(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-background border border-border text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold text-[10px] uppercase">Avaliação</label>
                <select
                  value={ratingInput}
                  onChange={e => setRatingInput(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded bg-background border border-border text-foreground"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                  <option value={3}>⭐⭐⭐ (3/5)</option>
                  <option value={2}>⭐⭐ (2/5)</option>
                  <option value={1}>⭐ (1/5)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold text-[10px] uppercase">Comentário</label>
                <textarea
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="w-full h-20 p-2.5 rounded bg-background border border-border text-foreground resize-none"
                />
              </div>
              <Button onClick={handleSaveReview} className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold">
                Assinar e Gravar na Blockchain
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
