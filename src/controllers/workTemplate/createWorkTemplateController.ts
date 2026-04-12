import { NextFunction, Request, Response } from 'express';

import { CacheKeyGroup } from 'constants/cache-keys';
import { deleteCacheByPrefix } from 'helpers/cache.helper';
import { createWorkTemplateService } from 'service/workTemplate/createWorkTemplateService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const createWorkTemplateController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.jwtPayload.id;
    const templates = req.body;

    if (!Array.isArray(templates) || templates.length === 0) {
      throw new CustomError(400, 'Validation', 'Invalid payload. An array of templates is required.');
    }

    const savedTemplates = await createWorkTemplateService(doctorId, templates);

    // Xóa Cache Mẫu cấu hồ làm việc của bác sĩ này
    const cacheKeyPrefix = `${CacheKeyGroup.DOCTOR_WORK_TEMPLATE}:${doctorId}:`;
    await deleteCacheByPrefix(cacheKeyPrefix);

    // Xóa Cache Lịch khám của bác sĩ này (Cả bản riêng tư của BS và bản công khai cho Patient)
    const privateCacheKeyPrefix = `${CacheKeyGroup.DOCTOR_SCHEDULE_PRIVATE}:${doctorId}:`;
    const publicCacheKeyPrefix = `${CacheKeyGroup.DOCTOR_SCHEDULE_PUBLIC}:/v1/users/doctor-schedule/${doctorId}`;
    await Promise.all([deleteCacheByPrefix(privateCacheKeyPrefix), deleteCacheByPrefix(publicCacheKeyPrefix)]);

    res.status(200).json({
      success: true,
      message: 'Tạo mẫu lịch làm việc thành công',
      data: savedTemplates,
    });
  } catch (error) {
    next(error);
  }
};
