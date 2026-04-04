import { NextFunction, Request, Response } from 'express';

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

    res.status(200).json({
      success: true,
      message: 'Tạo mẫu lịch làm việc thành công',
      data: savedTemplates,
    });
  } catch (error) {
    next(error);
  }
};
