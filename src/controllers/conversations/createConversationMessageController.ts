import { Request, Response, NextFunction } from 'express';

import { createConversationMessageService } from '../../service/conversations/createConversationMessageService';

export const createConversationMessageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: conversationId } = req.params;
    const { content } = req.body;
    const userId = req.jwtPayload?.id;
    const fileUrl = req.fileUrl; // From uploadToSupabase middleware

    const type = fileUrl ? 'image' : 'text';

    await createConversationMessageService({
      conversationId,
      senderId: userId,
      content,
      fileUrl,
      type,
    });

    res.customSuccess(201, 'Gửi tin nhắn thành công');
  } catch (err) {
    next(err);
  }
};
