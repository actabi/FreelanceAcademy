// src/core/domain/interfaces/mission.interface.ts
import { MissionStatus, MissionLocation, MissionPriority, MissionVisibility } from '../enums/mission.enums';
import { ISkill } from './skill.interface';
import { IApplication } from './application.interface';

export interface IMission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  location: MissionLocation;
  priority?: MissionPriority;
  visibility?: MissionVisibility;
  dailyRateMin: number;
  dailyRateMax: number;
  startDate?: Date;
  endDate?: Date;
  companyName?: string;
  address?: string;
  discordMessageId?: string;
  skills: ISkill[];
  applications: IApplication[];
  createdAt: Date;
  updatedAt: Date;
  
  // Métadonnées optionnelles
  requiredYearsOfExperience?: number;
  preferredStartDate?: Date;
  estimatedDuration?: number; // en jours
  maxApplications?: number;
}