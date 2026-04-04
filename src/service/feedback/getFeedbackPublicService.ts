import { getRepository } from 'typeorm';

import { Feedback } from '../../database/entities/feedback';

export const getFeedbackPublicService = async () => {
  const feedbackRepo = getRepository(Feedback);

  const feedbacks = await feedbackRepo.find({
    relations: ['patient', 'doctor'],
    where: {},
    order: {
      rate: 'DESC',
      created_at: 'DESC',
    },
    take: 12,
  });

  return feedbacks.map((f) => ({
    id: f.id,
    rate: f.rate,
    comment: f.comment,
    patientName: f.patient ? f.patient.fullName : 'Người dùng ẩn danh',
    doctorName: f.doctor ? f.doctor.fullName : 'Bác sĩ',
    created_at: f.created_at,
  }));
};
