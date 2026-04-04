import { Request, Response, NextFunction } from 'express';

import { getConversationByIdService } from '../../service/conversations/getConversationByIdService';

export const getConversationByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.jwtPayload.id;
    const role = req.jwtPayload.role;

    const conversation = await getConversationByIdService(id, userId, role);
    res.customSuccess(200, 'Lấy thông tin hội thoại thành công', conversation);
  } catch (err) {
    next(err);
  }
};
