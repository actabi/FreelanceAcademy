// src/infrastructure/discord/bot.ts
@Injectable()
export class DiscordBot implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    private missionService: MissionService
  ) {}

  async onModuleInit() {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
      ]
    });
    
    await client.login(
      this.configService.get('DISCORD_TOKEN')
    );
  }
}