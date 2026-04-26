import { NextFunction, Request, Response } from 'express';

import { CacheKeyGroup } from 'constants/cache-keys';
import { deleteCacheByPrefix } from 'helpers/cache.helper';
import { changeAvatarService } from 'service/doctor/changeAvatarService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const changeAvatarController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.jwtPayload.id;
    const fileUrl = req.fileUrl;

    if (!fileUrl) {
      throw new CustomError(400, 'Validation', 'Avatar image is required');
    }
    const doctor = await changeAvatarService(id, fileUrl);

    // Xóa Cache danh sách bác sĩ công khai vì Avatar đã thay đổi
    await Promise.all([
      deleteCacheByPrefix(CacheKeyGroup.TOP_DOCTORS),
      deleteCacheByPrefix(CacheKeyGroup.DOCTOR_LIST_ALL),
    ]);

    res.customSuccess(200, 'Cập nhật ảnh đại diện thành công', doctor);
  } catch (error) {
    console.error('Avatar upload error:', error);
    next(error);
  }
};
