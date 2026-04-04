import { Request, Response, NextFunction } from 'express';

import { getConversationImagesService } from '../../service/conversations/getConversationImagesService';
import { CustomSuccess } from '../../utils/response/custom-success/customSuccess';

export const getConversationImagesController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const images = await getConversationImagesService(id);
    return res.customSuccess(200, 'Successfully fetched conversation images', images);
  } catch (err) {
    return next(err);
  }
};
