import { NextFunction, Request, Response } from 'express';

import { getPublicSpecializationService } from 'service/users/getPublicSpecializationService';

export const getPublicSpecializationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specializations = await getPublicSpecializationService();
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách chuyên khoa thành công',
      data: specializations,
    });
  } catch (error) {
    next(error);
  }
};
