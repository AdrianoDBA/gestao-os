import { Injectable, UnauthorizedException } from "@nestjs/common"
import { UsersService } from "../users/users.service"

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(body: any) {
    const { email, password } = body
    if (!email || !password) {
      throw new UnauthorizedException("E-mail e senha são obrigatórios")
    }

    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas")
    }

    // Valida a hash da senha
    const hashed = this.usersService.hashPassword(password)
    if (user.passwordHash !== hashed) {
      throw new UnauthorizedException("Credenciais inválidas")
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Usuário inativo. Contate o administrador.")
    }

    // Gera Tokens simulados persistentes
    const accessToken = Buffer.from(JSON.stringify({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name,
      tenantId: user.tenantId || "default-tenant",
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora
    })).toString("base64")

    const refreshToken = Buffer.from(JSON.stringify({
      id: user.id,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 dias
    })).toString("base64")

    // Atualiza último acesso
    await this.usersService.update(user.id, {
      lastAccess: new Date().toISOString()
    })

    const { passwordHash, ...rest } = user

    return {
      user: rest,
      accessToken,
      refreshToken
    }
  }

  async refreshToken(body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new UnauthorizedException("Refresh token ausente")
    }

    try {
      const decodedStr = Buffer.from(body.refreshToken, "base64").toString("utf-8")
      const payload = JSON.parse(decodedStr)

      const user = await this.usersService.findOne(payload.id)
      if (!user || !user.isActive) {
        throw new UnauthorizedException("Usuário inativo ou não encontrado")
      }

      const newAccessToken = Buffer.from(JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        tenantId: (user as any).tenantId || "default-tenant",
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      })).toString("base64")

      return {
        accessToken: newAccessToken
      }
    } catch (e) {
      throw new UnauthorizedException("Refresh token inválido ou expirado")
    }
  }

  async logout() {
    return { success: true }
  }
}
