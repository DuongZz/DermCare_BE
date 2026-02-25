import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { User } from './user';

@Entity('doctors')
export class Doctor {
  @PrimaryColumn({
    nullable: false,
  })
  user_id: string;

  @Column({
    nullable: true,
  })
  avatar: string;

  @Column({
    nullable: true,
  })
  specialization: string;

  @Column({
    nullable: true,
  })
  qualifications: string;

  @Column({
    nullable: true,
  })
  workPlace: string;

  @Column({
    nullable: true,
    default: 0,
  })
  rating: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
