"use client"

import { Customer, Device, Part, Transaction, ServiceOrder, CashSession, SystemConfig, SystemLog } from "@/types"

// --- CLIENTES INICIAIS ---
export const initialCustomersList = [
  {
    id: "c1",
    name: "João Pedro Santos",
    document: "12345678909",
    documentType: "PF" as const,
    birthDate: "1990-05-15",
    phone: "11987654321",
    whatsapp: "11987654321",
    whatsappSameAsPhone: true,
    email: "joao.pedro@gmail.com",
    cep: "01311-100",
    address: "Avenida Paulista",
    addressNumber: "1000",
    complement: "Apt 12",
    bairro: "Cerqueira César",
    city: "São Paulo",
    state: "SP",
    notes: "Cliente exige peças originais e atendimento rápido.",
    isActive: true,
    createdAt: "2026-01-10T10:00:00Z",
    history: [
      { id: "h1", date: "2026-01-10T10:00:00Z", action: "Cadastro inicial realizado", user: "Mariana Silva" },
      { id: "h2", date: "2026-07-25T14:00:00Z", action: "Endereço atualizado", user: "Mariana Silva" }
    ],
    devices: [
      { id: "d1", brandName: "Samsung", modelName: "Galaxy S23 Ultra", serialNumber: "9876543210123" }
    ],
    serviceOrders: [
      { id: "o1", number: 1042, status: "READY", reportedDefect: "Substituição de Conector e limpeza", totalAmount: 650.00, entryDate: "2026-07-25" }
    ]
  },
  {
    id: "c2",
    name: "Carla Ramos Souza",
    document: "98765432100",
    documentType: "PF" as const,
    birthDate: "1988-09-20",
    phone: "21988887777",
    whatsapp: "21988887777",
    whatsappSameAsPhone: true,
    email: "carla.souza@outlook.com",
    cep: "22020-001",
    address: "Rua Copacabana",
    addressNumber: "450",
    complement: "",
    bairro: "Copacabana",
    city: "Rio de Janeiro",
    state: "RJ",
    notes: "Cliente preferencial de delivery.",
    isActive: true,
    createdAt: "2026-02-15T09:00:00Z",
    history: [
      { id: "h3", date: "2026-02-15T09:00:00Z", action: "Cadastro inicial realizado", user: "Mariana Silva" }
    ],
    devices: [
      { id: "d2", brandName: "Apple", modelName: "iPhone 13 Pro", serialNumber: "C39GL8P9N70D" }
    ],
    serviceOrders: [
      { id: "o2", number: 1041, status: "IN_REPAIR", reportedDefect: "Troca de bateria (Saúde em 74%)", totalAmount: 380.00, entryDate: "2026-07-28" }
    ]
  },
  {
    id: "c3",
    name: "Roberto Dias Filho",
    document: "11222333000181",
    documentType: "PJ" as const,
    birthDate: "",
    phone: "3134567890",
    whatsapp: "31999998888",
    whatsappSameAsPhone: false,
    email: "financeiro@robertodias.com.br",
    cep: "30110-001",
    address: "Avenida Contorno",
    addressNumber: "8000",
    complement: "Bloco B",
    bairro: "Savassi",
    city: "Belo Horizonte",
    state: "MG",
    notes: "Cliente corporativo com faturamento mensal.",
    isActive: true,
    createdAt: "2026-03-01T11:00:00Z",
    history: [
      { id: "h4", date: "2026-03-01T11:00:00Z", action: "Cadastro corporativo inicial", user: "Adriano Medeiros" }
    ],
    devices: [
      { id: "d3", brandName: "Dell", modelName: "Inspiron 15 3000", serialNumber: "5G7H2K3" },
      { id: "d4", brandName: "Sony", modelName: "PlayStation 5 Slim", serialNumber: "S01-92384729-A" }
    ],
    serviceOrders: [
      { id: "o3", number: 1040, status: "BUDGETED", reportedDefect: "Notebook não liga - Placa mãe em curto", totalAmount: 1200.00, entryDate: "2026-07-27" }
    ]
  },
  {
    id: "c4",
    name: "Mariana Costa Neves",
    document: "44455566677",
    documentType: "PF" as const,
    birthDate: "1995-12-01",
    phone: "11999991111",
    whatsapp: "11999991111",
    whatsappSameAsPhone: true,
    email: "mari.neves@gmail.com",
    cep: "01305-100",
    address: "Rua Augusta",
    addressNumber: "1200",
    complement: "",
    bairro: "Consolação",
    city: "São Paulo",
    state: "SP",
    notes: "Indicação de outro cliente.",
    isActive: false,
    createdAt: "2026-04-10T15:00:00Z",
    history: [
      { id: "h5", date: "2026-04-10T15:00:00Z", action: "Cadastro inicial realizado", user: "Mariana Silva" },
      { id: "h6", date: "2026-07-29T10:00:00Z", action: "Módulo inativado pelo administrador", user: "Adriano Medeiros" }
    ],
    devices: [],
    serviceOrders: []
  }
]

// --- DISPOSITIVOS INICIAIS ---
export const initialDevicesList = [
  {
    id: "dev1",
    customerId: "c1",
    brandName: "Samsung",
    modelName: "Galaxy S23 Ultra",
    serialNumber: "9876543210123",
    imei: "351234567890123",
    password: "Padrão desenhado em L",
    color: "Verde Escuro",
    physicalState: "Aparelho bem conservado, película com trinco discreto",
    reportedDefect: "Aparelho desliga sozinho após 10 minutos de uso em jogos",
    accessories: "Carregador Samsung original e capa preta",
    observations: "Aparelho apresenta alto aquecimento antes de desligar.",
    createdAt: "2026-07-25T11:00:00Z",
    status: "ACTIVE" as const,
    photos: {
      front: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=120&auto=format&fit=crop&q=60",
      back: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=120&auto=format&fit=crop&q=60",
      others: []
    },
    checklist: {
      "Tela": "OK" as const,
      "Touch": "OK" as const,
      "Botões": "OK" as const,
      "Microfone": "OK" as const,
      "Alto-falante": "DEFECT" as const,
      "Câmera": "OK" as const,
      "FaceID": "NOT_TESTED" as const,
      "TouchID": "NOT_TESTED" as const,
      "Wi-Fi": "OK" as const,
      "Bluetooth": "OK" as const,
      "Carcaça": "OK" as const,
      "Bateria": "DEFECT" as const,
      "Conector": "OK" as const
    },
    history: [
      { id: "dh1", date: "2026-07-25T11:00:00Z", action: "Entrada na bancada", details: "Ordem de serviço #1042 iniciada." },
      { id: "dh2", date: "2026-07-28T16:00:00Z", action: "Substituição de peça", details: "Conector USB-C trocado com sucesso." }
    ],
    customerName: "João Pedro Santos",
    category: "Celular" as const,
    serviceOrders: [
      { id: "o1", number: 1042, status: "READY", reportedDefect: "Substituição de Conector e limpeza", totalAmount: 650.00, entryDate: "2026-07-25" }
    ]
  },
  {
    id: "dev2",
    customerId: "c2",
    brandName: "Apple",
    modelName: "iPhone 13 Pro",
    serialNumber: "C39GL8P9N70D",
    imei: "359876543210987",
    password: "Pin de desbloqueio: 2580",
    color: "Azul Sierra",
    physicalState: "Riscos na tampa traseira, tela intacta",
    reportedDefect: "Troca de bateria (Saúde em 74%)",
    accessories: "Apenas aparelho",
    observations: "Aparelho esquenta levemente ao carregar.",
    createdAt: "2026-07-28T10:00:00Z",
    status: "ACTIVE" as const,
    photos: {
      front: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=120&auto=format&fit=crop&q=60",
      back: "",
      others: []
    },
    checklist: {
      "Tela": "OK" as const,
      "Touch": "OK" as const,
      "Botões": "OK" as const,
      "Microfone": "OK" as const,
      "Alto-falante": "OK" as const,
      "Câmera": "OK" as const,
      "FaceID": "OK" as const,
      "TouchID": "NOT_TESTED" as const,
      "Wi-Fi": "OK" as const,
      "Bluetooth": "OK" as const,
      "Carcaça": "DEFECT" as const,
      "Bateria": "DEFECT" as const,
      "Conector": "OK" as const
    },
    history: [
      { id: "dh3", date: "2026-07-28T10:00:00Z", action: "Entrada na bancada", details: "Ordem de serviço #1041 iniciada." }
    ],
    customerName: "Carla Ramos Souza",
    category: "Celular" as const,
    serviceOrders: [
      { id: "o2", number: 1041, status: "IN_REPAIR", reportedDefect: "Troca de bateria (Saúde em 74%)", totalAmount: 380.00, entryDate: "2026-07-28" }
    ]
  },
  {
    id: "dev3",
    customerId: "c3",
    brandName: "Dell",
    modelName: "Inspiron 15 3000",
    serialNumber: "5G7H2K3",
    imei: "",
    password: "",
    color: "Chumbo",
    physicalState: "Carcaça com marcas de impacto leves, dobradiça firme",
    reportedDefect: "Notebook não liga - Placa mãe em curto",
    accessories: "Fonte de alimentação original Dell",
    observations: "Notebook parou após chuva com raios.",
    createdAt: "2026-07-27T09:00:00Z",
    status: "ACTIVE" as const,
    photos: {
      front: "",
      back: "",
      others: []
    },
    checklist: {
      "Tela": "NOT_TESTED" as const,
      "Touch": "NOT_TESTED" as const,
      "Botões": "OK" as const,
      "Microfone": "NOT_TESTED" as const,
      "Alto-falante": "NOT_TESTED" as const,
      "Câmera": "NOT_TESTED" as const,
      "FaceID": "NOT_TESTED" as const,
      "TouchID": "NOT_TESTED" as const,
      "Wi-Fi": "NOT_TESTED" as const,
      "Bluetooth": "NOT_TESTED" as const,
      "Carcaça": "DEFECT" as const,
      "Bateria": "NOT_TESTED" as const,
      "Conector": "DEFECT" as const
    },
    history: [
      { id: "dh4", date: "2026-07-27T09:00:00Z", action: "Entrada na bancada", details: "Ordem de serviço #1040 iniciada." }
    ],
    customerName: "Roberto Dias Filho",
    category: "Notebook" as const,
    serviceOrders: [
      { id: "o3", number: 1040, status: "BUDGETED", reportedDefect: "Notebook não liga - Placa mãe em curto", totalAmount: 1200.00, entryDate: "2026-07-27" }
    ]
  },
  {
    id: "dev4",
    customerId: "c3",
    brandName: "Sony",
    modelName: "PlayStation 5 Slim",
    serialNumber: "S01-92384729-A",
    imei: "",
    password: "",
    color: "Branco/Preto",
    physicalState: "Playstation muito limpo, acompanha 1 controle",
    reportedDefect: "Console liga, apresenta bipe, mas não dá vídeo (Luz azul piscante)",
    accessories: "Cabo HDMI, Cabo de força e 1 controle original",
    observations: "Aparelho nunca foi aberto anteriormente (selo de garantia intacto).",
    createdAt: "2026-07-29T11:00:00Z",
    status: "ACTIVE" as const,
    photos: {
      front: "",
      back: "",
      others: []
    },
    checklist: {},
    history: [
      { id: "dh5", date: "2026-07-29T11:00:00Z", action: "Cadastro de aparelho", details: "Registrado no acervo do cliente." }
    ],
    customerName: "Roberto Dias Filho",
    category: "Videogame" as const,
    serviceOrders: []
  }
]

// --- ESTOQUE / PEÇAS INICIAIS ---
export const initialInventoryList = [
  {
    id: "p1",
    name: "Tela OLED iPhone 13 Pro",
    sku: "TEL-IPH13P-OLED",
    barcode: "7891234567890",
    description: "Tela frontal homologada EAN-13, excelente brilho e resposta táctil",
    costPrice: 300.00,
    salePrice: 650.00,
    minStock: 2,
    location: "Gaveteiro A - Linha 2",
    quantity: 5,
    movements: [
      { id: "m1", type: "INPUT", quantity: 5, reason: "Lote inicial de compra", createdAt: "2026-07-20" }
    ]
  },
  {
    id: "p2",
    name: "Conector de Carga USB-C S23 Ultra",
    sku: "CON-S23U-USBC",
    barcode: "7899876543210",
    description: "Subplaca de carga contendo conector USB tipo C e microfone secundário",
    costPrice: 80.00,
    salePrice: 200.00,
    minStock: 3,
    location: "Caixa Plástica Azul 1",
    quantity: 1,
    movements: [
      { id: "m2", type: "INPUT", quantity: 3, reason: "Fornecedor Tech Parts", createdAt: "2026-07-22" },
      { id: "m3", type: "OUTPUT", quantity: 2, reason: "Consumo automático na OS #1042", createdAt: "2026-07-28" }
    ]
  },
  {
    id: "p3",
    name: "Bateria iPhone 13 Pro Premium",
    sku: "BAT-IPH13P-PREM",
    barcode: "7894561230789",
    description: "Bateria de polímero de lítio com chip controlador de carga",
    costPrice: 90.00,
    salePrice: 200.00,
    minStock: 2,
    location: "Gaveteiro A - Linha 5",
    quantity: 3,
    movements: [
      { id: "m4", type: "INPUT", quantity: 4, reason: "Lote importação direta", createdAt: "2026-07-24" },
      { id: "m5", type: "OUTPUT", quantity: 1, reason: "Consumo automático na OS #1041", createdAt: "2026-07-28" }
    ]
  },
  {
    id: "p4",
    name: "Mosfet de Entrada 19V Notebook Dell",
    sku: "MOS-DELL-19V",
    barcode: "",
    description: "Mosfet canal N para reparo avançado de circuitos integrados de notebooks",
    costPrice: 5.00,
    salePrice: 15.00,
    minStock: 10,
    location: "Gaveta Organizadora 04",
    quantity: 8,
    movements: [
      { id: "m6", type: "INPUT", quantity: 10, reason: "Compra atacado eletrônica", createdAt: "2026-07-21" },
      { id: "m7", type: "OUTPUT", quantity: 2, reason: "Consumo automático na OS #1040", createdAt: "2026-07-27" }
    ]
  }
]

// --- FINANCEIRO INICIAIS ---
export const initialTransactionsList = [
  {
    id: "t1",
    description: "Recebimento OS #1042 - Samsung S23 Ultra",
    type: "REVENUE",
    amount: 650.00,
    dueDate: "2026-07-28",
    entityName: "João Pedro Santos",
    isPaid: true,
    paymentMethod: "PIX",
    paymentDate: "2026-07-28"
  },
  {
    id: "t2",
    description: "Recebimento OS #1041 - iPhone 13 Pro",
    type: "REVENUE",
    amount: 380.00,
    dueDate: "2026-07-28",
    entityName: "Carla Ramos Souza",
    isPaid: true,
    paymentMethod: "CREDIT_CARD",
    paymentDate: "2026-07-28"
  },
  {
    id: "t3",
    description: "Orçamento OS #1040 - Notebook Dell (Circuitos)",
    type: "REVENUE",
    amount: 1200.00,
    dueDate: "2026-07-30",
    entityName: "Roberto Dias Filho",
    isPaid: false,
    paymentMethod: undefined,
    paymentDate: null
  },
  {
    id: "t4",
    description: "Compra de Lote de Telas OLED iPhone 13 Pro",
    type: "EXPENSE",
    amount: 1500.00,
    dueDate: "2026-07-25",
    entityName: "Fornecedor Alpha Telas",
    isPaid: true,
    paymentMethod: "PIX",
    paymentDate: "2026-07-25"
  },
  {
    id: "t5",
    description: "Aluguel Mensal do Laboratório",
    type: "EXPENSE",
    amount: 2500.00,
    dueDate: "2026-08-05",
    entityName: "Imobiliária Prime",
    isPaid: false,
    paymentMethod: undefined,
    paymentDate: null
  }
]

// --- ORDENS DE SERVIÇO INICIAIS ---
export const initialOrdersList = [
  {
    id: "os1",
    number: 1042,
    customerId: "c1",
    deviceId: "d1",
    technicianId: "t1",
    status: "READY",
    priority: "HIGH",
    reportedDefect: "Substituição de Conector e limpeza",
    accessories: "Carregador Samsung original e capa preta",
    checklist: { wifi: true, audio: true, camera: true, touch: true, buttons: true, charging: true },
    laborAmount: 450.00,
    partsAmount: 200.00,
    totalAmount: 650.00,
    notes: "Aparelho desliga sozinho após 10 minutos de uso em jogos. Peça trocada.",
    entryDate: "2026-07-25",
    exitDate: null,
    customer: { name: "João Pedro Santos" },
    device: { brandName: "Samsung", modelName: "Galaxy S23 Ultra", serialNumber: "9876543210123" },
    technician: { name: "Claudio Técnico" },
    diagnostics: [
      {
        id: "diag1",
        technicalReport: "Conector USB-C com pinos rompidos e muita oxidação interna.",
        solutionProposed: "Troca da subplaca de carga e desoxidação química dos componentes periféricos.",
        isApproved: true,
        createdAt: "2026-07-26"
      }
    ],
    histories: [
      { id: "h1", fromStatus: "PENDING", toStatus: "UNDER_ANALYSIS", changedAt: "2026-07-25", user: { name: "Adriano" }, observation: "Envio para a bancada" },
      { id: "h2", fromStatus: "UNDER_ANALYSIS", toStatus: "BUDGETED", changedAt: "2026-07-26", user: { name: "Claudio Técnico" }, observation: "Laudo emitido" },
      { id: "h3", fromStatus: "BUDGETED", toStatus: "APPROVED", changedAt: "2026-07-26", user: { name: "Adriano" }, observation: "Aprovado pelo cliente" },
      { id: "h4", fromStatus: "APPROVED", toStatus: "IN_REPAIR", changedAt: "2026-07-27", user: { name: "Claudio Técnico" }, observation: "Manutenção iniciada" },
      { id: "h5", fromStatus: "IN_REPAIR", toStatus: "READY", changedAt: "2026-07-28", user: { name: "Claudio Técnico" }, observation: "Troca realizada" }
    ],
    warranties: [
      { id: "w1", termDays: 90, startDate: "2026-07-28", endDate: "2026-10-26", conditions: "Garantia cobrindo defeito no conector substituído." }
    ],
    partsUsed: [
      { id: "pu1", quantity: 1, priceCharged: 200.00, part: { name: "Subplaca de Carga S23 Ultra" } }
    ],
    servicesUsed: [
      { id: "su1", description: "Substituição de Conector e limpeza", amount: 450.00 }
    ]
  },
  {
    id: "os2",
    number: 1041,
    customerId: "c2",
    deviceId: "d2",
    technicianId: "t1",
    status: "IN_REPAIR",
    priority: "MEDIUM",
    reportedDefect: "Troca de bateria (Saúde em 74%)",
    accessories: "Apenas aparelho",
    checklist: { wifi: true, audio: true, camera: true, touch: true, buttons: true, charging: true },
    laborAmount: 180.00,
    partsAmount: 200.00,
    totalAmount: 380.00,
    notes: "Aparelho aberto para a troca da célula de bateria",
    entryDate: "2026-07-28",
    exitDate: null,
    customer: { name: "Carla Ramos Souza" },
    device: { brandName: "Apple", modelName: "iPhone 13 Pro", serialNumber: "C39GL8P9N70D" },
    technician: { name: "Claudio Técnico" },
    diagnostics: [],
    histories: [
      { id: "h2_1", fromStatus: "PENDING", toStatus: "UNDER_ANALYSIS", changedAt: "2026-07-28", user: { name: "Adriano" } },
      { id: "h2_2", fromStatus: "UNDER_ANALYSIS", toStatus: "IN_REPAIR", changedAt: "2026-07-28", user: { name: "Claudio Técnico" } }
    ],
    warranties: [],
    partsUsed: [
      { id: "pu2", quantity: 1, priceCharged: 200.00, part: { name: "Bateria iPhone 13 Pro Premium" } }
    ],
    servicesUsed: [
      { id: "su2", description: "Troca de bateria", amount: 180.00 }
    ]
  },
  {
    id: "os3",
    number: 1040,
    customerId: "c3",
    deviceId: "d3",
    technicianId: null,
    status: "BUDGETED",
    priority: "MEDIUM",
    reportedDefect: "Notebook não liga - Placa mãe em curto",
    accessories: "Fonte de alimentação original Dell",
    checklist: { wifi: false, audio: false, camera: false, touch: false, buttons: false, charging: false },
    laborAmount: 800.00,
    partsAmount: 400.00,
    totalAmount: 1200.00,
    notes: "Notebook parou após chuva com raios. Não acende nenhum led. Precisa de reparo de placa-mãe.",
    entryDate: "2026-07-27",
    exitDate: null,
    customer: { name: "Roberto Dias Filho" },
    device: { brandName: "Dell", modelName: "Inspiron 15 3000", serialNumber: "5G7H2K3" },
    technician: null,
    diagnostics: [
      {
        id: "diag3",
        technicalReport: "Mosfets de entrada da placa mãe em curto-circuito devido à sobretensão na rede elétrica.",
        solutionProposed: "Substituição de mosfets e capacitores de cerâmica da linha de 19V.",
        isApproved: null,
        createdAt: "2026-07-27"
      }
    ],
    histories: [
      { id: "h3_1", fromStatus: "PENDING", toStatus: "UNDER_ANALYSIS", changedAt: "2026-07-27", user: { name: "Adriano" } },
      { id: "h3_2", fromStatus: "UNDER_ANALYSIS", toStatus: "BUDGETED", changedAt: "2026-07-27", user: { name: "Claudio Técnico" } }
    ],
    warranties: [],
    partsUsed: [
      { id: "pu3", quantity: 2, priceCharged: 200.00, part: { name: "Mosfet de Entrada 19V" } }
    ],
    servicesUsed: [
      { id: "su3", description: "Reparo de placa mãe avançado", amount: 800.00 }
    ]
  }
]

// --- PERSISTÊNCIA GENÉRICA ---
export const getStoredCustomers = (): Customer[] => {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem("customers_list")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("customers_list", JSON.stringify([]))
  return []
}

export const saveStoredCustomers = (list: Customer[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("customers_list", JSON.stringify(list))
}

export const getStoredDevices = (): Device[] => {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem("devices_list")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("devices_list", JSON.stringify([]))
  return []
}

export const saveStoredDevices = (list: Device[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("devices_list", JSON.stringify(list))
}

export const getStoredInventory = (): Part[] => {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem("inventory_list")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("inventory_list", JSON.stringify([]))
  return []
}

export const saveStoredInventory = (list: Part[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("inventory_list", JSON.stringify(list))
}

export const getStoredTransactions = (): Transaction[] => {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem("transactions_list")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("transactions_list", JSON.stringify([]))
  return []
}

export const saveStoredTransactions = (list: Transaction[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("transactions_list", JSON.stringify(list))
}

export const getStoredOrders = (): ServiceOrder[] => {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem("orders_list")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("orders_list", JSON.stringify([]))
  return []
}

export const saveStoredOrders = (list: ServiceOrder[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("orders_list", JSON.stringify(list))
}

// --- PERSISTÊNCIA FINANCEIRA DO ÉPICO 5 ---

const defaultPaymentMethods = [
  "PIX", "Dinheiro", "Débito", "Crédito", "Transferência", "Boleto", "Cheque", "Vale", "Outros"
]

const defaultFinanceCategories = [
  "Receita", "Serviços", "Peças", "Compras", "Salários", "Energia", "Internet", "Impostos", "Marketing", "Outros"
]

const defaultCashSession: CashSession = {
  id: "session_init",
  isOpen: false,
  openedBy: "",
  openedAt: "",
  initialBalance: 0,
  movements: []
}

export const getStoredCashSession = (): CashSession => {
  if (typeof window === "undefined") return defaultCashSession
  const saved = localStorage.getItem("cash_session")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("cash_session", JSON.stringify(defaultCashSession))
  return defaultCashSession
}

export const saveStoredCashSession = (session: CashSession) => {
  if (typeof window === "undefined") return
  localStorage.setItem("cash_session", JSON.stringify(session))
}

export const getStoredPaymentMethods = (): string[] => {
  if (typeof window === "undefined") return defaultPaymentMethods
  const saved = localStorage.getItem("payment_methods")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("payment_methods", JSON.stringify(defaultPaymentMethods))
  return defaultPaymentMethods
}

export const saveStoredPaymentMethods = (methods: string[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("payment_methods", JSON.stringify(methods))
}

export const getStoredFinanceCategories = (): string[] => {
  if (typeof window === "undefined") return defaultFinanceCategories
  const saved = localStorage.getItem("finance_categories")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("finance_categories", JSON.stringify(defaultFinanceCategories))
  return defaultFinanceCategories
}

export const saveStoredFinanceCategories = (categories: string[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("finance_categories", JSON.stringify(categories))
}

// --- PERSISTÊNCIA DE CONFIGURAÇÕES E LOGS DO ÉPICO 7 ---

const defaultSystemConfig: SystemConfig = {
  company: {
    name: "",
    tradeName: "",
    cnpj: "",
    ie: "",
    address: "",
    cep: "",
    city: "",
    state: "",
    country: "Brasil",
    phone: "",
    whatsapp: "",
    email: "",
    website: ""
  },
  visual: {
    theme: "DARK",
    primaryColor: "#09090b",
    secondaryColor: "#27272a",
    accentColor: "#3b82f6"
  },
  os: {
    prefix: "OS",
    nextNumber: 1000,
    defaultWarrantyDays: 90,
    requiredFields: ["customerId", "deviceId", "reportedDefect"]
  },
  financial: {
    currency: "BRL",
    decimals: 2,
    interestDefault: 1.0,
    fineDefault: 2.0,
    maxDiscountPercent: 15.0
  },
  inventory: {
    minStockDefault: 5,
    allowNegativeStock: false,
    alertOnLowStock: true
  },
  smtp: {
    host: "",
    port: 2525,
    user: "",
    from: "",
    encryption: "TLS"
  },
  whatsapp: {
    number: "",
    token: "",
    webhook: "",
    autoMessageReady: "Olá {cliente}, seu equipamento {modelo} (OS #{numero}) está pronto para retirada!"
  },
  templates: {
    receiptHeader: "RECIBO DE ORDEM DE SERVIÇO",
    receiptFooter: "Equipamento testado e aprovado em laboratório.",
    warrantyTerms: "Garantia legal de 90 dias a partir da data de entrega, cobrindo exclusivamente as peças substituídas.",
    technicalReportTerms: "Laudo técnico elaborado por equipe de hardware."
  },
  security: {
    sessionTimeoutMinutes: 30,
    passwordMinLength: 6,
    maxLoginAttempts: 5,
    twoFactorEnabled: false
  }
}

const defaultSystemLogs: SystemLog[] = []

export const getStoredSystemConfig = (): SystemConfig => {
  if (typeof window === "undefined") return defaultSystemConfig
  const saved = localStorage.getItem("system_config")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("system_config", JSON.stringify(defaultSystemConfig))
  return defaultSystemConfig
}

export const saveStoredSystemConfig = (config: SystemConfig) => {
  if (typeof window === "undefined") return
  localStorage.setItem("system_config", JSON.stringify(config))
}

export const getStoredSystemLogs = (): SystemLog[] => {
  if (typeof window === "undefined") return defaultSystemLogs
  const saved = localStorage.getItem("system_logs")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("system_logs", JSON.stringify(defaultSystemLogs))
  return defaultSystemLogs
}

export const saveStoredSystemLogs = (logs: SystemLog[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("system_logs", JSON.stringify(logs))
}

const defaultPartners = [
  {
    id: "partner_1",
    name: "Claudio Técnico Especialista",
    email: "claudio@especialista.com",
    bio: "Especialista em equipamentos de áudio vintage, amplificadores valvulados e restauração.",
    specialties: ["Amplificador Valvulado", "Mesa de Som", "Pedais de Efeito"],
    technologies: ["Valvulado", "Analógico", "SMD"],
    brands: ["Marshall", "Fender", "Vox", "Orange"],
    devices: ["Audio", "Instrumento Musical"],
    city: "São Paulo",
    state: "SP",
    latitude: -23.5505,
    longitude: -46.6333,
    serviceType: "PRESENTIAL",
    rating: 4.9,
    reviews: [
      { id: "rev_1", clientName: "Roberto Filho", rating: 5, comment: "Excelente reparo no meu Marshall JCM800. Altamente qualificado!", blockchainTx: "0x39a823b8f9e0a12c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d" }
    ]
  },
  {
    id: "partner_2",
    name: "Mariana Microsoldagem",
    email: "mariana@microsoldagem.com",
    bio: "Recuperação avançada de placas de notebooks, MacBooks e consoles de videogame.",
    specialties: ["Reparo de Placa Mãe", "Reballing BGA", "Curto em Linhas Primárias"],
    technologies: ["SMD", "BGA", "Digital"],
    brands: ["Apple", "Dell", "Sony", "Microsoft"],
    devices: ["Notebook", "Videogame"],
    city: "Campinas",
    state: "SP",
    latitude: -22.9056,
    longitude: -47.0608,
    serviceType: "HYBRID",
    rating: 4.8,
    reviews: []
  },
  {
    id: "partner_3",
    name: "Rodrigo Consoles & Games",
    email: "rodrigo@games.com",
    bio: "Manutenção de consoles modernos (PS5, Xbox Series X, Nintendo Switch) com troca de HDMI e portas de energia.",
    specialties: ["Consoles de Videogame", "Troca de Porta HDMI", "Troca de Pasta Térmica"],
    technologies: ["SMD", "Digital"],
    brands: ["Sony", "Microsoft", "Nintendo"],
    devices: ["Videogame"],
    city: "Belo Horizonte",
    state: "MG",
    latitude: -19.9191,
    longitude: -43.9378,
    serviceType: "PRESENTIAL",
    rating: 4.7,
    reviews: []
  },
  {
    id: "partner_4",
    name: "Ana Paula Telas",
    email: "anapaula@telas.com",
    bio: "Substituição e reparos rápidos de displays OLED, AMOLED e vidros blindados de celulares.",
    specialties: ["Troca de Tela", "Troca de Vidro", "Bateria de Celular"],
    technologies: ["Digital", "Microeletrônica"],
    brands: ["Apple", "Samsung", "Xiaomi", "Motorola"],
    devices: ["Smartphone", "Tablet"],
    city: "Rio de Janeiro",
    state: "RJ",
    latitude: -22.9068,
    longitude: -43.1729,
    serviceType: "HYBRID",
    rating: 4.9,
    reviews: []
  },
  {
    id: "partner_5",
    name: "Lucas Drones & Gimbal",
    email: "lucas@drones.com",
    bio: "Especialista em calibração de sensores, reparos em motores brushless e troca de carcaças de Drones.",
    specialties: ["Drones", "Gimbal", "Calibração de Sensores"],
    technologies: ["Robótica", "Digital", "SMD"],
    brands: ["DJI", "Fimi", "Xiaomi"],
    devices: ["Drone"],
    city: "Curitiba",
    state: "PR",
    latitude: -25.4290,
    longitude: -49.2671,
    serviceType: "HYBRID",
    rating: 5.0,
    reviews: []
  },
  {
    id: "partner_6",
    name: "Beatriz Câmeras Profissionais",
    email: "beatriz@cameras.com",
    bio: "Limpeza técnica de sensor CCD/CMOS, troca de obturador e manutenção em lentes DSLR/Mirrorless.",
    specialties: ["Câmeras Fotográficas", "Lentes", "Limpeza de Sensor"],
    technologies: ["Óptica", "Mecânica", "Digital"],
    brands: ["Canon", "Nikon", "Sony", "Fujifilm"],
    devices: ["Câmera", "Equipamento Pro"],
    city: "Porto Alegre",
    state: "RS",
    latitude: -30.0346,
    longitude: -51.2177,
    serviceType: "HYBRID",
    rating: 4.8,
    reviews: []
  },
  {
    id: "partner_7",
    name: "Gabriel Smart TVs & Monitores",
    email: "gabriel@tvs.com",
    bio: "Substituição de barramento de LED e placas fonte de Smart TVs LED, OLED e QLED.",
    specialties: ["Smart TVs", "Monitores", "Reparo de Placa Fonte"],
    technologies: ["Analógico", "Digital", "LED/OLED"],
    brands: ["Samsung", "LG", "Philips", "TCL"],
    devices: ["TV", "Monitor"],
    city: "Salvador",
    state: "BA",
    latitude: -12.9777,
    longitude: -38.5016,
    serviceType: "PRESENTIAL",
    rating: 4.6,
    reviews: []
  },
  {
    id: "partner_8",
    name: "Juliana Wearables",
    email: "juliana@wearables.com",
    bio: "Especialista em manutenção de relógios inteligentes e sensores biométricos de alta sensibilidade.",
    specialties: ["Apple Watch", "Galaxy Watch", "Troca de Bateria"],
    technologies: ["Digital", "Microeletrônica", "SMD"],
    brands: ["Apple", "Samsung", "Garmin"],
    devices: ["Smartwatch", "Smartband"],
    city: "Recife",
    state: "PE",
    latitude: -8.0578,
    longitude: -34.8778,
    serviceType: "HYBRID",
    rating: 4.7,
    reviews: []
  },
  {
    id: "partner_9",
    name: "Felipe GPUs & Hardware Gamer",
    email: "felipe@gpus.com",
    bio: "Manutenção eletrônica avançada de placas de vídeo gamer, reballing VRM e substituição de memórias VRAM.",
    specialties: ["Placas de Vídeo (GPU)", "Hardware Gamer", "Reballing VRM"],
    technologies: ["SMD", "BGA", "Digital"],
    brands: ["Nvidia", "AMD", "ASUS", "Gigabyte"],
    devices: ["Computador Desktop", "Hardware Pro"],
    city: "Florianópolis",
    state: "SC",
    latitude: -27.5954,
    longitude: -48.5480,
    serviceType: "HYBRID",
    rating: 5.0,
    reviews: []
  },
  {
    id: "partner_10",
    name: "Teresa Teclados & Synths",
    email: "teresa@synths.com",
    bio: "Restauração de sintetizadores, teclados musicais, pianos digitais e calibração de teclas sensíveis ao toque.",
    specialties: ["Teclados Musicais", "Sintetizadores", "Calibração de Teclas"],
    technologies: ["Analógico", "Digital"],
    brands: ["Yamaha", "Roland", "Korg", "Nord"],
    devices: ["Instrumento Musical", "Audio"],
    city: "Brasília",
    state: "DF",
    latitude: -15.7975,
    longitude: -47.8919,
    serviceType: "PRESENTIAL",
    rating: 4.9,
    reviews: []
  },
  {
    id: "partner_11",
    name: "Marcos Áudio Profissional",
    email: "marcos@audiopro.com",
    bio: "Reparo de interfaces de áudio, mesas digitais e analógicas, periféricos de estúdio de alta gama.",
    specialties: ["Interfaces de Som", "Mesa de Som Digital", "Pré-amplificadores"],
    technologies: ["Analógico", "Digital", "SMD"],
    brands: ["Behringer", "Focusrite", "Universal Audio", "Yamaha"],
    devices: ["Audio", "Equipamento Pro"],
    city: "Fortaleza",
    state: "CE",
    latitude: -3.7319,
    longitude: -38.5267,
    serviceType: "HYBRID",
    rating: 4.8,
    reviews: []
  },
  {
    id: "partner_12",
    name: "Carla Smart Home & IoT",
    email: "carla@smarthome.com",
    bio: "Instalação e reparo eletrônico em assistentes de voz, câmeras wifi integradas e fechaduras biométricas.",
    specialties: ["Assistentes de Voz", "Câmeras IoT", "Fechaduras Biométricas"],
    technologies: ["Digital", "Redes sem Fio"],
    brands: ["Amazon Alexa", "Google Nest", "Intelbras", "Yale"],
    devices: ["Dispositivo IoT", "Smart Home"],
    city: "Goiânia",
    state: "GO",
    latitude: -16.6869,
    longitude: -49.2648,
    serviceType: "HYBRID",
    rating: 4.7,
    reviews: []
  },
  {
    id: "partner_13",
    name: "Eduardo Projetores",
    email: "eduardo@projetores.com",
    bio: "Substituição de lâmpadas, reparo de placas fonte e troca de chip DMD de projetores de projeção curta.",
    specialties: ["Projetores", "Chip DMD", "Placa Fonte Projetores"],
    technologies: ["Óptica", "Digital", "SMD"],
    brands: ["Epson", "BenQ", "Optoma", "Sony"],
    devices: ["Projetor", "Vídeo"],
    city: "Manaus",
    state: "AM",
    latitude: -3.1190,
    longitude: -60.0217,
    serviceType: "PRESENTIAL",
    rating: 4.6,
    reviews: []
  },
  {
    id: "partner_14",
    name: "Sandra Notebooks Corporativos",
    email: "sandra@notebooks.com",
    bio: "Troca de carcaças, restauração de dobradiças e troca de teclados de notebooks das linhas empresariais.",
    specialties: ["Notebook Corporativo", "Restauração de Dobradiças", "Troca de Teclados"],
    technologies: ["Digital", "Mecânica"],
    brands: ["Lenovo", "HP", "Dell", "ASUS"],
    devices: ["Notebook"],
    city: "Vitória",
    state: "ES",
    latitude: -20.3155,
    longitude: -40.3128,
    serviceType: "HYBRID",
    rating: 4.8,
    reviews: []
  },
  {
    id: "partner_15",
    name: "Daniel Módulos Amplificadores",
    email: "daniel@carpower.com",
    bio: "Manutenção eletrônica de módulos de potência e amplificadores de som automotivo de alta amperagem.",
    specialties: ["Módulos Automotivos", "Fontes Automotivas", "Crossovers"],
    technologies: ["Analógico", "Média Potência"],
    brands: ["Taramps", "Pioneer", "Stetsom", "Banda"],
    devices: ["Som Automotivo", "Audio"],
    city: "Natal",
    state: "RN",
    latitude: -5.7944,
    longitude: -35.2110,
    serviceType: "PRESENTIAL",
    rating: 4.9,
    reviews: []
  },
  {
    id: "partner_16",
    name: "Amanda Robótica & Raspberry",
    email: "amanda@robotica.com",
    bio: "Manutenção de placas controladoras de impressoras 3D, microcontroladores Raspberry Pi, Arduino e robôs.",
    specialties: ["Microcontroladores", "Impressoras 3D", "Robôs Educacionais"],
    technologies: ["Robótica", "IoT", "Digital"],
    brands: ["Raspberry Pi", "Arduino", "Creality", "Lego"],
    devices: ["Hardware IoT", "Robótica"],
    city: "São José dos Campos",
    state: "SP",
    latitude: -23.1791,
    longitude: -45.8872,
    serviceType: "HYBRID",
    rating: 4.9,
    reviews: []
  },
  {
    id: "partner_17",
    name: "Ricardo Nobreaks Senoidais",
    email: "ricardo@nobreaks.com",
    bio: "Troca e calibração de baterias estacionárias, placas lógicas de nobreaks senoidais de grande porte.",
    specialties: ["Nobreaks Senoidais", "Baterias Estacionárias", "Estabilizadores"],
    technologies: ["Alta Potência", "Analógico"],
    brands: ["APC", "SMS", "Intelbras", "NHS"],
    devices: ["Nobreak", "Estabilizador"],
    city: "Belém",
    state: "PA",
    latitude: -1.4557,
    longitude: -48.4902,
    serviceType: "PRESENTIAL",
    rating: 4.7,
    reviews: []
  },
  {
    id: "partner_18",
    name: "Patrícia Impressoras 3D",
    email: "patricia@impressoras3d.com",
    bio: "Especialista em manutenção de cabeçotes de extrusão, eixos e calibração de mesas de impressoras 3D de resina e filamento.",
    specialties: ["Impressoras 3D de Resina", "Calibração de Eixos", "Troca de Extrusora"],
    technologies: ["Mecânica", "Digital", "FDM/SLA"],
    brands: ["Creality", "Anycubic", "Ender", "Elegoo"],
    devices: ["Impressora 3D"],
    city: "João Pessoa",
    state: "PB",
    latitude: -7.1198,
    longitude: -34.8450,
    serviceType: "HYBRID",
    rating: 4.8,
    reviews: []
  },
  {
    id: "partner_19",
    name: "Vitor Pedais de Boutique",
    email: "vitor@boutiquepedals.com",
    bio: "Modificação, reparo de ruídos e criação de pedais de efeito de boutique e pedaleiras valvuladas analógicas.",
    specialties: ["Pedais de Efeito", "Pedaleiras Valvuladas", "Restauração de Circuitos"],
    technologies: ["Analógico", "Valvulado"],
    brands: ["Boss", "Line 6", "Mesa Boogie", "Electro-Harmonix"],
    devices: ["Instrumento Musical", "Audio"],
    city: "Santos",
    state: "SP",
    latitude: -23.9608,
    longitude: -46.3339,
    serviceType: "HYBRID",
    rating: 5.0,
    reviews: []
  },
  {
    id: "partner_20",
    name: "Isabela Assistência Express",
    email: "isabela@express.com",
    bio: "Reparo de conectores de carga tipo USB-C, troca de alto-falantes e microfones de tablets com atendimento express.",
    specialties: ["Conectores USB-C", "Alto-falantes", "Reparos Express"],
    technologies: ["Digital", "SMD"],
    brands: ["Apple", "Samsung", "Lenovo", "Xiaomi"],
    devices: ["Tablet", "Smartphone"],
    city: "Sorocaba",
    state: "SP",
    latitude: -23.5015,
    longitude: -47.4526,
    serviceType: "HYBRID",
    rating: 4.8,
    reviews: []
  }
]

export const getStoredPartners = (): any[] => {
  if (typeof window === "undefined") return defaultPartners
  const saved = localStorage.getItem("partners")
  if (saved) {
    const list = JSON.parse(saved)
    if (list.length < defaultPartners.length) {
      localStorage.setItem("partners", JSON.stringify(defaultPartners))
      return defaultPartners
    }
    return list
  }
  localStorage.setItem("partners", JSON.stringify(defaultPartners))
  return defaultPartners
}

export const saveStoredPartners = (partners: any[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("partners", JSON.stringify(partners))
}

export const getStoredBlockchainLogs = (): any[] => {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem("blockchain_logs")
  return saved ? JSON.parse(saved) : []
}

export const saveStoredBlockchainLogs = (logs: any[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("blockchain_logs", JSON.stringify(logs))
}

const defaultArticles = [
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

export const getStoredArticles = (): any[] => {
  if (typeof window === "undefined") return defaultArticles
  const saved = localStorage.getItem("knowledge_articles")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("knowledge_articles", JSON.stringify(defaultArticles))
  return defaultArticles
}

export const saveStoredArticles = (articles: any[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("knowledge_articles", JSON.stringify(articles))
}

const defaultAuditLogs = [
  {
    id: "log1",
    action: "UPDATE_OS_STATUS",
    entityName: "ServiceOrder",
    entityId: "os_1042",
    createdAt: "2026-07-28T15:30:00.000Z",
    ipAddress: "192.168.1.15",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    user: { name: "Claudio Técnico" },
    oldValues: { status: "IN_REPAIR", exitDate: null },
    newValues: { status: "READY", exitDate: null }
  },
  {
    id: "log2",
    action: "CREATE_CUSTOMER",
    entityName: "Customer",
    entityId: "cust_982",
    createdAt: "2026-07-28T10:15:00.000Z",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)",
    user: { name: "Adriano (Você)" },
    oldValues: null,
    newValues: { name: "Mariana Costa Neves", document: "456.789.123-00", email: "mariana@email.com", phone: "(11) 97777-6666" }
  },
  {
    id: "log3",
    action: "UPDATE_CUSTOMER_CONTACT",
    entityName: "Customer",
    entityId: "cust_221",
    createdAt: "2026-07-27T18:22:00.000Z",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    user: { name: "Adriano (Você)" },
    oldValues: { phone: "(11) 98765-4321", email: "joao.antigo@email.com" },
    newValues: { phone: "(11) 99999-8888", email: "joao.pedro@email.com" }
  },
  {
    id: "log4",
    action: "CONSUME_PART_STOCK",
    entityName: "Inventory",
    entityId: "part_s23u_usb",
    createdAt: "2026-07-28T15:31:00.000Z",
    ipAddress: "192.168.1.15",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    user: { name: "Claudio Técnico" },
    oldValues: { quantity: 3 },
    newValues: { quantity: 1 }
  },
  {
    id: "log5",
    action: "FINALIZE_TRANSACTION",
    entityName: "Transaction",
    entityId: "trans_9238",
    createdAt: "2026-07-28T16:02:00.000Z",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    user: { name: "Adriano (Você)" },
    oldValues: { status: "PENDING", paymentDate: null },
    newValues: { status: "PAID", paymentDate: "2026-07-28" }
  }
]

export const getStoredAuditLogs = (): any[] => {
  if (typeof window === "undefined") return defaultAuditLogs
  const saved = localStorage.getItem("audit_logs")
  if (saved) return JSON.parse(saved)
  localStorage.setItem("audit_logs", JSON.stringify(defaultAuditLogs))
  return defaultAuditLogs
}

export const saveStoredAuditLogs = (logs: any[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("audit_logs", JSON.stringify(logs))
}
