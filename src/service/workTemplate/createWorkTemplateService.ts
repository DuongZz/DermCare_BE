import { getRepository } from 'typeorm';

import { DayTemplateInput } from 'interfaces/workTemplate';
import { DoctorWorkTemplate } from 'typeorm/entities/doctorWorkTemplate';
import { Doctor } from 'typeorm/entities/doctor';

export const createWorkTemplateService = async (doctorId: string, templates: DayTemplateInput[]) => {
  const doctorWorkTemplateRepository = getRepository(DoctorWorkTemplate);

  await doctorWorkTemplateRepository.delete({ doctor: { user_id: doctorId } });

  const newTemplates = templates.map((t) => {
    const template = new DoctorWorkTemplate();
    template.doctor = { user_id: doctorId } as Doctor;
    template.dayOfWeek = t.dayOfWeek;
    template.isAvailable = t.isAvailable;
    template.morningStartTime = t.morningStartTime || '00:00';
    template.morningEndTime = t.morningEndTime || '00:00';
    template.afternoonStartTime = t.afternoonStartTime || '00:00';
    template.afternoonEndTime = t.afternoonEndTime || '00:00';
    template.slotDuration = t.slotDuration || 30;
    template.price = t.price || 0;
    return template;
  });

  const savedTemplates = await doctorWorkTemplateRepository.save(newTemplates);
  return savedTemplates;
};
