// src/api/controllers/health.controller.ts
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
}