import { Injectable } from "@nestjs/common"

export interface KnowledgeArticle {
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

@Injectable()
export class AIService {
  // Base de conhecimento em memória para fins demonstrativos e alta fidelidade
  private knowledgeBase: KnowledgeArticle[] = [
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

  async getSuggestions(brandName: string, modelName: string, reportedDefect: string) {
    const defectLower = reportedDefect.toLowerCase()
    const brandLower = brandName.toLowerCase()
    const modelLower = modelName.toLowerCase()

    // Busca artigo correspondente por palavra-chave no defeito informado e modelo
    const match = this.knowledgeBase.find(art => {
      const matchBrand = brandLower.includes(art.deviceBrand.toLowerCase()) || art.deviceBrand.toLowerCase().includes(brandLower)
      const matchDefect = art.defectKeywords.some(keyword => defectLower.includes(keyword))
      return matchBrand && matchDefect
    })

    if (match) {
      return {
        found: true,
        possibleDefects: match.possibleDefects,
        suggestedParts: match.suggestedParts,
        avgTime: match.avgTime,
        avgPrice: match.avgPrice,
        toolsNeeded: match.toolsNeeded,
        procedureSteps: match.procedureSteps
      }
    }

    // Heurística de Fallback inteligente caso não ache nenhum artigo exato
    const isApple = brandLower.includes("apple") || modelLower.includes("iphone") || modelLower.includes("macbook")
    const isConsole = brandLower.includes("sony") || brandLower.includes("microsoft") || modelLower.includes("playstation") || modelLower.includes("xbox") || modelLower.includes("nintendo")

    return {
      found: false,
      possibleDefects: [
        `Falha interna no circuito correspondente ao sintoma: "${reportedDefect}"`,
        "Necessário diagnóstico avançado com multímetro e esquema elétrico",
        "Desgaste natural de conexões ou soldas físicas"
      ],
      suggestedParts: isApple 
        ? ["Linhagem de peças de reposição Premium Apple", "Adesivos de fixação e selagem"] 
        : isConsole 
        ? ["Pasta térmica de alta performance (Metal Líquido/Gelid)", "Componentes SMD do setor primário"]
        : ["Peças sob demanda específicas do modelo", "Insumos gerais de reparo de bancada"],
      avgTime: isConsole ? "2.5 horas" : "2.0 horas",
      avgPrice: isApple ? 480.00 : 350.00,
      toolsNeeded: [
        "Multímetro Digital",
        "Estação de Ar Quente",
        "Microscópio Binocular",
        "Jogo de Chaves de Precisão",
        "Manta Antiestática ESD"
      ],
      procedureSteps: [
        "Efetuar abertura do aparelho documentando o estado estético externo.",
        "Desconectar a alimentação principal (bateria/cabo de força).",
        "Inspecionar visualmente a placa à procura de marcas de queima ou oxidação.",
        "Efetuar testes de resistência elétrica nas principais bobinas de alimentação.",
        "Montar provisoriamente para validação dos consumos elétricos."
      ]
    }
  }

  async searchKnowledgeBase(query?: string) {
    if (!query) {
      return this.knowledgeBase
    }

    const queryLower = query.toLowerCase()

    return this.knowledgeBase.filter(art => {
      return (
        art.title.toLowerCase().includes(queryLower) ||
        art.deviceBrand.toLowerCase().includes(queryLower) ||
        art.deviceModel.toLowerCase().includes(queryLower) ||
        art.defectKeywords.some(keyword => keyword.toLowerCase().includes(queryLower)) ||
        art.procedureSteps.some(step => step.toLowerCase().includes(queryLower))
      )
    })
  }
}
