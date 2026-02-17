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
  patientId: string;

  @Column({
    nullable: false,
  })
  doctorId: string;

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

  @Column({
    enum: PaymentStatus,
    nullable: false,
  })
  paymentStatus: string;

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
