import { NextFunction, Request, Response } from 'express';

import { getWorkTemplateService } from 'service/workTemplate/getWorkTemplateService';

export const getWorkTemplateController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.jwtPayload;

  try {
    const templates = await getWorkTemplateService(id);

    return res.status(200).json({
      success: true,
      message: 'Lấy mẫu lịch làm việc thành công',
      data: templates,
    });
  } catch (err) {
    return next(err);
  }
};
