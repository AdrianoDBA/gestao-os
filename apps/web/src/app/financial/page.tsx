"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { 
  getStoredTransactions, saveStoredTransactions, 
  getStoredCashSession, saveStoredCashSession, 
  getStoredPaymentMethods, saveStoredPaymentMethods, 
  getStoredFinanceCategories, saveStoredFinanceCategories,
  getStoredOrders
} from "@/lib/db-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TransactionDialog, TransactionFormData } from "./transaction-dialog"
import { 
  TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, 
  Plus, Edit, Trash2, Search, Filter, Shield, FileText, 
  Settings, Key, AlertTriangle, Eye, ArrowUpRight, ArrowDownRight, RefreshCw
} from "lucide-react"
import { Transaction, CashSession } from "@/types"

export default function FinancialPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cashSession, setCashSession] = useState<CashSession>({
    id: "session_init",
    isOpen: false,
    openedBy: "",
    openedAt: "",
    initialBalance: 0,
    movements: []
  })
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [financeCategories, setFinanceCategories] = useState<string[]>([])
  
  const [mounted, setMounted] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<"dashboard" | "cash" | "receivables" | "payables" | "settings" | "reports" | "audit">("dashboard")
  
  // Filtros Gerais
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL") // ALL, PAID, PENDING
  const [dateFilterStart, setDateFilterStart] = useState("")
  const [dateFilterEnd, setDateFilterEnd] = useState("")

  // Modais
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [forceFormType, setForceFormType] = useState<"REVENUE" | "EXPENSE" | undefined>(undefined)

  // Caixa Modais/Estados
  const [isCashDialogOpen, setIsCashDialogOpen] = useState(false)
  const [cashActionType, setCashActionType] = useState<"OPEN" | "CLOSE" | "REINFORCE" | "WITHDRAW">("OPEN")
  const [cashAmountInput, setCashAmountInput] = useState(0)
  const [cashReasonInput, setCashReasonInput] = useState("")
  const [cashObsInput, setCashObsInput] = useState("")

  // Formas de Pagamento & Categorias Editores
  const [newPaymentMethod, setNewPaymentMethod] = useState("")
  const [newCategory, setNewCategory] = useState("")

  // Simulador de Perfil e Permissões de Usuário (Rico para teste de QA em tempo real!)
  const [userPermissions, setUserPermissions] = useState({
    viewFinancial: true,
    createTransaction: true,
    editTransaction: true,
    deleteTransaction: true,
    receivePayments: true,
    makePayments: true,
    closeCash: true,
    viewReports: true
  })
  const [activeProfile, setActiveProfile] = useState<"ADMIN" | "FINANCIAL" | "TECHNICIAN">("ADMIN")

  // Carrega Permissões Conforme Perfil
  const handleProfileChange = (profile: "ADMIN" | "FINANCIAL" | "TECHNICIAN") => {
    setActiveProfile(profile)
    if (profile === "ADMIN") {
      setUserPermissions({
        viewFinancial: true,
        createTransaction: true,
        editTransaction: true,
        deleteTransaction: true,
        receivePayments: true,
        makePayments: true,
        closeCash: true,
        viewReports: true
      })
    } else if (profile === "FINANCIAL") {
      setUserPermissions({
        viewFinancial: true,
        createTransaction: true,
        editTransaction: true,
        deleteTransaction: false, // Financeiro não deleta por auditoria
        receivePayments: true,
        makePayments: true,
        closeCash: true,
        viewReports: true
      })
    } else {
      setUserPermissions({
        viewFinancial: false, // Técnico não vê o financeiro global
        createTransaction: false,
        editTransaction: false,
        deleteTransaction: false,
        receivePayments: false,
        makePayments: false,
        closeCash: false,
        viewReports: false
      })
    }
  }

  useEffect(() => {
    setTransactions(getStoredTransactions())
    setCashSession(getStoredCashSession())
    setPaymentMethods(getStoredPaymentMethods())
    setFinanceCategories(getStoredFinanceCategories())
    setMounted(true)
    setHasLoaded(true)
  }, [])

  useEffect(() => {
    if (mounted && hasLoaded) {
      saveStoredTransactions(transactions)
    }
  }, [transactions, mounted, hasLoaded])

  useEffect(() => {
    if (mounted && hasLoaded) {
      saveStoredCashSession(cashSession)
    }
  }, [cashSession, mounted, hasLoaded])

  const allOrders = useMemo(() => getStoredOrders(), [])

  // Lógica de Filtros Combinados (Contas a Receber e Pagar)
  const filterHelper = useCallback((t: Transaction, filterType: "REVENUE" | "EXPENSE") => {
    if (t.type !== filterType) return false
    
    const query = search.toLowerCase()
    const matchSearch =
      t.description.toLowerCase().includes(query) ||
      t.entityName.toLowerCase().includes(query) ||
      (t.category && t.category.toLowerCase().includes(query)) ||
      (t.originId && t.originId.includes(query))

    const matchCategory = categoryFilter === "ALL" || t.category === categoryFilter
    const matchPaymentMethod = paymentMethodFilter === "ALL" || t.paymentMethod === paymentMethodFilter
    
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PAID" && t.isPaid) ||
      (statusFilter === "PENDING" && !t.isPaid)

    let matchDate = true
    if (dateFilterStart) {
      matchDate = matchDate && t.dueDate >= dateFilterStart
    }
    if (dateFilterEnd) {
      matchDate = matchDate && t.dueDate <= dateFilterEnd
    }

    return matchSearch && matchCategory && matchPaymentMethod && matchStatus && matchDate
  }, [search, categoryFilter, paymentMethodFilter, statusFilter, dateFilterStart, dateFilterEnd])

  const filteredReceivables = useMemo(() => {
    return transactions.filter(t => filterHelper(t, "REVENUE"))
  }, [transactions, filterHelper])

  const filteredPayables = useMemo(() => {
    return transactions.filter(t => filterHelper(t, "EXPENSE"))
  }, [transactions, filterHelper])

  // KPIs Financeiros Consolidados
  const kpis = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0]
    
    let revDay = 0
    let revWeek = 0
    let revMonth = 0
    let revYear = 0
    
    let expDay = 0
    let expMonth = 0
    
    let totalPaidRevenue = 0
    let totalPaidExpense = 0
    let totalPendingRevenue = 0
    let totalPendingExpense = 0

    transactions.forEach(t => {
      const isToday = t.dueDate === todayStr || (t.paymentDate && t.paymentDate.split("T")[0] === todayStr)
      const tDate = new Date(t.dueDate)
      const now = new Date()
      
      // Diferença de dias
      const diffTime = Math.abs(now.getTime() - tDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const isThisWeek = diffDays <= 7
      
      const isThisMonth = tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
      const isThisYear = tDate.getFullYear() === now.getFullYear()

      if (t.type === "REVENUE") {
        if (t.isPaid) {
          totalPaidRevenue += t.amount
          if (isToday) revDay += t.amount
          if (isThisWeek) revWeek += t.amount
          if (isThisMonth) revMonth += t.amount
          if (isThisYear) revYear += t.amount
        } else {
          totalPendingRevenue += t.amount
        }
      } else {
        if (t.isPaid) {
          totalPaidExpense += t.amount
          if (isToday) expDay += t.amount
          if (isThisMonth) expMonth += t.amount
        } else {
          totalPendingExpense += t.amount
        }
      }
    })

    const faturadasCount = allOrders.filter(o => o.status === "READY" || o.status === "DELIVERED").length
    const pendentesCount = allOrders.filter(o => o.status !== "READY" && o.status !== "DELIVERED" && o.status !== "CANCELLED").length
    const ticketMedio = faturadasCount > 0 ? totalPaidRevenue / faturadasCount : 0

    return {
      revDay,
      revWeek,
      revMonth,
      revYear,
      expDay,
      expMonth,
      grossProfit: totalPaidRevenue,
      netProfit: totalPaidRevenue - totalPaidExpense,
      totalPaidRevenue,
      totalPaidExpense,
      totalPendingRevenue,
      totalPendingExpense,
      faturadasCount,
      pendentesCount,
      ticketMedio
    }
  }, [transactions, allOrders])

  // Lógica de Caixa (Abertura, Fechamento, Reforço, Sangria)
  const handleCashAction = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cashActionType === "OPEN") {
      const openedAt = new Date().toISOString()
      const newSession: CashSession = {
        id: `session_${Date.now()}`,
        isOpen: true,
        openedBy: "Adriano (Você)",
        openedAt,
        initialBalance: cashAmountInput,
        movements: [
          {
            id: `mov_${Date.now()}`,
            type: "INPUT",
            amount: cashAmountInput,
            reason: "Saldo Inicial de Abertura",
            date: openedAt,
            user: "Adriano (Você)",
            observation: cashObsInput
          }
        ],
        notes: cashObsInput
      }
      setCashSession(newSession)
      alert("Caixa aberto com sucesso!")
    } else if (cashActionType === "CLOSE") {
      const closedAt = new Date().toISOString()
      const currentBalance = getSessionBalance(cashSession)
      
      const closedSession: CashSession = {
        ...cashSession,
        isOpen: false,
        closedBy: "Adriano (Você)",
        closedAt,
        finalBalance: currentBalance,
        notes: cashObsInput
      }
      setCashSession(closedSession)
      alert(`Caixa fechado com sucesso! Saldo Final: ${currentBalance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`)
    } else {
      // Sangria ou Reforço
      const isInput = cashActionType === "REINFORCE"
      const newMov = {
        id: `mov_${Date.now()}`,
        type: (isInput ? "INPUT" : "OUTPUT") as "INPUT" | "OUTPUT",
        amount: cashAmountInput,
        reason: cashReasonInput || (isInput ? "Aporte / Reforço" : "Retirada / Sangria"),
        date: new Date().toISOString(),
        user: "Adriano (Você)",
        observation: cashObsInput
      }
      
      setCashSession(prev => ({
        ...prev,
        movements: [...prev.movements, newMov]
      }))
      
      // Registra a transação correspondente no fluxo financeiro principal
      const trans: Transaction = {
        id: `trans_cash_${Date.now()}`,
        description: `Movimentação de Caixa: ${newMov.reason}`,
        type: isInput ? "REVENUE" : "EXPENSE",
        amount: cashAmountInput,
        dueDate: new Date().toISOString().split("T")[0],
        entityName: "Fluxo de Caixa Interno",
        isPaid: true,
        paymentMethod: "Dinheiro",
        paymentDate: new Date().toISOString(),
        category: "Outros",
        createdByUser: "Adriano (Você)",
        createdAt: new Date().toISOString()
      }
      setTransactions(prev => [trans, ...prev])
      alert("Operação registrada no caixa e lançamentos!")
    }
    
    setIsCashDialogOpen(false)
    setCashAmountInput(0)
    setCashReasonInput("")
    setCashObsInput("")
  }

  const getSessionBalance = (session: CashSession) => {
    let bal = session.initialBalance
    session.movements.forEach(m => {
      if (m.reason === "Saldo Inicial de Abertura") return // evita duplicar saldo inicial
      if (m.type === "INPUT") bal += m.amount
      else bal -= m.amount
    })
    return bal
  }

  const handleOpenCashDialog = (type: typeof cashActionType) => {
    if (type === "CLOSE" && !userPermissions.closeCash) {
      alert("Você não possui permissão para fechar o caixa!")
      return
    }
    setCashActionType(type)
    setIsCashDialogOpen(true)
  }

  // Lógica de Salvar Lançamento (Contas a Pagar / Receber)
  const handleSaveTransaction = (data: TransactionFormData) => {
    if (!userPermissions.createTransaction && !data.id) {
      alert("Você não possui permissão para criar lançamentos!")
      return
    }
    if (!userPermissions.editTransaction && data.id) {
      alert("Você não possui permissão para editar lançamentos!")
      return
    }

    const todayStr = new Date().toISOString().split("T")[0]
    const user = "Adriano (Você)"

    if (data.id) {
      // Editar lançamento + Auditoria
      setTransactions(prev =>
        prev.map(t => {
          if (t.id === data.id) {
            const auditLogs: any[] = []
            if (t.amount !== data.amount) {
              auditLogs.push({
                date: new Date().toISOString(),
                user,
                action: "Alteração de valor",
                oldValue: t.amount.toString(),
                newValue: data.amount.toString()
              })
            }
            if (t.isPaid !== data.isPaid) {
              auditLogs.push({
                date: new Date().toISOString(),
                user,
                action: "Alteração de quitação",
                oldValue: t.isPaid ? "PAGO" : "PENDENTE",
                newValue: data.isPaid ? "PAGO" : "PENDENTE"
              })
            }

            // Se quitado agora, registrar entrada no caixa automático se o caixa estiver aberto!
            if (!t.isPaid && data.isPaid && cashSession.isOpen) {
              const mov = {
                id: `mov_auto_${Date.now()}`,
                type: data.type === "REVENUE" ? ("INPUT" as const) : ("OUTPUT" as const),
                amount: data.amount,
                reason: `Liq. Lançamento: ${data.description}`,
                date: new Date().toISOString(),
                user
              }
              setCashSession(prev => ({
                ...prev,
                movements: [...prev.movements, mov]
              }))
            }

            return {
              ...t,
              description: data.description,
              type: data.type,
              amount: data.amount,
              discount: data.discount,
              interest: data.interest,
              fine: data.fine,
              dueDate: data.dueDate,
              entityName: data.entityName,
              isPaid: data.isPaid,
              paymentMethod: data.paymentMethod,
              paymentDate: data.isPaid ? todayStr : null,
              category: data.category,
              notes: data.notes,
              origin: data.origin,
              originId: data.originId,
              updatedByUser: user,
              updatedAt: new Date().toISOString(),
              history: [...(t.history || []), ...auditLogs]
            }
          }
          return t
        })
      )
    } else {
      // Criar Lançamento (À vista ou parcelado)
      const isPaidNow = data.isPaid

      if (data.installmentsCount && data.installmentsCount > 1) {
        // Lógica de Parcelamento
        const totalNet = data.amount - (data.discount || 0) + (data.interest || 0) + (data.fine || 0)
        const entryVal = data.entryValue || 0
        const remainingVal = totalNet - entryVal
        const installmentsRemaining = data.installmentsCount - 1
        const valuePerInstallment = remainingVal / installmentsRemaining

        const transList: Transaction[] = []
        const baseId = `trans_${Date.now()}`

        // 1. Lança a entrada como título quitado
        if (entryVal > 0) {
          const entryTrans: Transaction = {
            id: `${baseId}_entry`,
            description: `${data.description} (Entrada)`,
            type: data.type,
            amount: entryVal,
            dueDate: todayStr,
            entityName: data.entityName,
            isPaid: true,
            paymentMethod: data.paymentMethod || "Dinheiro",
            paymentDate: todayStr,
            category: data.category,
            notes: `Entrada de parcelamento em ${data.installmentsCount}x`,
            createdByUser: user,
            createdAt: new Date().toISOString()
          }
          transList.push(entryTrans)

          // Movimenta caixa se aberto
          if (cashSession.isOpen) {
            const mov = {
              id: `mov_auto_entry_${Date.now()}`,
              type: data.type === "REVENUE" ? ("INPUT" as const) : ("OUTPUT" as const),
              amount: entryVal,
              reason: `Entrada Parc: ${data.description}`,
              date: new Date().toISOString(),
              user
            }
            setCashSession(prev => ({ ...prev, movements: [...prev.movements, mov] }))
          }
        }

        // 2. Lança as parcelas pendentes
        for (let i = 1; i <= installmentsRemaining; i++) {
          const due = new Date(data.dueDate)
          due.setMonth(due.getMonth() + i)

          const parcTrans: Transaction = {
            id: `${baseId}_parc_${i}`,
            description: `${data.description} (Parcela ${i}/${installmentsRemaining})`,
            type: data.type,
            amount: valuePerInstallment,
            dueDate: due.toISOString().split("T")[0],
            entityName: data.entityName,
            isPaid: false,
            category: data.category,
            notes: `Parcela ${i} de ${installmentsRemaining}`,
            createdByUser: user,
            createdAt: new Date().toISOString()
          }
          transList.push(parcTrans)
        }

        setTransactions(prev => [...transList, ...prev])
      } else {
        // Registro único comum
        const newTrans: Transaction = {
          id: `trans_${Date.now()}`,
          description: data.description,
          type: data.type,
          amount: data.amount,
          discount: data.discount,
          interest: data.interest,
          fine: data.fine,
          dueDate: data.dueDate,
          entityName: data.entityName,
          isPaid: isPaidNow,
          paymentMethod: data.paymentMethod,
          paymentDate: isPaidNow ? todayStr : null,
          category: data.category,
          notes: data.notes,
          origin: data.origin,
          originId: data.originId,
          createdByUser: user,
          createdAt: new Date().toISOString()
        }

        setTransactions(prev => [newTrans, ...prev])

        // Movimenta caixa se aberto e pago na hora
        if (isPaidNow && cashSession.isOpen) {
          const mov = {
            id: `mov_auto_${Date.now()}`,
            type: data.type === "REVENUE" ? ("INPUT" as const) : ("OUTPUT" as const),
            amount: data.amount,
            reason: `Recebimento: ${data.description}`,
            date: new Date().toISOString(),
            user
          }
          setCashSession(prev => ({
            ...prev,
            movements: [...prev.movements, mov]
          }))
        } else if (isPaidNow && !cashSession.isOpen) {
          alert(`⚠️ Caixa Fechado!\nO lançamento foi registrado com status Pago/Liquidado, mas o valor de R$ ${data.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} NÃO pôde ser lançado no fluxo de caixa automático porque o caixa está fechado.\nPor favor, abra o caixa e realize o lançamento correspondente para conciliação.`)
        }
      }
    }
    setIsFormOpen(false)
  }

  // Quitação rápida (Marcar como Recebido/Pago na tabela)
  const handleLiquidateFast = (id: string, method = "PIX") => {
    if (!userPermissions.receivePayments && !userPermissions.makePayments) {
      alert("Sem permissão para efetuar/receber pagamentos!")
      return
    }

    const targetTrans = transactions.find(item => item.id === id)
    if (!targetTrans) return
    if (targetTrans.isPaid) return // Evita processamento redundante

    // Caixa automático (executado fora do map/updater de transações)
    if (cashSession.isOpen) {
      const mov = {
        id: `mov_auto_liq_${Date.now()}`,
        type: targetTrans.type === "REVENUE" ? ("INPUT" as const) : ("OUTPUT" as const),
        amount: targetTrans.amount,
        reason: `Liq. Título: ${targetTrans.description}`,
        date: new Date().toISOString(),
        user: "Adriano (Você)"
      }
      setCashSession(s => ({ ...s, movements: [...s.movements, mov] }))
    } else {
      alert(`⚠️ Caixa Fechado!\nO lançamento foi marcado como liquidado, mas o valor de R$ ${targetTrans.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} NÃO pôde ser lançado no fluxo de caixa porque o caixa está fechado.\nPor favor, abra o caixa no painel de controle acima para registrar a entrada/saída financeira.`)
    }

    setTransactions(prev =>
      prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            isPaid: true,
            paymentMethod: method,
            paymentDate: new Date().toISOString().split("T")[0],
            history: [
              ...(t.history || []),
              {
                date: new Date().toISOString(),
                user: "Adriano (Você)",
                action: "Quitação rápida realizada",
                oldValue: "PENDENTE",
                newValue: "PAGO"
              }
            ]
          }
        }
        return t
      })
    )
  }

  // Lógica de Reembolsos e Estornos (Estorno/Cancelamento total com log de auditoria)
  const handleRefund = (id: string) => {
    if (confirm("Deseja realmente estornar/reembolsar este lançamento? A operação gerará uma contrapartida de auditoria.")) {
      const targetTrans = transactions.find(item => item.id === id)
      if (!targetTrans) return

      // Se estiver pago, devolve dinheiro no caixa automático (executado fora do map/updater)
      if (targetTrans.isPaid && cashSession.isOpen) {
        const mov = {
          id: `mov_auto_ref_${Date.now()}`,
          type: targetTrans.type === "REVENUE" ? ("OUTPUT" as const) : ("INPUT" as const),
          amount: targetTrans.amount,
          reason: `Estorno/Reembolso: ${targetTrans.description}`,
          date: new Date().toISOString(),
          user: "Adriano (Você)"
        }
        setCashSession(s => ({ ...s, movements: [...s.movements, mov] }))
      }

      setTransactions(prev =>
        prev.map(t => {
          if (t.id === id) {
            return {
              ...t,
              isPaid: false,
              paymentDate: null,
              refund: {
                type: "TOTAL",
                amount: t.amount,
                date: new Date().toISOString(),
                reason: "Estorno/Cancelamento aprovado por Adriano"
              },
              history: [
                ...(t.history || []),
                {
                  date: new Date().toISOString(),
                  user: "Adriano (Você)",
                  action: "Reembolso/Estorno total efetuado"
                }
              ]
            }
          }
          return t
        })
      )
    }
  }

  const handleDelete = (id: string) => {
    if (!userPermissions.deleteTransaction) {
      alert("Você não possui permissão para deletar lançamentos financeiros!")
      return
    }

    if (confirm("Deseja realmente excluir este lançamento financeiro permanentemente?")) {
      setTransactions(prev => prev.filter(t => t.id !== id))
    }
  }

  // Criar novas formas de pagamento e categorias
  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPaymentMethod.trim()) return
    if (paymentMethods.includes(newPaymentMethod.trim())) {
      alert("Forma de pagamento já existe!")
      return
    }
    const updated = [...paymentMethods, newPaymentMethod.trim()]
    setPaymentMethods(updated)
    saveStoredPaymentMethods(updated)
    setNewPaymentMethod("")
    alert("Forma de pagamento cadastrada!")
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    if (financeCategories.includes(newCategory.trim())) {
      alert("Categoria já existe!")
      return
    }
    const updated = [...financeCategories, newCategory.trim()]
    setFinanceCategories(updated)
    saveStoredFinanceCategories(updated)
    setNewCategory("")
    alert("Categoria financeira cadastrada!")
  }

  // Exportação CSV Pura e Instantânea (client-side)
  const exportToCSV = (dataList: Transaction[], title: string) => {
    let csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Descrição,Tipo,Valor,Vencimento,Entidade,Pago,Meio Pagamento,Categoria\n"
    
    dataList.forEach(t => {
      csvContent += `"${t.id}","${t.description}","${t.type}",${t.amount},"${t.dueDate}","${t.entityName}",${t.isPaid},"${t.paymentMethod || ""}","${t.category}"\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${title.toLowerCase().replace(/ /g, "_")}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 font-medium">Carregando financeiro...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* Top Header & Simulador de Permissões */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Financeiro & Fluxo de Caixa</h2>
          <p className="text-sm text-muted-foreground">Monitore lucros, despesas, faturamento e feche o caixa do dia.</p>
        </div>
        
        {/* Simulador de Perfil */}
        <div className="flex items-center gap-2.5 bg-zinc-950/40 border border-border/80 p-2 rounded-md">
          <Key className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Perfil de Acesso:</span>
          <select
            value={activeProfile}
            onChange={e => handleProfileChange(e.target.value as any)}
            className="bg-background border border-border h-7 text-[10px] px-2 rounded font-bold uppercase text-foreground focus:outline-none"
          >
            <option value="ADMIN">Administrador (Total)</option>
            <option value="FINANCIAL">Financeiro (Operações)</option>
            <option value="TECHNICIAN">Técnico (Restrito)</option>
          </select>
        </div>
      </div>

      {/* Condicional de Permissão de Visualização */}
      {!userPermissions.viewFinancial ? (
        <Card className="border-destructive/30 bg-destructive/5 text-center p-12">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground">Acesso Negado</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1.5 leading-relaxed">
            Seu perfil atual de <strong>Técnico</strong> não possui permissões de visualização financeira global. Use o seletor acima para testar como Administrador.
          </p>
        </Card>
      ) : (
        <>
          {/* Navegação de Abas */}
          <div className="flex overflow-x-auto border-b border-border/30 gap-4 scrollbar-none">
            {([
              { id: "dashboard", label: "Painel Geral" },
              { id: "cash", label: "Controle de Caixa" },
              { id: "receivables", label: "Contas a Receber" },
              { id: "payables", label: "Contas a Pagar" },
              { id: "settings", label: "Formas & Categorias" },
              { id: "reports", label: "Relatórios & Metas" },
              { id: "audit", label: "Auditoria & Logs" }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ABA 1: Painel Geral */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* KPIs Principais */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-zinc-950/20 border-border/50">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Faturamento Mensal</p>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-base font-bold font-mono text-foreground">
                        {kpis.revMonth.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-950/20 border-border/50">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Despesas do Mês</p>
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-destructive" />
                      <span className="text-base font-bold font-mono text-foreground">
                        {kpis.expMonth.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-950/20 border-border/50">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Lucro Líquido</p>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-cyan-400" />
                      <span className="text-base font-bold font-mono text-foreground">
                        {kpis.netProfit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-950/20 border-border/50">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Ticket Médio por OS</p>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-base font-bold font-mono text-foreground">
                        {kpis.ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes Secundários do Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Gráfico Simples de Fluxo de Caixa (CSS Puro Premium) */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Balanço Anual Receitas vs Despesas</h4>
                    
                    <div className="space-y-3.5">
                      {/* Receitas */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Receitas Liquidadas (Crédito)</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {kpis.totalPaidRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (kpis.totalPaidRevenue / (kpis.totalPaidRevenue + kpis.totalPaidExpense || 1)) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Despesas */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Despesas Liquidadas (Débito)</span>
                          <span className="font-mono font-bold text-destructive">
                            {kpis.totalPaidExpense.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-destructive rounded-full" style={{ width: `${Math.min(100, (kpis.totalPaidExpense / (kpis.totalPaidRevenue + kpis.totalPaidExpense || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo de Prospecção (Contas Pendentes e OSs) */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Previsão e Títulos Pendentes</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 border border-border/40 rounded bg-card/25">
                        <p className="text-[10px] text-muted-foreground font-semibold">Contas a Receber (Em Aberto)</p>
                        <p className="text-base font-bold font-mono text-foreground mt-1">
                          {kpis.totalPendingRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                      <div className="p-3 border border-border/40 rounded bg-card/25">
                        <p className="text-[10px] text-muted-foreground font-semibold">Contas a Pagar (A Vencer)</p>
                        <p className="text-base font-bold font-mono text-foreground mt-1">
                          {kpis.totalPendingExpense.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                      <div className="col-span-2 flex items-center justify-between p-2.5 bg-zinc-950/20 rounded border border-border/20">
                        <span className="text-muted-foreground font-semibold">Ordens de Serviço Prontas/Entregues:</span>
                        <Badge variant="success" className="font-bold font-mono">{kpis.faturadasCount} OSs</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}

          {/* ABA 2: Controle de Caixa */}
          {activeTab === "cash" && (
            <div className="space-y-6">
              
              {/* Status e Ações do Caixa */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/20 border border-border p-5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${cashSession.isOpen ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}`} />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Caixa {cashSession.isOpen ? "ABERTO" : "FECHADO"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {cashSession.isOpen 
                        ? `Operador: ${cashSession.openedBy} | Abertura: ${new Date(cashSession.openedAt).toLocaleTimeString("pt-BR")}` 
                        : "Abra o caixa no início do expediente para computar movimentações."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {cashSession.isOpen ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleOpenCashDialog("REINFORCE")}>
                        Aporte / Reforço
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenCashDialog("WITHDRAW")} className="text-destructive hover:text-destructive">
                        Sangria
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleOpenCashDialog("CLOSE")}>
                        Fechar Caixa
                      </Button>
                    </>
                  ) : (
                    <Button variant="default" size="sm" onClick={() => handleOpenCashDialog("OPEN")}>
                      Abrir Caixa do Dia
                    </Button>
                  )}
                </div>
              </div>

              {/* Log de Movimentações do Caixa Atual */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/20 pb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Movimentações do Caixa Atual</h4>
                    <span className="text-xs text-muted-foreground">
                      Saldo Acumulado: <strong className="text-foreground font-mono">{getSessionBalance(cashSession).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                    </span>
                  </div>

                  {cashSession.movements.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-10 border border-dashed border-border rounded">Nenhuma movimentação no caixa ativo.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border/60 bg-muted/10">
                            <th className="py-2 px-3 font-semibold text-muted-foreground">Hora</th>
                            <th className="py-2 px-3 font-semibold text-muted-foreground">Tipo</th>
                            <th className="py-2 px-3 font-semibold text-muted-foreground">Descrição / Motivo</th>
                            <th className="py-2 px-3 font-semibold text-muted-foreground">Operador</th>
                            <th className="py-2 px-3 font-semibold text-muted-foreground text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {cashSession.movements.map(m => (
                            <tr key={m.id} className="hover:bg-muted/5 transition-colors">
                              <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">
                                {new Date(m.date).toLocaleTimeString("pt-BR")}
                              </td>
                              <td className="py-2.5 px-3">
                                {m.type === "INPUT" ? (
                                  <span className="text-emerald-400 font-bold flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> Entrada</span>
                                ) : (
                                  <span className="text-destructive font-bold flex items-center gap-1"><ArrowDownRight className="w-3.5 h-3.5" /> Saída</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-foreground font-medium">
                                {m.reason}
                                {m.observation && <span className="text-[10px] text-muted-foreground block font-normal italic">{m.observation}</span>}
                              </td>
                              <td className="py-2.5 px-3 text-muted-foreground">{m.user}</td>
                              <td className={`py-2.5 px-3 text-right font-mono font-bold ${m.type === "INPUT" ? "text-emerald-400" : "text-destructive"}`}>
                                {m.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          )}

          {/* ABA 3: Contas a Receber */}
          {activeTab === "receivables" && (
            <div className="space-y-4">
              
              {/* Filtros e Busca */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950/20 border border-border p-4 rounded-lg">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar contas a receber por descrição, cliente..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 rounded bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="h-9 px-2 rounded bg-background border border-border text-xs focus:outline-none"
                  >
                    <option value="ALL">Status (Todos)</option>
                    <option value="PAID">Recebidas</option>
                    <option value="PENDING">Pendentes</option>
                  </select>

                  <Button variant="default" size="sm" onClick={() => { setForceFormType("REVENUE"); setIsFormOpen(true); }} className="gap-1">
                    <Plus className="w-4 h-4" /> Nova Receita
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredReceivables, "Contas_a_Receber")} className="gap-1 text-xs">
                    Exportar CSV
                  </Button>
                </div>
              </div>

              {/* Tabela de Contas a Receber */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/20">
                          <th className="py-3 px-4 font-semibold text-muted-foreground">Receita / Descrição</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground">Cliente</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground font-mono text-[10px] uppercase">Vencimento</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground">Categoria</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground">Situação</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Valor</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {filteredReceivables.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-muted-foreground">Nenhuma conta a receber encontrada.</td>
                          </tr>
                        ) : (
                          filteredReceivables.map(t => (
                            <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-foreground">
                                {t.description}
                                {t.origin === "OS" && <Badge variant="outline" className="ml-2 font-mono text-[9px]">OS #{t.originId}</Badge>}
                              </td>
                              <td className="py-3.5 px-4 text-muted-foreground">{t.entityName}</td>
                              <td className="py-3.5 px-4 font-mono text-muted-foreground">
                                {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                              </td>
                              <td className="py-3.5 px-4 text-muted-foreground">
                                <Badge variant="secondary" className="text-[9px] font-bold py-0.5">{t.category}</Badge>
                              </td>
                              <td className="py-3.5 px-4">
                                <Badge variant={t.isPaid ? "success" : "destructive"} className="text-[9px] font-bold">
                                  {t.isPaid ? "Recebido" : "Pendente"}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                                {t.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-1">
                                {!t.isPaid && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] text-emerald-400 hover:text-emerald-300 px-2 border border-emerald-950"
                                    onClick={() => handleLiquidateFast(t.id)}
                                  >
                                    Receber
                                  </Button>
                                )}
                                {t.isPaid && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] text-amber-400 hover:text-amber-300 px-2 border border-amber-950/60"
                                    onClick={() => handleRefund(t.id)}
                                  >
                                    Estornar
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-zinc-400 hover:text-foreground"
                                  onClick={() => { setSelectedTransaction(t); setIsFormOpen(true); }}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-zinc-400 hover:text-destructive"
                                  onClick={() => handleDelete(t.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

          {/* ABA 4: Contas a Pagar */}
          {activeTab === "payables" && (
            <div className="space-y-4">
              
              {/* Filtros e Busca */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950/20 border border-border p-4 rounded-lg">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar contas a pagar por descrição, credor..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 rounded bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="h-9 px-2 rounded bg-background border border-border text-xs focus:outline-none"
                  >
                    <option value="ALL">Status (Todos)</option>
                    <option value="PAID">Pagas</option>
                    <option value="PENDING">Pendentes</option>
                  </select>

                  <Button variant="default" size="sm" onClick={() => { setForceFormType("EXPENSE"); setIsFormOpen(true); }} className="gap-1 bg-destructive hover:bg-destructive/80 text-white">
                    <Plus className="w-4 h-4" /> Nova Despesa
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredPayables, "Contas_a_Pagar")} className="gap-1 text-xs">
                    Exportar CSV
                  </Button>
                </div>
              </div>

              {/* Tabela de Contas a Pagar */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/20">
                          <th className="py-3 px-4 font-semibold text-muted-foreground">Despesa / Descrição</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground">Credor / Fornecedor</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground font-mono text-[10px] uppercase">Vencimento</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground">Categoria</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground">Status</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Valor</th>
                          <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {filteredPayables.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-muted-foreground">Nenhuma conta a pagar encontrada.</td>
                          </tr>
                        ) : (
                          filteredPayables.map(t => (
                            <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-foreground">{t.description}</td>
                              <td className="py-3.5 px-4 text-muted-foreground">{t.entityName}</td>
                              <td className="py-3.5 px-4 font-mono text-muted-foreground">
                                {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                              </td>
                              <td className="py-3.5 px-4 text-muted-foreground">
                                <Badge variant="secondary" className="text-[9px] font-bold py-0.5">{t.category}</Badge>
                              </td>
                              <td className="py-3.5 px-4">
                                <Badge variant={t.isPaid ? "success" : "destructive"} className="text-[9px] font-bold">
                                  {t.isPaid ? "Pago" : "A vencer"}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                                {t.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-1">
                                {!t.isPaid && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] text-emerald-400 hover:text-emerald-300 px-2 border border-emerald-950"
                                    onClick={() => handleLiquidateFast(t.id, "PIX")}
                                  >
                                    Pagar
                                  </Button>
                                )}
                                {t.isPaid && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] text-amber-400 hover:text-amber-300 px-2 border border-amber-950/60"
                                    onClick={() => handleRefund(t.id)}
                                  >
                                    Estornar
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-zinc-400 hover:text-foreground"
                                  onClick={() => { setSelectedTransaction(t); setIsFormOpen(true); }}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-zinc-400 hover:text-destructive"
                                  onClick={() => handleDelete(t.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

          {/* ABA 5: Formas de Pagamento & Categorias */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Formas de Pagamento */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">Formas de Pagamento Aceitas</h4>
                  
                  <form onSubmit={handleAddPaymentMethod} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar forma (Ex: Vale Alimentação)"
                      value={newPaymentMethod}
                      onChange={e => setNewPaymentMethod(e.target.value)}
                      className="flex-1 h-8 px-2 rounded bg-background border border-border text-xs focus:outline-none"
                    />
                    <Button type="submit" variant="default" size="sm" className="h-8">Adicionar</Button>
                  </form>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {paymentMethods.map(method => (
                      <Badge key={method} variant="secondary" className="px-3 py-1 font-bold text-foreground">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Categorias Financeiras */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">Categorias de Lançamento</h4>
                  
                  <form onSubmit={handleAddCategory} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar categoria (Ex: Marketing)"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="flex-1 h-8 px-2 rounded bg-background border border-border text-xs focus:outline-none"
                    />
                    <Button type="submit" variant="default" size="sm" className="h-8">Adicionar</Button>
                  </form>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {financeCategories.map(cat => (
                      <Badge key={cat} variant="secondary" className="px-3 py-1 font-bold text-foreground">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          )}

          {/* ABA 6: Relatórios Financeiros */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              
              {/* Filtros Rápidos de Relatório */}
              <div className="bg-zinc-950/20 border border-border p-4 rounded-lg flex flex-wrap gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground font-semibold">Data Inicial</label>
                  <input type="date" value={dateFilterStart} onChange={e => setDateFilterStart(e.target.value)} className="h-8 px-2 rounded bg-background border border-border focus:outline-none text-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground font-semibold">Data Final</label>
                  <input type="date" value={dateFilterEnd} onChange={e => setDateFilterEnd(e.target.value)} className="h-8 px-2 rounded bg-background border border-border focus:outline-none text-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-muted-foreground font-semibold">Categoria</label>
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-8 px-2 rounded bg-background border border-border focus:outline-none text-foreground">
                    <option value="ALL">Todas</option>
                    {financeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="sm" onClick={() => { setDateFilterStart(""); setDateFilterEnd(""); setCategoryFilter("ALL"); }} className="h-8 text-xs">Limpar Filtros</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Categorias mais lucrativas */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">Resultados por Categoria</h4>
                    
                    <div className="space-y-3">
                      {financeCategories.map(cat => {
                        const total = transactions
                          .filter(t => t.category === cat && t.isPaid)
                          .reduce((acc, t) => acc + (t.type === "REVENUE" ? t.amount : -t.amount), 0)
                        
                        return (
                          <div key={cat} className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-foreground">{cat}</span>
                            <span className={`font-mono font-bold ${total >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                              {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Métricas de Meta / OS */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">Estatísticas de Produtividade OS</h4>
                    
                    <div className="space-y-3.5 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Total Faturado por OS:</span>
                        <strong className="text-foreground font-mono">{kpis.grossProfit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantidade OS Faturadas:</span>
                        <strong className="text-foreground font-mono">{kpis.faturadasCount} OSs</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantidade OS Pendentes de Faturamento:</span>
                        <strong className="text-foreground font-mono">{kpis.pendentesCount} OSs</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Ticket Médio Geral:</span>
                        <strong className="text-foreground font-mono">{kpis.ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

            </div>
          )}

          {/* ABA 7: Auditoria & Logs */}
          {activeTab === "audit" && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">Logs de Auditoria do Fluxo de Caixa</h4>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pl-4 border-l border-border/40 ml-2">
                  {transactions.filter(t => t.history && t.history.length > 0).length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-6">Nenhuma alteração registrada em auditoria.</p>
                  ) : (
                    transactions.map(t => {
                      if (!t.history || t.history.length === 0) return null
                      return (
                        <div key={t.id} className="space-y-2">
                          <p className="text-xs font-bold text-foreground">{t.description}</p>
                          <div className="pl-4 space-y-2 border-l border-zinc-800">
                            {t.history.map((log, idx) => (
                              <div key={idx} className="text-[10px] text-muted-foreground leading-normal">
                                <span className="font-semibold text-foreground">{log.action}</span> por <strong className="text-foreground">{log.user}</strong> em <span className="font-mono">{new Date(log.date).toLocaleString("pt-BR")}</span>
                                {log.oldValue && (
                                  <p className="font-mono text-[9px] text-muted-foreground mt-0.5">
                                    De: <span className="text-destructive line-through">{log.oldValue}</span> | Para: <span className="text-emerald-400 font-bold">{log.newValue}</span>
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal Lançamento */}
      <TransactionDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTransaction}
        transaction={selectedTransaction}
        type={forceFormType}
      />

      {/* Caixa Ações Dialog */}
      {isCashDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCashDialogOpen(false)} />
          
          <div className="relative w-full max-w-sm bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">
              {cashActionType === "OPEN" && "Abertura de Caixa"}
              {cashActionType === "CLOSE" && "Fechamento de Caixa"}
              {cashActionType === "REINFORCE" && "Reforço / Aporte de Caixa"}
              {cashActionType === "WITHDRAW" && "Sangria / Retirada de Caixa"}
            </h3>

            <form onSubmit={handleCashAction} className="space-y-4 text-xs">
              {cashActionType !== "CLOSE" && (
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={cashAmountInput || ""}
                    onChange={e => setCashAmountInput(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded bg-background border border-border text-foreground focus:outline-none"
                  />
                </div>
              )}

              {(cashActionType === "REINFORCE" || cashActionType === "WITHDRAW") && (
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Motivo / Descrição</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Troco inicial, retirada para banco"
                    value={cashReasonInput}
                    onChange={e => setCashReasonInput(e.target.value)}
                    className="w-full h-8 px-2 rounded bg-background border border-border text-foreground focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Observações</label>
                <textarea
                  placeholder="Anotações para a conferência do caixa..."
                  value={cashObsInput}
                  onChange={e => setCashObsInput(e.target.value)}
                  className="w-full h-16 p-2 rounded bg-background border border-border text-foreground focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCashDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="default" size="sm">Confirmar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
