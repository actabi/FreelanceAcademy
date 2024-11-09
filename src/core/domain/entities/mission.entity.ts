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
import { MissionStatus, MissionLocation, MissionPriority, MissionVisibility } from '../enums/mission.enums';
import { SkillEntity } from './skill.entity';
import { ApplicationEntity } from './application.entity';

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
    enumName: 'mission_status_enum', // Ajoutez ceci
    default: MissionStatus.DRAFT
})

@Column({
    type: 'enum',
    enum: MissionLocation,
    enumName: 'mission_location_enum' // Ajoutez ceci
})
location: MissionLocation;

@Column({
    type: 'enum',
    enum: MissionPriority,
    enumName: 'mission_priority_enum', // Ajoutez ceci
    nullable: true
})
priority?: MissionPriority; 

  @Column({
      type: 'enum',
      enum: MissionVisibility,
      default: MissionVisibility.DRAFT
  })
  visibility: MissionVisibility;

  @Column()
  dailyRateMin: number;

  @Column()
  dailyRateMax: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

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

  @Column({ nullable: true })
  requiredYearsOfExperience?: number;

  @Column({ type: 'timestamp', nullable: true })
  preferredStartDate?: Date;

  @Column({ nullable: true })
  estimatedDuration?: number;

  @Column({ nullable: true })
  maxApplications?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}