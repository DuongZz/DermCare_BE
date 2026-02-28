import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

import { AppointmentStatus, PaymentStatus } from './enum';
import { User } from './user';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  appointmentDate: Date;

  @Column({
    nullable: false,
  })
  appointmentTime: string;

  @Column({
    enum: AppointmentStatus,
    nullable: false,
    default: AppointmentStatus.PENDING,
  })
  appointmentStatus: string;

  @Column({
    nullable: false,
  })
  note: string;

  @Column({
    nullable: false,
  })
  price: number;

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
}
