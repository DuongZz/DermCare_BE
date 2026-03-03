import { NextFunction, Request, Response } from 'express';

import { getConversationsService } from 'service/conversations/getConversationsService';

export const getConversationsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtPayload.id;
    const role = req.jwtPayload.role;

    const conversations = await getConversationsService(userId, role);
    res.customSuccess(200, 'Lấy danh sách hội thoại thành công', conversations);
  } catch (error) {
    next(error);
  }
};
