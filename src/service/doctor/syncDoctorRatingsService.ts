import { Doctor } from '@database/entities/doctor';
import { Feedback } from '@database/entities/feedback';
import { getRepository } from 'typeorm';

export const syncDoctorRatingsService = async () => {
  const doctorRepo = getRepository(Doctor);
  const feedbackRepo = getRepository(Feedback);

  // Get all doctors
  const doctors = await doctorRepo.find();
  const results = [];

  for (const doctor of doctors) {
    // Get all feedbacks for this doctor
    const Feedbacks = await feedbackRepo.find({
      where: { doctor: { id: doctor.user_id } },
    });

    let average = 0;
    if (Feedbacks.length > 0) {
      const sum = Feedbacks.reduce((acc, f) => acc + f.rate, 0);
      average = parseFloat((sum / Feedbacks.length).toFixed(1));
    }

    // Update doctor record
    await doctorRepo.update({ user_id: doctor.user_id }, { rating: average });

    results.push({
      doctorId: doctor.user_id,
      rating: average,
      count: Feedbacks.length,
    });
  }

  return results;
};
