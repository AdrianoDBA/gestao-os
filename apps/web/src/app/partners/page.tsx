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
  Search, Shield, Star, MapPin, Cpu, BookOpen, Send, 
  CheckCircle, ArrowLeft, Plus, MessageSquare, Heart 
} from "lucide-react"

export default function PartnersPage() {
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
      text: "Olá! Sou o Assistente de Match IA do Ecossistema Gestão OS. Descreva o defeito ou o tipo do seu equipamento para eu localizar o especialista ideal próximo de você."
    }
  ])
  const [chatInput, setChatInput] = useState("")
  const [isAISending, setIsAISending] = useState(false)

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
  }, [partners, search, cityFilter, serviceTypeFilter])

  // Lógica de Envio de Mensagem para a IA (Triagem Geográfica e Match)
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
        replyText = `Com base no sintoma relatado, identifiquei a tecnologia correspondente e localizei ${recommended.length} especialista(s) adequado(s) em nossa base:\n\n`
        recommended.forEach(p => {
          replyText += `• ${p.name} (${p.city}/${p.state}) - Especialidade: ${p.specialties.slice(0, 2).join(", ")}. Reputação: ⭐ ${p.rating} (Verificação em Blockchain L2 ativa).\n`
        })
        replyText += "\nQualquer um desses parceiros está qualificado para receber seu chamado!"
      } else {
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

  // Grava nova avaliação com TxHash fictício gerado e persistido em Blockchain local
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
        const avg = parseFloat((totalRating / reviews.length).toFixed(1))
        return {
          ...p,
          reviews,
          rating: avg
        }
      }
      return p
    })

    // Grava também no log geral de blockchain do sistema para auditoria
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
    alert("Avaliação registrada e gravada na Blockchain de forma imutável!")
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground p-8 font-sans">
      
      {/* Cabeçalho superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6 mb-6">
        <div className="space-y-1.5">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-foreground uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Painel Interno OS
          </button>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-500" /> Rede Inteligente de Especialistas
          </h2>
          <p className="text-xs text-muted-foreground">
            Conecte-se a profissionais qualificados por tecnologias atendidas e reputação chancelada via Blockchain.
          </p>
        </div>

        {/* Filtros rápidos de busca */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Especialidade, marca ou tecnologia..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-52 h-9 pl-8 pr-3 text-xs bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
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

      {/* Grid Principal Layout: Esquerda Grade de Cards, Direita Chat de IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Lista de Cards de Especialistas */}
        <div className="lg:col-span-2 space-y-6">
          {filteredPartners.length === 0 ? (
            <p className="text-xs text-zinc-500 py-10 text-center italic">
              Nenhum especialista localizado com os filtros selecionados.
            </p>
          ) : (
            filteredPartners.map(p => (
              <Card key={p.id} className="bg-card/25 border-border/30 backdrop-blur-md overflow-hidden relative">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-100">{p.name}</h4>
                        <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Online
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {p.city} - {p.state}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/5 border border-amber-500/15 px-2 py-1 rounded">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {p.rating}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    {p.bio}
                  </p>

                  {/* Especialidades e Tecnologias */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Especialidades</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {p.specialties.map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-300">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Tecnologias & Marcas</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {p.technologies.map((t: string) => (
                          <Badge key={t} variant="outline" className="text-[9px] border-zinc-700 text-zinc-400">
                            {t}
                          </Badge>
                        ))}
                        {p.brands.map((b: string) => (
                          <Badge key={b} variant="outline" className="text-[9px] border-zinc-800 text-zinc-500">
                            {b}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Lista de Avaliações Registradas */}
                  <div className="border-t border-border/20 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avaliações Verificadas (Blockchain)</h5>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedPartner(p)
                          setIsReviewModalOpen(true)
                        }}
                        className="text-[10px] h-7 font-bold hover:bg-muted/15"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Avaliar
                      </Button>
                    </div>

                    {p.reviews.length === 0 ? (
                      <p className="text-[10px] text-zinc-500 italic">Nenhum feedback registrado ainda.</p>
                    ) : (
                      p.reviews.map((r: any) => (
                        <div key={r.id} className="p-3 bg-zinc-950/20 border border-zinc-800/80 rounded space-y-1.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-semibold text-zinc-300">{r.clientName}</span>
                            <span className="text-zinc-500 text-[9px] flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {r.rating}/5
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[10px] leading-relaxed">{r.comment}</p>
                          <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-border/5">
                            <span className="flex items-center gap-1 text-[8px] font-mono text-zinc-500">
                              <Shield className="w-2.5 h-2.5 text-emerald-500" /> Hash Tx: {r.blockchainTx}
                            </span>
                            <span>Blockchain L2 ativa</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Lado Direito: Chatbot de Triagem IA (Match IA) */}
        <div className="space-y-6">
          <Card className="bg-card/25 border-border/30 backdrop-blur-md h-[550px] flex flex-col overflow-hidden">
            <CardContent className="p-5 flex flex-col h-full space-y-4">
              
              {/* Header do Chat */}
              <div className="border-b border-border/40 pb-3 flex items-center gap-2 shrink-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Match IA & Localizador</h4>
                  <p className="text-[9px] text-muted-foreground">Assistente de Triagem de Bancada</p>
                </div>
              </div>

              {/* Corpo da Conversa */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
                {chatMessages.map((m: any) => (
                  <div 
                    key={m.id} 
                    className={`flex flex-col space-y-1 max-w-[85%] ${
                      m.sender === "USER" ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div 
                      className={`p-3 rounded-lg leading-relaxed ${
                        m.sender === "USER" 
                          ? "bg-zinc-800 text-zinc-100 rounded-tr-none" 
                          : "bg-emerald-950/15 border border-emerald-900/25 text-zinc-300 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-line text-[11px]">{m.text}</p>
                    </div>
                  </div>
                ))}
                {isAISending && (
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] italic">
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    <span>Analisando especialidades...</span>
                  </div>
                )}
              </div>

              {/* Input de Mensagem */}
              <div className="flex items-center gap-2 pt-3 border-t border-border/30 shrink-0">
                <input
                  type="text"
                  placeholder="Ex: Amplificador Marshall JCM800..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleSendChatMessage()
                  }}
                  className="flex-1 h-9 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-foreground"
                />
                <Button 
                  onClick={handleSendChatMessage} 
                  variant="default"
                  size="icon"
                  className="h-9 w-9 bg-amber-500 hover:bg-amber-600 text-zinc-950"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL PARA NOVA AVALIAÇÃO DE PARCEIRO (Gravando na Blockchain) */}
      {isReviewModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col p-6 space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" /> Nova Avaliação Blockchain
              </h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                &times;
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Deixe seu feedback sobre o atendimento de <span className="font-semibold text-zinc-200">{selectedPartner.name}</span>. A nota será assinada criptograficamente.
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold text-[10px] uppercase">Seu Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome completo..."
                  value={clientNameInput}
                  onChange={e => setClientNameInput(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-background border border-border text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold text-[10px] uppercase">Nota (Estrelas)</label>
                <select
                  value={ratingInput}
                  onChange={e => setRatingInput(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded bg-background border border-border text-foreground focus:outline-none"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Estrelas)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Estrelas)</option>
                  <option value={3}>⭐⭐⭐ (3 Estrelas)</option>
                  <option value={2}>⭐⭐ (2 Estrelas)</option>
                  <option value={1}>⭐ (1 Estrela)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold text-[10px] uppercase">Comentário</label>
                <textarea
                  placeholder="Descreva sua experiência..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="w-full h-20 p-2.5 rounded bg-background border border-border text-foreground focus:outline-none resize-none"
                />
              </div>

              <Button
                onClick={handleSaveReview}
                variant="default"
                size="sm"
                className="w-full bg-amber-500 hover:bg-amber-600 text-xs text-zinc-950 font-bold"
              >
                Gravar Avaliação Criptográfica
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
