import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { createFeedbackService } from '../../service/conversations/createFeedbackService';
import { Conversation } from '../../database/entities/conversation';
import { CustomError } from '../../utils/response/custom-error/CustomError';

export const createFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // conversation id
    const { rate, comment } = req.body;
    const userId = req.jwtPayload.id;

    const conversationRepo = getRepository(Conversation);
    const conversation = await conversationRepo.findOne(id, {
      relations: ['appointment'],
    });

    if (!conversation) {
      throw new CustomError(404, 'General', 'Không tìm thấy cuộc hội thoại');
    }

    if (!conversation.appointment) {
      throw new CustomError(400, 'General', 'Cuộc hội thoại này không có lịch hẹn để đánh giá');
    }

    const result = await createFeedbackService({
      appointmentId: conversation.appointment.id,
      patientId: userId,
      rate,
      comment,
    });

    res.status(201).json({
      message: 'Gửi đánh giá thành công',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
