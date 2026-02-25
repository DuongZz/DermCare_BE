import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from 'typeorm/entities/user';
import { CustomError } from 'utils/response/custom-error/CustomError';

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.jwtPayload;
    const userRepository = getRepository(User);

    const user = await userRepository.findOne(id);
    if (user) {
      user.refreshToken = null as any;
      await userRepository.save(user);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
    });

    res.customSuccess(200, 'Logout successfully.', null);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Logout failed', null, err);
    return next(customError);
  }
};
