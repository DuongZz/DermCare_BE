import { getRepository } from 'typeorm';

import { DoctorSchedule } from 'typeorm/entities/doctorSchedule';
import { DoctorWorkTemplate } from 'typeorm/entities/doctorWorkTemplate';
import { ScheduleStatus } from 'typeorm/entities/enum';
import { generateTimeSlots } from 'utils/generateTimeslot';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const createDoctorScheduleService = async (doctorId: string, dateStr: string) => {
  const templateRepo = getRepository(DoctorWorkTemplate);
  const scheduleRepo = getRepository(DoctorSchedule);

  const targetDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (targetDate < today) {
    throw new CustomError(400, 'Validation', 'Không thể tạo ca khám cho một ngày trong quá khứ!');
  }

  const templates = await templateRepo.find({ where: { doctor: { user_id: doctorId }, isAvailable: true } });
  if (!templates || templates.length === 0) {
    throw new CustomError(404, 'General', 'Bác sĩ chưa lặp lịch làm việc hoặc đang chọn nghỉ cả tuần.');
  }

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const dayOfWeekNum = targetDate.getDay();

  const dayTemplate = templates.find((t) => dayMap[t.dayOfWeek.toLowerCase()] === dayOfWeekNum);
  if (!dayTemplate) {
    throw new CustomError(
      400,
      'Validation',
      `Bạn chưa cấu hình khung giờ làm việc hoặc đã chọn nghỉ vào Thứ ${dayOfWeekNum === 0 ? 'CN' : dayOfWeekNum + 1}`,
    );
  }

  const morningSlots =
    dayTemplate.morningStartTime && dayTemplate.morningEndTime
      ? generateTimeSlots(dayTemplate.morningStartTime, dayTemplate.morningEndTime, dayTemplate.slotDuration)
      : [];

  const afternoonSlots =
    dayTemplate.afternoonStartTime && dayTemplate.afternoonEndTime
      ? generateTimeSlots(dayTemplate.afternoonStartTime, dayTemplate.afternoonEndTime, dayTemplate.slotDuration)
      : [];

  const allSlots = [...morningSlots, ...afternoonSlots];

  if (allSlots.length === 0) {
    throw new CustomError(
      400,
      'Validation',
      'Không sinh được ca khám nào từ mẫu lịch (Có thể do khoảng cách giờ quá ngắn).',
    );
  }

  const newSchedules = allSlots.map((slot) => ({
    doctor: { id: doctorId },
    date: dateStr,
    startTime: slot.start,
    endTime: slot.end,
    price: dayTemplate.price || 0,
    isBooked: false,
    status: ScheduleStatus.AVAILABLE,
  }));

  const existingSchedules = await scheduleRepo
    .createQueryBuilder('schedule')
    .where('schedule.doctorId = :doctorId', { doctorId })
    .andWhere('schedule.date = :dateStr', { dateStr })
    .getMany();

  const validSchedules = newSchedules.filter((newSched) => {
    const isOverlap = existingSchedules.some((ex) => {
      const exDateStr = typeof ex.date === 'string' ? ex.date : ex.date.toISOString().split('T')[0];
      return exDateStr === newSched.date && newSched.startTime < ex.endTime && newSched.endTime > ex.startTime;
    });
    return !isOverlap;
  });

  if (validSchedules.length === 0) {
    throw new CustomError(409, 'Conflict', 'Tất cả các ca khám trong ngày này đều đã được tạo từ trước.');
  }

  const entitiesToSave = scheduleRepo.create(validSchedules as any);
  const savedData = await scheduleRepo.save(entitiesToSave);

  return {
    totalGenerated: validSchedules.length,
    totalIgnored: newSchedules.length - validSchedules.length,
    schedulesToSave: savedData,
  };
};
