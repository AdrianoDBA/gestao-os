import { Controller, Post, Body } from "@nestjs/common"
import { AuthService } from "./auth.service"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() body: any) {
    return this.authService.login(body)
  }

  @Post("refresh")
  refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body)
  }

  @Post("logout")
  logout() {
    return this.authService.logout()
  }
}
