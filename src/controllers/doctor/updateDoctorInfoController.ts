import { NextFunction, Request, Response } from 'express';

import { CacheKeyGroup } from 'constants/cache-keys';
import { deleteCacheByPrefix } from 'helpers/cache.helper';
import { UpdateDoctorInfoInput } from 'interfaces/doctor';
import { updateDoctorInfoService } from 'service/doctor/updateDoctorInfoService';

export const updateDoctorInfoController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.jwtPayload.id;
    const data = req.body as UpdateDoctorInfoInput;
    const doctor = await updateDoctorInfoService(id, data);

    // Xóa Cache danh sách bác sĩ công khai & thông tin cá nhân của Bác sĩ này
    await Promise.all([
      deleteCacheByPrefix(CacheKeyGroup.TOP_DOCTORS),
      deleteCacheByPrefix(CacheKeyGroup.DOCTOR_LIST_ALL),
      deleteCacheByPrefix(CacheKeyGroup.SPECIALIZATIONS),
      deleteCacheByPrefix(`${CacheKeyGroup.ME_PROFILE}:${id}:`),
    ]);
    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin bác sĩ thành công',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};
