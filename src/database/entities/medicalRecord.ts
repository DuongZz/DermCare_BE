import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { Appointment } from './appointment';
import { Diagnosis } from './diagnosis';
import { User } from './user';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  treatment: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  note: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  images: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  patientInfo: any;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  doctorInfo: any;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patientId' })
  patient: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @OneToOne(() => Diagnosis, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'diagnosisId' })
  diagnosis: Diagnosis;

  @OneToOne(() => Appointment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;
}
