import { getRepository } from 'typeorm';

import { DoctorWorkTemplate } from '@database/entities/doctorWorkTemplate';

export const getWorkTemplateService = async (doctorId: string) => {
  const doctorWorkTemplateRepository = getRepository(DoctorWorkTemplate);

  const templates = await doctorWorkTemplateRepository.find({
    where: { doctor: { user_id: doctorId } },
    order: {
      dayOfWeek: 'ASC', // Sorting by day of week might need more logic if it's string based, but this is a start
    },
  });

  return templates;
};
