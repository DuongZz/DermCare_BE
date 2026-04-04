import { Request, Response, NextFunction } from 'express';

import { completeConversationService } from '../../service/conversations/completeConversationService';
import { getIo } from '../../socket/socketInstance';

export const completeConversationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.jwtPayload.id;

    const result = await completeConversationService(id, userId);

    // Emit socket event
    const io = getIo();
    io.to(id).emit('conversation_updated', {
      id: result.id,
      status: result.status,
      title: result.title,
    });

    res.status(200).json({
      message: 'Hoàn thành ca khám thành công',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
