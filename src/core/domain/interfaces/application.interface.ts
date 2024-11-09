// src/core/domain/interfaces/application.interface.ts
import { IMission } from './mission.interface';
import { IFreelance } from './freelance.interface';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface IApplication {
  id: string;
  mission?: IMission;
  freelance?: IFreelance;
  status: ApplicationStatus;
  message?: string;
  expectedDailyRate?: number;
  createdAt: Date;
  updatedAt: Date;
}