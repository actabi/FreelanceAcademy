// src/core/domain/entities/application.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
  } from 'typeorm';
  import { FreelanceEntity } from './freelance.entity';
  import { MissionEntity } from './mission.entity';
  
  export enum ApplicationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN'
  }
  
  @Entity('mission_application')
  export class ApplicationEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => MissionEntity, mission => mission.applications, {
      onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'mission_id' })
    mission: MissionEntity;
  
    @ManyToOne(() => FreelanceEntity, freelance => freelance.applications, {
      onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'freelance_id' })
    freelance: FreelanceEntity;
  
    @Column({
      type: 'varchar',
      default: ApplicationStatus.PENDING
    })
    status: ApplicationStatus;
  
    @Column({ type: 'text', nullable: true })
    message: string;
  
    @Column({ nullable: true })
    expectedDailyRate: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }