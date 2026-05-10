import path from 'path';

import { Appointment } from '@database/entities/appointment';
import { Conversation } from '@database/entities/conversation';
import { Diagnosis } from '@database/entities/diagnosis';
import { Doctor } from '@database/entities/doctor';
import { DoctorSchedule } from '@database/entities/doctorSchedule';
import { DoctorWorkTemplate } from '@database/entities/doctorWorkTemplate';
import { Feedback } from '@database/entities/feedback';
import { MedicalInfo } from '@database/entities/medicalInfo';
import { MedicalRecord } from '@database/entities/medicalRecord';
import { Message } from '@database/entities/message';
import { Notification } from '@database/entities/notification';
import { Payment } from '@database/entities/payment';
import { User } from '@database/entities/user';
import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const config: ConnectionOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: false,
  ssl: true,
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Tăng lên 10s để NeonDB serverless kịp wake up
    ssl: {
      rejectUnauthorized: false,
    },
  },
  entities: [
    Appointment,
    Conversation,
    Diagnosis,
    Doctor,
    DoctorSchedule,
    DoctorWorkTemplate,
    Feedback,
    MedicalInfo,
    MedicalRecord,
    Message,
    Notification,
    Payment,
    User,
  ],
  migrations: [
    path.join(process.cwd(), 'src/database/migrations/**/*.{ts,js}'),
    path.join(process.cwd(), 'dist/database/migrations/**/*.js'),
  ],
  subscribers: [
    path.join(process.cwd(), 'src/database/subscriber/**/*.{ts,js}'),
    path.join(process.cwd(), 'dist/database/subscriber/**/*.js'),
  ],
  cli: {
    entitiesDir: 'src/database/entities',
    migrationsDir: 'src/database/migrations',
    subscribersDir: 'src/database/subscriber',
  },
  namingStrategy: new SnakeNamingStrategy(),
};

export = config;
