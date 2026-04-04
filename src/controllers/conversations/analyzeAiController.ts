import { NextFunction, Request, Response } from 'express';

import { analyzeAiService } from 'service/conversations/analyzeAiService';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const analyzeAiController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = req.params.id; // TypeORM Router fallback support
    const patientId = req.jwtPayload.id;
    const file = req.file;
    const fileUrl = req.fileUrl;
    const description = req.body.description; // Multimodal text

    if ((!file || !fileUrl) && !description) {
      throw new CustomError(400, 'General', 'Vui lòng cung cấp ít nhất ảnh hoặc mô tả văn bản.');
    }

    const result = await analyzeAiService({
      conversationId,
      patientId,
      fileBuffer: file?.buffer,
      fileName: file?.originalname,
      mimeType: file?.mimetype,
      fileUrl,
      description,
    });

    res.customSuccess(200, 'Phân tích ảnh thành công', result);
  } catch (error) {
    console.error('API /analyze Error:', error);
    next(error);
  }
};
