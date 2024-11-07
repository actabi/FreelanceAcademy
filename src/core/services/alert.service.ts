// src/core/services/alert.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheService } from './cache.service';
import { AlertEntity } from '../domain/entities/alert.entity';

// Interface pour les critères d'alerte
interface CreateAlertDto {
  userId: string;
  skills: string[];
  minRate?: number;
  maxRate?: number;
  location?: string;
}

// Interface pour l'entité Alerte
interface IAlert {
  id: string;
  userId: string;
  skills: string[];
  minRate?: number;
  maxRate?: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AlertService {
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

    // Mettre en cache l'alerte pour un accès rapide
    await this.cacheService.set(
      `alert:${savedAlert.id}`,
      JSON.stringify(savedAlert),
      3600 // Cache pour 1 heure
    );

    return savedAlert;
  }

  // Récupérer les alertes d'un utilisateur
  async getAlertsByUserId(userId: string): Promise<IAlert[]> {
    // Essayer de récupérer depuis le cache d'abord
    const cachedAlerts = await this.cacheService.get(`alerts:user:${userId}`);
    if (cachedAlerts) {
      return JSON.parse(cachedAlerts);
    }

    // Si pas en cache, récupérer depuis la base de données
    const alerts = await this.alertRepository.find({
      where: { userId }
    });

    // Mettre en cache pour les prochaines requêtes
    await this.cacheService.set(
      `alerts:user:${userId}`,
      JSON.stringify(alerts),
      3600
    );

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
    
    // Invalider le cache
    await this.cacheService.del(`alert:${alertId}`);
    await this.cacheService.del(`alerts:user:${alert.userId}`);
  }

  // Vérifier si une mission correspond aux critères d'une alerte
  async checkMissionMatch(mission: any, alert: IAlert): Promise<boolean> {
    // Vérifier le TJM
    if (alert.minRate && mission.dailyRateMin < alert.minRate) {
      return false;
    }
    if (alert.maxRate && mission.dailyRateMax > alert.maxRate) {
      return false;
    }

    // Vérifier la localisation
    if (alert.location && mission.location !== alert.location) {
      return false;
    }

    // Vérifier les compétences
    const missionSkills = mission.skills.map(skill => skill.name.toLowerCase());
    const alertSkills = alert.skills.map(skill => skill.toLowerCase());
    const hasMatchingSkills = alertSkills.some(skill => 
      missionSkills.includes(skill)
    );

    return hasMatchingSkills;
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

    // Mettre à jour les champs
    Object.assign(alert, {
      ...updateData,
      updatedAt: new Date()
    });

    const updatedAlert = await this.alertRepository.save(alert);

    // Mettre à jour le cache
    await this.cacheService.set(
      `alert:${alertId}`,
      JSON.stringify(updatedAlert),
      3600
    );
    await this.cacheService.del(`alerts:user:${alert.userId}`);

    return updatedAlert;
  }
}