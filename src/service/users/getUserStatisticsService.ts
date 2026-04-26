import { getRepository } from 'typeorm';

import { Appointment } from '../../database/entities/appointment';
import { MedicalRecord } from '../../database/entities/medicalRecord';

export const getUserStatisticsService = async (userId: string) => {
  const appointmentRepository = getRepository(Appointment);
  const medicalRecordRepository = getRepository(MedicalRecord);

  // 1. Count Total Appointments
  const appointmentsCount = await appointmentRepository.count({
    where: { patient: { id: userId } },
  });

  // 2. Count Total Medical Records
  const medicalRecordsCount = await medicalRecordRepository.count({
    where: { patient: { id: userId } },
  });

  // 3. Count Unique Doctors Visited
  const doctorsVisited = await appointmentRepository
    .createQueryBuilder('appointment')
    .select('DISTINCT(appointment.doctorId)', 'doctorId')
    .where('appointment.patientId = :userId', { userId })
    .getRawMany();

  return {
    appointmentsCount,
    medicalRecordsCount,
    doctorsCount: doctorsVisited.length,
  };
};
