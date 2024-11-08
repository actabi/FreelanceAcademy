// src/core/domain/models/mission.model.ts
import { MissionStatus, MissionLocation, IMission } from '../interfaces/mission';
import { ISkill } from '../interfaces/skill.interface';

export class Mission implements IMission {
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
  skills: ISkill[];
  location: MissionLocation;
  companyName?: string;
  address?: string;
  discordMessageId?: string;

  constructor(partial: Partial<Mission>) {
    Object.assign(this, partial);
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.status = MissionStatus.DRAFT;
  }

  publish(): void {
    if (!this.canBePublished()) {
      throw new Error('Mission cannot be published');
    }
    this.status = MissionStatus.PUBLISHED;
    this.updatedAt = new Date();
  }

  private canBePublished(): boolean {
    return (
      !!this.title &&
      !!this.description &&
      this.dailyRateMin > 0 &&
      this.dailyRateMax >= this.dailyRateMin &&
      this.skills.length > 0
    );
  }

  get duration(): number | null {
    if (!this.startDate || !this.endDate) return null;
    return Math.ceil(
      (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}