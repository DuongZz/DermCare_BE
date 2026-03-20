import { getRepository } from 'typeorm';

import { CreateFeedbackInput } from '../../interfaces/feedback';
import { Appointment } from '../../typeorm/entities/appointment';
import { Feedback } from '../../typeorm/entities/feedback';
import { User } from '../../typeorm/entities/user';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const createFeedbackService = async (data: CreateFeedbackInput) => {
  const { appointmentId, patientId, rate, comment } = data;
  const feedbackRepo = getRepository(Feedback);
  const appointmentRepo = getRepository(Appointment);
  const userRepo = getRepository(User);

  const appointment = await appointmentRepo.findOne(appointmentId, {
    relations: ['doctor', 'patient'],
  });

  if (!appointment) {
    throw new CustomError(404, 'General', 'Không tìm thấy lịch hẹn');
  }

  if (appointment.patient.id !== patientId) {
    throw new CustomError(403, 'General', 'Bạn không có quyền đánh giá lịch hẹn này');
  }

  // Check if already rated
  const existingFeedback = await feedbackRepo.findOne({
    where: { appointment: { id: appointmentId } },
  });

  if (existingFeedback) {
    throw new CustomError(400, 'General', 'Bạn đã đánh giá lịch hẹn này rồi');
  }

  const feedback = new Feedback();
  feedback.rate = rate;
  feedback.comment = comment;
  feedback.appointment = appointment;
  feedback.patient = appointment.patient;
  feedback.doctor = appointment.doctor;

  await feedbackRepo.save(feedback);

  return feedback;
};
