import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user';
import { DoctorWorkTemplate } from './doctorWorkTemplate';

@Entity('doctors')
export class Doctor {
  @PrimaryColumn({
    type: 'uuid',
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

  @OneToMany(() => DoctorWorkTemplate, (doctorWorkTemplate) => doctorWorkTemplate.doctor)
  doctorWorkTemplates: DoctorWorkTemplate[];
}
