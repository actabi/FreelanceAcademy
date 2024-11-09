// src/core/domain/entities/skill.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany
  } from 'typeorm';
  import { FreelanceEntity } from './freelance.entity';
  import { MissionEntity } from './mission.entity';
import { ISkill } from '../interfaces/skill.interface';
  
  @Entity('skill')
  export class SkillEntity implements ISkill {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    name: string;
  
    @Column({ nullable: true })
    category: string;
  
    @ManyToMany(() => FreelanceEntity, freelance => freelance.skills)
    freelances: FreelanceEntity[];
  
    @ManyToMany(() => MissionEntity, mission => mission.skills)
    missions: MissionEntity[];
  }