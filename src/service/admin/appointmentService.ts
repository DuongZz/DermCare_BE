import { Appointment } from '@database/entities/appointment';
import { getRepository } from 'typeorm';

export const listAppointments = async () => {
  const appointmentRepository = getRepository(Appointment);
  return await appointmentRepository
    .createQueryBuilder('appointment')
    .leftJoinAndSelect('appointment.patient', 'patient')
    .leftJoinAndSelect('appointment.doctor', 'doctor')
    .leftJoinAndSelect('doctor.doctorProfile', 'doctorProfile')
    .orderBy('appointment.appointmentDate', 'DESC')
    .addOrderBy('appointment.appointmentTime', 'DESC')
    .getMany();
};
