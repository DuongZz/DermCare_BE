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
import { Diagnosis } from './diagnosis';
import { Message } from './message';
import { User } from './user';

@Entity('conversation')
export class Conversation {
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
  appointmentId: string;

  @Column({
    nullable: false,
  })
  status: string;

  @Column({
    nullable: true,
  })
  lastMessage: string;

  @Column({
    nullable: true,
  })
  timestamp: Date;

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

  @OneToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
