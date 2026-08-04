"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrderDialog, OrderData } from "@/app/service-orders/order-dialog"
import { OrderDetailDialog } from "@/app/service-orders/order-detail-dialog"
import { sendWhatsAppMessage } from "@/lib/whatsapp-service"
import { getCurrentUser } from "@/lib/auth-store"
import { 
  getStoredCustomers, getStoredDevices, getStoredOrders, saveStoredOrders,
  getStoredInventory, saveStoredInventory, getStoredTransactions, saveStoredTransactions, 
  getStoredCashSession, saveStoredCashSession, getStoredArticles, saveStoredArticles, 
  getStoredAuditLogs, saveStoredAuditLogs, getStoredSystemConfig 
} from "@/lib/db-store"
import { checkPermission } from "@/lib/auth-store"
import { 
  Play, Hourglass, CheckCircle2, TrendingUp, DollarSign, 
  Plus, Package, FileText, ArrowRight, UserPlus, Clock, 
  Wrench, Percent, Award, AlertTriangle, Users, Search, 
  Settings, Eye, ShieldAlert, Sparkles, ChevronUp, ChevronDown, Check, HelpCircle, X, Trash2
} from "lucide-react"
import { Customer, Device, ServiceOrder, Part, Transaction } from "@/types"

interface WidgetConfig {
  id: string
  title: string
  visible: boolean
  category: "kpi" | "chart" | "ranking"
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "kpis_financial", title: "Indicadores Financeiros Rápidos", visible: true, category: "kpi" },
  { id: "kpis_technical", title: "Indicadores Técnicos de Bancada", visible: true, category: "kpi" },
  { id: "chart_revenue", title: "Balanço Mensal Receitas vs Despesas", visible: true, category: "chart" },
  { id: "chart_os", title: "Distribuição de Ordens por Técnico", visible: true, category: "chart" },
  { id: "kpis_bi", title: "Métricas Avançadas de BI (Tempo e Qualidade)", visible: true, category: "kpi" },
  { id: "ranking_clients", title: "Ranking de Clientes (Maior Faturamento)", visible: true, category: "ranking" },
  { id: "ranking_problems", title: "Problemas & Defeitos Mais Recorrentes", visible: true, category: "ranking" },
  { id: "ranking_techs", title: "Ranking de Eficiência dos Técnicos", visible: true, category: "ranking" },
  { id: "ranking_parts", title: "Peças de Maior Consumo e Reposição", visible: true, category: "ranking" }
]

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  
  // Dados do localStorage
  const [customers, setCustomers] = useState<Customer[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [inventory, setInventory] = useState<Part[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Configuração de Widgets Customizáveis
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  // Spotlight Search / Command Menu (Ctrl + K)
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false)
  const [spotlightQuery, setSpotlightQuery] = useState("")

  // Estados para Gestão Operacional de OSs no Dashboard
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL")
  const [isOSSearchOpen, setIsOSSearchOpen] = useState(false)
  const [osSearchQuery, setOsSearchQuery] = useState("")

  // Estados para abertura e detalhes de OS no Dashboard
  const [isCreateOSOpen, setIsCreateOSOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  // Permissão financeira
  const hasFinancialAccess = useMemo(() => {
    return checkPermission("financial", "view")
  }, [])

  const refreshData = useCallback(() => {
    setCustomers(getStoredCustomers())
    setDevices(getStoredDevices())
    setOrders(getStoredOrders())
    setInventory(getStoredInventory())
    setTransactions(getStoredTransactions())
  }, [])

  const handleSaveNewOrder = (data: OrderData) => {
    const currentOrders = getStoredOrders()
    const lastNumber = currentOrders.reduce((max, o) => o.number > max ? o.number : max, 1000)
    const orderNumber = lastNumber + 1

    const customer = getStoredCustomers().find(c => c.id === data.customerId)
    const device = getStoredDevices().find(d => d.id === data.deviceId)

    const newOrder = {
      id: `os_${Date.now()}`,
      number: orderNumber,
      customerId: data.customerId,
      deviceId: data.deviceId,
      technicianId: null,
      status: "PENDING" as const,
      priority: data.priority,
      reportedDefect: data.reportedDefect,
      accessories: data.accessories || "",
      checklist: {
        wifi: data.checklist?.wifi || false,
        audio: data.checklist?.audio || false,
        camera: data.checklist?.camera || false,
        touch: data.checklist?.touch || false,
        buttons: data.checklist?.buttons || false,
        charging: data.checklist?.charging || false
      },
      laborAmount: 0,
      partsAmount: 0,
      totalAmount: 0,
      notes: data.notes || "",
      entryDate: new Date().toISOString().split("T")[0],
      exitDate: null,
      customer: { 
        name: customer?.name || "Sem nome",
        phone: customer?.phone || "",
        document: customer?.document || ""
      },
      device: { 
        brandName: device?.brandName || "Sem marca", 
        modelName: device?.modelName || "Sem modelo", 
        serialNumber: device?.serialNumber || "Sem serial" 
      },
      histories: [
        {
          id: `h_init_${Date.now()}`,
          fromStatus: "PENDING",
          toStatus: "PENDING",
          changedAt: new Date().toISOString(),
          user: { name: "Adriano (Você)" },
          observation: "Abertura inicial da ordem de serviço realizada via dashboard."
        }
      ],
      partsUsed: [],
      attachments: []
    }

    const updated = [newOrder, ...currentOrders]
    saveStoredOrders(updated)

    // Grava log de auditoria
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
        oldValues: {},
        newValues: { number: orderNumber, customerName: customer?.name, deviceModel: device?.modelName }
      }
      saveStoredAuditLogs([newLog, ...auditLogs])
    }

    refreshData()
    setIsCreateOSOpen(false)
  }

  const handleChangeOrderStatus = (orderId: string, newStatus: string) => {
    const currentOrders = getStoredOrders()
    let updatedOrderObj: any = null

    const updated = currentOrders.map(o => {
      if (o.id === orderId) {
        const newHistory = {
          id: `h_${Date.now()}`,
          fromStatus: o.status,
          toStatus: newStatus as any,
          changedAt: new Date().toISOString(),
          user: { name: "Adriano (Você)" },
          observation: `Transição rápida efetuada via Dashboard.`
        }

        // Log de auditoria
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

        // Se o orçamento foi aprovado, debita estoque
        if (newStatus === "APPROVED" && o.partsUsed && o.partsUsed.length > 0) {
          const inventoryData = getStoredInventory()
          let updatedInv = false
          const updatedInventory = inventoryData.map((part: any) => {
            const pu = o.partsUsed.find((item: any) => item.partId === part.id || item.id === part.id)
            if (pu) {
              updatedInv = true
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
          if (updatedInv) {
            saveStoredInventory(updatedInventory)
          }
        }

        let exitDate = o.exitDate
        if (newStatus === "DELIVERED") {
          exitDate = new Date().toISOString().split("T")[0]

          // Faturamento financeiro automático
          const currentTrans = getStoredTransactions()
          const existingIndex = currentTrans.findIndex(t => t.origin === "OS" && t.originId === o.number.toString())
          let updatedTransactions = [...currentTrans]
          let shouldRecordCash = false

          if (existingIndex > -1) {
            if (!currentTrans[existingIndex].isPaid) {
              updatedTransactions[existingIndex] = {
                ...currentTrans[existingIndex],
                description: `Faturamento OS #${o.number} - ${o.customer.name}`,
                isPaid: true,
                paymentMethod: "PIX",
                paymentDate: exitDate,
                amount: o.totalAmount
              }
              saveStoredTransactions(updatedTransactions)
              shouldRecordCash = true
            }
          } else {
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

          // Grava entrada no caixa se aberto
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
        } else if (newStatus === "READY") {
          // Contas a receber
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

          // WhatsApp automático
          const config = getStoredSystemConfig()
          let template = config.whatsapp?.autoMessageReady || "Olá {cliente}, seu equipamento {modelo} (OS #{numero}) está pronto para retirada!"
          const text = template
            .replace("{cliente}", o.customer.name)
            .replace("{modelo}", `${o.device.brandName} ${o.device.modelName}`)
            .replace("{numero}", o.number.toString())
          
          const allCusts = [...getStoredCustomers()]
          const customerObj = allCusts.find(c => c.id === o.customerId || c.name === o.customer.name)
          const phone = customerObj?.phone || (o.customer as any).phone
          sendWhatsAppMessage(phone, text)
        }

        updatedOrderObj = {
          ...o,
          status: newStatus as any,
          exitDate,
          histories: [...o.histories, newHistory]
        }
        return updatedOrderObj
      }
      return o
    })

    saveStoredOrders(updated)
    refreshData()

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updatedOrderObj)
    }
  }

  const handleSaveBudget = (orderId: string, technicalReport: string, laborAmount: number, partsAmount: number, partsUsed?: any[]) => {
    const currentOrders = getStoredOrders()
    let updatedOrder: any = null

    const updated = currentOrders.map(o => {
      if (o.id === orderId) {
        const newHistory = {
          id: `h_budget_${Date.now()}`,
          fromStatus: o.status,
          toStatus: "BUDGETED" as const,
          changedAt: new Date().toISOString(),
          user: { name: "Adriano (Você)" },
          observation: `Orçamento gerado: Mão de Obra R$ ${laborAmount.toFixed(2)} | Peças R$ ${partsAmount.toFixed(2)}`
        }

        const partsUsedList = partsUsed || []

        // Grava log de auditoria
        if (typeof window !== "undefined") {
          const auditLogs = getStoredAuditLogs()
          const newLog = {
            id: `log_${Date.now()}`,
            action: "GENERATE_BUDGET",
            entityName: "ServiceOrder",
            entityId: `os_${o.number}`,
            createdAt: new Date().toISOString(),
            ipAddress: "127.0.0.1",
            userAgent: window.navigator.userAgent,
            user: { name: getCurrentUser()?.name || "Adriano (Você)" },
            oldValues: { laborAmount: o.laborAmount, partsAmount: o.partsAmount },
            newValues: { laborAmount, partsAmount, status: "BUDGETED" }
          }
          saveStoredAuditLogs([newLog, ...auditLogs])
        }

        // Criar artigo na base de conhecimento
        if (typeof window !== "undefined") {
          const articles = getStoredArticles()
          const newArticle = {
            id: `art_${Date.now()}`,
            title: `Reparo em ${o.device.brandName} ${o.device.modelName} - ${o.reportedDefect}`,
            category: o.device.brandName,
            tags: ["OS", o.device.modelName, "Manutenção"],
            content: `### Detalhes do Defeito e Reparo\n\n**Aparelho:** ${o.device.brandName} ${o.device.modelName}\n**Defeito Relatado:** ${o.reportedDefect}\n**Laudo Técnico de Mão de Obra:** ${technicalReport}\n\n### Etapas Executadas:\n- Diagnóstico de falha no componente.\n- Limpeza interna e aplicação de insumos de alta condução térmica.\n- Substituição das peças necessárias.\n- Montagem e testes de estresse finalizados com sucesso.`,
            views: 0,
            likes: 0,
            createdAt: new Date().toISOString().split("T")[0],
            steps: [
              `Diagnóstico e reparo detalhado: ${technicalReport}`,
              `Peças e componentes empregados no conserto: ${partsUsedList.map(pu => `${pu.quantity}x ${pu.name}`).join(", ") || "Nenhuma"}`,
              `Fase de calibração, montagem final e testes de estresse em bancada.`
            ]
          }
          saveStoredArticles([newArticle, ...articles])
        }

        // WhatsApp automático
        const budgetMsg = `Olá *${o.customer.name}*!\n\nSeu orçamento para o equipamento *${o.device.brandName} ${o.device.modelName}* (OS #${o.number}) foi gerado:\n\n- Mão de Obra: R$ ${laborAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n- Peças: R$ ${partsAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n*Total: R$ ${(laborAmount + partsAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}*\n\nLaudo Técnico:\n_"${technicalReport}"_\n\nPara aprovar ou rejeitar, responda esta mensagem ou entre em contato conosco.`
        
        const allCusts = [...getStoredCustomers()]
        const customerObj = allCusts.find(c => c.id === o.customerId || c.name === o.customer.name)
        const phone = customerObj?.phone || (o.customer as any).phone
        sendWhatsAppMessage(phone, budgetMsg)

        updatedOrder = {
          ...o,
          status: "BUDGETED" as const,
          laborAmount,
          partsAmount,
          totalAmount: laborAmount + partsAmount,
          reportedDefect: technicalReport,
          partsUsed: partsUsedList,
          histories: [...o.histories, newHistory]
        }
        return updatedOrder
      }
      return o
    })

    saveStoredOrders(updated)
    refreshData()

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updatedOrder)
    }
  }

  useEffect(() => {
    refreshData()
    
    // Carrega layout de widgets customizados
    const savedLayout = localStorage.getItem("dashboard_layout")
    if (savedLayout) {
      setWidgets(JSON.parse(savedLayout))
    } else {
      setWidgets(DEFAULT_WIDGETS)
    }

    setMounted(true)

    // Listener para o atalho Ctrl + K ou Cmd + K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsSpotlightOpen(prev => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [refreshData])

  // Salva Layout de Widgets
  const saveLayout = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets)
    localStorage.setItem("dashboard_layout", JSON.stringify(newWidgets))
  }

  const toggleWidget = (id: string) => {
    const updated = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w)
    saveLayout(updated)
  }

  const moveWidget = (index: number, direction: "up" | "down") => {
    const newWidgets = [...widgets]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex >= 0 && targetIndex < newWidgets.length) {
      const temp = newWidgets[index]
      newWidgets[index] = newWidgets[targetIndex]
      newWidgets[targetIndex] = temp
      saveLayout(newWidgets)
    }
  }

  // Cálculos do BI Real da Assistência
  const bi = useMemo(() => {
    const totalClients = customers.length
    const totalDevices = devices.length
    const totalOS = orders.length

    // KPIs de Status de Ordens
    const osPending = orders.filter(o => o.status === "PENDING").length
    const osInRepair = orders.filter(o => o.status === "IN_REPAIR" || o.status === "UNDER_ANALYSIS").length
    const osBudgetPending = orders.filter(o => o.status === "BUDGETED").length
    const osReady = orders.filter(o => o.status === "READY").length
    const osDelivered = orders.filter(o => o.status === "DELIVERED").length
    const osCancelled = orders.filter(o => o.status === "CANCELLED").length
    const osTotalOpen = orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").length

    // 1. Tempo Médio de Reparo (MTTR) em Dias (Diferença entre entryDate e exitDate nas concluídas)
    let totalRepairTime = 0
    let repairCount = 0
    orders.forEach(o => {
      if ((o.status === "READY" || o.status === "DELIVERED") && o.entryDate) {
        const entry = new Date(o.entryDate)
        const exit = o.exitDate ? new Date(o.exitDate) : new Date()
        const diffTime = Math.abs(exit.getTime() - entry.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        totalRepairTime += diffDays
        repairCount++
      }
    })
    const mttr = repairCount > 0 ? (totalRepairTime / repairCount).toFixed(1) : "0"

    // 2. Taxa de Retorno por Garantia (Percentual de OSs com garantia aberta)
    let warrantyOSCount = 0
    orders.forEach(o => {
      if (o.warranties && o.warranties.length > 0) {
        warrantyOSCount++
      }
    })
    const warrantyRate = repairCount > 0 ? ((warrantyOSCount / repairCount) * 100).toFixed(1) : "0"

    // 3. Lucro Bruto e Líquido Real das OSs
    let grossProfit = 0
    let partsCostTotal = 0
    orders.forEach(o => {
      if (o.status === "DELIVERED" || o.status === "READY") {
        grossProfit += o.totalAmount
        partsCostTotal += o.partsAmount
      }
    })

    // 4. Ticket Médio Real
    const ticketMedio = repairCount > 0 ? grossProfit / repairCount : 0

    // 5. Ranking de Clientes (Maior Faturamento)
    const clientSpentMap: Record<string, { name: string; totalSpent: number; count: number }> = {}
    orders.forEach(o => {
      if (o.status === "DELIVERED" || o.status === "READY") {
        const clientName = o.customer.name
        if (!clientSpentMap[clientName]) {
          clientSpentMap[clientName] = { name: clientName, totalSpent: 0, count: 0 }
        }
        clientSpentMap[clientName].totalSpent += o.totalAmount
        clientSpentMap[clientName].count++
      }
    })
    const clientRanking = Object.values(clientSpentMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 4)

    // 6. Ranking de Defeitos Mais Recorrentes
    const defectMap: Record<string, number> = {}
    orders.forEach(o => {
      const defect = o.reportedDefect || "Outros"
      defectMap[defect] = (defectMap[defect] || 0) + 1
    })
    const defectRanking = Object.entries(defectMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percent: totalOS > 0 ? Math.round((count / totalOS) * 100) : 0
      }))
      .slice(0, 4)

    // 7. Ranking de Técnicos (OS Concluídas e Faturamento Gerado)
    const techPerformance: Record<string, { name: string; completed: number; revenue: number }> = {}
    orders.forEach(o => {
      if (o.status === "DELIVERED" || o.status === "READY") {
        const techName = o.technician?.name || "Não atribuído"
        if (!techPerformance[techName]) {
          techPerformance[techName] = { name: techName, completed: 0, revenue: 0 }
        }
        techPerformance[techName].completed++
        techPerformance[techName].revenue += o.totalAmount
      }
    })
    const techRanking = Object.values(techPerformance)
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 4)

    // 8. Valor Total em Estoque & Abaixo do Mínimo
    let totalStockValue = 0
    let lowStockCount = 0
    inventory.forEach(p => {
      totalStockValue += p.quantity * p.salePrice
      if (p.quantity <= p.minStock) {
        lowStockCount++
      }
    })

    // 9. Distribuição por Categoria
    const categoryDistribution: Record<string, number> = {}
    devices.forEach(d => {
      categoryDistribution[d.category] = (categoryDistribution[d.category] || 0) + 1
    })

    return {
      totalClients,
      totalDevices,
      totalOS,
      osPending,
      osInRepair,
      osBudgetPending,
      osReady,
      osDelivered,
      osCancelled,
      osTotalOpen,
      mttr,
      warrantyRate,
      grossProfit,
      partsCostTotal,
      ticketMedio,
      clientRanking,
      defectRanking,
      techRanking,
      totalStockValue,
      lowStockCount,
      categoryDistribution
    }
  }, [customers, devices, orders, inventory])

  // Lógica de Lançamentos Financeiros Consolidados do Dia
  const financialToday = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0]
    let revenueToday = 0
    let expenseToday = 0

    transactions.forEach(t => {
      const isToday = t.dueDate === todayStr || (t.paymentDate && t.paymentDate.split("T")[0] === todayStr)
      if (isToday && t.isPaid) {
        if (t.type === "REVENUE") revenueToday += t.amount
        else expenseToday += t.amount
      }
    })

    return {
      revenueToday,
      expenseToday
    }
  }, [transactions])

  // Lógica de Filtro do Spotlight Search
  const spotlightResults = useMemo(() => {
    if (!spotlightQuery.trim()) return { clients: [], orders: [], commands: [] }
    
    const query = spotlightQuery.toLowerCase()
    
    const matchedClients = customers
      .filter(c => c.name.toLowerCase().includes(query) || c.phone.includes(query))
      .slice(0, 3)
      
    const matchedOrders = orders
      .filter(o => o.number.toString().includes(query) || o.reportedDefect.toLowerCase().includes(query))
      .slice(0, 3)

    const staticCommands = [
      { label: "Ir para Gestão de Caixa / Abertura", url: "/financial" },
      { label: "Ir para Lançamentos de Despesas", url: "/financial" },
      { label: "Ir para Controle de Estoque", url: "/inventory" },
      { label: "Cadastrar Novo Equipamento", url: "/devices" },
      { label: "Ver Rede de Especialistas (Match IA)", url: "/partners" },
      { label: "Auditar Transações na Blockchain", url: "/partners" }
    ].filter(cmd => cmd.label.toLowerCase().includes(query))

    return {
      clients: matchedClients,
      orders: matchedOrders,
      commands: staticCommands
    }
  }, [spotlightQuery, customers, orders])

  const filteredOrdersForDashboard = useMemo(() => {
    return orders.filter(o => {
      // Filtro de status
      if (selectedStatusFilter === "OPEN") {
        if (o.status === "DELIVERED" || o.status === "CANCELLED") return false
      } else if (selectedStatusFilter !== "ALL") {
        if (selectedStatusFilter === "IN_REPAIR") {
          if (o.status !== "IN_REPAIR" && o.status !== "UNDER_ANALYSIS") return false
        } else {
          if (o.status !== selectedStatusFilter) return false
        }
      }

      // Filtro de busca de texto
      if (osSearchQuery.trim()) {
        const q = osSearchQuery.toLowerCase()
        const matchesNum = o.number.toString().includes(q)
        const matchesName = o.customer.name.toLowerCase().includes(q)
        const matchesBrand = o.device.brandName.toLowerCase().includes(q)
        const matchesModel = o.device.modelName.toLowerCase().includes(q)
        return matchesNum || matchesName || matchesBrand || matchesModel
      }

      return true
    })
  }, [orders, selectedStatusFilter, osSearchQuery])

  const getStatusTitle = (status: string) => {
    switch (status) {
      case "OPEN": return "Ordens de Serviço Abertas (Ativas)"
      case "IN_REPAIR": return "Aparelhos em Manutenção Ativa"
      case "BUDGETED": return "Orçamentos Aguardando Aprovação"
      case "READY": return "Aparelhos Prontos (Aguardando Retirada)"
      case "ALL": return "Todas as Ordens de Serviço"
      default: return "Ordens de Serviço"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "LOW": return "bg-zinc-800 text-zinc-300 border-zinc-700"
      case "MEDIUM": return "bg-blue-950/40 text-blue-400 border-blue-900/30"
      case "HIGH": return "bg-amber-950/40 text-amber-400 border-amber-900/30"
      case "URGENT": return "bg-red-950/50 text-red-400 border-red-900/30 animate-pulse font-bold"
      default: return "bg-zinc-800 text-zinc-300"
    }
  }

  const getOSStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge variant="secondary">Na Fila</Badge>
      case "UNDER_ANALYSIS": return <Badge variant="info">Em Diagnóstico</Badge>
      case "BUDGETED": return <Badge variant="warning">Orçado</Badge>
      case "APPROVED": return <Badge variant="success">Orçamento Aprovado</Badge>
      case "REJECTED": return <Badge variant="destructive">Orçamento Rejeitado</Badge>
      case "IN_REPAIR": return <Badge variant="info">Em Conserto</Badge>
      case "READY": return <Badge variant="success">Pronto (Retirada)</Badge>
      case "DELIVERED": return <Badge variant="success">Entregue</Badge>
      case "CANCELLED": return <Badge variant="destructive">Cancelado</Badge>
      default: return <Badge variant="secondary">Status</Badge>
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 font-medium">Carregando painel executivo...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* Header do Painel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            Business Intelligence & Dashboard Executivo
          </h2>
          <p className="text-sm text-muted-foreground">Monitore a saúde do negócio, MTTR, gargalos técnicos e conversão financeira.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Spotlight Search Trigger */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSpotlightOpen(true)}
            className="gap-2 text-[11px] font-semibold text-muted-foreground bg-zinc-950/40 border-border/80"
          >
            <Search className="w-3.5 h-3.5" />
            Pesquisa Global...
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground ml-2">
              Ctrl+K
            </kbd>
          </Button>

          <Button variant="outline" size="sm" onClick={() => setIsConfigOpen(true)} className="gap-2 text-[11px] font-semibold">
            <Settings className="w-3.5 h-3.5" />
            Configurar Layout
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setIsCreateOSOpen(true)} 
            className="gap-2 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Abrir Nova OS
          </Button>
        </div>
      </div>

      {/* RENDERIZAÇÃO DOS WIDGETS CONFIGURADOS EM ORDEM */}
      <div className="space-y-6">
        {widgets.filter(w => w.visible).map((widget) => {
          
          // 1. KPI FINANCEIROS
          if (widget.id === "kpis_financial") {
            return (
              <div key={widget.id} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="bg-zinc-950/25 border-border/60 hover:border-zinc-500/20 transition-all">
                  <CardHeader className="pb-2 p-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Receita Hoje</span>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base font-bold font-mono text-emerald-400">
                      {hasFinancialAccess 
                        ? financialToday.revenueToday.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) 
                        : "🔒 Acesso Restrito"}
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">Liquidado no fluxo de caixa hoje</p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-950/25 border-border/60 hover:border-zinc-500/20 transition-all">
                  <CardHeader className="pb-2 p-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lucro Bruto OS</span>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base font-bold font-mono text-foreground">
                      {hasFinancialAccess 
                        ? bi.grossProfit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) 
                        : "🔒 Acesso Restrito"}
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">Ganhos acumulados nas OSs</p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-950/25 border-border/60 hover:border-zinc-500/20 transition-all">
                  <CardHeader className="pb-2 p-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ticket Médio</span>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base font-bold font-mono text-foreground">
                      {hasFinancialAccess 
                        ? bi.ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) 
                        : "🔒 Acesso Restrito"}
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">Valor médio arrecadado por conserto</p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-950/25 border-border/60 hover:border-zinc-500/20 transition-all">
                  <CardHeader className="pb-2 p-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Valor do Estoque</span>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-base font-bold font-mono text-foreground">
                      {hasFinancialAccess 
                        ? bi.totalStockValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) 
                        : "🔒 Acesso Restrito"}
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1">{bi.lowStockCount} peças críticas abaixo do estoque mínimo</p>
                  </CardContent>
                </Card>
              </div>
            )
          }

          // 2. KPI TÉCNICOS
          if (widget.id === "kpis_technical") {
            return (
              <div key={widget.id} className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                <Card 
                  onClick={() => { setSelectedStatusFilter("OPEN"); setIsOSSearchOpen(true); }}
                  className="bg-zinc-950/25 border-border/60 hover:border-zinc-500/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <CardHeader className="pb-2 p-4 flex flex-row justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">OS Abertas (Total)</span>
                    <FileText className="w-3.5 h-3.5 text-zinc-300 group-hover:animate-bounce" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-lg font-bold font-mono text-zinc-100">{bi.osTotalOpen} Ordens</div>
                    <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-zinc-300 transition-colors">
                      Clique para gerenciar <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  onClick={() => { setSelectedStatusFilter("IN_REPAIR"); setIsOSSearchOpen(true); }}
                  className="bg-zinc-950/25 border-border/60 hover:border-zinc-500/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <CardHeader className="pb-2 p-4 flex flex-row justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Manutenção Ativa</span>
                    <Play className="w-3.5 h-3.5 text-blue-400 group-hover:scale-125 transition-transform" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-lg font-bold font-mono text-foreground">{bi.osInRepair} Aparelhos</div>
                    <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-blue-300 transition-colors">
                      Clique para gerenciar <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  onClick={() => { setSelectedStatusFilter("BUDGETED"); setIsOSSearchOpen(true); }}
                  className="bg-zinc-950/25 border-border/60 hover:border-zinc-500/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <CardHeader className="pb-2 p-4 flex flex-row justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Aguardando Aprov.</span>
                    <Hourglass className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-180 transition-transform duration-700" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-lg font-bold font-mono text-foreground">{bi.osBudgetPending} Orçamentos</div>
                    <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
                      Clique para gerenciar <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  onClick={() => { setSelectedStatusFilter("READY"); setIsOSSearchOpen(true); }}
                  className="bg-zinc-950/25 border-border/60 hover:border-zinc-500/20 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <CardHeader className="pb-2 p-4 flex flex-row justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Aparelhos Prontos</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-pulse" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-lg font-bold font-mono text-foreground">{bi.osReady} Prontos</div>
                    <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
                      Clique para gerenciar <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-950/25 border-border/60 hover:border-zinc-500/20 transition-all">
                  <CardHeader className="pb-2 p-4 flex flex-row justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total de Clientes</span>
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-lg font-bold font-mono text-foreground">{bi.totalClients} Cadastros</div>
                    <p className="text-[9px] text-muted-foreground mt-1">Contas gerenciadas e ativas</p>
                  </CardContent>
                </Card>
              </div>
            )
          }

          // 3. BALANÇO FINANCEIRO (Gráfico CSS Puro)
          if (widget.id === "chart_revenue" && hasFinancialAccess) {
            return (
              <Card key={widget.id}>
                <CardHeader>
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Balanço Financeiro Consolidado</CardTitle>
                  <CardDescription>Comparativo de receitas e despesas brutas registradas em histórico.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Receitas Arrecadadas (Bancos / Caixa)</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {bi.grossProfit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded" style={{ width: `${Math.min(100, (bi.grossProfit / (bi.grossProfit + bi.partsCostTotal || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Despesas / Custo de Peças de OS</span>
                      <span className="font-mono font-bold text-destructive">
                        {bi.partsCostTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded overflow-hidden">
                      <div className="h-full bg-destructive rounded" style={{ width: `${Math.min(100, (bi.partsCostTotal / (bi.grossProfit + bi.partsCostTotal || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }

          // 4. METRICAS BI AVANÇADAS
          if (widget.id === "kpis_bi") {
            return (
              <div key={widget.id} className="grid gap-4 grid-cols-2 lg:grid-cols-4 text-xs">
                <Card className="bg-zinc-950/20 border-border/50">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Tempo Médio de Reparo (MTTR)</span>
                    <div className="text-base font-bold font-mono text-foreground flex items-center gap-1.5 mt-1">
                      <Clock className="w-4 h-4 text-blue-400" />
                      {bi.mttr} Dias
                    </div>
                    <p className="text-[9px] text-muted-foreground">Entrada até pronto na bancada</p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-950/20 border-border/50">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Taxa de Retorno por Garantia</span>
                    <div className="text-base font-bold font-mono text-foreground flex items-center gap-1.5 mt-1">
                      <Percent className="w-4 h-4 text-amber-400" />
                      {bi.warrantyRate}%
                    </div>
                    <p className="text-[9px] text-muted-foreground">OSs com acionamento de termo</p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-950/20 border-border/50">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Estoque Crítico (Reposição)</span>
                    <div className="text-base font-bold font-mono text-foreground flex items-center gap-1.5 mt-1">
                      <Package className="w-4 h-4 text-destructive" />
                      {bi.lowStockCount} Itens
                    </div>
                    <p className="text-[9px] text-muted-foreground">Produtos abaixo do estoque mínimo</p>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-950/20 border-border/50">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Garantias Vigentes</span>
                    <div className="text-base font-bold font-mono text-foreground flex items-center gap-1.5 mt-1">
                      <Award className="w-4 h-4 text-emerald-400" />
                      {orders.filter(o => o.warranties && o.warranties.length > 0).length} Ativas
                    </div>
                    <p className="text-[9px] text-muted-foreground">Termos de proteção assegurados</p>
                  </CardContent>
                </Card>
              </div>
            )
          }

          // 5. RANKINGS (Clientes e Defeitos)
          if (widget.id === "ranking_clients") {
            return (
              <div key={widget.id} className="grid gap-6 md:grid-cols-2">
                
                {/* Ranking de Clientes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clientes que Mais Faturaram</CardTitle>
                    <CardDescription>Clientes com maior volume de gastos liquidados no laboratório.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    {bi.clientRanking.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">Nenhum faturamento registrado.</p>
                    ) : (
                      bi.clientRanking.map((c, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 border border-border/40 rounded bg-card/25">
                          <span className="font-semibold text-foreground">{c.name}</span>
                          <div className="text-right">
                            <span className="font-mono font-bold text-foreground block">
                              {c.totalSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                            <span className="text-[9px] text-muted-foreground">{c.count} consertos finalizados</span>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Problemas mais Recorrentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Defeitos & Sintomas Recorrentes</CardTitle>
                    <CardDescription>Principais queixas apresentadas na triagem inicial de entrada.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bi.defectRanking.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">Nenhum defeito registrado.</p>
                    ) : (
                      bi.defectRanking.map((d, idx) => (
                        <div key={idx} className="space-y-1.5 text-xs">
                          <div className="flex justify-between font-semibold">
                            <span className="text-foreground truncate max-w-[200px]" title={d.name}>{d.name}</span>
                            <span className="text-muted-foreground font-mono">{d.count} ocorrências</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded">
                            <div className="h-full bg-amber-500 rounded" style={{ width: `${d.percent}%` }} />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          }

          // 6. RANKINGS OPERACIONAIS (Técnicos e Peças)
          if (widget.id === "ranking_techs") {
            return (
              <div key={widget.id} className="grid gap-6 md:grid-cols-2">
                
                {/* Ranking de Técnicos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ranking de Eficiência de Técnicos</CardTitle>
                    <CardDescription>Volume de ordens finalizadas e faturamento bruto gerado.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    {bi.techRanking.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">Nenhum técnico com ordens concluídas.</p>
                    ) : (
                      bi.techRanking.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 border border-border/40 rounded bg-card/25">
                          <span className="font-semibold text-foreground">{t.name}</span>
                          <div className="text-right">
                            <span className="font-mono font-bold text-foreground block">
                              {t.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                            <span className="text-[9px] text-muted-foreground">{t.completed} OSs finalizadas</span>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Peças mais Utilizadas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peças Críticas & Giro de Estoque</CardTitle>
                    <CardDescription>Peças com maior volume de aplicação direta em ordens.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {inventory.slice(0, 4).map((p, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-foreground truncate max-w-[200px]" title={p.name}>{p.name}</span>
                          <span className="text-muted-foreground font-mono">{p.quantity} un. em estoque</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded">
                          <div className="h-full bg-blue-500 rounded" style={{ width: `${Math.min(100, (p.quantity / (p.minStock * 2 || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )
          }

          return null
        })}
      </div>

      {/* SPOTLIGHT SEARCH DIALOG (Ctrl + K) */}
      {isSpotlightOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSpotlightOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-10 flex flex-col p-4">
            <div className="relative flex items-center border-b border-zinc-800 pb-3">
              <Search className="w-4 h-4 text-zinc-400 absolute left-2.5" />
              <input
                type="text"
                autoFocus
                placeholder="Busque por clientes, ordens, ou comandos de atalho..."
                value={spotlightQuery}
                onChange={e => setSpotlightQuery(e.target.value)}
                className="w-full pl-9 pr-4 bg-transparent border-0 text-xs text-foreground focus:outline-none placeholder-zinc-500"
              />
              <button onClick={() => setIsSpotlightOpen(false)} className="text-zinc-500 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Resultados filtrados */}
            <div className="mt-4 space-y-4 max-h-[300px] overflow-y-auto">
              {!spotlightQuery.trim() ? (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  <p>Digite algo para pesquisar...</p>
                  <p className="text-[10px] text-zinc-600 mt-1">Dica: digite &quot;cliente&quot;, &quot;os&quot;, ou um nome.</p>
                </div>
              ) : (
                <>
                  {/* Clientes */}
                  {spotlightResults.clients.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Clientes Encontrados</p>
                      {spotlightResults.clients.map(c => (
                        <a 
                          key={c.id} 
                          href="/customers"
                          className="flex items-center justify-between p-2 rounded hover:bg-zinc-800/60 text-xs"
                        >
                          <span className="font-semibold text-zinc-200">{c.name}</span>
                          <span className="text-zinc-500 font-mono">{c.phone}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* OS */}
                  {spotlightResults.orders.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Ordens de Serviço</p>
                      {spotlightResults.orders.map(o => (
                        <a 
                          key={o.id} 
                          href="/service-orders"
                          className="flex items-center justify-between p-2 rounded hover:bg-zinc-800/60 text-xs"
                        >
                          <span className="font-semibold text-zinc-200">OS #{o.number}</span>
                          <span className="text-zinc-500 truncate max-w-[200px]">{o.reportedDefect}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Comandos rápidos */}
                  {spotlightResults.commands.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Comandos Rápidos</p>
                      {spotlightResults.commands.map((cmd, idx) => (
                        <a 
                          key={idx} 
                          href={cmd.url}
                          className="flex items-center justify-between p-2 rounded hover:bg-zinc-800/60 text-xs text-blue-400 hover:text-blue-300"
                        >
                          <span>{cmd.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      ))}
                    </div>
                  )}

                  {spotlightResults.clients.length === 0 && spotlightResults.orders.length === 0 && spotlightResults.commands.length === 0 && (
                    <p className="text-center py-6 text-zinc-500 text-xs">Nenhum resultado encontrado para &quot;{spotlightQuery}&quot;</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURADOR DE WIDGETS DIALOG */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)} />
          
          <div className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col p-6 max-h-[85vh]">
            <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-4">
              <h3 className="text-sm font-bold text-foreground">Configurar Layout do Painel</h3>
              <button onClick={() => setIsConfigOpen(false)} className="text-zinc-500 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground leading-normal mb-4">
              Oculte ou ative os cartões, rankings e gráficos do painel de Business Intelligence. Use as setas para alterar a ordem de renderização na tela.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[350px] pr-1">
              {widgets.map((w, idx) => (
                <div key={w.id} className="flex items-center justify-between p-2 border border-border/50 rounded bg-card/25 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={w.visible}
                      onChange={() => toggleWidget(w.id)}
                      className="w-3.5 h-3.5 rounded border-border cursor-pointer focus:ring-0"
                    />
                    <span className={`font-semibold ${w.visible ? "text-foreground" : "text-muted-foreground line-through"}`}>{w.title}</span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => moveWidget(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 border border-border rounded hover:bg-muted/15 disabled:opacity-20 text-zinc-400"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveWidget(idx, "down")}
                      disabled={idx === widgets.length - 1}
                      className="p-1 border border-border rounded hover:bg-muted/15 disabled:opacity-20 text-zinc-400"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-border/40 pt-4 mt-4">
              <Button variant="default" size="sm" onClick={() => setIsConfigOpen(false)}>Concluir & Salvar</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PESQUISA E GESTÃO DE OS RÁPIDA NO DASHBOARD */}
      {isOSSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsOSSearchOpen(false); setOsSearchQuery(""); }} />
          
          <div className="relative w-full max-w-4xl bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col p-6 max-h-[85vh]">
            <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-400" />
                  {getStatusTitle(selectedStatusFilter)}
                </h3>
                <p className="text-[10px] text-muted-foreground">Gerenciador Operacional Exclusivo do Dashboard</p>
              </div>
              <button onClick={() => { setIsOSSearchOpen(false); setOsSearchQuery(""); }} className="text-zinc-500 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filtros Rápidos Internos */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedStatusFilter("OPEN")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors ${
                    selectedStatusFilter === "OPEN" 
                      ? "bg-zinc-800 text-zinc-100 border-zinc-700" 
                      : "bg-transparent text-muted-foreground border-border/40 hover:bg-muted/10"
                  }`}
                >
                  Abertas
                </button>
                <button
                  onClick={() => setSelectedStatusFilter("IN_REPAIR")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors ${
                    selectedStatusFilter === "IN_REPAIR" 
                      ? "bg-blue-950/40 text-blue-400 border-blue-900/30" 
                      : "bg-transparent text-muted-foreground border-border/40 hover:bg-muted/10"
                  }`}
                >
                  Em Manutenção
                </button>
                <button
                  onClick={() => setSelectedStatusFilter("BUDGETED")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors ${
                    selectedStatusFilter === "BUDGETED" 
                      ? "bg-amber-950/40 text-amber-400 border-amber-900/30" 
                      : "bg-transparent text-muted-foreground border-border/40 hover:bg-muted/10"
                  }`}
                >
                  Orçamentos
                </button>
                <button
                  onClick={() => setSelectedStatusFilter("READY")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors ${
                    selectedStatusFilter === "READY" 
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30" 
                      : "bg-transparent text-muted-foreground border-border/40 hover:bg-muted/10"
                  }`}
                >
                  Prontos
                </button>
                <button
                  onClick={() => setSelectedStatusFilter("ALL")}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors ${
                    selectedStatusFilter === "ALL" 
                      ? "bg-zinc-800 text-zinc-100 border-zinc-700" 
                      : "bg-transparent text-muted-foreground border-border/40 hover:bg-muted/10"
                  }`}
                >
                  Todos
                </button>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Pesquisar por OS, cliente ou aparelho..."
                  value={osSearchQuery}
                  onChange={(e) => setOsSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-950/50 border border-border/60 rounded text-[11px] placeholder:text-muted-foreground text-foreground focus:outline-none focus:border-zinc-500 focus:ring-0"
                />
              </div>
            </div>

            {/* Listagem de OS */}
            <div className="flex-1 overflow-y-auto min-h-[250px] border border-border/40 rounded bg-zinc-950/15">
              {filteredOrdersForDashboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="w-8 h-8 text-zinc-600 mb-2" />
                  <p className="text-xs font-semibold text-foreground">Nenhuma Ordem de Serviço encontrada</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Tente ajustar seus termos de busca ou filtros rápidos.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setIsCreateOSOpen(true); setIsOSSearchOpen(false); }}
                    className="mt-4 gap-1.5 text-[10px] bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600/20"
                  >
                    <Plus className="w-3 h-3" /> Abrir Nova OS
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 bg-zinc-900/30 text-muted-foreground font-bold">
                        <th className="p-3">Nº OS</th>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Aparelho</th>
                        <th className="p-3">Entrada</th>
                        <th className="p-3">Prioridade</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrdersForDashboard.map((o) => (
                        <tr key={o.id} className="border-b border-border/20 hover:bg-muted/5 transition-colors">
                          <td className="p-3 font-mono font-bold text-foreground">#{o.number}</td>
                          <td className="p-3 font-semibold text-foreground">{o.customer.name}</td>
                          <td className="p-3 text-muted-foreground">{o.device.brandName} {o.device.modelName}</td>
                          <td className="p-3 text-muted-foreground">{new Date(o.entryDate).toLocaleDateString("pt-BR")}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-[9px] rounded-full border ${getPriorityBadgeColor(o.priority)}`}>
                              {o.priority === "LOW" && "Baixa"}
                              {o.priority === "MEDIUM" && "Média"}
                              {o.priority === "HIGH" && "Alta"}
                              {o.priority === "URGENT" && "Urgente"}
                            </span>
                          </td>
                          <td className="p-3">{getOSStatusBadge(o.status)}</td>
                          <td className="p-3 text-right flex items-center justify-end gap-1.5">
                            {o.status === "READY" && (
                              <button
                                onClick={() => {
                                  if (confirm(`Deseja confirmar a entrega e dar baixa na OS #${o.number} de R$ ${o.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}?`)) {
                                    handleChangeOrderStatus(o.id, "DELIVERED")
                                  }
                                }}
                                className="px-2 py-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/20 rounded transition-colors"
                              >
                                Dar Baixa / Entregar
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedOrder(o)
                              }}
                              className="p-1 text-muted-foreground hover:text-foreground border border-border/40 hover:bg-muted/15 rounded transition-colors"
                              title="Ver Detalhes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setIsCreateOSOpen(true); setIsOSSearchOpen(false); }}
                className="gap-1.5 text-[10px] text-blue-400 border-blue-500/20 hover:bg-blue-600/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Abrir Nova OS
              </Button>
              <Button variant="default" size="sm" onClick={() => { setIsOSSearchOpen(false); setOsSearchQuery(""); }}>Fechar</Button>
            </div>
          </div>
        </div>
      )}

      {/* DIÁLOGO DE CRIAÇÃO OPERACIONAL DE OS */}
      {isCreateOSOpen && (
        <OrderDialog
          isOpen={isCreateOSOpen}
          onClose={() => setIsCreateOSOpen(false)}
          onSave={handleSaveNewOrder}
          customers={customers}
          devices={devices}
        />
      )}

      {/* DIÁLOGO DE DETALHES, ORÇAMENTOS E LAUDOS DE OS */}
      {selectedOrder && (
        <OrderDetailDialog
          isOpen={!!selectedOrder}
          onClose={() => { setSelectedOrder(null); refreshData(); }}
          order={selectedOrder}
          onChangeStatus={(orderId, newStatus) => {
            handleChangeOrderStatus(orderId, newStatus)
            const currentOrders = getStoredOrders()
            const found = currentOrders.find(ord => ord.id === orderId)
            if (found) {
              setSelectedOrder(found)
            }
          }}
          onSaveBudget={handleSaveBudget}
        />
      )}

    </div>
  )
}
