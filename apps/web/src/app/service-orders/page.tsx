"use client"

import React, { useState, useMemo, useEffect } from "react"
import { checkPermission, getCurrentUser } from "@/lib/auth-store"
import { sendWhatsAppMessage } from "@/lib/whatsapp-service"
import { getStoredOrders, saveStoredOrders, getStoredTransactions, saveStoredTransactions, getStoredCashSession, saveStoredCashSession, getStoredCustomers, getStoredDevices, getStoredInventory, saveStoredInventory, getStoredArticles, saveStoredArticles, getStoredAuditLogs, saveStoredAuditLogs, getStoredSystemConfig } from "@/lib/db-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderDialog, OrderData } from "./order-dialog"
import { OrderDetailDialog } from "./order-detail-dialog"
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  Play, 
  Clock, 
  CheckCircle,
  AlertTriangle
} from "lucide-react"

// Clientes mockados
const mockCustomers = [
  { id: "c1", name: "João Pedro Santos", phone: "11987654321" },
  { id: "c2", name: "Carla Ramos Souza", phone: "11988887777" },
  { id: "c3", name: "Roberto Dias Filho", phone: "11977776666" },
  { id: "c4", name: "Mariana Costa Neves", phone: "11966665555" }
]

// Dispositivos mockados
const mockDevices = [
  { id: "d1", customerId: "c1", brandName: "Samsung", modelName: "Galaxy S23 Ultra", serialNumber: "9876543210123" },
  { id: "d2", customerId: "c2", brandName: "Apple", modelName: "iPhone 13 Pro", serialNumber: "C39GL8P9N70D" },
  { id: "d3", customerId: "c3", brandName: "Dell", modelName: "Inspiron 15 3000", serialNumber: "5G7H2K3" },
  { id: "d4", customerId: "c3", brandName: "Sony", modelName: "PlayStation 5 Slim", serialNumber: "S01-92384729-A" }
]

// Lista de Ordens de Serviço mockadas de alta fidelidade
const initialOrders: any[] = [
  {
    id: "os1",
    number: 1042,
    customerId: "c1",
    deviceId: "d1",
    technicianId: "t1",
    status: "READY" as const,
    priority: "HIGH" as const,
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
    status: "IN_REPAIR" as const,
    priority: "MEDIUM" as const,
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
    diagnostics: [
      {
        id: "diag2",
        technicalReport: "Saúde da bateria em 74%, degradada. Exige substituição física da peça.",
        solutionProposed: "Troca de bateria homologada Premium.",
        isApproved: true,
        createdAt: "2026-07-28"
      }
    ],
    histories: [
      { id: "h2_1", fromStatus: "PENDING", toStatus: "UNDER_ANALYSIS", changedAt: "2026-07-28", user: { name: "Adriano" } },
      { id: "h2_2", fromStatus: "UNDER_ANALYSIS", toStatus: "APPROVED", changedAt: "2026-07-28", user: { name: "Claudio Técnico" } },
      { id: "h2_3", fromStatus: "APPROVED", toStatus: "IN_REPAIR", changedAt: "2026-07-28", user: { name: "Claudio Técnico" } }
    ],
    warranties: [],
    partsUsed: [
      { id: "pu2", quantity: 1, priceCharged: 200.00, part: { name: "Bateria iPhone 13 Pro Premium" } }
    ],
    servicesUsed: [
      { id: "su2", description: "Mão de Obra de Troca de Bateria", amount: 180.00 }
    ]
  },
  {
    id: "os3",
    number: 1040,
    customerId: "c3",
    deviceId: "d3",
    technicianId: null,
    status: "BUDGETED" as const,
    priority: "URGENT" as const,
    reportedDefect: "Notebook não liga - Placa mãe em curto",
    accessories: "Fonte de alimentação original Dell",
    checklist: { wifi: false, audio: false, camera: false, touch: false, buttons: false, charging: false },
    laborAmount: 800.00,
    partsAmount: 400.00,
    totalAmount: 1200.00,
    notes: "Aguardando aprovação do cliente para reparo em circuitos",
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

export default function ServiceOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [dbCustomers, setDbCustomers] = useState<any[]>([])
  const [dbDevices, setDbDevices] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")

  useEffect(() => {
    setOrders(getStoredOrders())
    setDbCustomers(getStoredCustomers())
    setDbDevices(getStoredDevices())
    setMounted(true)
    setHasLoaded(true)
  }, [])

  useEffect(() => {
    if (mounted && hasLoaded) {
      saveStoredOrders(orders)
    }
  }, [orders, mounted, hasLoaded])

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  // Modais de Controle
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  // Filtros combinados
  const filteredOrders = useMemo(() => {
    return orders.filter(os => {
      const matchSearch =
        os.number.toString().includes(search) ||
        os.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        os.device.modelName.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === "ALL" || os.status === statusFilter
      const matchPriority = priorityFilter === "ALL" || os.priority === priorityFilter

      return matchSearch && matchStatus && matchPriority
    })
  }, [orders, search, statusFilter, priorityFilter])

  // Paginação lógica
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(start, start + itemsPerPage)
  }, [filteredOrders, currentPage])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 font-medium">Carregando ordens...</span>
        </div>
      </div>
    )
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleOpenCreate = () => {
    setSelectedOrder(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (order: typeof initialOrders[0]) => {
    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      alert("Erro: Não é permitido editar uma Ordem de Serviço que já foi Entregue ou Cancelada!")
      return
    }
    if (!checkPermission("orders", "edit")) {
      alert("Erro: Você não possui permissão para editar Ordens de Serviço!")
      return
    }
    setSelectedOrder(order)
    setIsFormOpen(true)
  }

  const handleOpenDetail = (order: typeof initialOrders[0]) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  const handleDelete = (id: string) => {
    if (!checkPermission("orders", "delete")) {
      alert("Erro: Você não possui permissão para remover Ordens de Serviço!")
      return
    }
    const target = orders.find(o => o.id === id)
    if (confirm("Deseja realmente remover esta OS do sistema?")) {
      // Log de Auditoria
      if (typeof window !== "undefined" && target) {
        const auditLogs = getStoredAuditLogs()
        const newLog = {
          id: `log_${Date.now()}`,
          action: "DELETE_OS",
          entityName: "ServiceOrder",
          entityId: `os_${target.number}`,
          createdAt: new Date().toISOString(),
          ipAddress: "127.0.0.1",
          userAgent: window.navigator.userAgent,
          user: { name: getCurrentUser()?.name || "Adriano (Você)" },
          oldValues: { number: target.number, reportedDefect: target.reportedDefect },
          newValues: null
        }
        saveStoredAuditLogs([newLog, ...auditLogs])
      }
      setOrders(prev => prev.filter(o => o.id !== id))
    }
  }

  const handleSaveOrder = (data: OrderData) => {
    const allCusts = [...dbCustomers, ...mockCustomers]
    const allDevs = [...dbDevices, ...mockDevices]
    const customer = allCusts.find(c => c.id === data.customerId)
    const device = allDevs.find(d => d.id === data.deviceId)

    if (data.id) {
      // Editar
      const currentOrder = orders.find(o => o.id === data.id)
      if (currentOrder && (currentOrder.status === "DELIVERED" || currentOrder.status === "CANCELLED")) {
        alert("Erro: Não é permitido editar uma Ordem de Serviço que já foi Entregue ou Cancelada!")
        return
      }
      if (!checkPermission("orders", "edit")) {
        alert("Erro: Você não possui permissão para editar Ordens de Serviço!")
        return
      }

      // Log de Auditoria
      if (typeof window !== "undefined") {
        const auditLogs = getStoredAuditLogs()
        const newLog = {
          id: `log_${Date.now()}`,
          action: "UPDATE_OS",
          entityName: "ServiceOrder",
          entityId: `os_${currentOrder?.number || data.id}`,
          createdAt: new Date().toISOString(),
          ipAddress: "127.0.0.1",
          userAgent: window.navigator.userAgent,
          user: { name: getCurrentUser()?.name || "Adriano (Você)" },
          oldValues: {
            reportedDefect: currentOrder?.reportedDefect,
            priority: currentOrder?.priority,
            accessories: currentOrder?.accessories,
            notes: currentOrder?.notes
          },
          newValues: {
            reportedDefect: data.reportedDefect,
            priority: data.priority,
            accessories: data.accessories,
            notes: data.notes
          }
        }
        saveStoredAuditLogs([newLog, ...auditLogs])
      }

      setOrders(prev =>
        prev.map(o =>
          o.id === data.id
            ? {
                ...o,
                customerId: data.customerId,
                deviceId: data.deviceId,
                reportedDefect: data.reportedDefect,
                accessories: data.accessories,
                priority: data.priority,
                checklist: data.checklist,
                notes: data.notes,
                customer: { name: customer?.name || o.customer.name },
                device: { 
                  brandName: device?.brandName || o.device.brandName, 
                  modelName: device?.modelName || o.device.modelName, 
                  serialNumber: device?.serialNumber || o.device.serialNumber 
                }
              }
            : o
        )
      )
    } else {
      // Criar
      if (!checkPermission("orders", "create")) {
        alert("Erro: Você não possui permissão para abrir novas Ordens de Serviço!")
        return
      }

      const orderNumber = 1000 + orders.length + 1

      // Log de Auditoria
      if (typeof window !== "undefined") {
        const auditLogs = getStoredAuditLogs()
        const newLog = {
          id: `log_${Date.now()}`,
          action: "CREATE_OS",
          entityName: "ServiceOrder",
          entityId: `os_${orderNumber}`,
          createdAt: new Date().toISOString(),
          ipAddress: "127.0.0.1",
          userAgent: window.navigator.userAgent,
          user: { name: getCurrentUser()?.name || "Adriano (Você)" },
          oldValues: null,
          newValues: {
            number: orderNumber,
            reportedDefect: data.reportedDefect,
            priority: data.priority,
            accessories: data.accessories
          }
        }
        saveStoredAuditLogs([newLog, ...auditLogs])
      }

      const newOrder = {
        id: `os_${Date.now()}`,
        number: orderNumber,
        customerId: data.customerId,
        deviceId: data.deviceId,
        technicianId: null,
        status: "PENDING" as const,
        priority: data.priority,
        reportedDefect: data.reportedDefect,
        accessories: data.accessories,
        checklist: data.checklist,
        laborAmount: 0,
        partsAmount: 0,
        totalAmount: 0,
        notes: data.notes,
        entryDate: new Date().toISOString().split("T")[0],
        exitDate: null,
        customer: { name: customer?.name || "Sem nome" },
        device: { 
          brandName: device?.brandName || "Sem marca", 
          modelName: device?.modelName || "Sem modelo", 
          serialNumber: device?.serialNumber || "Sem serial" 
        },
        technician: null,
        diagnostics: [],
        histories: [
          { id: `h_${Date.now()}`, fromStatus: "PENDING", toStatus: "PENDING", changedAt: new Date().toISOString(), user: { name: "Adriano" }, observation: "Abertura de OS" }
        ],
        warranties: [],
        partsUsed: [],
        servicesUsed: []
      }
      setOrders(prev => [newOrder, ...prev])
    }
    setIsFormOpen(false)
  }

  // Mudança Automática de Status com registro de histórico
  const handleChangeStatus = (orderId: string, newStatus: typeof initialOrders[0]["status"]) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const newHistory = {
            id: `h_${Date.now()}`,
            fromStatus: o.status,
            toStatus: newStatus,
            changedAt: new Date().toISOString(),
            user: { name: "Adriano (Você)" },
            observation: `Transição automática para ${newStatus}`
          }

          // Log de Auditoria
          if (typeof window !== "undefined") {
            const auditLogs = getStoredAuditLogs()
            const newLog = {
              id: `log_${Date.now()}`,
              action: "UPDATE_OS_STATUS",
              entityName: "ServiceOrder",
              entityId: `os_${o.number}`,
              createdAt: new Date().toISOString(),
              ipAddress: "127.0.0.1",
              userAgent: window.navigator.userAgent,
              user: { name: getCurrentUser()?.name || "Adriano (Você)" },
              oldValues: { status: o.status },
              newValues: { status: newStatus }
            }
            saveStoredAuditLogs([newLog, ...auditLogs])
          }

          // Se o orçamento foi aprovado, debita o estoque das peças usadas na OS
          if (newStatus === "APPROVED" && o.partsUsed && o.partsUsed.length > 0) {
            if (typeof window !== "undefined") {
              const inventory = getStoredInventory()
              let updated = false
              const updatedInventory = inventory.map((part: any) => {
                const pu = o.partsUsed.find((item: any) => item.partId === part.id || item.id === part.id)
                if (pu) {
                  updated = true
                  if (part.quantity < pu.quantity) {
                    alert(`⚠️ Atenção: Estoque insuficiente da peça "${part.name}"!\nQuantidade em estoque: ${part.quantity}\nQuantidade solicitada na OS: ${pu.quantity}`)
                  }
                  return {
                    ...part,
                    quantity: part.quantity - pu.quantity,
                    movements: [
                      ...part.movements,
                      {
                        id: `mov_os_${Date.now()}_${part.id}`,
                        type: "OUTPUT",
                        quantity: pu.quantity,
                        reason: `Consumo automático na aprovação da OS #${o.number}`,
                        createdAt: new Date().toISOString().split("T")[0]
                      }
                    ]
                  }
                }
                return part
              })
              if (updated) {
                saveStoredInventory(updatedInventory)
              }
            }
          }

          // Se passar para entregue, simular o recebimento financeiro
          let exitDate = o.exitDate
          if (newStatus === "DELIVERED") {
            exitDate = new Date().toISOString().split("T")[0]
            
            // Faturamento automático do financeiro (Evitando duplicidade)
            if (typeof window !== "undefined") {
              const currentTrans = getStoredTransactions()
              // Procura se já existe um contas a receber criado em READY
              const existingIndex = currentTrans.findIndex(t => t.origin === "OS" && t.originId === o.number.toString())
              
              let updatedTransactions = [...currentTrans]
              let shouldRecordCash = false

              if (existingIndex > -1) {
                // Se já existe e não está pago, nós simplesmente liquidamos ele
                if (!currentTrans[existingIndex].isPaid) {
                  updatedTransactions[existingIndex] = {
                    ...currentTrans[existingIndex],
                    description: `Faturamento OS #${o.number} - ${o.customer.name}`,
                    isPaid: true,
                    paymentMethod: "PIX",
                    paymentDate: exitDate,
                    amount: o.totalAmount // Garante o valor final correto da OS
                  }
                  saveStoredTransactions(updatedTransactions)
                  shouldRecordCash = true
                }
              } else {
                // Se não existe (pulou READY por exemplo), cria uma transação paga do zero
                const newTrans = {
                  id: `trans_os_${Date.now()}`,
                  description: `Faturamento OS #${o.number} - ${o.customer.name}`,
                  type: "REVENUE" as const,
                  amount: o.totalAmount,
                  dueDate: exitDate,
                  entityName: o.customer.name,
                  isPaid: true,
                  paymentMethod: "PIX",
                  paymentDate: exitDate,
                  category: "Serviços",
                  origin: "OS" as const,
                  originId: o.number.toString(),
                  createdByUser: "Sistema (Integração)",
                  createdAt: new Date().toISOString()
                }
                saveStoredTransactions([newTrans, ...currentTrans])
                shouldRecordCash = true
              }

              // Entrada no caixa se estiver aberto e houver liquidação nesta ação
              if (shouldRecordCash) {
                const session = getStoredCashSession()
                if (session.isOpen) {
                  const mov = {
                    id: `mov_auto_os_${Date.now()}`,
                    type: "INPUT" as const,
                    amount: o.totalAmount,
                    reason: `Faturamento OS #${o.number}`,
                    date: new Date().toISOString(),
                    user: "Sistema (Integration)",
                    observation: `Faturamento automático por encerramento de OS.`
                  }
                  session.movements.push(mov)
                  saveStoredCashSession(session)
                } else {
                  alert(`⚠️ Caixa Fechado!\nO recebimento de R$ ${o.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} foi registrado no faturamento da OS #${o.number}, mas NÃO pôde ser lançado no fluxo de caixa porque o caixa está fechado.\nPor favor, abra o caixa no módulo Financeiro para registrar a movimentação correspondente.`)
                }
              }
            }
          } else if (newStatus === "READY") {
            // Se passar para pronto, gera uma conta a receber
            if (typeof window !== "undefined") {
              const currentTrans = getStoredTransactions()
              const dup = currentTrans.some(t => t.origin === "OS" && t.originId === o.number.toString())
              if (!dup) {
                const newTrans = {
                  id: `trans_os_${Date.now()}`,
                  description: `Conta a Receber OS #${o.number} - ${o.customer.name}`,
                  type: "REVENUE" as const,
                  amount: o.totalAmount,
                  dueDate: new Date().toISOString().split("T")[0],
                  entityName: o.customer.name,
                  isPaid: false,
                  category: "Serviços",
                  origin: "OS" as const,
                  originId: o.number.toString(),
                  createdByUser: "Sistema (Integração)",
                  createdAt: new Date().toISOString()
                }
                saveStoredTransactions([newTrans, ...currentTrans])
              }

              // Dispara mensagem automática do WhatsApp se configurado
              const config = getStoredSystemConfig()
              let template = config.whatsapp?.autoMessageReady || "Olá {cliente}, seu equipamento {modelo} (OS #{numero}) está pronto para retirada!"
              const text = template
                .replace("{cliente}", o.customer.name)
                .replace("{modelo}", `${o.device.brandName} ${o.device.modelName}`)
                .replace("{numero}", o.number.toString())
              
              const allCusts = [...getStoredCustomers(), ...mockCustomers]
              const customerObj = allCusts.find(c => c.id === o.customerId || c.name === o.customer.name)
              const phone = customerObj?.phone || o.customer.phone
              sendWhatsAppMessage(phone, text)
            }
          }

          const updated = {
            ...o,
            status: newStatus,
            exitDate,
            histories: [...o.histories, newHistory]
          }
          
          // Mantém o modal de detalhes sincronizado com o status atualizado
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder(updated)
          }

          return updated
        }
        return o
      })
    )
  }

  const handleUpdateAttachments = (orderId: string, attachments: any[]) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, attachments }
          : o
      )
    )
  }

  const handleSaveBudget = (orderId: string, technicalReport: string, laborAmount: number, partsAmount: number, partsUsedList: any[] = []) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const newDiag = {
            id: `diag_${Date.now()}`,
            technicalReport,
            solutionProposed: "Reparo geral detalhado em bancada.",
            isApproved: null,
            createdAt: new Date().toISOString().split("T")[0]
          }

          const servicesUsed = [
            { id: `su_${Date.now()}`, description: "Mão de Obra Técnica", amount: laborAmount }
          ]

          // Mapeia as peças reais selecionadas na interface
          const partsUsed = partsUsedList.map((pu, idx) => ({
            id: `pu_${Date.now()}_${idx}`,
            partId: pu.partId,
            quantity: pu.quantity,
            priceCharged: pu.salePrice,
            part: { name: pu.name }
          }))

          const updatedOrder = {
            ...o,
            status: "BUDGETED" as const,
            laborAmount,
            partsAmount,
            totalAmount: laborAmount + partsAmount,
            diagnostics: [newDiag],
            servicesUsed,
            partsUsed,
            histories: [
              ...o.histories,
              {
                id: `h_${Date.now()}`,
                fromStatus: o.status,
                toStatus: "BUDGETED",
                changedAt: new Date().toISOString(),
                user: { name: "Adriano (Você)" },
                observation: `Orçamento registrado: R$ ${(laborAmount + partsAmount).toFixed(2)}`
              }
            ]
          }

          // Integração com a Base de Conhecimento - Cria artigo a partir do laudo da OS
          if (typeof window !== "undefined") {
            const articles = getStoredArticles()
            const newArticle = {
              id: `kb_os_${Date.now()}`,
              title: `Caso de Sucesso: ${o.device.brandName} ${o.device.modelName} - ${o.reportedDefect.slice(0, 35)}...`,
              deviceBrand: o.device.brandName,
              deviceModel: o.device.modelName,
              defectKeywords: [o.reportedDefect, technicalReport, o.device.brandName, o.device.modelName].flatMap((s: string) => s.toLowerCase().split(/\s+/)).filter(s => s.length > 3),
              possibleDefects: [o.reportedDefect],
              suggestedParts: partsUsedList.map(pu => pu.name),
              avgTime: "2.0 horas",
              avgPrice: laborAmount + partsAmount,
              toolsNeeded: ["Multímetro Digital", "Estação de Retrabalho SMD", "Jogo de chaves de precisão"],
              procedureSteps: [
                `Defeito inicial constatado: ${o.reportedDefect}`,
                `Diagnóstico e reparo detalhado: ${technicalReport}`,
                `Peças e componentes empregados no conserto: ${partsUsedList.map(pu => `${pu.quantity}x ${pu.name}`).join(", ") || "Nenhuma"}`,
                `Fase de calibração, montagem final e testes de estresse em bancada.`
              ]
            }
            saveStoredArticles([newArticle, ...articles])

            // Envia o orçamento via WhatsApp
            const budgetMsg = `Olá *${o.customer.name}*!\n\nSeu orçamento para o equipamento *${o.device.brandName} ${o.device.modelName}* (OS #${o.number}) foi gerado:\n\n- Mão de Obra: R$ ${laborAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n- Peças: R$ ${partsAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n*Total: R$ ${(laborAmount + partsAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}*\n\nLaudo Técnico:\n_"${technicalReport}"_\n\nPara aprovar ou rejeitar, responda esta mensagem ou entre em contato conosco.`
            
            const allCusts = [...getStoredCustomers(), ...mockCustomers]
            const customerObj = allCusts.find(c => c.id === o.customerId || c.name === o.customer.name)
            const phone = customerObj?.phone || o.customer.phone
            sendWhatsAppMessage(phone, budgetMsg)
          }

          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder(updatedOrder)
          }

          return updatedOrder
        }
        return o
      })
    )
  }

  const getStatusBadge = (status: typeof initialOrders[0]["status"]) => {
    switch (status) {
      case "PENDING": return <Badge variant="outline">Pendente</Badge>
      case "UNDER_ANALYSIS": return <Badge variant="info">Em Análise</Badge>
      case "BUDGETED": return <Badge variant="secondary">Orçado</Badge>
      case "APPROVED": return <Badge variant="default">Aprovado</Badge>
      case "REJECTED": return <Badge variant="destructive">Rejeitado</Badge>
      case "IN_REPAIR": return <Badge variant="info">Em Conserto</Badge>
      case "READY": return <Badge variant="success">Pronto</Badge>
      case "DELIVERED": return <Badge variant="success">Entregue</Badge>
      case "CANCELLED": return <Badge variant="destructive">Cancelado</Badge>
    }
  }

  const getPriorityBadge = (priority: typeof initialOrders[0]["priority"]) => {
    switch (priority) {
      case "LOW": return <Badge variant="outline" className="text-zinc-400">Baixa</Badge>
      case "MEDIUM": return <Badge variant="outline" className="text-blue-400">Média</Badge>
      case "HIGH": return <Badge variant="outline" className="text-amber-400">Alta</Badge>
      case "URGENT": return <Badge variant="outline" className="text-red-400 font-bold animate-pulse">Urgente</Badge>
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Ordens de Serviço (OS)</h2>
          <p className="text-sm text-muted-foreground">Registre laudos, ordene prioridades de bancada e emita termos de garantia.</p>
        </div>
        {checkPermission("orders", "create") && (
          <Button variant="default" size="sm" onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Abertura de OS
          </Button>
        )}
      </div>

      {/* Pesquisa e Filtros */}
      <div className="grid gap-4 md:grid-cols-4 bg-card/25 border border-border p-4 rounded-lg items-center">
        {/* Pesquisa */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-4 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            placeholder="Buscar por Nº de OS, Cliente ou Modelo..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filtro Status */}
        <div className="space-y-1">
          <select
            className="w-full h-9 px-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos os Status</option>
            <option value="PENDING">Pendente</option>
            <option value="UNDER_ANALYSIS">Em Análise</option>
            <option value="BUDGETED">Orçado</option>
            <option value="APPROVED">Aprovado</option>
            <option value="IN_REPAIR">Em Conserto</option>
            <option value="READY">Pronto</option>
            <option value="DELIVERED">Entregue</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>

        {/* Filtro Prioridade */}
        <div className="space-y-1">
          <select
            className="w-full h-9 px-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">Todas as Prioridades</option>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>
      </div>

      {/* Tabela de OS */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20">
                  <th className="py-3 px-6 font-mono text-[10px] uppercase text-muted-foreground">OS</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Cliente</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Equipamento</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Defeito Informado</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Prioridade</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold">Status</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold text-right">Valor Final</th>
                  <th className="py-3 px-6 text-muted-foreground font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      Nenhuma ordem de serviço encontrada.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map(os => (
                    <tr key={os.id} className="hover:bg-muted/30 transition-colors">
                      {/* OS Number */}
                      <td className="py-3.5 px-6 font-mono font-semibold text-foreground">#{os.number}</td>
                      
                      {/* Cliente */}
                      <td className="py-3.5 px-6 text-foreground font-semibold">{os.customer.name}</td>
                      
                      {/* Aparelho */}
                      <td className="py-3.5 px-6 text-muted-foreground">{os.device.brandName} {os.device.modelName}</td>
                      
                      {/* Defeito */}
                      <td className="py-3.5 px-6 text-muted-foreground max-w-[180px] truncate">{os.reportedDefect}</td>
                      
                      {/* Prioridade */}
                      <td className="py-3.5 px-6">{getPriorityBadge(os.priority)}</td>

                      {/* Status */}
                      <td className="py-3.5 px-6">{getStatusBadge(os.status)}</td>
                      
                      {/* Valor */}
                      <td className="py-3.5 px-6 text-right font-mono font-semibold text-foreground">
                        {os.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-6 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-foreground"
                          onClick={() => handleOpenDetail(os)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {checkPermission("orders", "edit") && os.status !== "DELIVERED" && os.status !== "CANCELLED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-foreground"
                            onClick={() => handleOpenEdit(os)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {checkPermission("orders", "delete") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-destructive"
                            onClick={() => handleDelete(os.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Modais */}
      <OrderDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveOrder}
        order={selectedOrder}
        customers={[...dbCustomers, ...mockCustomers]}
        devices={[...dbDevices, ...mockDevices]}
      />

      <OrderDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder}
        onChangeStatus={handleChangeStatus}
        onSaveBudget={handleSaveBudget}
        onUpdateAttachments={handleUpdateAttachments}
      />
    </div>
  )
}
