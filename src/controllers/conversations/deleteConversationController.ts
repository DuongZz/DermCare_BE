import { Request, Response, NextFunction } from 'express';

import { deleteConversationService } from '../../service/conversations/deleteConversationService';

export const deleteConversationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.jwtPayload.id;

    await deleteConversationService(id, userId);
    res.customSuccess(200, 'Xóa cuộc hội thoại thành công');
  } catch (err) {
    next(err);
  }
};
