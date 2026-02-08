import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AdminService } from './admin/admin.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly adminService: AdminService
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('config')
  async getConfig() {
    return this.adminService.getSystemConfigs();
  }
}
