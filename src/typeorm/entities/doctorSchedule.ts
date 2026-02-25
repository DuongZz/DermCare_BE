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

import { User } from './user';

@Entity('doctorSchedule')
export class DoctorSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  doctorId: string;

  @Column({
    nullable: false,
  })
  availableDate: Date;

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
  isBooked: boolean;

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
