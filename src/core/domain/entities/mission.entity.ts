// src/core/domain/entities/mission.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    OneToMany,
    JoinTable
  } from 'typeorm';
  import { SkillEntity } from './skill.entity';
  import { ApplicationEntity } from './application.entity';
  import { MissionStatus, MissionLocation } from '../interfaces/mission';
  
  @Entity('mission')
  export class MissionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    title: string;
  
    @Column('text')
    description: string;
  
    @Column({
      type: 'enum',
      enum: MissionStatus,
      default: MissionStatus.DRAFT
    })
    status: MissionStatus;
  
    @Column()
    dailyRateMin: number;
  
    @Column()
    dailyRateMax: number;
  
    @Column({ type: 'timestamp', nullable: true })
    startDate: Date;
  
    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;
  
    @Column({
      type: 'enum',
      enum: MissionLocation
    })
    location: MissionLocation;
  
    @Column({ nullable: true })
    companyName: string;
  
    @Column({ nullable: true })
    address: string;
  
    @Column({ nullable: true })
    discordMessageId: string;
  
    @ManyToMany(() => SkillEntity, skill => skill.missions)
    @JoinTable({
      name: 'mission_skill',
      joinColumn: {
        name: 'mission_id',
        referencedColumnName: 'id'
      },
      inverseJoinColumn: {
        name: 'skill_id',
        referencedColumnName: 'id'
      }
    })
    skills: SkillEntity[];
  
    @OneToMany(() => ApplicationEntity, application => application.mission)
    applications: ApplicationEntity[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }