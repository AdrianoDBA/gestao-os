"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  cleanNonDigits, 
  formatDocument, 
  formatPhone, 
  validateDocument, 
  validateEmail 
} from "@/lib/validation"
import { X, MapPin, Search } from "lucide-react"

export interface CustomerData {
  id?: string
  name: string
  document: string
  documentType: "PF" | "PJ"
  birthDate?: string
  phone: string
  whatsapp: string
  whatsappSameAsPhone: boolean
  email: string
  cep?: string
  address: string
  addressNumber?: string
  complement?: string
  bairro?: string
  city?: string
  state?: string
  notes?: string
  isActive: boolean
}

interface CustomerDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CustomerData) => void
  customer?: CustomerData | null
}

export function CustomerDialog({ isOpen, onClose, onSave, customer }: CustomerDialogProps) {
  const [name, setName] = useState("")
  const [documentType, setDocumentType] = useState<"PF" | "PJ">("PF")
  const [document, setDocument] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [isWhatsappSame, setIsWhatsappSame] = useState(true)
  const [email, setEmail] = useState("")
  
  // Endereço
  const [cep, setCep] = useState("")
  const [address, setAddress] = useState("")
  const [addressNumber, setAddressNumber] = useState("")
  const [complement, setComplement] = useState("")
  const [bairro, setBairro] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [notes, setNotes] = useState("")
  const [isActive, setIsActive] = useState(true)

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [cepLoading, setCepLoading] = useState(false)

  // Preenche dados ao editar
  useEffect(() => {
    if (customer) {
      setName(customer.name)
      setDocumentType(customer.documentType || "PF")
      setDocument(formatDocument(customer.document))
      setBirthDate(customer.birthDate || "")
      setPhone(formatPhone(customer.phone))
      setWhatsapp(formatPhone(customer.whatsapp))
      setIsWhatsappSame(customer.whatsappSameAsPhone ?? true)
      setEmail(customer.email || "")
      setCep(customer.cep || "")
      setAddress(customer.address || "")
      setAddressNumber(customer.addressNumber || "")
      setComplement(customer.complement || "")
      setBairro(customer.bairro || "")
      setCity(customer.city || "")
      setState(customer.state || "")
      setNotes(customer.notes || "")
      setIsActive(customer.isActive ?? true)
    } else {
      setName("")
      setDocumentType("PF")
      setDocument("")
      setBirthDate("")
      setPhone("")
      setWhatsapp("")
      setIsWhatsappSame(true)
      setEmail("")
      setCep("")
      setAddress("")
      setAddressNumber("")
      setComplement("")
      setBairro("")
      setCity("")
      setState("")
      setNotes("")
      setIsActive(true)
    }
    setErrors({})
  }, [customer, isOpen])

  if (!isOpen) return null

  // Sincroniza WhatsApp se selecionado
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    if (isWhatsappSame) {
      setWhatsapp(formatted)
    }
    if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }))
  }

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatPhone(e.target.value))
    if (errors.whatsapp) setErrors(prev => ({ ...prev, whatsapp: "" }))
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocument(formatDocument(e.target.value))
    if (errors.document) setErrors(prev => ({ ...prev, document: "" }))
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Máscara 00000-000
    let value = cleanNonDigits(e.target.value).slice(0, 8)
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5)}`
    }
    setCep(value)
  }

  // Busca rápida de CEP simulada
  const fetchAddressByCep = () => {
    const cleaned = cleanNonDigits(cep)
    if (cleaned.length !== 8) {
      setErrors(prev => ({ ...prev, cep: "CEP deve possuir 8 dígitos" }))
      return
    }
    setCepLoading(true)
    setErrors(prev => ({ ...prev, cep: "" }))

    setTimeout(() => {
      setCepLoading(false)
      // Mocks rápidos de CEP para agilidade do usuário
      if (cleaned.startsWith("013")) {
        setAddress("Avenida Paulista")
        setBairro("Cerqueira César")
        setCity("São Paulo")
        setState("SP")
      } else if (cleaned.startsWith("220")) {
        setAddress("Rua Copacabana")
        setBairro("Copacabana")
        setCity("Rio de Janeiro")
        setState("RJ")
      } else if (cleaned.startsWith("301")) {
        setAddress("Avenida Contorno")
        setBairro("Savassi")
        setCity("Belo Horizonte")
        setState("MG")
      } else {
        setAddress("Rua Principal")
        setBairro("Centro")
        setCity("São Paulo")
        setState("SP")
      }
    }, 600)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}

    if (!name.trim()) newErrors.name = "Nome é obrigatório"
    
    const docCleaned = cleanNonDigits(document)
    if (!docCleaned) {
      newErrors.document = "Documento é obrigatório"
    } else if (!validateDocument(docCleaned)) {
      newErrors.document = documentType === "PF" ? "CPF inválido" : "CNPJ inválido"
    }

    const phoneCleaned = cleanNonDigits(phone)
    if (!phoneCleaned) {
      newErrors.phone = "Telefone é obrigatório"
    } else if (phoneCleaned.length < 10) {
      newErrors.phone = "Número incompleto"
    }

    const whatsappCleaned = cleanNonDigits(isWhatsappSame ? phone : whatsapp)
    if (!isWhatsappSame && !whatsappCleaned) {
      newErrors.whatsapp = "WhatsApp é obrigatório"
    }

    if (email && !validateEmail(email)) {
      newErrors.email = "E-mail inválido"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      id: customer?.id,
      name,
      document: docCleaned,
      documentType,
      birthDate: birthDate || undefined,
      phone: phoneCleaned,
      whatsapp: isWhatsappSame ? phoneCleaned : whatsappCleaned,
      whatsappSameAsPhone: isWhatsappSame,
      email,
      cep: cep || undefined,
      address,
      addressNumber: addressNumber || undefined,
      complement: complement || undefined,
      bairro: bairro || undefined,
      city: city || undefined,
      state: state || undefined,
      notes: notes || undefined,
      isActive
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h3 className="text-sm font-bold text-foreground">
            {customer ? "Editar Dados do Cliente" : "Cadastrar Novo Cliente"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Seção 1: Identificação */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border/20 pb-1">Identificação Pessoal</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tipo de Pessoa</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDocumentType("PF")
                      setDocument("")
                    }}
                    className={`flex-1 h-8 rounded border text-xs font-semibold transition-colors ${
                      documentType === "PF"
                        ? "bg-zinc-900 border-zinc-700 text-foreground"
                        : "bg-transparent border-border text-muted-foreground hover:bg-muted/10"
                    }`}
                  >
                    Física (CPF)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDocumentType("PJ")
                      setDocument("")
                    }}
                    className={`flex-1 h-8 rounded border text-xs font-semibold transition-colors ${
                      documentType === "PJ"
                        ? "bg-zinc-900 border-zinc-700 text-foreground"
                        : "bg-transparent border-border text-muted-foreground hover:bg-muted/10"
                    }`}
                  >
                    Jurídica (CNPJ)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Data de Nascimento (Opcional)</label>
                <input
                  type="date"
                  className="w-full h-8 px-3 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nome Completo / Razão Social</label>
                <input
                  type="text"
                  className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                    errors.name ? "border-destructive/60" : "border-border"
                  }`}
                  placeholder="Ex: João Pedro Santos"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (errors.name) setErrors(prev => ({ ...prev, name: "" }))
                  }}
                />
                {errors.name && <p className="text-[9px] text-destructive font-medium">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{documentType === "PF" ? "CPF" : "CNPJ"}</label>
                <input
                  type="text"
                  className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                    errors.document ? "border-destructive/60" : "border-border"
                  }`}
                  placeholder={documentType === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
                  value={document}
                  onChange={handleDocumentChange}
                />
                {errors.document && <p className="text-[9px] text-destructive font-medium">{errors.document}</p>}
              </div>
            </div>
          </div>

          {/* Seção 2: Contato */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border/20 pb-1">Canais de Contato</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Telefone Principal</label>
                <input
                  type="text"
                  className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                    errors.phone ? "border-destructive/60" : "border-border"
                  }`}
                  placeholder="(00) 90000-0000"
                  value={phone}
                  onChange={handlePhoneChange}
                />
                {errors.phone && <p className="text-[9px] text-destructive font-medium">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">WhatsApp</label>
                <input
                  type="text"
                  disabled={isWhatsappSame}
                  className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 ${
                    errors.whatsapp ? "border-destructive/60" : "border-border"
                  }`}
                  placeholder="(00) 90000-0000"
                  value={isWhatsappSame ? phone : whatsapp}
                  onChange={handleWhatsappChange}
                />
                {errors.whatsapp && <p className="text-[9px] text-destructive font-medium">{errors.whatsapp}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="whatsappSame"
                className="rounded bg-background border border-border text-primary focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                checked={isWhatsappSame}
                onChange={e => {
                  setIsWhatsappSame(e.target.checked)
                  if (e.target.checked) {
                    setWhatsapp(phone)
                  }
                }}
              />
              <label htmlFor="whatsappSame" className="text-xs text-muted-foreground select-none cursor-pointer">
                WhatsApp é o mesmo número do telefone principal
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">E-mail</label>
              <input
                type="text"
                className={`w-full h-8 px-3 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                  errors.email ? "border-destructive/60" : "border-border"
                }`}
                placeholder="cliente@provedor.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors(prev => ({ ...prev, email: "" }))
                }}
              />
              {errors.email && <p className="text-[9px] text-destructive font-medium">{errors.email}</p>}
            </div>
          </div>

          {/* Seção 3: Localidade */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border/20 pb-1">Endereço Residencial / Comercial</h4>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">CEP</label>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full h-8 pl-3 pr-8 rounded bg-background border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                      errors.cep ? "border-destructive/60" : "border-border"
                    }`}
                    placeholder="00000-000"
                    value={cep}
                    onChange={handleCepChange}
                  />
                  <button
                    type="button"
                    onClick={fetchAddressByCep}
                    disabled={cepLoading}
                    className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <Search className={`w-3.5 h-3.5 ${cepLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
                {errors.cep && <p className="text-[9px] text-destructive font-medium">{errors.cep}</p>}
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Logradouro / Avenida</label>
                <input
                  type="text"
                  className="w-full h-8 px-3 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Rua, Avenida, Praça..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Número</label>
                <input
                  type="text"
                  className="w-full h-8 px-3 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="123"
                  value={addressNumber}
                  onChange={e => setAddressNumber(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Complemento</label>
                <input
                  type="text"
                  className="w-full h-8 px-3 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Apt, Bloco..."
                  value={complement}
                  onChange={e => setComplement(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Bairro</label>
                <input
                  type="text"
                  className="w-full h-8 px-3 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Centro..."
                  value={bairro}
                  onChange={e => setBairro(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Cidade</label>
                <input
                  type="text"
                  className="w-full h-8 px-3 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="São Paulo"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Estado</label>
                <input
                  type="text"
                  maxLength={2}
                  className="w-full h-8 px-3 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring uppercase"
                  placeholder="SP"
                  value={state}
                  onChange={e => setState(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>

          {/* Seção 4: Configurações */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border/20 pb-1">Configurações & Observações</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status do Cadastro</label>
                <select
                  value={isActive ? "ACTIVE" : "INACTIVE"}
                  onChange={e => setIsActive(e.target.value === "ACTIVE")}
                  className="w-full h-8 px-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ACTIVE">Ativo (Permite abertura de OS)</option>
                  <option value="INACTIVE">Inativo (Bloqueado)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Observações Internas</label>
              <textarea
                className="w-full h-16 p-2 rounded bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                placeholder="Insira detalhes adicionais sobre o perfil deste cliente..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/40 bg-card/25">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="default" size="sm" onClick={handleSubmit}>
            {customer ? "Salvar Alterações" : "Cadastrar Cliente"}
          </Button>
        </div>
      </div>
    </div>
  )
}
