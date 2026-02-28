import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { Doctor } from './doctor';

@Entity('doctorWorkTemplate')
export class DoctorWorkTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  dayOfWeek: string;

  @Column({
    nullable: false,
  })
  morningStartTime: string;

  @Column({
    nullable: false,
  })
  morningEndTime: string;

  @Column({
    nullable: false,
  })
  afternoonStartTime: string;

  @Column({
    nullable: false,
  })
  afternoonEndTime: string;

  @Column({
    nullable: false,
  })
  isAvailable: boolean;

  @Column({
    nullable: false,
  })
  slotDuration: number;

  @Column({
    nullable: true,
  })
  price: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.doctorWorkTemplates)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;
}
