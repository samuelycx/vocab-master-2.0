import { Controller, Get, ParseIntPipe, DefaultValuePipe, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { AdminService } from './admin/admin.service';
import { ProgressService } from './progress/progress.service';

@Controller(['api', ''])
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly adminService: AdminService,
    private readonly progressService: ProgressService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('config')
  async getConfig() {
    return this.adminService.getSystemConfigs();
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const entries = await this.progressService.getLeaderboard(limit);
    return {
      success: true,
      data: {
        entries,
        total: entries.length,
      },
    };
  }
}
