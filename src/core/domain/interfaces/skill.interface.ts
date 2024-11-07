// src/core/domain/interfaces/skill.interface.ts
import { IMission } from './mission.interface';
import { IFreelance } from './freelance.interface';

export interface ISkill {
  id: string;
  name: string;
  category?: string;
  missions: IMission[];
  freelances: IFreelance[];
}