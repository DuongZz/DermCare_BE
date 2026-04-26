import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BloodGroup, SkinType } from './enum';
import { User } from './user';

@Entity('medical_info')
export class MedicalInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    enum: SkinType,
    nullable: true,
  })
  skinType: string;

  @Column({
    enum: BloodGroup,
    nullable: true,
  })
  bloodGroup: string;

  @Column({
    nullable: true,
  })
  allergies: string;

  @Column({
    nullable: true,
  })
  emergencyContact: string;

  @Column({
    nullable: true,
  })
  currentMedications: string;

  @Column({
    nullable: true,
  })
  chronicConditions: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
