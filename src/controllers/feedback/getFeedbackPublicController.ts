import { Request, Response, NextFunction } from 'express';

import { getFeedbackPublicService } from '../../service/feedback/getFeedbackPublicService';

export const getFeedbackPublicController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feedbacks = await getFeedbackPublicService();
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công',
      data: feedbacks,
    });
  } catch (err) {
    next(err);
  }
};
