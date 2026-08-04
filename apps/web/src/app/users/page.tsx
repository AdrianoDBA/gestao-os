"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  getUsers, 
  saveUsers, 
  User, 
  getRoles, 
  checkPermission 
} from "@/lib/auth-store"
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Edit, 
  Lock, 
  Phone, 
  Mail, 
  Shield, 
  Calendar,
  X,
  CheckCircle,
  XCircle,
  KeyRound,
  History
} from "lucide-react"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(getUsers())
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [sortField, setSortField] = useState<keyof User>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Modais
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  // Campos do Form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("Técnico")
  const [isActive, setIsActive] = useState(true)
  const [password, setPassword] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Campo Reset Senha
  const [newPassword, setNewPassword] = useState("")
  const [resetSuccessMsg, setResetSuccessMsg] = useState("")

  const roles = getRoles()

  const canEdit = checkPermission("settings", "edit")
  const canCreate = checkPermission("settings", "create")
  const canDelete = checkPermission("settings", "delete")

  // Filtragem, Ordenação e Paginação
  const filteredUsers = useMemo(() => {
    return users
      .filter(u => {
        const matchSearch =
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        
        const matchRole = roleFilter === "ALL" || u.role === roleFilter
        
        const matchStatus = 
          statusFilter === "ALL" || 
          (statusFilter === "ACTIVE" && u.isActive) ||
          (statusFilter === "INACTIVE" && !u.isActive)

        return matchSearch && matchRole && matchStatus
      })
      .sort((a, b) => {
        const valA = String(a[sortField]).toLowerCase()
        const valB = String(b[sortField]).toLowerCase()
        if (valA < valB) return sortOrder === "asc" ? -1 : 1
        if (valA > valB) return sortOrder === "asc" ? 1 : -1
        return 0
      })
  }, [users, search, roleFilter, statusFilter, sortField, sortOrder])

  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredUsers.slice(start, start + itemsPerPage)
  }, [filteredUsers, currentPage])

  const handleOpenCreate = () => {
    setSelectedUser(null)
    setName("")
    setEmail("")
    setPhone("")
    setRole("Técnico")
    setIsActive(true)
    setPassword("")
    setAvatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60")
    setErrors({})
    setIsUserModalOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user)
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone)
    setRole(user.role)
    setIsActive(user.isActive)
    setPassword("")
    setAvatarUrl(user.avatarUrl)
    setErrors({})
    setIsUserModalOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Nome é obrigatório"
    if (!email.trim()) newErrors.email = "E-mail é obrigatório"
    if (!phone.trim()) newErrors.phone = "Telefone é obrigatório"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    let updatedList: User[] = []
    if (selectedUser) {
      // Edição
      updatedList = users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, name, email, phone, role, isActive, avatarUrl }
          : u
      )
    } else {
      // Criação
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name,
        email,
        phone,
        role,
        isActive,
        avatarUrl,
        createdAt: new Date().toISOString()
      }
      updatedList = [...users, newUser]
    }

    setUsers(updatedList)
    saveUsers(updatedList)
    setIsUserModalOpen(false)
  }

  const handleSoftDelete = (id: string) => {
    if (!window.confirm("Deseja realmente desativar este usuário (Soft Delete)?")) return
    const updated = users.map(u => u.id === id ? { ...u, isActive: false } : u)
    setUsers(updated)
    saveUsers(updated)
  }

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword.trim()) return

    // Simula salvamento
    setResetSuccessMsg("Senha redefinida com sucesso para o usuário!")
    setTimeout(() => {
      setIsResetModalOpen(false)
      setNewPassword("")
      setResetSuccessMsg("")
    }, 1500)
  }

  const triggerSort = (field: keyof User) => {
    if (sortField === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Usuários & Acesso</h2>
          <p className="text-xs text-muted-foreground">Cadastre novos operadores de laboratório e governe as permissões de acesso.</p>
        </div>
        {canCreate && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleOpenCreate}
            className="bg-blue-500 hover:bg-blue-600 gap-1.5 font-bold"
          >
            <UserPlus className="w-4 h-4" /> Novo Usuário
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid gap-4 md:grid-cols-4 bg-card/20 border border-border p-4 rounded-lg items-center">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-4 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Buscar usuário por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div>
          <select
            className="w-full h-9 px-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Todos os Perfis</option>
            {roles.map(r => (
              <option key={r.name} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="w-full h-9 px-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="INACTIVE">Inativo</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="border border-border/80 rounded-lg overflow-hidden bg-card/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-card/30 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => triggerSort("name")}>Nome</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => triggerSort("email")}>E-mail</th>
              <th className="p-4">Telefone</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => triggerSort("role")}>Perfil</th>
              <th className="p-4">Status</th>
              <th className="p-4">Último Acesso</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Nenhum usuário cadastrado com estes filtros.
                </td>
              </tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-card/20 transition-colors">
                  <td className="p-4 font-semibold text-foreground flex items-center gap-3">
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border border-border" />
                    <span>{user.name}</span>
                  </td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4 text-muted-foreground">{user.phone}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-wider border-zinc-700/60 text-zinc-300">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Ativo</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-zinc-500"><XCircle className="w-3.5 h-3.5" /> Inativo</span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground font-mono">
                    {user.lastAccess ? new Date(user.lastAccess).toLocaleString("pt-BR") : "Nunca"}
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    {canEdit && (
                      <>
                        <button 
                          onClick={() => { setSelectedUser(user); setIsResetModalOpen(true); }}
                          className="p-1.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                          title="Resetar Senha"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-zinc-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {canDelete && user.isActive && (
                      <button 
                        onClick={() => handleSoftDelete(user.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Desativar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/40 bg-card/20">
            <span className="text-[10px] text-muted-foreground">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Anterior
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal CRUD Usuário */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative w-full max-w-md bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/45">
              <h3 className="text-sm font-bold text-foreground">
                {selectedUser ? "Editar Operador" : "Cadastrar Novo Operador"}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Nome Completo</label>
                <input
                  type="text"
                  className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">E-mail Corporativo</label>
                <input
                  type="email"
                  className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Telefone</label>
                <input
                  type="text"
                  className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && <p className="text-[10px] text-destructive">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Cargo / Perfil</label>
                  <select
                    className="w-full h-9 px-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    {roles.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Status da Conta</label>
                  <select
                    className="w-full h-9 px-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none"
                    value={isActive ? "ACTIVE" : "INACTIVE"}
                    onChange={e => setIsActive(e.target.value === "ACTIVE")}
                  >
                    <option value="ACTIVE">Ativo / Habilitado</option>
                    <option value="INACTIVE">Inativo / Bloqueado</option>
                  </select>
                </div>
              </div>

              {!selectedUser && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Senha Inicial</label>
                  <input
                    type="password"
                    className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none"
                    placeholder="Deixe em branco para 'senha123'"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Foto de Perfil (URL)</label>
                <input
                  type="text"
                  className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsUserModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 font-bold">
                  Salvar Operador
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Senha Administrador */}
      {isResetModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm bg-card border border-border rounded-lg shadow-2xl z-10 flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-blue-400" /> Reset de Senha</h3>
              <button onClick={() => setIsResetModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Redefina a senha de acesso para o usuário <span className="font-semibold text-white">&quot;{selectedUser.name}&quot;</span> de forma mandatória.
            </p>

            {resetSuccessMsg && (
              <div className="p-2.5 bg-emerald-950/20 border border-emerald-800/40 text-emerald-400 rounded text-center font-semibold">
                {resetSuccessMsg}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nova Senha Provisória</label>
                <input
                  type="password"
                  className="w-full h-9 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none"
                  placeholder="Insira a nova senha provisória..."
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 font-bold">
                  Confirmar Reset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
