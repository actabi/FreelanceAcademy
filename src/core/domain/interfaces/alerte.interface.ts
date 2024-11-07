// Interface pour l'entité Alerte
export interface IAlert {
    id: string;
    userId: string;
    skills: string[];
    minRate?: number;
    maxRate?: number;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
  }