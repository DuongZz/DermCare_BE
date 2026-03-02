import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { User } from './user';
import { ScheduleStatus } from './enum';

@Entity('doctorSchedule')
export class DoctorSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'date',
    nullable: false,
  })
  date: Date;

  @Column({
    nullable: false,
  })
  startTime: string;

  @Column({
    nullable: false,
  })
  endTime: string;

  @Column({
    nullable: false,
  })
  price: number;

  @Column({
    nullable: false,
  })
  isBooked: boolean;

  @Column({
    enum: ScheduleStatus,
    default: ScheduleStatus.AVAILABLE,
    nullable: false,
  })
  status: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctorId' })
  doctor: User;
}
