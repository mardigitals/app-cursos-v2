import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    // Llama al servicio y devuelve el JSON con todas las estadísticas
    return this.dashboardService.getStats();
  }
}