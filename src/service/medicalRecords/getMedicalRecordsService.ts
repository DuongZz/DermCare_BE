import { getRepository } from 'typeorm';

import { Role } from '../../database/entities/enum';
import { MedicalRecord } from '../../database/entities/medicalRecord';

export const getMedicalRecordsService = async (userId: string, role: string) => {
  const medicalRecordRepository = getRepository(MedicalRecord);

  const query = medicalRecordRepository
    .createQueryBuilder('record')
    .leftJoinAndSelect('record.patient', 'patient')
    .leftJoinAndSelect('record.doctor', 'doctor')
    .leftJoinAndSelect('doctor.doctorProfile', 'doctorProfile')
    .leftJoinAndSelect('record.diagnosis', 'diagnosis')
    .leftJoinAndSelect('record.appointment', 'appointment')
    .select([
      'record',
      'patient.id',
      'patient.fullName',
      'doctor.id',
      'doctor.fullName',
      'doctorProfile.avatar',
      'diagnosis',
      'appointment.id',
      'appointment.appointmentDate',
      'appointment.appointmentTime',
    ]);
  console.log(query);
  if (role === Role.PATIENT) {
    query.where('record.patientId = :userId', { userId });
  } else if (role === Role.DOCTOR) {
    query.where('record.doctorId = :userId', { userId });
  }

  return await query.orderBy('record.created_at', 'DESC').getMany();
};
