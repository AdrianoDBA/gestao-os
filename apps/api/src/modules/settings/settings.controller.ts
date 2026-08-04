import { Controller, Get, Post, Put, Body, UseGuards } from "@nestjs/common"
import { SettingsService } from "./settings.service"

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings()
  }

  @Put()
  async updateSettings(@Body() body: any) {
    return this.settingsService.updateSettings(body)
  }

  @Post("smtp/test")
  async testSMTP(@Body() body: { email: string }) {
    return this.settingsService.testSMTP(body.email)
  }

  @Post("backup/export")
  async exportBackup() {
    return this.settingsService.exportBackup()
  }

  @Post("backup/restore")
  async restoreBackup(@Body() body: any) {
    return this.settingsService.restoreBackup(body)
  }
}
