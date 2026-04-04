import { NextFunction, Request, Response } from 'express';

import { upRoleDoctorService } from '../../service/admin/upRoleDoctorService';

export const upRoleDoctorController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Id is required',
      });
    }
    const result = await upRoleDoctorService(id);
    return res.status(200).json({
      success: true,
      message: 'User upgraded to doctor successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
