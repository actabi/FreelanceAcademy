export enum MissionStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }
  
  export class Mission {
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
    skills: string[]; // IDs des compétences requises
  
    constructor(partial: Partial<Mission>) {
      Object.assign(this, partial);
      this.createdAt = new Date();
      this.updatedAt = new Date();
      this.status = MissionStatus.DRAFT;
    }
  
    // Méthodes métier
    publish(): void {
      if (!this.canBePublished()) {
        throw new Error('Mission cannot be published');
      }
      this.status = MissionStatus.PUBLISHED;
      this.updatedAt = new Date();
    }
  
    cancel(): void {
      if (this.status === MissionStatus.COMPLETED) {
        throw new Error('Completed mission cannot be cancelled');
      }
      this.status = MissionStatus.CANCELLED;
      this.updatedAt = new Date();
    }
  
    updateDetails(details: Partial<Mission>): void {
      if (this.status !== MissionStatus.DRAFT) {
        throw new Error('Only draft missions can be updated');
      }
      Object.assign(this, details);
      this.updatedAt = new Date();
    }
  
    // Validations métier
    private canBePublished(): boolean {
      return (
        !!this.title &&
        !!this.description &&
        this.dailyRateMin > 0 &&
        this.dailyRateMax >= this.dailyRateMin &&
        this.skills.length > 0
      );
    }
  
    // Getters métier
    get duration(): number | null {
      if (!this.startDate || !this.endDate) {
        return null;
      }
      return Math.ceil(
        (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
  
    get isActive(): boolean {
      return this.status === MissionStatus.PUBLISHED || 
             this.status === MissionStatus.IN_PROGRESS;
    }
  
    get estimatedBudget(): { min: number; max: number } | null {
      const duration = this.duration;
      if (!duration) {
        return null;
      }
      return {
        min: this.dailyRateMin * duration,
        max: this.dailyRateMax * duration
      };
    }
  }
  
  // Types pour les opérations sur les missions
  export interface CreateMissionDto {
    title: string;
    description: string;
    dailyRateMin: number;
    dailyRateMax: number;
    startDate?: Date;
    endDate?: Date;
    skills: string[];
  }
  
  export interface UpdateMissionDto {
    title?: string;
    description?: string;
    dailyRateMin?: number;
    dailyRateMax?: number;
    startDate?: Date;
    endDate?: Date;
    skills?: string[];
  }