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

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  recipientId: string;

  @Column({
    nullable: false,
  })
  title: string;

  @Column({
    nullable: false,
  })
  type: string;

  @Column({
    nullable: false,
  })
  referenceId: string;

  @Column({
    nullable: false,
  })
  isRead: boolean;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;
}
