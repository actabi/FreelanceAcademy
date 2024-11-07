// src/bot/commands/mission.commands.ts
import { Injectable } from '@nestjs/common';
import { Command } from './command.decorator';
import { MissionService } from '../../core/services/mission.service';

@Injectable()
export class MissionCommands {
  constructor(private missionService: MissionService) {}

  @Command({
    name: 'missions',
    description: 'Liste des missions disponibles'
  })
  async listMissions() {
    return await this.missionService.getMissions();
  }

  @Command({
    name: 'mission',
    description: 'Détails d\'une mission',
    options: [{
      name: 'id',
      description: 'ID de la mission',
      type: 'STRING',
      required: true
    }]
  })
  async getMission(id: string) {
    return await this.missionService.getMissionById(id);
  }
}