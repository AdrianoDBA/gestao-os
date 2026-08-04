"use client"

import React, { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { 
  Printer, 
  ArrowLeft, 
  CheckSquare, 
  ShieldAlert, 
  FileText, 
  Wrench 
} from "lucide-react"
import { getStoredOrders, getStoredCustomers, getStoredDevices } from "@/lib/db-store"

// Mock de busca de OS por ID (dados reais para os layouts de impressão)
const mockOSData = {
  id: "os1",
  number: 1042,
  customerName: "João Pedro Santos",
  customerDoc: "123.456.789-00",
  customerPhone: "(11) 98765-4321",
  customerEmail: "joao.pedro@email.com",
  customerAddress: "Av. Paulista, 1000 - Bela Vista - São Paulo/SP",
  deviceBrand: "Samsung",
  deviceModel: "Galaxy S23 Ultra",
  deviceSerial: "9876543210123",
  deviceImei: "351234567890123",
  devicePassword: "Padrão desenhado em L",
  deviceColor: "Verde Escuro",
  physicalState: "Aparelho bem conservado, película com trinco discreto",
  accessories: "Carregador Samsung original e capa preta",
  reportedDefect: "Aparelho desliga sozinho após 10 minutos de uso em jogos",
  technicalReport: "Conector USB-C com pinos rompidos e muita oxidação interna na subplaca.",
  solutionProposed: "Troca da subplaca de carga e desoxidação química dos componentes periféricos.",
  laborAmount: 450.00,
  partsAmount: 200.00,
  totalAmount: 650.00,
  notes: "Serviço testado e aprovado em bancada de testes de stress.",
  entryDate: "25/07/2026",
  exitDate: "28/07/2026",
  warrantyTerm: 90,
  warrantyConditions: "Garantia cobrindo defeito no conector substituído sob condições de uso normais. Exclui-se quebra física ou danos por líquidos pós-entrega."
}

export default function PrintPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const type = params.type as string
  const id = params.id as string
  const autoPrint = searchParams.get("auto") === "true"

  const [data, setData] = useState(mockOSData)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orders = getStoredOrders()
      const customers = getStoredCustomers()
      const devices = getStoredDevices()
      
      const foundOS = orders.find((o: any) => o.id === id || o.number.toString() === id)
      if (foundOS) {
        const customer = customers.find((c: any) => c.id === foundOS.customerId)
        const device = devices.find((d: any) => d.id === foundOS.deviceId)

        setData({
          id: foundOS.id,
          number: foundOS.number,
          customerName: customer?.name || foundOS.customer?.name || "Sem nome",
          customerDoc: customer?.document || "Não informado",
          customerPhone: customer?.phone || "(00) 00000-0000",
          customerEmail: customer?.email || "cliente@email.com",
          customerAddress: customer?.cep ? `${customer.address}, ${customer.addressNumber || ""} - ${customer.bairro || ""} - ${customer.city || ""}/${customer.state || ""}` : "Endereço não cadastrado",
          deviceBrand: device?.brandName || foundOS.device?.brandName || "Sem marca",
          deviceModel: device?.modelName || foundOS.device?.modelName || "Sem modelo",
          deviceSerial: device?.serialNumber || foundOS.device?.serialNumber || "Sem serial",
          deviceImei: device?.imei || "Não cadastrado",
          devicePassword: device?.password || "Não informada",
          deviceColor: device?.color || "Não especificada",
          physicalState: device?.physicalState || "Sem observações do estado físico",
          accessories: foundOS.accessories || "Nenhum",
          reportedDefect: foundOS.reportedDefect,
          technicalReport: foundOS.diagnostics?.[0]?.technicalReport || "Nenhum laudo registrado ainda.",
          solutionProposed: foundOS.diagnostics?.[0]?.solutionProposed || "Reparo geral em bancada.",
          laborAmount: foundOS.laborAmount || 0,
          partsAmount: foundOS.partsAmount || 0,
          totalAmount: foundOS.totalAmount || 0,
          notes: foundOS.notes || "Nenhuma observação extra.",
          entryDate: foundOS.entryDate ? new Date(foundOS.entryDate).toLocaleDateString("pt-BR") : "Data não registrada",
          exitDate: foundOS.exitDate ? new Date(foundOS.exitDate).toLocaleDateString("pt-BR") : null,
          warrantyTerm: foundOS.warranties?.[0]?.termDays || 90,
          warrantyConditions: foundOS.warranties?.[0]?.conditions || "Garantia legal de 90 dias sobre as peças e serviços executados."
        })
      }
    }
  }, [id])

  useEffect(() => {
    if (autoPrint) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [autoPrint])

  const handlePrint = () => {
    window.print()
  }

  // Estilos globais específicos de impressão injetados via styled JSX ou tag style
  const printStyles = `
    @media print {
      body {
        background: white !important;
        color: black !important;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
      @page {
        margin: 15mm;
        size: A4 portrait;
      }
    }
  `

  const renderHeader = (title: string) => (
    <div className="flex justify-between items-start border-b border-zinc-300 pb-4 mb-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <Wrench className="w-5 h-5 text-zinc-800" />
          TECH ASSIST LTDA
        </h1>
        <p className="text-xs text-zinc-500 font-mono">CNPJ: 12.345.678/0001-90 | IE: 123.456.789.110</p>
        <p className="text-xs text-zinc-500">Rua da Manutenção, 500 - Laboratório - São Paulo/SP</p>
        <p className="text-xs text-zinc-500">Contato: (11) 5555-4321 | suporte@techassist.com.br</p>
      </div>
      <div className="text-right space-y-1 font-mono">
        <h2 className="text-sm font-bold text-zinc-800 bg-zinc-100 px-3 py-1 rounded inline-block">
          {title}
        </h2>
        <p className="text-[10px] text-zinc-500 block mt-2">OS: <span className="font-semibold text-zinc-800">#{data.number}</span></p>
        <p className="text-[10px] text-zinc-500 block">Entrada: {data.entryDate}</p>
      </div>
    </div>
  )

  const renderFooterSignatures = () => (
    <div className="grid grid-cols-2 gap-8 pt-12 mt-12 border-t border-zinc-200 text-center text-xs">
      <div className="space-y-1 pt-6 border-t border-zinc-300">
        <p className="font-semibold text-zinc-800">TECH ASSIST</p>
        <p className="text-[10px] text-zinc-500">Assinatura do Técnico Responsável</p>
      </div>
      <div className="space-y-1 pt-6 border-t border-zinc-300">
        <p className="font-semibold text-zinc-800">{data.customerName}</p>
        <p className="text-[10px] text-zinc-500">Assinatura do Cliente Proprietário</p>
      </div>
    </div>
  )

  // 1. FICHA DE ENTRADA (Check-in)
  if (type === "entry") {
    return (
      <div className="min-h-screen bg-white text-zinc-800 p-8 max-w-3xl mx-auto font-sans leading-relaxed">
        <style>{printStyles}</style>

        {/* Toolbar de Controle (Escondido na Impressão) */}
        <div className="no-print flex items-center justify-between bg-zinc-100 border border-zinc-200 p-4 rounded-lg mb-8 text-xs">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Sistema
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors px-4 py-2 rounded">
            <Printer className="w-4 h-4" /> Imprimir Ficha
          </button>
        </div>

        {renderHeader("FICHA DE ENTRADA")}

        {/* Dados do Cliente */}
        <div className="space-y-2 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 pb-1">1. DADOS DO CLIENTE</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p><span className="font-semibold">Nome:</span> {data.customerName}</p>
            <p><span className="font-semibold">CPF/CNPJ:</span> {data.customerDoc}</p>
            <p><span className="font-semibold">Telefone:</span> {data.customerPhone}</p>
            <p><span className="font-semibold">E-mail:</span> {data.customerEmail}</p>
            <p className="col-span-2"><span className="font-semibold">Endereço:</span> {data.customerAddress}</p>
          </div>
        </div>

        {/* Dados do Equipamento */}
        <div className="space-y-2 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 pb-1">2. DETALHES DO EQUIPAMENTO</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p><span className="font-semibold">Aparelho:</span> {data.deviceBrand} {data.deviceModel}</p>
            <p><span className="font-semibold">Cor:</span> {data.deviceColor}</p>
            <p><span className="font-semibold">Número de Série:</span> {data.deviceSerial}</p>
            <p><span className="font-semibold">IMEI (se aplicável):</span> {data.deviceImei || "Não se aplica"}</p>
            <p className="col-span-2"><span className="font-semibold">Senha / Padrão:</span> {data.devicePassword || "Sem senha cadastrada"}</p>
            <p className="col-span-2"><span className="font-semibold">Acessórios Deixados:</span> {data.accessories || "Nenhum acessório"}</p>
          </div>
        </div>

        {/* Defeito e Estado Físico */}
        <div className="space-y-2 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 pb-1">3. DEFEITO RELATADO & ESTADO DE RECEBIMENTO</h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded">
              <p className="font-semibold mb-1">Defeito Informado pelo Cliente:</p>
              <p className="text-zinc-600 font-mono">{data.reportedDefect}</p>
            </div>
            <p><span className="font-semibold">Estado Estético do Aparelho (Check-in):</span> {data.physicalState}</p>
          </div>
        </div>

        {/* Termos de Aceite */}
        <div className="space-y-2 mb-6 text-[10px] text-zinc-500 leading-snug">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 pb-1">4. TERMOS E CONDIÇÕES DE ACEITE</h3>
          <p>1. O cliente declara estar ciente de que a Tech Assist não se responsabiliza por eventuais perdas de dados, mídias ou arquivos contidos no equipamento, sendo de exclusiva responsabilidade do proprietário a realização prévia de backup.</p>
          <p>2. Os aparelhos não retirados no prazo de 90 dias a contar da data de conclusão do reparo ou rejeição do orçamento estarão sujeitos a cobrança de taxa de armazenamento ou descarte legal conforme legislação vigente.</p>
        </div>

        {renderFooterSignatures()}
      </div>
    )
  }

  // 2. ORÇAMENTO TÉCNICO (Budget)
  if (type === "budget") {
    return (
      <div className="min-h-screen bg-white text-zinc-800 p-8 max-w-3xl mx-auto font-sans leading-relaxed">
        <style>{printStyles}</style>

        <div className="no-print flex items-center justify-between bg-zinc-100 border border-zinc-200 p-4 rounded-lg mb-8 text-xs">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Sistema
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors px-4 py-2 rounded">
            <Printer className="w-4 h-4" /> Imprimir Orçamento
          </button>
        </div>

        {renderHeader("ORÇAMENTO TÉCNICO")}

        {/* Dados do Cliente e Aparelho */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 border border-zinc-200 p-4 rounded mb-6">
          <div>
            <p className="font-semibold text-zinc-700 uppercase text-[9px] tracking-wider mb-1">Cliente Pagador</p>
            <p className="font-bold">{data.customerName}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{data.customerPhone} | {data.customerEmail}</p>
          </div>
          <div>
            <p className="font-semibold text-zinc-700 uppercase text-[9px] tracking-wider mb-1">Aparelho sob Reparo</p>
            <p className="font-bold">{data.deviceBrand} {data.deviceModel}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">S/N: {data.deviceSerial}</p>
          </div>
        </div>

        {/* Defeito e Diagnóstico */}
        <div className="space-y-3 mb-6 text-xs">
          <div>
            <p className="font-semibold text-zinc-500 uppercase text-[10px] mb-1">Laudo / Diagnóstico Técnico:</p>
            <p className="bg-zinc-50 border border-zinc-200 p-3 rounded text-zinc-700 leading-normal">{data.technicalReport}</p>
          </div>
          <div>
            <p className="font-semibold text-zinc-500 uppercase text-[10px] mb-1">Solução Proposta:</p>
            <p className="bg-zinc-50 border border-zinc-200 p-3 rounded text-zinc-700 leading-normal">{data.solutionProposed}</p>
          </div>
        </div>

        {/* Detalhamento Financeiro */}
        <div className="space-y-2 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 pb-1">DEMONSTRATIVO DE VALORES</h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-300 bg-zinc-50 font-bold">
                <th className="py-2 px-3">Item / Serviço Executado</th>
                <th className="py-2 px-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr>
                <td className="py-2 px-3">Mão de Obra de Reparo Técnico Avançado</td>
                <td className="py-2 px-3 text-right font-mono">
                  {data.laborAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3">Subplaca de Carga USB-C S23 Ultra (Reposição de Peça)</td>
                <td className="py-2 px-3 text-right font-mono">
                  {data.partsAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
              <tr className="font-bold border-t border-zinc-300 text-sm bg-zinc-100/50">
                <td className="py-3 px-3">Valor Total do Orçamento</td>
                <td className="py-3 px-3 text-right font-mono">
                  {data.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Validade do Orçamento */}
        <p className="text-[10px] text-zinc-500 italic mt-4 text-center">Este orçamento é válido por 10 dias a contar da data de emissão.</p>

        {renderFooterSignatures()}
      </div>
    )
  }

  // 3. TERMO DE GARANTIA (Warranty)
  if (type === "warranty") {
    return (
      <div className="min-h-screen bg-white text-zinc-800 p-8 max-w-3xl mx-auto font-sans leading-relaxed">
        <style>{printStyles}</style>

        <div className="no-print flex items-center justify-between bg-zinc-100 border border-zinc-200 p-4 rounded-lg mb-8 text-xs">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Sistema
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors px-4 py-2 rounded">
            <Printer className="w-4 h-4" /> Imprimir Garantia
          </button>
        </div>

        {renderHeader("CERTIFICADO DE GARANTIA")}

        {/* Dados Básicos */}
        <div className="grid grid-cols-2 gap-4 text-xs border border-zinc-200 p-4 rounded mb-6">
          <div>
            <p className="font-semibold text-zinc-500 uppercase text-[9px] mb-1">Aparelho</p>
            <p className="font-bold text-zinc-900">{data.deviceBrand} {data.deviceModel}</p>
            <p className="text-zinc-500 font-mono mt-0.5">S/N: {data.deviceSerial}</p>
          </div>
          <div>
            <p className="font-semibold text-zinc-500 uppercase text-[9px] mb-1">Vigência de Garantia</p>
            <p className="font-bold text-emerald-600">{data.warrantyTerm} DIAS</p>
            <p className="text-zinc-500 mt-0.5">Início: {data.exitDate} | Fim: 26/10/2026</p>
          </div>
        </div>

        {/* Condições da Garantia */}
        <div className="space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-zinc-800 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-zinc-700" />
              CONDIÇÕES GERAIS DE COBERTURA
            </h4>
            <p className="text-zinc-600 leading-relaxed bg-zinc-50 border border-zinc-200 p-4 rounded">
              {data.warrantyConditions}
            </p>
          </div>
          <div className="space-y-1 text-[10px] text-zinc-500">
            <p>1. A garantia cobre exclusivamente peças substituídas e defeitos de funcionamento relacionados ao serviço executado descritos na OS.</p>
            <p>2. A violação do selo de garantia/lacre técnico aplicado na carcaça interna do aparelho invalida imediatamente este termo.</p>
            <p>3. Danos causados por quedas, oxidação secundária, sobretensão elétrica na recarga ou softwares corrompidos não são cobertos.</p>
          </div>
        </div>

        {renderFooterSignatures()}
      </div>
    )
  }

  // 4. RECIBO DE QUITAÇÃO (Receipt)
  if (type === "receipt") {
    return (
      <div className="min-h-screen bg-white text-zinc-800 p-8 max-w-3xl mx-auto font-sans leading-relaxed">
        <style>{printStyles}</style>

        <div className="no-print flex items-center justify-between bg-zinc-100 border border-zinc-200 p-4 rounded-lg mb-8 text-xs">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Sistema
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors px-4 py-2 rounded">
            <Printer className="w-4 h-4" /> Imprimir Recibo
          </button>
        </div>

        {renderHeader("RECIBO DE QUITAÇÃO")}

        {/* Texto do Recibo */}
        <div className="border border-zinc-200 p-6 rounded bg-zinc-50/50 space-y-4 text-sm leading-relaxed mb-6">
          <p>
            Declaramos para os devidos fins que recebemos de <span className="font-bold text-zinc-900">{data.customerName}</span>, 
            portador do CPF/CNPJ <span className="font-semibold text-zinc-900">{data.customerDoc}</span>, a importância de{" "}
            <span className="font-bold text-zinc-900 font-mono">
              {data.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>{" "}
            referente à quitação integral dos serviços prestados na Ordem de Serviço de manutenção número{" "}
            <span className="font-bold text-zinc-900">#{data.number}</span>, contendo o aparelho{" "}
            <span className="font-semibold text-zinc-900">{data.deviceBrand} {data.deviceModel} (S/N: {data.deviceSerial})</span>.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs border-t border-zinc-200 pt-4 font-mono text-zinc-600">
            <p>Método de Pagamento: PIX</p>
            <p className="text-right">Liquidação em: {data.exitDate}</p>
          </div>
        </div>

        {renderFooterSignatures()}
      </div>
    )
  }

  // 5. LAUDO TÉCNICO (Report)
  if (type === "report") {
    return (
      <div className="min-h-screen bg-white text-zinc-800 p-8 max-w-3xl mx-auto font-sans leading-relaxed">
        <style>{printStyles}</style>

        <div className="no-print flex items-center justify-between bg-zinc-100 border border-zinc-200 p-4 rounded-lg mb-8 text-xs">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Sistema
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors px-4 py-2 rounded">
            <Printer className="w-4 h-4" /> Imprimir Laudo
          </button>
        </div>

        {renderHeader("LAUDO TÉCNICO TÉCNICO")}

        {/* Ficha Técnica */}
        <div className="grid grid-cols-2 gap-4 text-xs border border-zinc-200 p-4 rounded mb-6 bg-zinc-50">
          <div>
            <p className="font-semibold text-zinc-500 uppercase text-[9px] mb-1">Aparelho Avaliado</p>
            <p className="font-bold text-zinc-900">{data.deviceBrand} {data.deviceModel}</p>
            <p className="text-zinc-500 font-mono mt-0.5">S/N: {data.deviceSerial}</p>
          </div>
          <div>
            <p className="font-semibold text-zinc-500 uppercase text-[9px] mb-1">Responsável Técnico</p>
            <p className="font-bold text-zinc-900">Claudio Técnico</p>
            <p className="text-zinc-500 mt-0.5">Registro CREA/Laboratório: #3210-SP</p>
          </div>
        </div>

        {/* Relatório Técnico */}
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-zinc-800 uppercase text-[10px] tracking-wider">Parecer do Laudo e Constatações:</h4>
            <p className="text-zinc-700 bg-zinc-50/50 border border-zinc-200 p-4 rounded leading-relaxed">
              O aparelho deu entrada na assistência apresentando desligamento abrupto durante processamento pesado. 
              Após testes em bancada, identificou-se curto e oxidação severa no conector USB-C e trilhas da subplaca de carga. 
              {data.technicalReport}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-zinc-800 uppercase text-[10px] tracking-wider">Solução Aplicada:</h4>
            <p className="text-zinc-700 bg-zinc-50/50 border border-zinc-200 p-4 rounded leading-relaxed">
              Substituição completa do componente flex de carga USB-C, limpeza e banho químico desoxidante em cuba ultrassônica nos circuitos integrados periféricos. 
              {data.solutionProposed}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-zinc-800 uppercase text-[10px] tracking-wider">Testes Finais de Qualidade (Pós-Reparo):</h4>
            <div className="grid grid-cols-3 gap-2 p-3 border border-zinc-200 rounded bg-zinc-50/50 font-mono text-[10px]">
              <p>✔ Carga Rápida USB: OK (9V/2A)</p>
              <p>✔ Teste de stress CPU: OK</p>
              <p>✔ Wi-Fi & Antenas: OK</p>
              <p>✔ Tela Touch: OK</p>
              <p>✔ Câmeras Frontal/Traseira: OK</p>
              <p>✔ Alto-falante & Microfone: OK</p>
            </div>
          </div>
        </div>

        {renderFooterSignatures()}
      </div>
    )
  }

  // 6. ETIQUETA TÉRMICA DE BANCADA (Label - 80mm ou 58mm)
  if (type === "label") {
    // Estilos especiais de etiqueta térmica para sobrescrever margens de página A4
    const labelPrintStyles = `
      @media print {
        body {
          background: white !important;
          color: black !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .no-print {
          display: none !important;
        }
        @page {
          size: 80mm 50mm;
          margin: 2mm;
        }
      }
    `
    return (
      <div className="bg-white text-black p-4 max-w-[80mm] border border-zinc-300 font-sans tracking-tight text-xs leading-tight mx-auto rounded shadow">
        <style>{labelPrintStyles}</style>

        {/* Toolbar no-print */}
        <div className="no-print bg-zinc-100 border border-zinc-200 p-2 rounded mb-4 text-[10px] flex items-center justify-between">
          <button onClick={() => router.back()} className="font-semibold text-zinc-600">Voltar</button>
          <button onClick={handlePrint} className="font-semibold bg-zinc-900 text-white px-2 py-1 rounded">Imprimir</button>
        </div>

        {/* Layout da Etiqueta Térmica de Aparelho */}
        <div className="space-y-1.5 text-center">
          <div className="border-b border-black pb-1">
            <h1 className="font-bold text-sm tracking-wider">TECH ASSIST OS</h1>
            <h2 className="font-extrabold text-base font-mono">#{data.number}</h2>
          </div>
          
          <div className="text-left text-[11px] space-y-0.5">
            <p><span className="font-bold">Cliente:</span> {data.customerName}</p>
            <p><span className="font-bold">Fone:</span> {data.customerPhone}</p>
            <p><span className="font-bold">Aparelho:</span> {data.deviceBrand} {data.deviceModel}</p>
            <p className="font-mono text-[9px] truncate"><span className="font-bold">Serial:</span> {data.deviceSerial}</p>
          </div>

          {/* Código de barras simples representativo */}
          <div className="pt-1 flex flex-col items-center">
            <div className="w-full h-8 bg-zinc-900 flex items-center justify-center font-bold text-white text-[9px] font-mono select-none tracking-widest">
              ||||| | |||| || ||| ||
            </div>
            <span className="text-[8px] font-mono block mt-0.5">{data.deviceSerial}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 text-center text-xs text-muted-foreground">
      Documento indisponível.
    </div>
  )
}
