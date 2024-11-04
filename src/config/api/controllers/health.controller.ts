// src/api/controllers/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return {
      status: 'ok',
      time: new Date().toISOString(),
      services: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        discord: await this.checkDiscord()
      }
    };
  }

  // Ajout des méthodes manquantes
  private async checkDatabase(): Promise<boolean> {
    // Implémentation à ajouter
    return true;
  }

  private async checkRedis(): Promise<boolean> {
    // Implémentation à ajouter
    return true;
  }

  private async checkDiscord(): Promise<boolean> {
    // Implémentation à ajouter
    return true;
  }
}