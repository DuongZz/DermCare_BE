import { Request, Response, NextFunction } from 'express';

import { getOrCreateAppointmentConversationService } from '../../service/conversations/getOrCreateAppointmentConversationService';

export const getOrCreateAppointmentConversationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appointmentId } = req.params;
    const userId = (req as any).user.id;

    const conversation = await getOrCreateAppointmentConversationService(appointmentId, userId);

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    next(err);
  }
};
