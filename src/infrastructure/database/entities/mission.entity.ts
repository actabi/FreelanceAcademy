// src/infrastructure/database/entities/mission.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MissionStatus } from '../../../domain/models/mission.model';

@Entity('missions')
export class MissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;  

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: MissionStatus,
    default: MissionStatus.DRAFT
  })
  status!: MissionStatus;

  @Column('decimal')
  dailyRateMin!: number;

  @Column('decimal')
  dailyRateMax!: number;

  @Column('timestamp', { nullable: true })
  startDate!: Date;

  @Column('timestamp', { nullable: true })
  endDate!: Date;

  @Column('simple-array')
  skills!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}