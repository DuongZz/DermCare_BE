import { NextFunction, Request, Response } from 'express';

import { getConversationMessagesService } from 'service/conversations/getConversationMessagesService';

export const getConversationMessagesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtPayload.id;
    const role = req.jwtPayload.role;
    const { id } = req.params; // conversationId

    const messages = await getConversationMessagesService(id, userId, role);
    res.customSuccess(200, 'Lấy lịch sử tin nhắn thành công', messages);
  } catch (error) {
    next(error);
  }
};
