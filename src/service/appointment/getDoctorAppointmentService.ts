import { getRepository } from 'typeorm';

import { Appointment } from 'typeorm/entities/appointment';

export const getDoctorAppointmentService = async (doctorId: string) => {
  try {
    const appointmentRepository = getRepository(Appointment);
    const appointments = await appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoin('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.payments', 'payments')
      .select([
        'appointment.id',
        'appointment.appointmentDate',
        'appointment.appointmentTime',
        'appointment.appointmentStatus',
        'appointment.note',
        'appointment.price',
        'appointment.created_at',
        'patient.id',
        'patient.fullName',
        'patient.phone',
        'patient.email',
        'patient.gender',
        'patient.dateOfBirth',
        'patient.address',
        'payments.paymentStatus',
        'payments.createdAt',
      ])
      .where('appointment.doctorId = :doctorId', { doctorId })
      .orderBy('appointment.created_at', 'DESC')
      .addOrderBy('payments.createdAt', 'DESC')
      .getMany();

    return appointments.map((apt) => {
      let status = 'PENDING';
      if (apt.payments && apt.payments.length > 0) {
        if (apt.payments.some((p) => p.paymentStatus === 'PAID')) {
          status = 'PAID';
        } else {
          status = apt.payments[0].paymentStatus;
        }
      }
      const { payments, ...rest } = apt as any;
      return { ...rest, paymentStatus: status };
    });
  } catch (error) {
    throw error;
  }
};
