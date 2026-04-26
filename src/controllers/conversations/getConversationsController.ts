import { NextFunction, Request, Response } from 'express';

import { getConversationsService } from 'service/conversations/getConversationsService';

export const getConversationsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtPayload.id;
    const role = req.jwtPayload.role;
    const { status, page } = req.query;

    const result = await getConversationsService(
      userId,
      role,
      status as string,
      page ? parseInt(page as string, 10) : 1,
    );
    res.customSuccess(200, 'Lấy danh sách hội thoại thành công', result);
  } catch (error) {
    next(error);
  }
};
