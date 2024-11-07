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
  duration?: number;
}