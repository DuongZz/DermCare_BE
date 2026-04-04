import { NextFunction, Request, Response } from 'express';

import { createAiConversationService } from 'service/conversations/createAiConversationService';

export const createAiConversationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtPayload.id;
    const conversation = await createAiConversationService(userId);
    res.customSuccess(200, 'Tạo cuộc hội thoại với AI thành công', conversation);
  } catch (error) {
    next(error);
  }
};
