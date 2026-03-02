import { getRepository } from 'typeorm';

import { Doctor } from 'typeorm/entities/doctor';
import { Appointment } from 'typeorm/entities/appointment';
import { DoctorSchedule } from 'typeorm/entities/doctorSchedule';

export const getMyAppointmentService = async (userId: string) => {
  const appointments = await getRepository(Appointment).find({
    where: { patient: { id: userId } },
    relations: ['doctor'],
    order: { appointmentDate: 'DESC' },
  });

  const doctorRepo = getRepository(Doctor);
  const scheduleRepo = getRepository(DoctorSchedule);

  const result = await Promise.all(
    appointments.map(async (apt) => {
      // Lấy thêm thông tin doctor profile
      const doctorProfile = apt.doctor ? await doctorRepo.findOne({ where: { user_id: apt.doctor.id } }) : null;

      // Lấy giờ kết thúc từ bảng DoctorSchedule
      const scheduleSlot = apt.doctor
        ? await scheduleRepo.findOne({
            where: {
              doctor: { id: apt.doctor.id },
              date: apt.appointmentDate,
              startTime: apt.appointmentTime,
            },
            relations: ['doctor'],
          })
        : null;

      return {
        id: apt.id,
        appointmentDate: apt.appointmentDate,
        appointmentTime: apt.appointmentTime,
        appointmentEndTime: scheduleSlot?.endTime || null,
        appointmentStatus: apt.appointmentStatus,
        price: apt.price,
        note: apt.note || null,
        doctor: apt.doctor
          ? {
              fullName: apt.doctor.fullName,
              specialization: doctorProfile?.specialization || null,
              qualifications: doctorProfile?.qualifications || null,
              avatar: doctorProfile?.avatar || null,
            }
          : null,
      };
    }),
  );

  return result;
};
