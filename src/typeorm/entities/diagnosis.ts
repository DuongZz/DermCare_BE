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
import { Conversation } from './conversation';
import { User } from './user';

@Entity('diagnosis')
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  AIResult: string; // Tên bệnh cụ thể AI chẩn đoán (vd: "Eczema", "Psoriasis")

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 3,
    nullable: false,
  })
  AIConfidence: number; // Độ tin cậy 0-1

  @Column({
    nullable: true, // Chuyên khoa tương ứng với bệnh (vd: "Da liễu Thẩm mỹ", "Da liễu Bệnh lý")
  })
  specialization: string;

  @Column({
    nullable: true, // Bác sĩ chưa viết ghi chú khi AI vừa chẩn đoán
  })
  doctorNote: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patientId' })
  patient: User;

  @OneToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment; // nullable bởi vì AI chẩn đoán trước khi có lịch hẹn

  @ManyToOne(() => Conversation, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation; // Liên kết với cuộc hội thoại mà AI đã chẩn đoán
}
