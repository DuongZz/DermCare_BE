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

import { Conversation } from './conversation';
import { User } from './user';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  content: string;

  @Column({
    nullable: false,
  })
  type: string;

  @Column({
    nullable: false,
  })
  timestamp: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;
}
