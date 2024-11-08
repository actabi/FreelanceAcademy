// src/core/domain/interfaces/freelance.interface.ts
import { ISkill } from './skill.interface';
import { IApplication } from './application.interface';

export interface IFreelance {
  id: string;
  discordId: string;
  name: string;
  email?: string;
  dailyRate?: number;
  isActive: boolean;
  skills: ISkill[];
  applications: IApplication[];
  createdAt: Date;
  updatedAt: Date;
  isAvailable: boolean;
}