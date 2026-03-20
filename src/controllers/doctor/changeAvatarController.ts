import { NextFunction, Request, Response } from 'express';

import { changeAvatarService } from 'service/doctor/changeAvatarService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const changeAvatarController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.jwtPayload.id;
    const fileUrl = (req as any).fileUrl;

    if (!fileUrl) {
      throw new CustomError(400, 'Validation', 'Avatar image is required');
    }
    const doctor = await changeAvatarService(id, fileUrl);

    res.status(200).json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      data: doctor,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    next(error);
  }
};
