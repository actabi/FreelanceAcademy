// src/core/domain/entities/freelance.entity.ts

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
import { IFreelance } from '../interfaces/freelance.interface';

@Entity('freelance')
export class FreelanceEntity implements IFreelance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  discordId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  dailyRate: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToMany(() => SkillEntity, skill => skill.freelances)
  @JoinTable({
    name: 'freelance_skill',
    joinColumn: {
      name: 'freelance_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'skill_id',
      referencedColumnName: 'id'
    }
  })
  skills: SkillEntity[];

  @OneToMany(() => ApplicationEntity, application => application.freelance)
  applications: ApplicationEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}