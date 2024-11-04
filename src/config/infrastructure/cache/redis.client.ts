// src/infrastructure/cache/redis.client.ts
@Injectable()
export class RedisService {
  private client: Redis;

  constructor(
    private configService: ConfigService
  ) {
    this.client = new Redis(
      this.configService.get('REDIS_URL')
    );
  }
}