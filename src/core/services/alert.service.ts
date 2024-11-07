// src\core\services\alert.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheService } from './cache.service';
import { AlertEntity } from '../domain/entities/alert.entity';
import { IAlert } from '../domain/interfaces/alerte.interface';

// Interface pour les critères d'alerte
interface CreateAlertDto {
  userId: string;
  skills: string[];
  minRate?: number;
  maxRate?: number;
  location?: string;
}

@Injectable()
export class AlertService {
  private readonly CACHE_KEY_PREFIX = 'alert:';
  private readonly CACHE_TTL = 3600; // 1 heure

  constructor(
    @InjectRepository(AlertEntity)
    private readonly alertRepository: Repository<IAlert>,
    private readonly cacheService: CacheService
  ) {}

  // Créer une nouvelle alerte
  async createAlert(createAlertDto: CreateAlertDto): Promise<IAlert> {
    const alert = this.alertRepository.create({
      ...createAlertDto,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedAlert = await this.alertRepository.save(alert);
    await this.cacheService.setData(`${this.CACHE_KEY_PREFIX}${savedAlert.id}`, savedAlert);
    return savedAlert;
  }

  // Récupérer les alertes d'un utilisateur
  async getAlertsByUserId(userId: string): Promise<IAlert[]> {
    const cacheKey = `alerts:user:${userId}`;
    const cachedAlerts = await this.cacheService.getData<IAlert[]>(cacheKey);
    
    if (cachedAlerts) {
      return cachedAlerts;
    }

    const alerts = await this.alertRepository.find({
      where: { userId }
    });

    await this.cacheService.setData(cacheKey, alerts);
    return alerts;
  }

  // Supprimer une alerte
  async deleteAlert(alertId: string): Promise<void> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId }
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    await this.alertRepository.remove(alert);
    
    await this.cacheService.invalidateData(`${this.CACHE_KEY_PREFIX}${alertId}`);
    await this.cacheService.invalidateData(`alerts:user:${alert.userId}`);
  }

  // Vérifier si une mission correspond aux critères d'une alerte
  async checkMissionMatch(mission: any, alert: IAlert): Promise<boolean> {
    if (alert.minRate && mission.dailyRateMin < alert.minRate) {
      return false;
    }
    if (alert.maxRate && mission.dailyRateMax > alert.maxRate) {
      return false;
    }

    if (alert.location && mission.location !== alert.location) {
      return false;
    }

    const missionSkills = mission.skills?.map((skill: any) => skill.name.toLowerCase()) || [];
    const alertSkills = alert.skills?.map(skill => skill.toLowerCase()) || [];
    
    return alertSkills.some(skill => missionSkills.includes(skill));
  }

  // Trouver toutes les alertes correspondant à une mission
  async findMatchingAlerts(mission: any): Promise<IAlert[]> {
    const allAlerts = await this.alertRepository.find();
    const matchingAlerts = [];

    for (const alert of allAlerts) {
      if (await this.checkMissionMatch(mission, alert)) {
        matchingAlerts.push(alert);
      }
    }

    return matchingAlerts;
  }

  // Mettre à jour une alerte
  async updateAlert(alertId: string, updateData: Partial<CreateAlertDto>): Promise<IAlert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId }
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    Object.assign(alert, {
      ...updateData,
      updatedAt: new Date()
    });

    const updatedAlert = await this.alertRepository.save(alert);
    await this.cacheService.setData(`${this.CACHE_KEY_PREFIX}${alertId}`, updatedAlert);
    await this.cacheService.invalidateData(`alerts:user:${alert.userId}`);

    return updatedAlert;
  }
}