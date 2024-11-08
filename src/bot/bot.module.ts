// // src/bot/bot.module.ts
// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { DiscordClient } from './discord.client';
// import { MissionCommands } from './commands/mission.commands';
// import { ProfileCommand } from './commands/profile.command';
// import { AlertCommand } from './commands/alert.command';
// import { MissionService } from '../core/services/mission.service';
// import { FreelanceService } from '../core/services/freelance.service';
// import { AlertService } from '../core/services/alert.service'; 
// import { NotificationService } from '../core/services/notification.service';
// import { CommandService } from './commands/command.service';

// @Module({
//   imports: [ConfigModule],
//   providers: [
//     DiscordClient,
//     CommandService,
//     MissionCommands,
//     ProfileCommand,
//     AlertCommand,
//     MissionService,
//     FreelanceService,
//     AlertService,
//     NotificationService
//   ],
//   exports: [DiscordClient]
// })
// export class BotModule {}

// src/bot/bot.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from '../core/notification/notification.module';
import { DiscordClient } from './discord.client';
import { MissionCommands } from './commands/mission.commands';
import { ProfileCommand } from './commands/profile.command';
import { AlertCommand } from './commands/alert.command';
import { CommandService } from './commands/command.service';

@Module({
  imports: [
    ConfigModule,
    NotificationModule // Import du module de notification
  ],
  providers: [
    DiscordClient,
    CommandService,
    MissionCommands,
    ProfileCommand,
    AlertCommand
  ],
  exports: [DiscordClient]
})
export class BotModule {}