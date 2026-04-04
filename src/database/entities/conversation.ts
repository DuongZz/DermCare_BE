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
import { ConversationStatus, ConversationType } from './enum';
import { Message } from './message';
import { User } from './user';

@Entity('conversation')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    enum: ConversationType,
    default: ConversationType.AI_ASSISTANT,
  })
  type: ConversationType;

  @Column({
    enum: ConversationStatus,
    default: ConversationStatus.AI_CONSULTING,
  })
  status: ConversationStatus;

  @Column({
    nullable: true,
  })
  lastMessage: string;

  @Column({
    nullable: true,
  })
  title: string;

  @Column({
    nullable: true,
  })
  timestamp: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  diagnosisInfo: any;

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
