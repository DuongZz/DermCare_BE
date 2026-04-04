import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import { User } from '@database/entities/user';
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

    res.customSuccess(200, 'Đăng xuất thành công.', null);
  } catch (err) {
    const customError = new CustomError(400, 'Raw', 'Có lỗi khi đăng xuất', null, err);
    return next(customError);
  }
};
