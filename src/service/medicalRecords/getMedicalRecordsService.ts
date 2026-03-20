import { getRepository } from 'typeorm';

import { MedicalRecord } from '../../typeorm/entities/medicalRecord';

export const getMedicalRecordsService = async (userId: string) => {
  const medicalRecordRepository = getRepository(MedicalRecord);

  const query = medicalRecordRepository
    .createQueryBuilder('record')
    .leftJoinAndSelect('record.patient', 'patient')
    .leftJoinAndSelect('record.doctor', 'doctor')
    .leftJoinAndSelect('record.diagnosis', 'diagnosis')
    .leftJoinAndSelect('record.appointment', 'appointment')
    .select([
      'record',
      'patient.id',
      'patient.fullName',
      'patient.avatar',
      'doctor.id',
      'doctor.fullName',
      'doctor.avatar',
      'diagnosis',
      'appointment.id',
      'appointment.appointmentDate',
      'appointment.appointmentTime',
    ])
    .where('record.patientId = :userId', { userId });

  return await query.orderBy('record.created_at', 'DESC').getMany();
};
