import { getRepository } from 'typeorm';

import { Appointment } from '../../database/entities/appointment';
import { Feedback } from '../../database/entities/feedback';
import { User } from '../../database/entities/user';
import { CreateFeedbackInput } from '../../interfaces/feedback';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const createFeedbackService = async (data: CreateFeedbackInput) => {
  const { appointmentId, patientId, rate, comment } = data;
  const feedbackRepo = getRepository(Feedback);
  const appointmentRepo = getRepository(Appointment);

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

  // Recalculate doctor rating
  try {
    const doctorRepo = getRepository('Doctor');
    const doctorId = appointment.doctor.id;

    const allFeedbacks = await feedbackRepo.find({
      where: { doctor: { id: doctorId } },
    });

    if (allFeedbacks.length > 0) {
      const sum = allFeedbacks.reduce((acc, f) => acc + f.rate, 0);
      const average = parseFloat((sum / allFeedbacks.length).toFixed(1));

      await doctorRepo.update({ user_id: doctorId }, { rating: average });
      console.log(`[Rating] Updated doctor ${doctorId} rating to ${average}`);
    }
  } catch (err) {
    console.error('[Rating] Error updating doctor rating:', err);
  }

  return feedback;
};
