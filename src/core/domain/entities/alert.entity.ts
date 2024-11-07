// src/core/domain/entities/alert.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
  
  @Entity('alert')
  export class AlertEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    userId: string;
  
    @Column('text', { array: true })
    skills: string[];
  
    @Column({ nullable: true })
    minRate?: number;
  
    @Column({ nullable: true })
    maxRate?: number;
  
    @Column({ nullable: true })
    location?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }