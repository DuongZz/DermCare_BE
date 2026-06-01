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
    const payload = {
      id: result.id,
      status: result.status,
      title: result.title,
    };
    io.to(id).emit('conversation_updated', payload);

    if (result.patient?.id) {
      io.to(`user_${result.patient.id}`).emit('conversation_updated', payload);
    }

    if (result.doctor?.id) {
      io.to(`user_${result.doctor.id}`).emit('conversation_updated', payload);
    }

    res.status(200).json({
      message: 'Hoàn thành ca khám thành công',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
