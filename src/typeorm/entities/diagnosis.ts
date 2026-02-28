import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { Appointment } from './appointment';
import { DiagnosisStatus } from './enum';
import { User } from './user';

@Entity('diagnosis')
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  AIResult: string;

  @Column({
    nullable: false,
  })
  AIConfidence: number;

  @Column({
    nullable: false,
  })
  doctorNote: string;

  @Column({
    enum: DiagnosisStatus,
    default: DiagnosisStatus.AI_PENDING,
  })
  status: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patientId' })
  patient: User;

  @OneToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;
}
