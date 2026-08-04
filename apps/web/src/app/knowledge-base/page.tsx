"use client"

import React, { useState, useMemo, useEffect } from "react"
import { getStoredArticles } from "@/lib/db-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  BookOpen, 
  Cpu, 
  Wrench, 
  Clock, 
  DollarSign, 
  FileText, 
  X, 
  ExternalLink,
  ChevronRight
} from "lucide-react"

interface Article {
  id: string
  title: string
  deviceBrand: string
  deviceModel: string
  defectKeywords: string[]
  possibleDefects: string[]
  suggestedParts: string[]
  avgTime: string
  avgPrice: number
  toolsNeeded: string[]
  procedureSteps: string[]
}

const localArticles: Article[] = [
  {
    id: "kb_1",
    title: "Falha de Carregamento - Samsung Galaxy S23 Series",
    deviceBrand: "Samsung",
    deviceModel: "Galaxy S23 Ultra",
    defectKeywords: ["carga", "carregar", "usb", "conector", "energia", "bateria"],
    possibleDefects: [
      "Conector USB-C danificado ou com oxidação interna",
      "Solda fria ou trinca na placa filha (sub-board) de carga",
      "FEP (Flex Principal de Interconexão) desconectado ou rompido"
    ],
    suggestedParts: [
      "Conector USB-C original Galaxy S23 Ultra",
      "Placa de Carga Sub-Board Galaxy S23 Ultra",
      "Cabo Flex de Carga Principal"
    ],
    avgTime: "1.5 horas",
    avgPrice: 420.00,
    toolsNeeded: [
      "Estação de retrabalho de ar quente (Quick 861DW)",
      "Ferro de solda ponta faca (JBC)",
      "Microscópio Trinocular",
      "Espátula de teflon e pinça de precisão",
      "Fita Kapton para proteção térmica"
    ],
    procedureSteps: [
      "Remover a tampa traseira com calor a 80ºC e ventosa de sucção.",
      "Desparafusar os blindados de proteção NFC e bobina de indução.",
      "Desconectar a bateria imediatamente para evitar curtos na placa.",
      "Remover o FEP (Flex Principal) e desencaixar a placa filha (sub-board).",
      "Aplicar solda de baixa fusão e substituir o conector USB-C sob o microscópio, ou trocar a sub-board completa.",
      "Limpar resíduos com álcool isopropílico, reencaixar e realizar testes de consumo elétrico no USB Meter."
    ]
  },
  {
    id: "kb_2",
    title: "Troca de Tela Frontal OLED - iPhone 13 Pro",
    deviceBrand: "Apple",
    deviceModel: "iPhone 13 Pro",
    defectKeywords: ["tela", "quebrada", "touch", "display", "risco", "mancha", "vidro"],
    possibleDefects: [
      "Trinca física no vidro do display OLED",
      "Flex do display rompido ou danificado por impacto",
      "Falha no circuito integrado de toque (Touch IC)"
    ],
    suggestedParts: [
      "Tela Frontal OLED iPhone 13 Pro com suporte IC",
      "Adesivo de vedação de tela contra água (Gasket)"
    ],
    avgTime: "1.0 hora",
    avgPrice: 1350.00,
    toolsNeeded: [
      "Aquecedor de tela específico para iPhone (iOpener)",
      "Chave Pentalobe 0.8 e Tri-point Y0.6",
      "Espátula de plástico fina (iFlex)",
      "Pinça antiestática",
      "Dispositivo de reprogramação de True Tone (JCID)"
    ],
    procedureSteps: [
      "Aquecer a parte frontal a 70ºC para amolecer o adesivo de fábrica.",
      "Usar chave Pentalobe para retirar os dois parafusos inferiores da carcaça.",
      "Abrir o painel da esquerda para a direita com muito cuidado para não rasgar o flex do sensor superior.",
      "Desparafusar a blindagem do conector da bateria e desconectá-la.",
      "Desconectar o display e o conjunto de sensores frontais (Face ID).",
      "Ler os dados da tela original no programador JCID e gravá-los na nova tela para preservar a função True Tone.",
      "Instalar o novo adesivo de vedação na carcaça e montar a nova tela."
    ]
  },
  {
    id: "kb_3",
    title: "Reparo de Setor de Alimentação - Notebook Dell Inspiron 15",
    deviceBrand: "Dell",
    deviceModel: "Inspiron 15 3000",
    defectKeywords: ["liga", "energia", "alimentacao", "curto", "placa", "led", "morreu"],
    possibleDefects: [
      "Mosfets de entrada (19V) em curto-circuito",
      "Capacitor de cerâmica da linha de alta (B+) em curto",
      "Falha no CI de Charger (Super I/O ou PWM primário)"
    ],
    suggestedParts: [
      "Mosfet de Entrada 19V N-Channel",
      "Capacitor Cerâmico SMD 10uF 25V",
      "CI PWM de Charger"
    ],
    avgTime: "3.5 horas",
    avgPrice: 850.00,
    toolsNeeded: [
      "Estação de solda e ar quente",
      "Fonte assimétrica DC (regulada em 19V com corrente controlada)",
      "Câmera térmica infravermelha para identificar aquecimento",
      "Multímetro digital calibrado",
      "Breu para identificação visual de dissipação de calor"
    ],
    procedureSteps: [
      "Desmontar o notebook removendo parafusos inferiores e teclado.",
      "Retirar a placa-mãe da carcaça e remover bateria e pilha RTC.",
      "Conectar a fonte assimétrica e aplicar tensão controlada (injetar 1V na linha primária B+).",
      "Usar câmera térmica ou método de evaporação de breu para encontrar o componente em curto (geralmente aquece instantaneamente).",
      "Substituir o componente danificado usando estação de ar quente com bocal apropriado.",
      "Medir a impedância da linha após a troca para certificar que o curto foi eliminado, e ligar a placa-mãe na bancada."
    ]
  }
]

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<Article[]>([])
  const [mounted, setMounted] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL")
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  useEffect(() => {
    setArticles(getStoredArticles())
    setMounted(true)
    setHasLoaded(true)
  }, [])

  // Filtra os artigos
  const filteredArticles = useMemo(() => {
    if (!mounted || !hasLoaded) return []
    return articles.filter(art => {
      const matchSearch =
        art.title.toLowerCase().includes(search.toLowerCase()) ||
        art.deviceModel.toLowerCase().includes(search.toLowerCase()) ||
        art.defectKeywords.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))

      const matchBrand = selectedBrand === "ALL" || art.deviceBrand === selectedBrand

      return matchSearch && matchBrand
    })
  }, [articles, search, selectedBrand, mounted, hasLoaded])

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-xs">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-zinc-300" /> Base de Conhecimento
        </h2>
        <p className="text-sm text-muted-foreground">Artigos técnicos de bancada, guias de reparo detalhados e procedimentos operacionais recomendados.</p>
      </div>

      {/* Busca e Filtros */}
      <div className="grid gap-4 md:grid-cols-4 bg-card/25 border border-border p-4 rounded-lg items-center">
        {/* Barra de Busca */}
        <div className="relative md:col-span-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-4 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            placeholder="Buscar por palavras-chave (Ex: conector, tela, curto, display)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Marca/Fabricante */}
        <div className="space-y-1">
          <select
            className="w-full h-9 px-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
          >
            <option value="ALL">Todas as Marcas</option>
            <option value="Samsung">Samsung</option>
            <option value="Apple">Apple</option>
            <option value="Dell">Dell</option>
          </select>
        </div>
      </div>

      {/* Grid de Artigos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed border-border rounded-lg bg-card/10">
            Nenhum guia técnico correspondente encontrado na base de conhecimento.
          </div>
        ) : (
          filteredArticles.map(art => (
            <Card 
              key={art.id} 
              className="bg-card border-border/80 hover:border-zinc-500/30 hover:bg-card/60 transition-all cursor-pointer flex flex-col justify-between"
              onClick={() => setSelectedArticle(art)}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-wider">{art.deviceBrand}</Badge>
                  <span className="text-[10px] text-muted-foreground">{art.deviceModel}</span>
                </div>
                <CardTitle className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                  {art.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="text-[10px] text-muted-foreground space-y-1.5 border-t border-border/20 pt-3">
                  <p className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Tempo: <span className="font-semibold text-foreground">{art.avgTime}</span></p>
                  <p className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Preço Médio: <span className="font-semibold text-foreground font-mono">R$ {art.avgPrice.toFixed(2)}</span></p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 group pt-2">
                  <span>Ver procedimento completo</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Detalhe do Artigo */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <button 
            onClick={() => setSelectedArticle(null)} 
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-55 bg-zinc-900/60 p-2 rounded-full border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/45">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant="default" className="font-mono text-[9px] uppercase">{selectedArticle.deviceBrand}</Badge>
                  <span className="text-[10px] text-muted-foreground font-semibold">{selectedArticle.deviceModel}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground mt-0.5">{selectedArticle.title}</h3>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs leading-relaxed">
              
              {/* Stats Rápidas */}
              <div className="grid grid-cols-2 gap-4 bg-muted/10 border border-border/20 p-4 rounded-md">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Tempo Médio</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{selectedArticle.avgTime}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Preço Estimado de Serviço</p>
                  <p className="text-sm font-bold text-foreground font-mono mt-0.5">R$ {selectedArticle.avgPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Diagnósticos Relacionados */}
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Chaves de Chancelamento e Diagnósticos</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground">
                  {selectedArticle.possibleDefects.map((def, idx) => (
                    <li key={idx}><span className="text-foreground font-semibold">{def}</span></li>
                  ))}
                </ul>
              </div>

              {/* Peças recomendadas */}
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Peças Solicitadas</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedArticle.suggestedParts.map((part, idx) => (
                    <Badge key={idx} variant="secondary" className="font-semibold text-foreground">{part}</Badge>
                  ))}
                </div>
              </div>

              {/* Ferramentas necessárias */}
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Ferramentas de Bancada Requeridas</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedArticle.toolsNeeded.map((tool, idx) => (
                    <Badge key={idx} variant="outline" className="font-semibold text-zinc-400 border-zinc-700/60">{tool}</Badge>
                  ))}
                </div>
              </div>

              {/* Passos do Procedimento */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Instruções de Desmontagem e Conserto</h4>
                <div className="space-y-3 pl-2 border-l-2 border-border/80">
                  {selectedArticle.procedureSteps.map((step, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="font-semibold text-foreground font-mono text-[10px] block">Passo {idx + 1}</span>
                      <p className="text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-border/40 bg-card/25">
              <Button variant="outline" size="sm" onClick={() => setSelectedArticle(null)}>
                Fechar Artigo
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
