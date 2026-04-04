import bcrypt from 'bcryptjs';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import { Appointment } from './appointment';
import { Doctor } from './doctor';
import { Gender, Role } from './enum';
import { MedicalInfo } from './medicalInfo';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  fullName: string;

  @Column({
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  password: string;

  @Column({
    enum: Gender,
    nullable: true,
  })
  gender: string;

  @Column({
    nullable: true,
  })
  dateOfBirth: Date;

  @Column({
    nullable: true,
  })
  provider: string;

  @Column({
    nullable: true,
  })
  providerId: string;

  @Column({
    unique: true,
    nullable: true,
  })
  phone: string;

  @Column({
    nullable: true,
  })
  address: string;

  @Column({
    nullable: true,
  })
  refreshToken: string;

  @Column({
    enum: Role,
    default: Role.PATIENT,
  })
  role: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => MedicalInfo, (medicalInfo) => medicalInfo.user)
  medicalInfo: MedicalInfo;

  @OneToOne(() => Doctor, (doctor) => doctor.user)
  doctorProfile: Doctor;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  patientAppointments: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctorAppointments: Appointment[];

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
