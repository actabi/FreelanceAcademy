// src/core/domain/interfaces/mission.ts
export enum MissionStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  export enum MissionLocation {
    REMOTE = 'REMOTE',
    ON_SITE = 'ON_SITE',
    HYBRID = 'HYBRID'
  }
  
  export interface IMission {
    id: string;
    title: string;
    description: string;
    status: MissionStatus;
    dailyRateMin: number;
    dailyRateMax: number;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    skills: string[];
    location: MissionLocation;
    companyName?: string;
    address?: string;
    discordMessageId?: string;
  }